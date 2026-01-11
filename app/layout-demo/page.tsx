// app/layout-demo/page.tsx
import LayoutDemo from '@/components/LayoutDemo';

export default function LayoutDemoPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-dark">
          Enhanced Layout Grouping Demo
        </h1>
        <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
          Visualize and experiment with CSS layout techniques. Drag, drop, resize, and group elements.
        </p>
        <LayoutDemo />
      </div>
    </div>
  );
}