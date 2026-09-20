import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { DrawEngine } from '../../services/drawEngine';
import { StablefordScore } from '../../types';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Info,
  Clock,
  ArrowDown
} from 'lucide-react';

interface ScoreManagerProps {
  onScoreUpdated?: () => void;
}

export const ScoreManager: React.FC<ScoreManagerProps> = ({ onScoreUpdated }) => {
  const { currentUser } = useAuth();

  const [scoreInput, setScoreInput] = useState<string>('38');
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const [courseInput, setCourseInput] = useState<string>('Championship Course');

  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800">
        <Target className="w-10 h-10 text-slate-500 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-white">Subscriber Login Required</h3>
        <p className="text-xs text-slate-400 mt-1">Please sign in to track your Stableford scores and enter monthly draws.</p>
      </div>
    );
  }

  const scores = db.getUserScores(currentUser.id);
  const derivedDrawBalls = DrawEngine.deriveDrawNumbers(scores, currentUser.id, 'direct_scores');

  const handleAddOrUpdateScore = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const parsedScore = parseInt(scoreInput, 10);

    // 1. Client-Side Validation: Score 1 to 45
    if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 45) {
      setErrorMessage('Stableford score must be a whole number between 1 and 45 points.');
      return;
    }

    // 2. Client-Side Validation: Date required
    if (!dateInput) {
      setErrorMessage('A valid match round date is required.');
      return;
    }

    if (editingScoreId) {
      // Update existing score
      const result = db.updateScore(editingScoreId, {
        score: parsedScore,
        date: dateInput,
        courseName: courseInput.trim() || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to update score.');
        return;
      }

      setSuccessNotice('Score successfully updated.');
      setEditingScoreId(null);
    } else {
      // Add new score (PRD: max 5 retained, 6th evicts oldest, unique date enforced)
      const result = db.addScore({
        userId: currentUser.id,
        score: parsedScore,
        date: dateInput,
        courseName: courseInput.trim() || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to save score.');
        return;
      }

      if (result.evictedScore) {
        setSuccessNotice(
          `Score added! Oldest round from ${result.evictedScore.date} (${result.evictedScore.score} pts) was automatically evicted to maintain the 5-score limit.`
        );
      } else {
        setSuccessNotice('Stableford score recorded successfully.');
      }
    }

    // Reset inputs
    setScoreInput('36');
    setDateInput(new Date().toISOString().split('T')[0]);
    setCourseInput('Championship Course');
    onScoreUpdated?.();
  };

  const handleEditClick = (s: StablefordScore) => {
    setEditingScoreId(s.id);
    setScoreInput(s.score.toString());
    setDateInput(s.date);
    setCourseInput(s.course_name || '');
    setErrorMessage(null);
    setSuccessNotice(null);
  };

  const handleCancelEdit = () => {
    setEditingScoreId(null);
    setScoreInput('36');
    setDateInput(new Date().toISOString().split('T')[0]);
    setCourseInput('Championship Course');
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to remove this round?')) {
      db.deleteScore(id);
      setSuccessNotice('Round removed.');
      onScoreUpdated?.();
    }
  };

  return (
    <div className="space-y-8">
      {/* Retention Rule Header Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">5-Score Rolling Stableford Window</h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-xl">
              Strict PRD Section 7 Rule: Exactly your <strong>latest 5 rounds</strong> are retained in reverse chronological order. 
              Submitting a 6th score automatically removes your oldest recorded round.
            </p>
          </div>
        </div>

        {/* Live Draw Ball Conversion Preview */}
        <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 text-right w-full md:w-auto">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-end space-x-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Draw Numbers Derived:</span>
          </div>
          <div className="flex items-center justify-end space-x-1.5 mt-1">
            {derivedDrawBalls.map((ball, i) => (
              <span
                key={i}
                className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center font-mono shadow"
              >
                {ball}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Score Entry / Edit Form */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center">
          <Edit3 className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
          <span>{editingScoreId ? 'Edit Recorded Stableford Round' : 'Record New Stableford Round'}</span>
        </h4>

        <form onSubmit={handleAddOrUpdateScore} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          {/* Score Input (1 - 45) */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Points (1–45)</span>
              <span className="text-[10px] text-slate-400">Stableford</span>
            </label>
            <input
              id="score-points-input"
              type="number"
              min="1"
              max="45"
              required
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              placeholder="1–45"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-base font-bold font-mono text-white text-center focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Date Input */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Round Date</span>
              <span className="text-[10px] text-rose-400">1 per date limit</span>
            </label>
            <input
              id="score-date-input"
              type="date"
              required
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Course Name */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Course / Club (Optional)
            </label>
            <input
              id="score-course-input"
              type="text"
              value={courseInput}
              onChange={(e) => setCourseInput(e.target.value)}
              placeholder="e.g. Torrey Pines"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="sm:col-span-2 flex space-x-2">
            <button
              id="score-submit-btn"
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-slate-950 shadow-md transition flex items-center justify-center space-x-1"
            >
              {editingScoreId ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingScoreId ? 'Save' : 'Add'}</span>
            </button>

            {editingScoreId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Reverse Chronological Score Display (Strict PRD Example) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Active Retained Scores ({scores.length}/5)</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Ordered in reverse chronological sequence. These 5 values feed your monthly draw ticket.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
            {scores.length === 5 ? '5/5 Slots Filled (Optimal)' : `${5 - scores.length} slots remaining`}
          </span>
        </div>

        {scores.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No rounds recorded yet. Enter your first Stableford score above.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {scores.map((s, index) => {
              const dateObj = new Date(s.date + 'T00:00:00');
              const formattedDate = dateObj.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={s.id}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-850/50 transition"
                >
                  <div className="flex items-center space-x-4">
                    {/* Position Badge */}
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-mono flex items-center justify-center font-semibold">
                      #{index + 1}
                    </span>

                    {/* Stableford Points Badge */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700 flex flex-col items-center justify-center">
                      <span className="text-lg font-black text-amber-300 font-mono leading-none">
                        {s.score}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
                        PTS
                      </span>
                    </div>

                    {/* Round Metadata */}
                    <div>
                      <div className="text-sm font-bold text-white flex items-center space-x-2">
                        <span>{s.score} — {formattedDate}</span>
                        {index === 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            LATEST
                          </span>
                        )}
                        {index === 4 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            OLDEST (NEXT TO EVICT)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{s.date}</span>
                        <span>•</span>
                        <span>{s.course_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClick(s)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit round"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(s.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete round"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
