import { useGetElections } from "@workspace/api-client-react";
import { useGetElectionNews } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { Calendar, MapPin, ChevronRight, Vote, ShieldCheck, Users, BarChart2, ArrowRight, Newspaper, ExternalLink, RefreshCw } from "lucide-react";
import { getStatusColor, getElectionTypeLabel } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { data: elections, isLoading } = useGetElections();
  const { data: newsData, isLoading: newsLoading, refetch: refetchNews } = useGetElectionNews();
  const { isAuthenticated } = useAuth();

  const liveElections = elections?.filter(e => e.status === 'live') || [];
  const upcomingElections = elections?.filter(e => e.status === 'upcoming') || [];
  const completedElections = elections?.filter(e => e.status === 'completed') || [];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 pt-20 pb-32">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Hero background"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532375810709-75b1d3150b38?w=1920&q=80&auto=format&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              Secure Digital Voting Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Your Voice. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-300 to-white">Your Vote.</span> <br />
              Your Nation.
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed">
              Participate in the world's largest democracy from anywhere.
              Secure, transparent, and authenticated via Aadhaar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {!isAuthenticated ? (
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-xl font-bold bg-primary text-white shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_0_60px_-15px_rgba(249,115,22,0.7)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                >
                  Register to Vote
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/profile"
                  className="px-8 py-4 rounded-xl font-bold bg-primary text-white shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_0_60px_-15px_rgba(249,115,22,0.7)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                >
                  My Voter Profile
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              )}
              <a
                href="#elections"
                className="px-8 py-4 rounded-xl font-bold bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all duration-300 flex items-center justify-center border border-white/10"
              >
                View Elections
              </a>
            </div>
          </motion.div>
        </div>

        {/* Feature Highlights */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "Aadhaar Verified", desc: "Identity verification using secure integration to ensure zero duplication." },
              { icon: Vote, title: "One Vote, One Citizen", desc: "Cryptographically secured single-vote mechanism per live election." },
              { icon: Users, title: "Transparent Results", desc: "Real-time updates and publicly verifiable outcomes upon completion." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div id="elections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-24">

            {/* Live Elections */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-display font-bold text-slate-900 flex items-center">
                    <span className="relative flex h-4 w-4 mr-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                    </span>
                    Live Elections
                  </h2>
                  <p className="text-slate-500 mt-1">Cast your vote now for these active elections.</p>
                </div>
              </div>

              {liveElections.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center">
                  <Vote className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600">No active elections currently</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveElections.map((election, i) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      key={election.id}
                    >
                      <ElectionCard election={election} isAuthenticated={isAuthenticated} />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Upcoming Elections */}
            <section>
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Upcoming Elections</h2>
              <p className="text-slate-500 mb-8">Prepare to participate in these scheduled polls.</p>

              {upcomingElections.length === 0 ? (
                <div className="text-slate-500 italic px-4">No upcoming elections scheduled.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingElections.map((election, i) => (
                    <motion.div
                      key={election.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <ElectionCard election={election} isAuthenticated={isAuthenticated} />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Completed Elections */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-display font-bold text-slate-900">Completed Elections</h2>
                  <p className="text-slate-500 mt-1">View results and historical data.</p>
                </div>
                <Link href="/results" className="text-primary font-medium hover:underline flex items-center">
                  View All Results <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {completedElections.length === 0 ? (
                <div className="text-slate-500 italic px-4">No completed elections yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedElections.slice(0, 3).map((election, i) => (
                    <motion.div
                      key={election.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <ElectionCard election={election} isAuthenticated={isAuthenticated} showResults />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </div>

      {/* Election News Section */}
      <div className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Newspaper className="w-7 h-7 text-primary" />
                <h2 className="text-3xl font-display font-bold text-white">Election News</h2>
              </div>
              <p className="text-slate-400">
                Latest updates from NDTV, Times of India, The Hindu & more
                {newsData?.lastFetchedAt && (
                  <span className="ml-2 text-xs text-slate-500">
                    · Updated {formatDistanceToNow(new Date(newsData.lastFetchedAt), { addSuffix: true })}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => refetchNews()}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors border border-white/10"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white/5 rounded-2xl h-44 animate-pulse border border-white/10" />
              ))}
            </div>
          ) : !newsData?.news?.length ? (
            <div className="text-center py-16 text-slate-500">
              <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>News is being fetched from sources. Check back shortly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {newsData.news.slice(0, 9).map((item, i) => (
                <motion.a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                      {item.source}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </div>
                  <h3 className="text-white font-semibold text-sm leading-snug line-clamp-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{item.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
                    <span>{item.category}</span>
                    <span>
                      {(() => {
                        try { return formatDistanceToNow(new Date(item.pubDate), { addSuffix: true }); }
                        catch { return ''; }
                      })()}
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          )}

          {newsData && newsData.total > 9 && (
            <p className="text-center text-slate-500 text-sm mt-8">
              Showing 9 of {newsData.total} election news articles
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ElectionCard({ election, isAuthenticated, showResults = false }: {
  election: any;
  isAuthenticated: boolean;
  showResults?: boolean;
}) {
  const isLive = election.status === 'live';
  const isUpcoming = election.status === 'upcoming';
  const isCompleted = election.status === 'completed';

  return (
    <div className="h-full rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden group">

      {/* Top accent bar */}
      <div className={`h-1.5 w-full ${
        isLive ? 'bg-gradient-to-r from-red-500 to-orange-500' :
        isUpcoming ? 'bg-gradient-to-r from-primary to-yellow-400' :
        'bg-slate-300'
      }`} />

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(election.status)}`}>
            {isLive ? '🔴 Live' : isUpcoming ? '🟡 Upcoming' : '✅ Completed'}
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {getElectionTypeLabel(election.electionType)}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
          {election.title}
        </h3>

        {election.description && (
          <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow">
            {election.description}
          </p>
        )}

        <div className="mt-auto space-y-2 pt-4 border-t border-slate-100">
          <div className="flex items-center text-sm text-slate-600">
            <MapPin className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
            {election.state}{election.constituency ? ` — ${election.constituency}` : ''}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Calendar className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
            {format(new Date(election.startDate), 'MMM d, yyyy')} — {format(new Date(election.endDate), 'MMM d, yyyy')}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex flex-col gap-2">
          {isLive && (
            <Link
              href={`/elections/${election.id}`}
              className="w-full py-2.5 rounded-xl text-center font-semibold text-sm bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Vote className="w-4 h-4" />
              {isAuthenticated ? 'Enter Voting Booth' : 'View Election'}
            </Link>
          )}

          {(isLive || isCompleted) && (
            <Link
              href={`/elections/${election.id}?tab=results`}
              className="w-full py-2.5 rounded-xl text-center font-semibold text-sm bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <BarChart2 className="w-4 h-4" />
              View Results
            </Link>
          )}

          {isUpcoming && (
            <Link
              href={`/elections/${election.id}`}
              className="w-full py-2.5 rounded-xl text-center font-semibold text-sm bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
