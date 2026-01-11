// app/about/page.tsx
import ProfileCard from '@/components/ProfileCard';
import { teamMembers } from '@/lib/data';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Header */}
      <header className="bg-gray-900 py-6 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-accent">
            <a href="/">DevTribe</a>
          </h1>
          <nav className="flex gap-6">
            <a href="/layout-demo" className="text-gray-300 hover:text-accent transition-colors">
              Layout Practice
            </a>
            <a href="/games" className="text-gray-300 hover:text-accent transition-colors">
              Games
            </a>
            <a href="/about" className="text-gray-300 hover:text-accent transition-colors">
              About Us
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-gray-900 to-dark">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-accent">
            We Are Builders. Dreamers. Learners.
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            DevTribe is a community of curious minds and passionate creators.  
            We experiment, we learn, we build — together.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 bg-dark">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-3xl font-bold mb-8 text-accent">Our Story</h3>
          <div className="bg-gray-900/50 rounded-xl p-8 backdrop-blur-sm">
            <p className="text-gray-300 text-lg leading-relaxed">
              What started as a small group of friends exploring code late at night  
              has grown into a learning tribe. We believe technology is best learned  
              through collaboration, creativity, and play. Each member brings unique  
              perspectives and skills, creating a dynamic environment where everyone  
              can grow and contribute.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mt-6">
              Our mission is to make coding accessible, engaging, and fun for everyone.  
              Whether you're just starting your journey or you're an experienced developer  
              looking to sharpen your skills, there's a place for you in DevTribe.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center text-accent">Meet the Tribe</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <ProfileCard key={index} {...member} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 text-center">
        <div className="container mx-auto px-4">
          <p className="text-gray-500">
            © {new Date().getFullYear()} DevTribe Collective — Building and Learning Together
          </p>
        </div>
      </footer>
    </div>
  );
}