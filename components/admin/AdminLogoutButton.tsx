'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { LogOut } from 'lucide-react';

export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleLogout}>
      <LogOut size={14} />
      Logout
    </Button>
  );
}
