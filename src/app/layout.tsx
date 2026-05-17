import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import AppHeader from '@/components/AppHeader';
import MobileNav from '@/components/MobileNav';

export const metadata: Metadata = {
  title: '手順書管理 | HORIZON-JIT',
  description: '業務手順書を作成・管理・共有するシステム',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-bg min-h-screen">
        <div className="flex h-screen overflow-hidden">
          {/* PC sidebar */}
          <Sidebar />

          {/* Main column */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <AppHeader />
            <main className="flex-1 overflow-y-auto pb-[60px] md:pb-0">
              {children}
            </main>
          </div>
        </div>

        {/* Mobile bottom navigation */}
        <MobileNav />
      </body>
    </html>
  );
}
