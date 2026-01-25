// // app/layout.tsx
// import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
// import './globals.css'
// import Header from '@/components/Header'
// import Footer from '@/components/Footer'
// import { AuthProvider } from '@/context/AuthContext'

// const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = {
//   title: 'CodeCraft - Learn, Practice, Master',
//   description: 'Master coding through interactive learning',
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <AuthProvider>
//           <div className="min-h-screen flex flex-col">
//             <Header />
//             <main className="flex-grow">{children}</main>
//             <Footer />
//           </div>
//         </AuthProvider>
//       </body>
//     </html>
//   )
// }













// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Deveda - Learning Platform',
  description: 'Interactive learning platform with courses, quizzes, and games',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}