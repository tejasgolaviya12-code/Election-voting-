import { useGetAdminStats } from "@workspace/api-client-react";
import { useRefreshNews, useSyncElectionStatuses } from "@workspace/api-client-react";
import { Users, Vote, AlertCircle, CheckCircle, Clock, RefreshCw, CalendarCheck, Newspaper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { data: stats, isLoading, refetch: refetchStats } = useGetAdminStats();
  const { toast } = useToast();

  const syncMutation = useSyncElectionStatuses({
    mutation: {
      onSuccess: (data) => {
        toast({
          title: "Status Sync Complete",
          description: `${data.updated} election(s) updated — ${data.toLive} moved to Live, ${data.toCompleted} moved to Completed.`,
        });
        refetchStats();
      },
      onError: (err: any) => {
        toast({ title: "Sync Failed", description: err.message, variant: "destructive" });
      },
    },
  });

  const newsMutation = useRefreshNews({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "News Refreshed", description: `${data.total} election news articles fetched from media sources.` });
      },
      onError: (err: any) => {
        toast({ title: "News Refresh Failed", description: err.message, variant: "destructive" });
      },
    },
  });

  if (isLoading) return <div className="p-8">Loading stats...</div>;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Platform Overview</h2>
          <p className="text-slate-500">Real-time statistics and controls for the voting portal</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <CalendarCheck className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? "Syncing..." : "Sync Election Status"}
          </button>
          <button
            onClick={() => newsMutation.mutate()}
            disabled={newsMutation.isPending}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors shadow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${newsMutation.isPending ? 'animate-spin' : ''}`} />
            {newsMutation.isPending ? "Fetching..." : "Refresh News"}
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard title="Total Registered Voters" value={stats.totalUsers.toLocaleString()} icon={Users} color="bg-blue-500" />
        <StatCard title="Total Votes Cast" value={stats.totalVotesCast.toLocaleString()} icon={Vote} color="bg-purple-500" />
        <StatCard title="Live Elections" value={stats.liveElections.toString()} icon={AlertCircle} color="bg-red-500" />
        <StatCard title="Completed Elections" value={stats.completedElections.toString()} icon={CheckCircle} color="bg-green-500" />
        <StatCard title="Upcoming Elections" value={stats.upcomingElections.toString()} icon={Clock} color="bg-orange-500" />
        <StatCard title="Total Candidates" value={stats.totalCandidates.toString()} icon={Users} color="bg-indigo-500" />
      </div>

      {/* Auto-update info panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <Newspaper className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Automatic Data Updates</h3>
            <p className="text-sm text-slate-600 mb-4">
              The system automatically runs background tasks to keep data fresh:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Election Status Sync</p>
                <p className="text-sm text-slate-700">Runs <strong>every hour</strong> — auto-moves elections from Upcoming → Live → Completed based on start/end dates.</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">News Feed Refresh</p>
                <p className="text-sm text-slate-700">Runs <strong>every 6 hours</strong> — fetches latest election news from NDTV, Times of India, The Hindu, Indian Express.</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Both tasks also run once automatically on server startup. Use the buttons above to force an immediate refresh at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white mr-5 ${color} shadow-lg`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
