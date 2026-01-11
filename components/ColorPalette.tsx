// components/ColorPalette.tsx
'use client';

interface ColorPaletteProps {
  name: string;
  description: string;
  colors: string[];
  onColorCopy: (color: string) => void;
}

export default function ColorPalette({ name, description, colors, onColorCopy }: ColorPaletteProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* Color Swatches */}
      <div className="flex h-32">
        {colors.map((color, index) => (
          <div
            key={index}
            className="flex-1 flex items-end justify-center p-2 cursor-pointer hover:flex-1.2 transition-all duration-300"
            style={{ backgroundColor: color }}
            onClick={() => onColorCopy(color)}
          >
            <span 
              className={`text-sm font-medium px-2 py-1 rounded ${index === colors.length - 1 ? 'text-gray-900 bg-white/80' : 'text-white bg-black/40'}`}
            >
              {color}
            </span>
          </div>
        ))}
      </div>
      
      {/* Palette Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-dark mb-2">{name}</h3>
        <p className="text-gray-600">{description}</p>
        <div className="mt-4 text-sm text-gray-500">
          Click on any color to copy its hex code
        </div>
      </div>
    </div>
  );
}