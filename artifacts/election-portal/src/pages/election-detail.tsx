import { useGetElection, useGetMyVote, useCastVote, useGetElectionResults } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { MapPin, Calendar, Info, CheckCircle, ShieldAlert, BarChart2, Trophy } from "lucide-react";
import { getStatusColor, getElectionTypeLabel } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export default function ElectionDetail() {
  const params = useParams();
  const electionId = parseInt(params.id || "0", 10);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  const { data: election, isLoading, error } = useGetElection(electionId);
  const { data: voteStatus, refetch: refetchVoteStatus } = useGetMyVote(electionId, { query: { enabled: isAuthenticated } });
  const { data: results } = useGetElectionResults(electionId);

  const castVoteMutation = useCastVote({
    mutation: {
      onSuccess: () => {
        toast({ title: "Vote Cast Successfully!", description: "Your vote has been securely recorded. Thank you for participating." });
        refetchVoteStatus();
      },
      onError: (err: any) => {
        toast({ title: "Voting Failed", description: err.message || "An error occurred", variant: "destructive" });
      }
    }
  });

  // Auto-scroll to results if ?tab=results in URL
  useEffect(() => {
    if (window.location.search.includes('tab=results') && resultsRef.current) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 600);
    }
  }, [election]);

  const handleVote = (candidateId: number) => {
    if (confirm("Are you sure you want to vote for this candidate? You cannot change your vote once cast.")) {
      castVoteMutation.mutate({ id: electionId, data: { candidateId } });
    }
  };

  if (isLoading) return (
    <div className="p-20 flex justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
  if (error || !election) return <div className="p-20 text-center text-red-500">Failed to load election details.</div>;

  const isLive = election.status === 'live';
  const isCompleted = election.status === 'completed';
  const totalVotes = results?.reduce((sum, r) => sum + r.voteCount, 0) || 0;
  const topCandidate = results?.sort((a, b) => b.voteCount - a.voteCount)[0];

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
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(election.status)}`}>
                  {isLive ? '🔴 Live' : isCompleted ? '✅ Completed' : '🟡 Upcoming'}
                </span>
                <span className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-medium">
                  {getElectionTypeLabel(election.electionType)}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-tight">
                {election.title}
              </h1>
              {election.description && (
                <p className="text-lg text-slate-300 max-w-2xl">{election.description}</p>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[260px]">
              <div className="space-y-4">
                <div className="flex items-center text-slate-300">
                  <MapPin className="w-5 h-5 mr-3 text-primary shrink-0" />
                  <div>
                    <div className="text-xs text-slate-400">Location</div>
                    <div className="font-semibold text-white">{election.state} {election.constituency ? `— ${election.constituency}` : ''}</div>
                  </div>
                </div>
                <div className="flex items-center text-slate-300">
                  <Calendar className="w-5 h-5 mr-3 text-primary shrink-0" />
                  <div>
                    <div className="text-xs text-slate-400">Schedule</div>
                    <div className="font-semibold text-white">
                      {format(new Date(election.startDate), 'dd MMM')} to {format(new Date(election.endDate), 'dd MMM yyyy')}
                    </div>
                  </div>
                </div>
                {totalVotes > 0 && (
                  <div className="flex items-center text-slate-300">
                    <BarChart2 className="w-5 h-5 mr-3 text-primary shrink-0" />
                    <div>
                      <div className="text-xs text-slate-400">Total Votes Cast</div>
                      <div className="font-semibold text-white">{totalVotes.toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 space-y-10">

        {/* Voting Status Panel */}
        <div>
          {!isAuthenticated ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center text-slate-700">
                <ShieldAlert className="w-8 h-8 text-orange-500 mr-4 shrink-0" />
                <div>
                  <h3 className="font-bold text-lg">Authentication Required</h3>
                  <p className="text-sm text-slate-500">You must be logged in with your Aadhaar to vote.</p>
                </div>
              </div>
              <Link href="/login" className="shrink-0 px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                Login to Vote
              </Link>
            </div>
          ) : voteStatus?.hasVoted ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-6 flex items-start gap-4">
              <CheckCircle className="w-10 h-10 text-green-500 shrink-0" />
              <div>
                <h3 className="font-bold text-xl text-green-900 mb-1">Your vote has been recorded securely.</h3>
                <p className="text-green-700 mb-3">Thank you for participating in the democratic process.</p>
                <div className="bg-white/70 inline-flex flex-wrap gap-3 px-4 py-2 rounded-lg border border-green-200/50 text-sm">
                  <span><span className="text-slate-500">Voted for: </span><span className="font-bold text-slate-900">{voteStatus.candidateName}</span></span>
                  <span className="text-slate-300">|</span>
                  <span className="font-medium text-slate-700">{voteStatus.partyName}</span>
                  {voteStatus.votedAt && (
                    <><span className="text-slate-300">|</span><span className="text-slate-500">{format(new Date(voteStatus.votedAt), 'dd MMM yyyy, h:mm a')}</span></>
                  )}
                </div>
              </div>
            </div>
          ) : isLive ? (
            <div className="bg-white rounded-2xl shadow-lg border-l-4 border-l-primary border border-primary/20 p-6 flex items-start gap-4">
              <Info className="w-8 h-8 text-primary shrink-0" />
              <div>
                <h3 className="font-bold text-lg text-slate-900">Voting is Open</h3>
                <p className="text-slate-600">Select your preferred candidate below. <strong>You can only cast your vote once</strong> — choose carefully.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center">
              <p className="text-slate-500 font-medium">
                {election.status === 'upcoming' ? 'Voting has not started yet for this election.' : 'Voting is closed for this election.'}
              </p>
            </div>
          )}
        </div>

        {/* Candidates List */}
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">
            Candidates <span className="text-slate-400 font-normal text-lg">({election.candidates.length})</span>
          </h2>

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
                  transition={{ delay: idx * 0.08 }}
                  key={candidate.id}
                  className={`bg-white rounded-2xl shadow-sm hover:shadow-lg border transition-all overflow-hidden flex flex-col ${
                    voteStatus?.candidateId === candidate.id
                      ? 'border-green-500 ring-2 ring-green-500/20'
                      : 'border-slate-200 hover:border-primary/30'
                  }`}
                >
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center text-slate-500 font-bold text-2xl">
                        {candidate.imageUrl ? (
                          <img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover" />
                        ) : candidate.name.charAt(0)}
                      </div>
                      {voteStatus?.candidateId === candidate.id && (
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Your Vote
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-1">{candidate.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="font-semibold text-slate-700">{candidate.partyName}</span>
                      {candidate.partySymbol && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium border border-amber-200">
                          {candidate.partySymbol}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-sm text-slate-600 mb-4">
                      {candidate.constituency && <div><span className="text-slate-400">Constituency: </span>{candidate.constituency}</div>}
                      {candidate.age && <div><span className="text-slate-400">Age: </span>{candidate.age}</div>}
                      {candidate.education && <div><span className="text-slate-400">Education: </span>{candidate.education}</div>}
                    </div>

                    {candidate.bio && (
                      <p className="text-sm text-slate-500 line-clamp-3 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                        "{candidate.bio}"
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    {isLive && isAuthenticated && !voteStatus?.hasVoted ? (
                      <button
                        onClick={() => handleVote(candidate.id)}
                        disabled={castVoteMutation.isPending}
                        className="w-full py-3 rounded-xl font-bold text-white bg-primary hover:bg-orange-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {castVoteMutation.isPending ? 'Recording...' : `Vote for ${candidate.name.split(' ')[0]}`}
                      </button>
                    ) : (
                      <button disabled className="w-full py-3 rounded-xl font-bold text-slate-400 bg-slate-200 cursor-not-allowed">
                        {voteStatus?.hasVoted
                          ? (voteStatus.candidateId === candidate.id ? '✓ Your Choice' : 'Already Voted')
                          : (!isLive ? 'Voting Closed' : 'Login to Vote')}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Results Section */}
        {(isLive || isCompleted) && results && results.length > 0 && (
          <div ref={resultsRef} className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <BarChart2 className="w-7 h-7 text-primary" />
              <h2 className="text-2xl font-display font-bold text-slate-900">
                {isCompleted ? 'Election Results' : 'Live Vote Count'}
              </h2>
              {isLive && (
                <span className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                  Updating Live
                </span>
              )}
            </div>

            {isCompleted && topCandidate && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-6 flex items-center gap-4">
                <Trophy className="w-10 h-10 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm text-amber-600 font-medium">Winner</p>
                  <p className="text-2xl font-bold text-slate-900">{topCandidate.candidateName}</p>
                  <p className="text-slate-600">{topCandidate.partyName} — <span className="font-semibold">{topCandidate.voteCount.toLocaleString()} votes</span></p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {[...results]
                  .sort((a, b) => b.voteCount - a.voteCount)
                  .map((r, idx) => {
                    const pct = totalVotes > 0 ? Math.round((r.voteCount / totalVotes) * 100) : 0;
                    return (
                      <div key={r.candidateId} className="p-5">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900">{r.candidateName}</p>
                              <p className="text-sm text-slate-500">{r.partyName}{r.partySymbol ? ` • ${r.partySymbol}` : ''}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">{r.voteCount.toLocaleString()}</p>
                            <p className="text-sm text-slate-500">{pct}%</p>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className={`h-full rounded-full ${idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-blue-400' : 'bg-slate-300'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-sm text-slate-500 text-right">
                Total votes cast: <span className="font-semibold text-slate-700">{totalVotes.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
