import AdminLoginForm from '@/components/admin/AdminLoginForm';
import Card from '@/components/ui/Card';
import { Shield } from 'lucide-react';

export const metadata = { title: 'Admin Portal — MedCare Health' };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#f8fafc]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0f3460] rounded-full mb-4">
            <Shield className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-[#0f3460]">Admin Portal</h1>
          <p className="text-[#64748b] mt-1 text-sm">MedCare Health Staff Access</p>
        </div>
        <Card>
          <AdminLoginForm />
        </Card>
      </div>
    </div>
  );
}
