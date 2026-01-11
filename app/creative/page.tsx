// app/creative/page.tsx
'use client';

import { useState } from 'react';
import ColorPalette from '@/components/ColorPalette';
import { colorPalettes, colorGuidelines } from '@/lib/data';

export default function CreativePage() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleColorCopy = async (colorCode: string) => {
    await navigator.clipboard.writeText(colorCode);
    setCopiedColor(colorCode);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Color Harmony</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Discover beautiful color combinations and see how they work in practice
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-dark py-4">
        <div className="container mx-auto px-4">
          <ul className="flex flex-wrap justify-center gap-6">
            <li><a href="#palettes" className="text-white hover:text-secondary transition-colors">Color Palettes</a></li>
            <li><a href="#components" className="text-white hover:text-secondary transition-colors">UI Components</a></li>
            <li><a href="#usage" className="text-white hover:text-secondary transition-colors">Best Practices</a></li>
            <li><a href="#about" className="text-white hover:text-secondary transition-colors">About</a></li>
          </ul>
        </div>
      </nav>

      {/* Color Palettes Section */}
      <section id="palettes" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Inspirational Color Palettes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Curated color combinations for your next project
            </p>
            {copiedColor && (
              <div className="mt-4 inline-block px-4 py-2 bg-success/10 text-success rounded-lg">
                Copied {copiedColor} to clipboard!
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {colorPalettes.map((palette, index) => (
              <ColorPalette
                key={index}
                {...palette}
                onColorCopy={handleColorCopy}
              />
            ))}
          </div>
        </div>
      </section>

      {/* UI Components Section */}
      <section id="components" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">UI Components Demo</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how color combinations work in practical UI elements
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buttons Demo */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-dark mb-6 pb-3 border-b border-gray-200">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  Primary
                </button>
                <button className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Secondary
                </button>
                <button className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Accent
                </button>
                <button className="px-6 py-3 bg-success text-white rounded-lg hover:bg-green-700 transition-colors">
                  Success
                </button>
                <button className="px-6 py-3 bg-warning text-white rounded-lg hover:bg-yellow-700 transition-colors">
                  Warning
                </button>
              </div>
            </div>

            {/* Cards Demo */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-dark mb-6 pb-3 border-b border-gray-200">Cards</h3>
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-lg shadow">
                  <h4 className="text-xl font-bold text-primary mb-2">Information Card</h4>
                  <p className="text-gray-600">
                    This is an example of a card component with a subtle gradient background and soft shadow.
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-lg shadow">
                  <h4 className="text-xl font-bold text-primary mb-2">Feature Highlight</h4>
                  <p className="text-gray-600">
                    Cards are versatile components that can display various types of content.
                  </p>
                </div>
              </div>
            </div>

            {/* Alerts Demo */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-dark mb-6 pb-3 border-b border-gray-200">Alerts & Notifications</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 text-success border-l-4 border-success rounded">
                  <span className="font-semibold">✓ Success:</span> This is a success message
                </div>
                <div className="p-4 bg-yellow-50 text-warning border-l-4 border-warning rounded">
                  <span className="font-semibold">⚠ Warning:</span> This is a warning message
                </div>
                <div className="p-4 bg-red-50 text-error border-l-4 border-error rounded">
                  <span className="font-semibold">✗ Error:</span> This is an error message
                </div>
                <div className="p-4 bg-blue-50 text-secondary border-l-4 border-secondary rounded">
                  <span className="font-semibold">ℹ Info:</span> This is an information message
                </div>
              </div>
            </div>

            {/* Typography Demo */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-dark mb-6 pb-3 border-b border-gray-200">Typography</h3>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-dark">Heading 1</h1>
                <h2 className="text-3xl font-bold text-dark">Heading 2</h2>
                <h3 className="text-2xl font-bold text-dark">Heading 3</h3>
                <p className="text-gray-600 leading-relaxed">
                  This is a paragraph demonstrating how body text appears with this color scheme. 
                  Good typography is essential for readability and user experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guidelines Section */}
      <section id="usage" className="py-16 bg-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Color Usage Guidelines</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Best practices for applying colors in your designs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {colorGuidelines.map((guideline, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-2xl mb-6">
                  {guideline.icon}
                </div>
                <h3 className="text-xl font-bold text-dark mb-4">{guideline.title}</h3>
                <p className="text-gray-600">{guideline.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl mb-4">Color Harmony - Inspiration for Designers & Developers</p>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Explore, experiment, and create beautiful color schemes for your projects
          </p>
          <div className="flex justify-center gap-6">
            <a href="#" className="text-white hover:text-secondary transition-colors text-2xl">
              🐦
            </a>
            <a href="#" className="text-white hover:text-secondary transition-colors text-2xl">
              📷
            </a>
            <a href="#" className="text-white hover:text-secondary transition-colors text-2xl">
              💻
            </a>
            <a href="#" className="text-white hover:text-secondary transition-colors text-2xl">
              🎨
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}