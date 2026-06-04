import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'FlowOS — Workflow Automation Platform',
  description: 'Tự động hóa quy trình làm việc với hàng trăm template sẵn có. Không cần code, chỉ cần chọn và chạy.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
