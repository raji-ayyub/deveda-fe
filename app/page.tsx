// app/page.tsx
import FeatureCard from '@/components/FeatureCard';
// import TestimonialCard from '@/components/TestimonialCard';
import { features, testimonials, steps } from '@/lib/data';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-emerald-50 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark mb-6">
            Master Coding Through Interactive Learning
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            CodeCraft offers a comprehensive platform to learn, practice, and master programming
            skills through interactive challenges, quizzes, and real-world projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary btn-large">Get Started</button>
            <button className="btn-secondary btn-large">Explore Features</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-dark mb-4">What We Offer</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform is designed to help developers of all levels improve their skills
              through practical, engaging content.
            </p>
          </div>
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div> */}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-dark mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Start your coding journey in three simple steps
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            {steps.map((step, index) => (
              <div key={index} className="flex-1 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-bold text-dark mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-dark mb-4">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of developers who have improved their skills with CodeCraft
            </p>
          </div>
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} {...testimonial} />
            ))}
          </div> */}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Start Your Coding Journey Today</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of developers and take your skills to the next level with our
            interactive learning platform.
          </p>
          <button className="bg-white text-primary font-bold hover:bg-gray-100 btn-large">
            Create Free Account
          </button>
        </div>
      </section>
    </>
  );
}