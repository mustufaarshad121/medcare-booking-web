import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import Card from '@/components/ui/Card';

export const metadata = { title: 'Sign In — MedCare Health' };

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0f3460]">Sign In to MedCare Health</h1>
          <p className="text-[#64748b] mt-2">Access your appointments and book new ones</p>
        </div>
        <Card>
          <LoginForm />
          <p className="text-center text-sm text-[#64748b] mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#16a085] font-medium hover:underline">
              Create one
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
