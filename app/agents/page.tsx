import AgentHub from '@/components/agents/AgentHub';

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#eff6ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AgentHub />
      </div>
    </div>
  );
}
