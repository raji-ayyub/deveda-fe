// components/Footer.tsx
import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaGithub, FaLinkedinIn } from 'react-icons/fa';

export default function Footer() {
  const footerLinks = {
    products: [
      { name: 'Frontend Courses', href: '/courses' },
      { name: 'Backend Courses', href: '/courses' },
      { name: 'Systems Design', href: '/courses' },
      { name: 'Coding Quizzes', href: '/quiz' },
    ],
    resources: [
      { name: 'Lessons', href: '/lessons' },
      { name: 'Course Catalog', href: '/courses' },
      { name: 'About Deveda', href: '/about' },
      { name: 'Quiz Practice', href: '/quiz' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Frontend Track', href: '/courses' },
      { name: 'Backend Track', href: '/courses' },
      { name: 'Systems Design Track', href: '/courses' },
    ],
  };

  const socialLinks = [
    { icon: <FaFacebookF />, href: '#' },
    { icon: <FaTwitter />, href: '#' },
    { icon: <FaGithub />, href: '#' },
    { icon: <FaLinkedinIn />, href: '#' },
  ];

  return (
    <footer className="bg-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 */}
          <div>
            <h3 className="text-xl font-bold mb-4">Deveda</h3>
            <p className="text-gray-400 mb-4">
              Build real coding skills through structured frontend, backend, and systems design learning paths.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-primary transition-colors"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-xl font-bold mb-4">Products</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xl font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xl font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Deveda. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
