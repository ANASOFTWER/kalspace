-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Companies Table
create table public.companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Profiles Table (Linked to Auth.Users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  company_id uuid references public.companies(id) on delete set null,
  full_name text not null,
  role text not null default 'employee' check (role in ('admin', 'employee', 'manager', 'hr', 'developer', 'designer', 'sales', 'marketing', 'support', 'finance', 'other')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Invitations Table
create table public.invitations (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  company_id uuid references public.companies(id) on delete cascade not null,
  token uuid default gen_random_uuid() not null unique,
  role text not null default 'employee' check (role in ('admin', 'employee', 'manager', 'hr', 'developer', 'designer', 'sales', 'marketing', 'support', 'finance', 'other')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null default (now() + interval '7 days')
);

-- 4. Enable Row Level Security (RLS)
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.invitations enable row level security;

-- 5. RLS Policies

-- Companies Policies
create policy "Users can view their own company" on public.companies
  for select using (
    id = (select company_id from public.profiles where profiles.id = auth.uid())
  );

create policy "Admins can update their own company" on public.companies
  for update using (
    id = (select company_id from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Profiles Policies
create policy "Users can view profiles in the same company" on public.profiles
  for select using (
    company_id = (select company_id from public.profiles where profiles.id = auth.uid())
  );

create policy "Users can update their own profile" on public.profiles
  for update using (
    id = auth.uid()
  );

-- Invitations Policies
create policy "Admins can view invitations for their company" on public.invitations
  for select using (
    company_id = (select company_id from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "Admins can create invitations for their company" on public.invitations
  for insert with check (
    company_id = (select company_id from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "Admins can update/delete invitations for their company" on public.invitations
  for all using (
    company_id = (select company_id from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- 6. Trigger for Automatic Profile Creation on Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_company_id uuid;
begin
  -- Try to parse company_id from raw_user_meta_data
  user_company_id := (new.raw_user_meta_data->>'company_id')::uuid;

  insert into public.profiles (id, company_id, full_name, role)
  values (
    new.id,
    user_company_id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  );
  return new;
exception
  when others then
    -- Handle case where company_id is missing or invalid
    insert into public.profiles (id, company_id, full_name, role)
    values (
      new.id,
      null,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      coalesce(new.raw_user_meta_data->>'role', 'employee')
    );
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Meetings Table
create table public.meetings (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  title text not null,
  date text not null,
  time text not null,
  attendees integer not null default 0,
  link text not null default '#',
  is_active boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Tasks Table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  title text not null,
  status text not null default 'todo' check (status in ('todo', 'in-progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Attendance Table
create table public.attendance (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  check_in timestamp with time zone default timezone('utc'::text, now()) not null,
  check_out timestamp with time zone,
  status text not null default 'Working' check (status in ('Working', 'Break', 'Completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Leaves Table
create table public.leaves (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null default 'annual' check (type in ('annual', 'sick', 'unpaid')),
  start_date text not null,
  end_date text not null,
  duration text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Chat Messages Table
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  sender_name text not null,
  text text not null,
  channel text not null default 'general',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for all new tables
alter table public.meetings enable row level security;
alter table public.tasks enable row level security;
alter table public.attendance enable row level security;
alter table public.leaves enable row level security;
alter table public.chat_messages enable row level security;

-- RLS Policies for new tables

-- Meetings policies
create policy "Users can view meetings of their own company" on public.meetings
  for select using (company_id = (select company_id from public.profiles where profiles.id = auth.uid()));

create policy "Users can insert meetings for their company" on public.meetings
  for insert with check (company_id = (select company_id from public.profiles where profiles.id = auth.uid()));

-- Tasks policies
create policy "Users can view tasks of their own company" on public.tasks
  for select using (company_id = (select company_id from public.profiles where profiles.id = auth.uid()));

create policy "Users can manage tasks of their own company" on public.tasks
  for all using (company_id = (select company_id from public.profiles where profiles.id = auth.uid()));

-- Attendance policies
create policy "Users can view attendance in their own company" on public.attendance
  for select using (company_id = (select company_id from public.profiles where profiles.id = auth.uid()));

create policy "Users can manage their own attendance" on public.attendance
  for all using (user_id = auth.uid());

-- Leaves policies
create policy "Users can view leaves in their own company" on public.leaves
  for select using (company_id = (select company_id from public.profiles where profiles.id = auth.uid()));

create policy "Users can manage their own leaves" on public.leaves
  for all using (user_id = auth.uid());

-- Chat Messages policies
create policy "Users can view chat messages in their own company" on public.chat_messages
  for select using (company_id = (select company_id from public.profiles where profiles.id = auth.uid()));

create policy "Users can post chat messages in their own company" on public.chat_messages
  for insert with check (
    company_id = (select company_id from public.profiles where profiles.id = auth.uid())
    and sender_id = auth.uid()
  );

