import React from 'react';
import { FlaskConical, ShieldCheck, Cpu, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-glow">
                <FlaskConical className="w-4 h-4" />
              </div>
              <span className="font-display font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                PACKWISE<span className="text-emerald-500">.AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Intelligent packaging decision-support platform designed for food technologists, packaging engineers, and FMCG brands. Optimising barrier protection, shelf-life, and environmental sustainability.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Transparent Rules
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-500" /> Multi-barrier Matching
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Explainable AI
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li><a href="#new-analysis" className="hover:text-emerald-500 transition-colors">Packaging Analysis</a></li>
              <li><a href="#materials" className="hover:text-emerald-500 transition-colors">Materials Library (13+ Films)</a></li>
              <li><a href="#history" className="hover:text-emerald-500 transition-colors">Analysis History</a></li>
              <li><a href="#reports" className="hover:text-emerald-500 transition-colors">Technical Reports</a></li>
            </ul>
          </div>

          {/* Technology & Compliance */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">Engineering Standards</h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>ASTM F1249 (WVTR Measurement)</li>
              <li>ASTM D3985 (OTR Coulometric)</li>
              <li>DIN EN 13432 (Compostability)</li>
              <li>ISO 14040/44 (LCA Principles)</li>
            </ul>
          </div>
        </div>

        {/* Scientific Disclaimer Alert Box */}
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          <strong className="text-slate-800 dark:text-slate-200">Scientific Prototype Disclaimer: </strong>
          PACKWISE AI is a decision-support and rapid prototyping engine. Compatibility scores, shelf-life forecasts, MAP gas recommendations, and barrier ratings are calculated indicative values. Formal production requires pilot shelf-life testing, sensory evaluation, seal integrity verification, and packaging supplier compliance validation.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p>© {new Date().getFullYear()} PACKWISE AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Engineered with precision for modern FoodTech</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
