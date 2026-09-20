import React from 'react';
import { Charity } from '../../types';
import { HeartHandshake, Calendar, MapPin, ArrowUpRight, Users, Sparkles } from 'lucide-react';

interface CharitySpotlightProps {
  charities: Charity[];
  onSelectCharity: (charity: Charity) => void;
  onViewAllCharities: () => void;
  onDonate: (charity: Charity) => void;
}

export const CharitySpotlight: React.FC<CharitySpotlightProps> = ({
  charities,
  onSelectCharity,
  onViewAllCharities,
  onDonate,
}) => {
  const featured = charities.slice(0, 3);

  return (
    <section className="py-16 sm:py-20 border-b border-slate-800 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vetted Beneficiary Partners</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Leading With Impact, Not Sport
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl">
              Select the cause that matters most to you. Every subscription directly funds real rehabilitation, education, and research initiatives.
            </p>
          </div>

          <button
            onClick={onViewAllCharities}
            className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-sm font-semibold text-rose-400 hover:text-rose-300 transition"
          >
            <span>View All Partner Charities</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Charity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((charity) => {
            const nextEvent = charity.upcoming_events[0];
            const formattedTotal = (charity.donations_received_cents / 100).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            });

            return (
              <div
                key={charity.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition duration-300 overflow-hidden flex flex-col justify-between group shadow-xl"
              >
                <div>
                  {/* Hero Image */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                    <img
                      src={charity.hero_image_url}
                      alt={charity.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-slate-200 border border-slate-700 backdrop-blur-md">
                      {charity.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition">
                      {charity.name}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {charity.tagline}
                    </p>

                    {/* Metrics Strip */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">Total Donated</div>
                        <div className="font-bold text-emerald-400 font-mono">{formattedTotal}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">Active Supporters</div>
                        <div className="font-bold text-slate-200 flex items-center">
                          <Users className="w-3 h-3 text-indigo-400 mr-1" />
                          {charity.active_supporters_count.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Golf Day or Gala */}
                    {nextEvent && (
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] space-y-1">
                        <div className="font-semibold text-amber-300/90 flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-amber-400" />
                          <span>{nextEvent.title}</span>
                        </div>
                        <div className="text-slate-400 flex items-center">
                          <MapPin className="w-2.5 h-2.5 mr-1 text-slate-500" />
                          <span className="truncate">{nextEvent.location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectCharity(charity)}
                    className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-center"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => onDonate(charity)}
                    className="py-2 px-3 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition text-center flex items-center justify-center space-x-1"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>Direct Gift</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
