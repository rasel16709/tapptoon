'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const nextPath = String(formData.get('next') || '/admin');

  if (!email || !password) {
    redirect(
      `/admin/login?error=${encodeURIComponent('Email and password are required.')}&next=${encodeURIComponent(nextPath)}`
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/admin/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(nextPath)}`
    );
  }

  redirect(nextPath || '/admin');
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
