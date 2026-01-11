// components/ProfileCard.tsx
'use client';

interface ProfileCardProps {
  name: string;
  role: string;
  image: string;
  description: string;
  skills: string[];
  progress: { label: string; value: number }[];
}

export default function ProfileCard({ name, role, description, skills, progress }: ProfileCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors group">
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-2xl font-bold mb-4 mx-auto group-hover:scale-110 transition-transform">
        {initials}
      </div>
      
      {/* Info */}
      <h3 className="text-xl font-bold text-white text-center mb-2">{name}</h3>
      <p className="text-accent text-center mb-4">{role}</p>
      <p className="text-gray-300 text-center text-sm mb-6">{description}</p>
      
      {/* Skills */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {skills.map((skill, index) => (
          <span key={index} className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm">
            {skill}
          </span>
        ))}
      </div>
      
      {/* Progress Bars */}
      <div className="space-y-4">
        {progress.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">{item.label}</span>
              <span className="text-accent">{item.value}%</span>
            </div>
            <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}