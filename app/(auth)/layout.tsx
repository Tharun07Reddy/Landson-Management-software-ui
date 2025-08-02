import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import Image from "next/image";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Landson Agri E-Commerce Portal",
  description: "Shop for agricultural machinery, tractors, tillers and spare parts",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left sidebar with branding and e-commerce information */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-600 to-green-800 text-white flex-col">
        <div className="p-8 flex flex-col h-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Landson Agri E-Commerce</h1>
            <p className="mt-2 text-green-100">Your one-stop shop for premium agricultural machinery</p>
          </div>
          
          <div className="flex-grow flex flex-col justify-center space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <Image src="/globe.svg" alt="Premium Tractors" width={24} height={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Premium Tractors</h3>
                <p className="text-green-100">Browse our extensive collection of high-performance tractors for all farming needs</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <Image src="/file.svg" alt="Tillers & Equipment" width={24} height={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Tillers & Equipment</h3>
                <p className="text-green-100">Quality tillers and agricultural equipment to boost your productivity</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <Image src="/window.svg" alt="Genuine Spare Parts" width={24} height={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Genuine Spare Parts</h3>
                <p className="text-green-100">Original spare parts for all machinery with fast delivery options</p>
              </div>
            </div>

            {/* <div className="mt-8 p-4  bg-opacity-10 rounded-lg">
              <h3 className="font-semibold text-xl mb-2">Special Offers</h3>
              <ul className="space-y-2 text-green-100">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Free shipping on orders over $1000</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Exclusive discounts for registered customers</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Seasonal sales on selected machinery</span>
                </li>
              </ul>
            </div> */}
          </div>
          
          <div className="mt-auto pt-8 border-t border-green-500 text-sm text-green-200">
            <p>© 2023 Landson Agri E-Commerce. All rights reserved.</p>
            <p className="mt-2">Trusted by farmers worldwide for quality agricultural machinery and parts.</p>
          </div>
        </div>
      </div>
      
      {/* Right side with authentication form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col items-center mb-6 md:hidden">
              <h1 className="text-2xl font-bold text-gray-900">Landson Agri E-Commerce</h1>
              <p className="text-sm text-gray-600 mt-1">Sign in to shop for agricultural machinery</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}