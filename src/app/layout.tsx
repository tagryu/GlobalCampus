import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GlobalCampus - 외국인 유학생 커뮤니티",
  description: "외국인 유학생들을 위한 정보 공유, 커뮤니티 형성, 중고 거래, 모임/행사 플랫폼",
  keywords: "유학생, 커뮤니티, 외국인, 한국, 대학교, 정보공유",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <AuthProvider>
        <body className={`${inter.className} antialiased bg-gray-50`}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
          {children}
            </main>
          </div>
        </body>
      </AuthProvider>
    </html>
  );
}
