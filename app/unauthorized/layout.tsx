import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Access Restricted - Landson Management Portal',
  description: 'Secure administrative portal for authorized personnel only. Contact your administrator for access.',
  robots: 'noindex, nofollow',
};

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}