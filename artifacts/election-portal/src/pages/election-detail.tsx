import { useGetElection, useGetMyVote, useCastVote, useGetElectionResults, useGetECIResults } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { format, formatDistanceToNow } from "date-fns";
import { MapPin, Calendar, Info, CheckCircle, ShieldAlert, BarChart2, Trophy, X, Vote, AlertTriangle, User, ExternalLink } from "lucide-react";
import { getStatusColor, getElectionTypeLabel } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface ConfirmCandidate {
  id: number;
  name: string;
  partyName: string;
  partySymbol?: string | null;
  imageUrl?: string | null;
  constituency?: string | null;
}

function VoteConfirmModal({
  candidate,
  onConfirm,
  onCancel,
  isPending,
}: {
  candidate: ConfirmCandidate | null;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  if (!candidate) return null;
  return (
    <AnimatePresence>
      {candidate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header bar */}
            <div className="bg-gradient-to-r from-primary to-orange-500 p-6 text-white text-center relative">
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-center mb-2">
                <Vote className="w-8 h-8 mr-2" />
                <span className="font-bold text-xl">Confirm Your Vote</span>
              </div>
              <p className="text-orange-100 text-sm">Please review your selection carefully</p>
            </div>

            <div className="p-6">
              {/* Candidate preview */}
              <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden flex items-center justify-center text-slate-500 font-bold text-3xl shrink-0 border-4 border-white shadow-md">
                  {candidate.imageUrl ? (
                    <img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-0.5">You are voting for</p>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">{candidate.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="font-semibold text-slate-700">{candidate.partyName}</span>
                    {candidate.partySymbol && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium border border-amber-200">
                        {candidate.partySymbol}
                      </span>
                    )}
                  </div>
                  {candidate.constituency && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {candidate.constituency}
                    </p>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> This action is <strong>irreversible</strong>. Once your vote is submitted, it cannot be changed or withdrawn. You may only vote once per election.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={isPending}
                  className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isPending}
                  className="flex-1 py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Vote className="w-4 h-4" />
                      Confirm Vote
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ElectionDetail() {
  const params = useParams();
  const electionId = parseInt(params.id || "0", 10);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [confirmCandidate, setConfirmCandidate] = useState<ConfirmCandidate | null>(null);

  const { data: election, isLoading, error } = useGetElection(electionId, {
    query: { refetchInterval: 30 * 1000 }
  });
  const { data: voteStatus, refetch: refetchVoteStatus } = useGetMyVote(electionId, { query: { enabled: isAuthenticated } });
  const { data: results, dataUpdatedAt } = useGetElectionResults(electionId, {
    query: { refetchInterval: 30 * 1000 }
  });
  const { data: eciResults } = useGetECIResults(electionId, {
    query: { enabled: true, retry: false }
  });

  const castVoteMutation = useCastVote({
    mutation: {
      onSuccess: () => {
        setConfirmCandidate(null);
        toast({ title: "🗳️ Vote Cast Successfully!", description: "Your vote has been securely recorded. Thank you for participating in democracy." });
        refetchVoteStatus();
      },
      onError: (err: any) => {
        setConfirmCandidate(null);
        toast({ title: "Voting Failed", description: err.message || "An error occurred. Please try again.", variant: "destructive" });
      }
    }
  });

  useEffect(() => {
    if (window.location.search.includes('tab=results') && resultsRef.current) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 600);
    }
  }, [election]);

  if (isLoading) return (
    <div className="p-20 flex justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
  if (error || !election) return <div className="p-20 text-center text-red-500">Failed to load election details.</div>;

  const isLive = election.status === 'live';
  const isCompleted = election.status === 'completed';
  const totalVotes = results?.reduce((sum, r) => sum + r.voteCount, 0) || 0;
  const topCandidate = results ? [...results].sort((a, b) => b.voteCount - a.voteCount)[0] : null;

  const userState = (user as any)?.state || '';
  const userConstituency = (user as any)?.constituency || '';
  const isUserArea =
    election.state === 'National' ||
    election.state === userState ||
    (election.constituency && userConstituency &&
      election.constituency.toLowerCase() === userConstituency.toLowerCase());

  const handleVoteClick = (candidate: ConfirmCandidate) => {
    setConfirmCandidate(candidate);
  };

  const handleConfirmVote = () => {
    if (confirmCandidate) {
      castVoteMutation.mutate({ id: electionId, data: { candidateId: confirmCandidate.id } });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Confirmation Modal */}
      <VoteConfirmModal
        candidate={confirmCandidate}
        onConfirm={handleConfirmVote}
        onCancel={() => !castVoteMutation.isPending && setConfirmCandidate(null)}
        isPending={castVoteMutation.isPending}
      />

      {/* Header */}
      <div className="bg-slate-900 text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-slate-400 hover:text-white text-sm mb-6 inline-flex items-center gap-1 transition-colors">
            ← Back to Elections
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
                {isAuthenticated && isUserArea && (
                  <span className="bg-green-500/20 text-green-300 border border-green-400/30 px-3 py-1 rounded-full text-xs font-bold">
                    📍 Your Area
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-tight">{election.title}</h1>
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
                    <div className="font-semibold text-white">{election.state}{election.constituency ? ` — ${election.constituency}` : ''}</div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 space-y-10">

        {/* Voting Status Panel */}
        {!isAuthenticated ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center text-slate-700 gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Login Required to Vote</h3>
                <p className="text-sm text-slate-500">Sign in with your Aadhaar credentials to cast your vote.</p>
              </div>
            </div>
            <Link href="/login" className="shrink-0 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors">
              Login to Vote
            </Link>
          </div>
        ) : voteStatus?.hasVoted ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-green-900 mb-1">Vote Recorded Successfully</h3>
              <p className="text-green-700 mb-3">Thank you for participating in the democratic process.</p>
              <div className="bg-white/70 inline-flex flex-wrap gap-3 px-4 py-2.5 rounded-xl border border-green-200/50 text-sm">
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
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Voting Booth is Open</h3>
              <p className="text-slate-600">Select your candidate below. A confirmation screen will appear before your vote is submitted. <strong>You can only vote once.</strong></p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 text-center text-slate-500 font-medium">
            {election.status === 'upcoming' ? '🗓️ Voting has not started yet. Check back on the start date.' : '🔒 Voting is closed for this election.'}
          </div>
        )}

        {/* Candidates */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-slate-900">
              Candidates
              <span className="ml-2 text-base font-normal text-slate-400">({election.candidates.length})</span>
            </h2>
            {isAuthenticated && !isUserArea && (
              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                📍 Election outside your registered area
              </span>
            )}
          </div>

          {election.candidates.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
              No candidates registered yet for this election.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {election.candidates.map((candidate, idx) => {
                const isMyVote = voteStatus?.candidateId === candidate.id;
                const canVote = isLive && isAuthenticated && !voteStatus?.hasVoted;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    key={candidate.id}
                    className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden flex flex-col group ${
                      isMyVote
                        ? 'border-green-400 ring-2 ring-green-400/20 shadow-green-100'
                        : canVote
                          ? 'border-slate-200 hover:border-primary/40 hover:shadow-lg cursor-pointer'
                          : 'border-slate-200'
                    }`}
                  >
                    {/* Candidate photo / avatar */}
                    <div className="relative">
                      <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                        {candidate.imageUrl ? (
                          <img
                            src={candidate.imageUrl}
                            alt={candidate.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-white/60 border-4 border-white shadow-md flex items-center justify-center text-slate-400 font-bold text-4xl">
                            {candidate.name.charAt(0)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>

                      {/* Party symbol badge */}
                      {candidate.partySymbol && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 px-2.5 py-1 rounded-full text-xs font-bold shadow border border-white/60">
                          {candidate.partySymbol}
                        </div>
                      )}

                      {/* Your vote badge */}
                      {isMyVote && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Your Vote
                        </div>
                      )}

                      {/* Name overlay at bottom of photo */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">{candidate.name}</h3>
                        <p className="text-white/80 text-sm font-medium drop-shadow">{candidate.partyName}</p>
                      </div>
                    </div>

                    <div className="p-4 flex-grow flex flex-col">
                      {/* Details */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4">
                        {candidate.constituency && (
                          <div className="flex items-center gap-1 col-span-2">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{candidate.constituency}</span>
                          </div>
                        )}
                        {candidate.age && (
                          <div><span className="text-slate-400">Age: </span>{candidate.age}</div>
                        )}
                        {candidate.education && (
                          <div className="col-span-2"><span className="text-slate-400">Education: </span>{candidate.education}</div>
                        )}
                      </div>

                      {candidate.bio && (
                        <p className="text-xs text-slate-500 italic line-clamp-2 bg-slate-50 rounded-lg p-2.5 border border-slate-100 mb-4 flex-grow">
                          "{candidate.bio}"
                        </p>
                      )}

                      {/* Vote button */}
                      <div className="mt-auto">
                        {canVote ? (
                          <button
                            onClick={() => handleVoteClick({
                              id: candidate.id,
                              name: candidate.name,
                              partyName: candidate.partyName,
                              partySymbol: candidate.partySymbol,
                              imageUrl: candidate.imageUrl,
                              constituency: candidate.constituency,
                            })}
                            className="w-full py-3 rounded-xl font-bold text-white bg-primary hover:bg-orange-600 active:scale-95 transition-all shadow-md hover:shadow-lg group-hover:shadow-primary/20 flex items-center justify-center gap-2"
                          >
                            <Vote className="w-4 h-4" />
                            Vote for {candidate.name.split(' ')[0]}
                          </button>
                        ) : (
                          <div className={`w-full py-3 rounded-xl text-center font-bold text-sm ${
                            isMyVote
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            {voteStatus?.hasVoted
                              ? (isMyVote ? '✓ Your Selected Candidate' : 'Not Selected')
                              : election.status === 'upcoming' ? 'Voting Not Started'
                              : isLive ? 'Login to Vote'
                              : 'Voting Closed'}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ECI Official Results — Real party-wise data */}
        {eciResults && (
          <div className="scroll-mt-24">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <BarChart2 className="w-7 h-7 text-primary" />
                <h2 className="text-2xl font-display font-bold text-slate-900">
                  Official ECI Results
                </h2>
                <span className="bg-green-100 text-green-700 border border-green-300 text-xs font-bold px-3 py-1 rounded-full">
                  ✓ Verified Data
                </span>
              </div>
              <a
                href="https://results.eci.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Source: results.eci.gov.in
              </a>
            </div>

            {/* Alliance summary (for national elections) */}
            {eciResults.allianceSummary && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {eciResults.allianceSummary.map((alliance) => {
                  const pct = Math.round((alliance.seats / eciResults.totalSeats) * 100);
                  const isMajority = alliance.seats >= eciResults.majorityMark;
                  return (
                    <motion.div
                      key={alliance.name}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white rounded-2xl border p-5 shadow-sm ${isMajority ? 'border-amber-300 ring-2 ring-amber-200/50' : 'border-slate-200'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 rounded-full shrink-0" style={{ background: alliance.color }} />
                        <span className="font-bold text-lg text-slate-900">{alliance.name}</span>
                        {isMajority && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-amber-200">Majority</span>}
                      </div>
                      <div className="text-4xl font-black text-slate-900 mb-1">{alliance.seats}</div>
                      <div className="text-sm text-slate-500 mb-3">seats &nbsp;·&nbsp; {pct}% of {eciResults.totalSeats}</div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: alliance.color }}
                        />
                      </div>
                      <div className="text-xs text-slate-400 mt-1.5">{alliance.description}</div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Majority mark indicator */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex items-center gap-4">
              <div className="text-xs text-slate-500 font-medium">Majority mark: <strong className="text-slate-900">{eciResults.majorityMark}</strong> seats</div>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                {/* Full seat bar stacked */}
                <div className="flex h-full">
                  {eciResults.results.slice(0, 12).map((p) => (
                    <div
                      key={p.shortName}
                      className="h-full"
                      style={{ width: `${(p.seats / eciResults.totalSeats) * 100}%`, background: p.color, minWidth: p.seats > 5 ? 2 : 0 }}
                      title={`${p.shortName}: ${p.seats} seats`}
                    />
                  ))}
                </div>
                {/* Majority line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-600"
                  style={{ left: `${(eciResults.majorityMark / eciResults.totalSeats) * 100}%` }}
                  title={`Majority: ${eciResults.majorityMark}`}
                />
              </div>
              <div className="text-xs text-slate-500">Total: <strong className="text-slate-900">{eciResults.totalSeats}</strong> seats</div>
            </div>

            {/* Party-wise breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Party</span>
                <span>Seats Won</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                {[...eciResults.results]
                  .sort((a, b) => b.seats - a.seats)
                  .map((p, idx) => {
                    const pct = Math.round((p.seats / eciResults.totalSeats) * 100);
                    return (
                      <div key={p.shortName} className="px-5 py-3.5">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                              {idx + 1}
                            </span>
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: p.color }} />
                            <div>
                              <span className="font-bold text-slate-900 text-sm">{p.shortName}</span>
                              <span className="text-slate-400 text-xs ml-2 hidden sm:inline">{p.party}</span>
                              {p.alliance !== "OTHER" && (
                                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded font-semibold ${p.alliance === "NDA" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                                  {p.alliance}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-black text-slate-900 text-lg">{p.seats}</span>
                            <span className="text-slate-400 text-xs ml-1">({pct}%)</span>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(p.seats / eciResults.results[0].seats) * 100}%` }}
                            transition={{ duration: 0.9, delay: idx * 0.04, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: p.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Source: Election Commission of India — results.eci.gov.in</span>
                <span className="font-semibold text-slate-700">Total {eciResults.totalSeats} seats</span>
              </div>
            </div>
          </div>
        )}

        {/* Portal Vote Count Results Section */}
        {(isLive || isCompleted) && results && results.length > 0 && (
          <div ref={resultsRef} className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <BarChart2 className="w-7 h-7 text-primary" />
              <h2 className="text-2xl font-display font-bold text-slate-900">
                {isCompleted ? 'Final Results' : 'Live Vote Count'}
              </h2>
              {isLive && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Updating Live
                </span>
              )}
            </div>

            {isCompleted && topCandidate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-6 flex items-center gap-5"
              >
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Trophy className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-0.5">Winner</p>
                  <p className="text-2xl font-bold text-slate-900">{topCandidate.candidateName}</p>
                  <p className="text-slate-600">{topCandidate.partyName}{topCandidate.partySymbol ? ` • ${topCandidate.partySymbol}` : ''} — <span className="font-semibold">{topCandidate.voteCount.toLocaleString()} votes</span></p>
                </div>
              </motion.div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {[...results]
                  .sort((a, b) => b.voteCount - a.voteCount)
                  .map((r, idx) => {
                    const pct = totalVotes > 0 ? Math.round((r.voteCount / totalVotes) * 100) : 0;
                    const barColors = ['bg-primary', 'bg-blue-400', 'bg-purple-400', 'bg-slate-300'];
                    return (
                      <div key={r.candidateId} className="p-5">
                        <div className="flex justify-between items-center mb-2.5">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900 flex items-center gap-2">
                                {r.candidateName}
                                {idx === 0 && isCompleted && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Winner</span>}
                              </p>
                              <p className="text-sm text-slate-500">{r.partyName}{r.partySymbol ? ` • ${r.partySymbol}` : ''}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-slate-900">{r.voteCount.toLocaleString()}</p>
                            <p className="text-sm text-slate-500">{pct}%</p>
                          </div>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                            className={`h-full rounded-full ${barColors[idx] || 'bg-slate-300'}`}
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
