import { useGetAdminStats } from "@workspace/api-client-react";
import { Users, Vote, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) return <div className="p-8">Loading stats...</div>;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Platform Overview</h2>
        <p className="text-slate-500">Real-time statistics of the voting portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Registered Users" 
          value={stats.totalUsers.toLocaleString()} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Total Votes Cast" 
          value={stats.totalVotesCast.toLocaleString()} 
          icon={Vote} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Live Elections" 
          value={stats.liveElections.toString()} 
          icon={AlertCircle} 
          color="bg-red-500" 
        />
        <StatCard 
          title="Completed Elections" 
          value={stats.completedElections.toString()} 
          icon={CheckCircle} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Upcoming Elections" 
          value={stats.upcomingElections.toString()} 
          icon={Clock} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Total Candidates" 
          value={stats.totalCandidates.toString()} 
          icon={Users} 
          color="bg-indigo-500" 
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white mr-5 ${color} shadow-lg shadow-${color.split('-')[1]}-500/30`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
