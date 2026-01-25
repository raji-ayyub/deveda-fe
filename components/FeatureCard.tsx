// components/FeatureCard.tsx
import { FaLayerGroup, FaCode, FaPuzzlePiece, FaGamepad } from 'react-icons/fa';

const iconMap = {
  FaLayerGroup,
  FaCode,
  FaPuzzlePiece,
  FaGamepad,
};

export type FeatureIcon = keyof typeof iconMap;

export interface FeatureCardProps {
  icon: FeatureIcon;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const IconComponent = iconMap[icon] || FaCode;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 card-hover">
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl mb-6">
        <IconComponent />
      </div>
      <h3 className="text-2xl font-bold text-dark mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}