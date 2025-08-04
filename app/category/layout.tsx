import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Category Management - Landson",
  description: "Manage product categories for Landson Agri E-Commerce",
};

export default function CategoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}