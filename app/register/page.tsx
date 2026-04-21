import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';
import Card from '@/components/ui/Card';

export const metadata = { title: 'Create Account — MedCare Health' };

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0f3460]">Create Your Account</h1>
          <p className="text-[#64748b] mt-2">
            Join MedCare Health to book specialist appointments
          </p>
        </div>
        <Card>
          <RegisterForm />
          <p className="text-center text-sm text-[#64748b] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#16a085] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
