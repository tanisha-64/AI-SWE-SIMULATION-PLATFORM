import type { ReactNode } from 'react';
import Navbar from './Navbar';
import FloatingAssistant from '../assistant/FloatingAssistant';
import JellyBlobs from '../ui/JellyBlobs';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <JellyBlobs variant="subtle" />
      <div className="relative z-10">
        <Navbar />
        <main>{children}</main>
      </div>
      <FloatingAssistant />
    </div>
  );
}