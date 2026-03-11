import InstructorLayout from '@/components/InstructorLayout';

export default function InstructorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InstructorLayout>{children}</InstructorLayout>;
}
