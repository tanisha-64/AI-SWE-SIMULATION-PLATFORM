import { type ReactNode } from 'react';
import Navbar from './Navbar';
import FloatingAssistant from '../assistant/FloatingAssistant';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <main>{children}</main>
      <FloatingAssistant />
    </div>
  );
}