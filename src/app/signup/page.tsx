"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Public signup is disabled.
 * This page is kept to handle any stale links gracefully.
 * The middleware also permanently redirects /signup → /login.
 */
export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return null;
}
