import React, { useState } from 'react';
import { Charity } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartHandshake, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  ArrowUpRight, 
  Check, 
  Sparkles,
  MapPin
} from 'lucide-react';

interface CharityDirectoryProps {
  charities: Charity[];
  onSelectCharity: (charity: Charity) => void;
  onDonate: (charity: Charity) => void;
  onDesignateForSubscription?: (charity: Charity) => void;
}

export const CharityDirectory: React.FC<CharityDirectoryProps> = ({
  charities,
  onSelectCharity,
  onDonate,
  onDesignateForSubscription,
}) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Veterans & First Responders',
    'Children & Youth',
    'Cancer Research',
    'Mental Health',
  ];

  const filtered = charities.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSetAsMyCharity = (charity: Charity) => {
    if (onDesignateForSubscription) {
      onDesignateForSubscription(charity);
    } else if (currentUser) {
      updateCurrentUser({ selected_charity_id: charity.id });
    }
  };

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Directory Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Vetted Partner Organizations</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Charity Directory
        </h1>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Discover vetted non-profits backed by the Digital Heroes community. 
          Each organization has undergone transparency auditing and receives direct monthly distributions.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="charity-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search charities by name or cause..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Charities */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <HeartHandshake className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-300">No charities match your search</h4>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or searching for different keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((charity) => {
            const isCurrentUsersCharity = currentUser?.selected_charity_id === charity.id;
            const formattedTotal = (charity.donations_received_cents / 100).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            });
            const nextEvent = charity.upcoming_events[0];

            return (
              <div
                key={charity.id}
                className={`rounded-2xl bg-slate-900 border transition duration-300 flex flex-col justify-between overflow-hidden shadow-xl ${
                  isCurrentUsersCharity ? 'border-rose-500/80 ring-1 ring-rose-500/50' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Hero Photo & Category Tag */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                    <img
                      src={charity.hero_image_url}
                      alt={charity.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-slate-200 border border-slate-700 backdrop-blur-md">
                      {charity.category}
                    </span>
                    {isCurrentUsersCharity && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-slate-950 shadow flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>My Designated Cause</span>
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-bold text-white">{charity.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {charity.tagline}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500">Total Community Donated</div>
                        <div className="font-bold text-emerald-400 font-mono">{formattedTotal}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Active Supporters</div>
                        <div className="font-bold text-slate-200 flex items-center">
                          <Users className="w-3 h-3 text-indigo-400 mr-1" />
                          {charity.active_supporters_count.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Next Event */}
                    {nextEvent && (
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px]">
                        <div className="font-semibold text-amber-300 flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-amber-400" />
                          <span className="truncate">{nextEvent.title}</span>
                        </div>
                        <div className="text-slate-400 flex items-center mt-0.5">
                          <MapPin className="w-2.5 h-2.5 mr-1 text-slate-500" />
                          <span className="truncate">{nextEvent.location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
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
                      <HeartHandshake className="w-3 h-3" />
                      <span>Direct Gift</span>
                    </button>
                  </div>

                  {currentUser && !isCurrentUsersCharity && (
                    <button
                      onClick={() => handleSetAsMyCharity(charity)}
                      className="w-full py-1.5 px-2 rounded-lg text-[11px] font-medium bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
                    >
                      Switch My Monthly Subscription To This Charity
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
