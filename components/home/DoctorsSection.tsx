'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import type { Doctor } from '@/lib/types';
import { getInitials } from '@/lib/data';
import Button from '@/components/ui/Button';

export default function DoctorsSection({ isLoggedIn: _initial }: { isLoggedIn: boolean }) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    getDocs(query(collection(db, 'doctors'), limit(3))).then(snap => {
      setDoctors(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name,
          specialty: data.specialty,
          bio: data.bio ?? null,
          location: data.location,
          avatar_color: data.avatarColor ?? data.avatar_color ?? '#0f3460',
        } as Doctor;
      }));
    }).catch(() => {});
  }, []);

  return (
    <section id="doctors" className="py-16 md:py-20 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f3460]">Meet Our Specialists</h2>
          <p className="text-[#64748b] mt-3 max-w-xl mx-auto">
            Board-certified physicians with decades of experience in preventive and specialist care.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctors.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4"
                style={{ backgroundColor: d.avatar_color }}
              >
                {getInitials(d.name)}
              </div>
              <h3 className="font-semibold text-[#0f3460] text-lg mb-1">{d.name}</h3>
              <p className="text-[#16a085] text-sm font-medium mb-2">{d.specialty}</p>
              <p className="flex items-center gap-1 text-[#64748b] text-xs mb-4">
                <MapPin size={12} />
                {d.location}
              </p>
              {d.bio && (
                <p className="text-[#64748b] text-sm leading-relaxed mb-5 line-clamp-3">{d.bio}</p>
              )}
              <Link href={user ? '/book' : '/login'} className="mt-auto">
                <Button variant="secondary" size="sm">Book Now</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
