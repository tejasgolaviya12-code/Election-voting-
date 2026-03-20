import { useGetElection, useGetMyVote, useCastVote } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { MapPin, Calendar, Info, CheckCircle, ShieldAlert } from "lucide-react";
import { getStatusColor, getElectionTypeLabel } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function ElectionDetail() {
  const params = useParams();
  const electionId = parseInt(params.id || "0", 10);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: election, isLoading, error } = useGetElection(electionId);
  const { data: voteStatus, refetch: refetchVoteStatus } = useGetMyVote(electionId, { query: { enabled: isAuthenticated } });
  
  const castVoteMutation = useCastVote({
    mutation: {
      onSuccess: () => {
        toast({ title: "Vote Cast Successfully", description: "Your vote has been securely recorded." });
        refetchVoteStatus();
      },
      onError: (err: any) => {
        toast({ title: "Voting Failed", description: err.message || "An error occurred", variant: "destructive" });
      }
    }
  });

  const handleVote = (candidateId: number) => {
    if (confirm("Are you sure? You cannot change your vote once cast.")) {
      castVoteMutation.mutate({ id: electionId, data: { candidateId } });
    }
  };

  if (isLoading) return <div className="p-20 flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error || !election) return <div className="p-20 text-center text-red-500">Failed to load election details.</div>;

  const isLive = election.status === 'live';

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Election Header Banner */}
      <div className="bg-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-slate-400 hover:text-white text-sm mb-6 inline-block transition-colors">
            &larr; Back to Elections
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(election.status).replace('bg-', 'bg-').replace('border-', 'border-')}`}>
                  {election.status}
                </span>
                <span className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-medium">
                  {getElectionTypeLabel(election.electionType)}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 leading-tight">
                {election.title}
              </h1>
              {election.description && (
                <p className="text-lg text-slate-300 max-w-2xl">{election.description}</p>
              )}
            </div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[280px]">
              <div className="space-y-4">
                <div className="flex items-center text-slate-300">
                  <MapPin className="w-5 h-5 mr-3 text-primary" />
                  <div>
                    <div className="text-xs text-slate-400">Location</div>
                    <div className="font-semibold text-white">{election.state} {election.constituency ? `- ${election.constituency}` : ''}</div>
                  </div>
                </div>
                <div className="flex items-center text-slate-300">
                  <Calendar className="w-5 h-5 mr-3 text-primary" />
                  <div>
                    <div className="text-xs text-slate-400">Schedule</div>
                    <div className="font-semibold text-white">
                      {format(new Date(election.startDate), 'dd MMM')} to {format(new Date(election.endDate), 'dd MMM yyyy')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        
        {/* Voting Status Panel */}
        <div className="mb-10">
          {!isAuthenticated ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center text-slate-700 mb-4 sm:mb-0">
                <ShieldAlert className="w-8 h-8 text-orange-500 mr-4" />
                <div>
                  <h3 className="font-bold text-lg">Authentication Required</h3>
                  <p className="text-sm text-slate-500">You must be logged in with your Aadhaar to vote.</p>
                </div>
              </div>
              <Link href="/login" className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap">
                Login to Vote
              </Link>
            </div>
          ) : voteStatus?.hasVoted ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-6 flex items-start">
              <CheckCircle className="w-10 h-10 text-green-500 mr-5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-xl text-green-900 mb-1">Your vote has been recorded securely.</h3>
                <p className="text-green-700 mb-2">Thank you for participating in the democratic process.</p>
                <div className="bg-white/60 inline-block px-4 py-2 rounded-lg border border-green-200/50 text-sm">
                  <span className="text-slate-500">Voted for: </span>
                  <span className="font-bold text-slate-900">{voteStatus.candidateName}</span> 
                  <span className="text-slate-500 mx-2">|</span>
                  <span className="font-medium text-slate-700">{voteStatus.partyName}</span>
                </div>
              </div>
            </div>
          ) : isLive ? (
            <div className="bg-white rounded-2xl shadow-lg border border-primary/20 p-6 flex items-start border-l-4 border-l-primary">
              <Info className="w-8 h-8 text-primary mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg text-slate-900">Voting is Open</h3>
                <p className="text-slate-600">Select your preferred candidate below. Remember, you can only cast your vote once.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center">
              <p className="text-slate-500 font-medium">Voting is currently closed for this election.</p>
            </div>
          )}
        </div>

        {/* Candidates List */}
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Candidates ({election.candidates.length})</h2>
          
          {election.candidates.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
              No candidates have been registered for this election yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {election.candidates.map((candidate, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={candidate.id}
                  className={`bg-white rounded-2xl shadow-sm hover:shadow-xl border transition-all overflow-hidden flex flex-col ${
                    voteStatus?.candidateId === candidate.id ? 'border-green-500 ring-2 ring-green-500/20' : 'border-slate-200 hover:border-primary/30'
                  }`}
                >
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400 font-bold text-xl">
                        {candidate.imageUrl ? (
                          <img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover" />
                        ) : (
                          candidate.name.charAt(0)
                        )}
                      </div>
                      {voteStatus?.candidateId === candidate.id && (
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" /> Selected
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{candidate.name}</h3>
                    <div className="flex items-center mb-4">
                      <span className="font-semibold text-slate-700">{candidate.partyName}</span>
                      {candidate.partySymbol && (
                        <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">
                          {candidate.partySymbol}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                      {candidate.age && <div><span className="text-slate-400">Age:</span> {candidate.age}</div>}
                      {candidate.education && <div><span className="text-slate-400">Education:</span> {candidate.education}</div>}
                    </div>
                    
                    {candidate.bio && (
                      <p className="text-sm text-slate-500 line-clamp-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        "{candidate.bio}"
                      </p>
                    )}
                  </div>
                  
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    {isLive && isAuthenticated && !voteStatus?.hasVoted ? (
                      <button
                        onClick={() => handleVote(candidate.id)}
                        disabled={castVoteMutation.isPending}
                        className="w-full py-3 rounded-xl font-bold text-white bg-primary hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        Vote for {candidate.name}
                      </button>
                    ) : (
                      <button disabled className="w-full py-3 rounded-xl font-bold text-slate-400 bg-slate-200 cursor-not-allowed">
                        {voteStatus?.hasVoted 
                          ? (voteStatus.candidateId === candidate.id ? 'Your Choice' : 'Already Voted') 
                          : (!isLive ? 'Voting Closed' : 'Login to Vote')}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
