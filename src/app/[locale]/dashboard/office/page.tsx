import VirtualOffice from '@/components/office/VirtualOffice';

export default function OfficePage() {
  return (
    <div className="h-full p-4 md:p-6 flex flex-col animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Virtual Headquarters</h1>
          <p className="text-slate-400">Click anywhere to move. Hover over colleagues to interact.</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
         <VirtualOffice />
      </div>
    </div>
  );
}
