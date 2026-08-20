"use client";

import { useState, useEffect } from 'react';
import { Video, Calendar, Plus, Users, X, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Meeting {
  id: string;
  title: string;
  time: string;
  date: string;
  attendees: number;
  link: string;
}

const MOCK_MEETINGS: Meeting[] = [];

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [attendees, setAttendees] = useState(1);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadMeetings() {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setIsDemo(true);
          setMeetings(MOCK_MEETINGS);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile || !profile.company_id) {
          setIsDemo(true);
          setMeetings(MOCK_MEETINGS);
          return;
        }

        setUserCompanyId(profile.company_id);

        const { data: dbMeetings, error: dbError } = await supabase
          .from('meetings')
          .select('*')
          .eq('company_id', profile.company_id)
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;

        setMeetings(dbMeetings || []);
        setIsDemo(false);
      } catch (err) {
        console.error('Error loading meetings, running in demo mode:', err);
        setIsDemo(true);
        setMeetings(MOCK_MEETINGS);
      } finally {
        setLoading(false);
      }
    }

    loadMeetings();
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMsg('');

    try {
      if (isDemo) {
        const newMockMeeting: Meeting = {
          id: `mock-${Date.now()}`,
          title,
          date,
          time,
          attendees,
          link: '#'
        };
        setMeetings(prev => [newMockMeeting, ...prev]);
        setIsOpen(false);
        return;
      }

      if (!userCompanyId) {
        throw new Error('لم يتم العثور على معرف الشركة.');
      }

      const randomMeetingLink = `https://meet.jit.si/kalspace-${Math.random().toString(36).substring(2, 8)}`;

      const { data, error } = await supabase
        .from('meetings')
        .insert({
          company_id: userCompanyId,
          title,
          date,
          time,
          attendees,
          link: randomMeetingLink
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'فشل حفظ الاجتماع.');
      }

      setMeetings(prev => [data, ...prev]);
      setIsOpen(false);
    } catch (err: any) {
      console.error('Error scheduling meeting:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء جدولة الاجتماع.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="h-full p-4 md:p-6 flex flex-col animate-fade-in-up">


      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">غرف الاجتماعات (Meetings)</h1>
          <p className="text-slate-400">انضم إلى غرف اجتماعات الفيديو أو قم بجدولة موعد</p>
        </div>
        <button
          onClick={() => {
            setIsOpen(true);
            setTitle('');
            setDate('');
            setTime('');
            setAttendees(1);
            setErrorMsg('');
          }}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> جدولة اجتماع
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Rooms */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-white">الغرف النشطة الآن (Active Rooms)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { name: 'Board Room', active: 3, capacity: 10, bg: 'bg-primary' },
                { name: 'Developer Den', active: 5, capacity: 8, bg: 'bg-secondary' },
                { name: 'HR Interview Room', active: 0, capacity: 4, bg: 'bg-slate-700' },
              ].map((room, i) => (
                <div key={i} className="glass-card rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{room.name}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                      <Users className="w-4 h-4" />
                      <span>{room.active} / {room.capacity} in room</span>
                    </div>
                    <button 
                      className={`w-full py-2.5 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2 ${
                        room.active > 0 ? 'bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20' : 'bg-slate-800 hover:bg-slate-750'
                      }`}
                    >
                      <Video className="w-4 h-4" /> انضم الآن
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Meetings */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 h-fit">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" /> الاجتماعات المجدولة
            </h2>
            <div className="space-y-4">
              {meetings.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">لا توجد اجتماعات مجدولة حالياً.</p>
              ) : (
                meetings.map((meeting) => (
                  <div key={meeting.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <h3 className="font-semibold text-white mb-1 text-sm">{meeting.title}</h3>
                    <p className="text-xs text-slate-400 mb-3">{meeting.date} • {meeting.time}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{meeting.attendees} attendees</span>
                      <a
                        href={meeting.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-primary hover:text-primary-hover"
                      >
                        Join &rarr;
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative animate-fade-in-up">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2">جدولة اجتماع جديد</h3>
            <p className="text-sm text-slate-400 mb-6">املأ البيانات أدناه لتحديد موعد اجتماع لفريقك.</p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/25 rounded-lg text-danger text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">عنوان الاجتماع</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="مثال: Daily Standup"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">التاريخ</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    placeholder="Today أو Tomorrow أو 25 Aug"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">الوقت</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    placeholder="10:00 AM - 10:30 AM"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">عدد الحضور المتوقع</label>
                <input
                  type="number"
                  value={attendees}
                  onChange={(e) => setAttendees(parseInt(e.target.value) || 1)}
                  required
                  min={1}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'حفظ وجدولة الاجتماع'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
