import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizData';
import { soundFx } from '../utils/AudioController';
import { Award, CheckCircle2, XCircle, HelpCircle, Trophy, RefreshCw, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizModule({ initialGrade = '8' }) {
  const [selectedGrade, setSelectedGrade] = useState(initialGrade === 'all' ? '8' : initialGrade);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestions = QUIZ_QUESTIONS[selectedGrade] || QUIZ_QUESTIONS['8'];
  const question = currentQuestions[currentIndex];

  const handleSelectOption = (index) => {
    if (selectedAnswer !== null) return;

    soundFx.playClick();
    setSelectedAnswer(index);

    if (index === question.correct) {
      soundFx.playSuccess();
      setScore(prev => prev + 100 * (streak + 1));
      setStreak(prev => prev + 1);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    if (currentIndex + 1 < currentQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    soundFx.playClick();
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setStreak(0);
    setIsCompleted(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel p-6 md:p-8 rounded-3xl border border-cyan-500/30">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" /> Chemistry Syllabus Challenge
          </h2>
          <p className="text-xs text-slate-400 mt-1">Test your Periodic Table & Atomic structure knowledge!</p>
        </div>

        {/* Grade switch */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-white/10">
          {['8', '9', '10'].map(g => (
            <button
              key={g}
              onClick={() => {
                soundFx.playClick();
                setSelectedGrade(g);
                handleReset();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedGrade === g
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Class {g}th
            </button>
          ))}
        </div>
      </div>

      {/* Score HUD */}
      <div className="flex items-center justify-between text-xs font-mono mb-6 bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-white/10">
        <span className="text-cyan-300">Question {currentIndex + 1} of {currentQuestions.length}</span>
        <span className="text-yellow-400 font-bold">Score: {score} pts</span>
        <span className="text-purple-300">Streak: {streak}x 🔥</span>
      </div>

      {!isCompleted ? (
        <div className="space-y-6">
          {/* Question Text */}
          <h3 className="text-lg md:text-xl font-semibold text-white leading-relaxed">
            {question.question}
          </h3>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((opt, idx) => {
              let btnStyle = "bg-slate-900/70 border-white/10 hover:border-cyan-400/50 text-slate-200";

              if (selectedAnswer !== null) {
                if (idx === question.correct) {
                  btnStyle = "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                } else if (idx === selectedAnswer) {
                  btnStyle = "bg-red-500/20 border-red-400 text-red-300";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 rounded-2xl border text-left font-medium text-sm transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {selectedAnswer !== null && idx === question.correct && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {selectedAnswer === idx && idx !== question.correct && (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Card */}
          {selectedAnswer !== null && (
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 animate-fade-in">
              <strong className="block font-mono text-cyan-400 mb-1">Explanation:</strong>
              {question.explanation}
            </div>
          )}

          {/* Next Button */}
          {selectedAnswer !== null && (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-bold text-sm hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              >
                Next Question <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Completion screen */
        <div className="text-center py-8 space-y-4">
          <Award className="w-16 h-16 text-yellow-400 mx-auto animate-bounce" />
          <h3 className="text-2xl font-bold text-white">Class {selectedGrade}th Challenge Completed!</h3>
          <p className="text-slate-300 text-sm">
            You scored <strong className="text-yellow-400">{score} points</strong> with a max streak of {streak}!
          </p>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          >
            <RefreshCw className="w-4 h-4" /> Retake Challenge
          </button>
        </div>
      )}
    </div>
  );
}
