import React from 'react';
import { Charity } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartHandshake, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Globe, 
  Mail, 
  Check, 
  Sparkles,
  Trophy,
  ExternalLink
} from 'lucide-react';

interface CharityDetailPageProps {
  charity: Charity;
  onBack: () => void;
  onDonate: (charity: Charity) => void;
  onSelectForSubscription?: (charity: Charity) => void;
}

export const CharityDetailPage: React.FC<CharityDetailPageProps> = ({
  charity,
  onBack,
  onDonate,
  onSelectForSubscription,
}) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const isSelected = currentUser?.selected_charity_id === charity.id;

  const formattedTotal = (charity.donations_received_cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const handleDesignate = () => {
    if (onSelectForSubscription) {
      onSelectForSubscription(charity);
    } else if (currentUser) {
      updateCurrentUser({ selected_charity_id: charity.id });
    }
  };

  return (
    <div className="py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Charity Directory</span>
      </button>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl mb-8">
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={charity.hero_image_url}
            alt={charity.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md">
              {charity.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {charity.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-medium">
              {charity.tagline}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onDonate(charity)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-lg shadow-rose-950/50 transition flex items-center space-x-1.5"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Direct Gift</span>
            </button>

            {currentUser && !isSelected && (
              <button
                onClick={handleDesignate}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
              >
                Set As My Monthly Cause
              </button>
            )}

            {isSelected && (
              <div className="px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center space-x-1.5">
                <Check className="w-4 h-4" />
                <span>Your Active Beneficiary</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Mission & Description */}
        <div className="lg:col-span-8 space-y-8">
          {/* Mission Statement Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs text-rose-400 flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Official Mission
            </h3>
            <p className="text-base text-slate-200 font-medium leading-relaxed italic border-l-2 border-rose-500 pl-4 py-1">
              "{charity.mission}"
            </p>
          </div>

          {/* Full Narrative Description */}
          <div className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">About the Initiative</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {charity.description}
            </p>
          </div>

          {/* Upcoming Golf Days & Fundraiser Events (PRD Section 11) */}
          <div className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Calendar className="w-5 h-5 text-amber-400 mr-2" />
                <span>Upcoming Golf Days & Charity Events</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {charity.upcoming_events.length} Scheduled
              </span>
            </div>

            {charity.upcoming_events.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No public tournaments currently scheduled. Check back soon.</p>
            ) : (
              <div className="space-y-3">
                {charity.upcoming_events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          evt.type === 'golf_day'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}>
                          {evt.type.replace('_', ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-white">{evt.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{evt.description}</p>
                      <div className="flex items-center space-x-4 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 text-slate-400 mr-1" />
                          {evt.date}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 text-slate-400 mr-1" />
                          {evt.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        onClick={() => alert(`Registration details for ${evt.title} sent to your email!`)}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                      >
                        Register / Info
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Financial Impact Stats & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Impact Ledger Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Community Financial Impact
            </h4>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 font-medium">Total Donated by Golfers</span>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-0.5">
                  {formattedTotal}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  Active Golf Supporters:
                </span>
                <span className="font-bold text-white">{charity.active_supporters_count.toLocaleString()}</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center">
                  <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  Website:
                </span>
                <a
                  href={charity.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-rose-400 hover:underline flex items-center text-[11px]"
                >
                  <span>Visit Domain</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-1" />
                </a>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  Direct Contact:
                </span>
                <span className="text-slate-300 font-mono text-[11px]">{charity.contact_email}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => onDonate(charity)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-md transition flex items-center justify-center space-x-1.5"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Make One-Off Gift to This Charity</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
