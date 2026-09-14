import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const poppins = Poppins({ 
  weight: ['400', '600', '700'],
  subsets: ["latin"], 
  variable: '--font-poppins' 
});

export const metadata: Metadata = {
  title: "Cafetin | Tu mesa, tus turnos",
  description: "Plataforma de moderación y turnos gamificada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased text-cafetin-dark bg-cafetin-cream min-h-screen">
        {children}
      </body>
    </html>
  );
}
