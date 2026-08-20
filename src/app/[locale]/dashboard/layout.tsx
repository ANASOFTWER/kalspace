import Sidebar from '@/components/navigation/Sidebar';
import MobileNav from '@/components/navigation/MobileNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#050816] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
