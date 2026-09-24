import Link from 'next/link';
import Image from 'next/image';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-primary rounded-t-2xl px-6 py-4 flex items-center justify-between z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
      {/* Icon Sidebar / Menu */}
      <button className="flex flex-col items-center justify-center outline-none">
        <Image 
          src="/icon sidebar.svg" 
          alt="Sidebar Menu" 
          width={32} 
          height={32} 
        />
      </button>

      {/* Menu Text */}
      <div className="flex gap-4 sm:gap-6 items-center">
        <Link href="/" className="text-[#FBFFF3] text-sm font-medium hover:opacity-80 transition-opacity">
          Beranda
        </Link>
        <Link href="/tentang" className="text-[#FBFFF3] text-sm font-medium hover:opacity-80 transition-opacity">
          Tentang Modul
        </Link>
        <Link href="/alur" className="text-[#FBFFF3] text-sm font-medium hover:opacity-80 transition-opacity">
          Alur Modul
        </Link>
      </div>
    </nav>
  );
}
