// lib/data.ts


import type { FeatureCardProps } from "@/components/FeatureCard";

export const features: FeatureCardProps[] = [
  {
    icon: 'FaLayerGroup',
    title: 'Frontend Paths',
    description:
      'Progress from HTML, CSS, and JavaScript basics to React, Next.js, Tailwind CSS, and frontend engineering.',
  },
  {
    icon: 'FaPuzzlePiece',
    title: 'Backend Tracks',
    description:
      'Learn Python, APIs, FastAPI, backend architecture, and production-ready service design step by step.',
  },
  {
    icon: 'FaCode',
    title: 'Systems Design',
    description:
      'Connect frontend and backend learning with scalability, reliability, API boundaries, and architecture tradeoffs.',
  },
];

export const testimonials = [
  {
    id: 1,
    text: '"The layout grouping tool completely changed how I understand CSS. I finally grasped flexbox and grid after just a few hours of experimentation!"',
    author: 'Sarah Andrews',
    role: 'Junior Frontend Developer',
    initials: 'SA',
  },
  {
    id: 2,
    text: '"The Python and FastAPI track gave me a clean backend roadmap. I finally understood how to move from scripts to real APIs."',
    author: 'Michael Johnson',
    role: 'Backend Learner',
    initials: 'MJ',
  },
  {
    id: 3,
    text: '"The systems design content tied everything together. It made frontend and backend decisions feel connected instead of isolated topics."',
    author: 'Robert Parker',
    role: 'Software Engineer',
    initials: 'RP',
  },
];

export const steps = [
  {
    title: 'Create an Account',
    description:
      'Sign up for free and set up your learning profile based on your interests and skill level.',
  },
  {
    title: 'Choose Your Path',
    description:
      'Pick a frontend, backend, or systems design path based on the type of engineer you want to become.',
  },
  {
    title: 'Start Learning',
    description:
      'Work through coding lessons, quizzes, and projects that map directly to real engineering skills.',
  },
];













// lib/colorData.ts
export const colorPalettes = [
  {
    name: 'Ocean Breeze',
    description: 'Cool and refreshing colors reminiscent of the sea and sky',
    colors: ['#2c3e50', '#3498db', '#e74c3c', '#ecf0f1'],
  },
  {
    name: 'Vibrant Harmony',
    description: 'Bold and energetic colors that complement each other',
    colors: ['#8e44ad', '#f1c40f', '#16a085', '#f5f5f5'],
  },
  {
    name: 'Earth Tones',
    description: 'Natural colors inspired by the environment',
    colors: ['#34495e', '#e67e22', '#2ecc71', '#f9f9f9'],
  },
  {
    name: 'Primary Contrast',
    description: 'Strong primary colors with clear visual hierarchy',
    colors: ['#2980b9', '#c0392b', '#27ae60', '#f7f7f7'],
  },
];

export const colorGuidelines = [
  {
    icon: '🎨',
    title: 'Color Hierarchy',
    description: 'Establish a clear visual hierarchy by using your primary color for main actions, secondary color for secondary actions, and accent colors for highlights.',
  },
  {
    icon: '👁️',
    title: 'Accessibility',
    description: 'Ensure sufficient contrast between text and background colors. Use tools to check contrast ratios to make your designs accessible to everyone.',
  },
  {
    icon: '🔄',
    title: 'Consistency',
    description: 'Maintain consistency in your color usage across all components and screens. Create a style guide to document your color choices.',
  },
];











// lib/teamData.ts
export const teamMembers = [
  {
    name: 'Zara',
    role: 'Frontend Development Beginner',
    image: '/images/higab.jpg',
    description: 'Building solid foundations in HTML, CSS, and basic JavaScript.',
    skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
    progress: [
      { label: 'HTML', value: 75 },
      { label: 'CSS Layout', value: 65 },
      { label: 'JavaScript', value: 30 },
    ],
  },
  {
    name: 'Ayyub',
    role: 'Frontend and Backend Mentor',
    image: '/images/admin.png',
    description: 'Guiding learners across frontend systems, backend services, and architecture thinking.',
    skills: ['Mentorship', 'JavaScript', 'TypeScript', 'React', 'Python'],
    progress: [
      { label: 'Frontend Systems', value: 90 },
      { label: 'Full-Stack Development', value: 95 },
      { label: 'Backend Architecture', value: 85 },
      { label: 'Systems Design', value: 80 },
    ],
  },
  {
    name: 'DevTribe Crew',
    role: 'Frontend and Backend Cohort',
    image: '/images/git2.jpg',
    description: 'Shipping projects together across frontend, backend, and systems design practice.',
    skills: ['Collaboration', 'Projects', 'Code Reviews'],
    progress: [
      { label: 'Team Projects', value: 20 },
      { label: 'Collaboration', value: 30 },
    ],
  },
  {
    name: 'Muiz',
    role: 'Frontend Development Intermediate',
    image: '/images/user.jpg',
    description: 'Exploring modern web technologies and responsive design.',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    progress: [
      { label: 'Frontend Basics', value: 85 },
      { label: 'React Fundamentals', value: 40 },
      { label: 'Responsive Design', value: 70 },
    ],
  },
  {
    name: 'David',
    role: 'Frontend Development Advanced',
    image: '/images/admin2.png',
    description: 'Focusing on React, Next.js, and accessible interface engineering.',
    skills: ['React', 'Next.js', 'TypeScript', 'Accessibility'],
    progress: [
      { label: 'Next.js', value: 80 },
      { label: 'TypeScript', value: 75 },
      { label: 'Accessibility', value: 70 },
    ],
  },
  {
    name: 'Romlah_Dev',
    role: 'Frontend Development Mastery',
    image: '/images/hijab.png',
    description: 'Specializing in JavaScript and modern frameworks.',
    skills: ['JavaScript', 'React', 'Next.js', 'TypeScript'],
    progress: [
      { label: 'JavaScript', value: 95 },
      { label: 'React Ecosystem', value: 85 },
      { label: 'TypeScript', value: 70 },
    ],
  },
  {
    name: 'Iremide',
    role: 'Backend Development FastAPI',
    image: '/images/hijab.png',
    description: 'Learning Python APIs, request validation, and service structure with FastAPI.',
    skills: ['Python', 'FastAPI', 'Pydantic', 'APIs'],
    progress: [
      { label: 'Python', value: 65 },
      { label: 'FastAPI', value: 60 },
    ],
  },
  {
    name: 'Uthman',
    role: 'Systems Design Learner',
    image: '/images/user.jpg',
    description: 'Exploring how APIs, databases, queues, and scaling decisions fit together.',
    skills: ['Python', 'System Design', 'APIs', 'Problem Solving'],
    progress: [
      { label: 'Python', value: 75 },
      { label: 'Architecture', value: 65 },
      { label: 'Scalability', value: 50 },
    ],
  },
];
