import ProfileCard from '@/components/ProfileCard';
import { teamMembers } from '@/lib/data';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark text-white">
      <header className="bg-gray-900 py-6 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-accent">
            <a href="/">Deveda</a>
          </h1>
          <nav className="flex gap-6">
            <a href="/courses" className="text-gray-300 hover:text-accent transition-colors">
              Courses
            </a>
            <a href="/lessons" className="text-gray-300 hover:text-accent transition-colors">
              Lessons
            </a>
            <a href="/about" className="text-gray-300 hover:text-accent transition-colors">
              About
            </a>
          </nav>
        </div>
      </header>

      <section className="py-20 px-4 text-center bg-gradient-to-b from-gray-900 to-dark">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-accent">
            We Train Developers End To End.
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            Deveda is focused on frontend development, backend development, and the systems design
            thinking that connects them.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 bg-dark">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-3xl font-bold mb-8 text-accent">Our Story</h3>
          <div className="bg-gray-900/50 rounded-xl p-8 backdrop-blur-sm">
            <p className="text-gray-300 text-lg leading-relaxed">
              Deveda started with a simple goal: cut out unrelated learning noise and build clear,
              practical coding paths that move from fundamentals to engineering-level work.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mt-6">
              The curriculum stays centered on HTML, CSS, JavaScript, React, Next.js, Python,
              FastAPI, backend architecture, and systems design so learners always know what they
              are building toward.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center text-accent">Meet the Coding Cohort</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <ProfileCard key={index} {...member} />
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-black py-8 text-center">
        <div className="container mx-auto px-4">
          <p className="text-gray-500">
            © {new Date().getFullYear()} Deveda - Frontend, backend, and systems design learning
          </p>
        </div>
      </footer>
    </div>
  );
}
