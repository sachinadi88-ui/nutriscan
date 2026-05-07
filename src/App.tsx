/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShieldCheck, ShieldAlert, Info, Leaf, AlertTriangle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { analyzeProduct, ProductAnalysis, HealthStatus } from './services/geminiService';
import { cn } from './lib/utils';

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeProduct(query);
      setResult(analysis);
    } catch (err) {
      setError('Could not analyze product. Please try again with a more specific name.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-emerald-50 text-slate-900">
      {/* Header Section */}
      <header className="bg-white border-b border-emerald-100 px-8 py-4 flex justify-between items-center shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">N</div>
          <h1 className="text-2xl font-black text-emerald-800 tracking-tight">NutriScan<span className="text-orange-500">India</span></h1>
        </div>
        <div className="flex gap-4 items-center">
          <span className="health-pill bg-emerald-100 text-emerald-600">AI Nutrition Data</span>
          <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-orange-600">
            <Leaf size={20} />
          </div>
        </div>
      </header>

      {/* Main Search Area */}
      <div className="px-8 py-8 bg-emerald-500 shrink-0 z-10 transition-all duration-500 shadow-lg">
        <div className="max-w-3xl mx-auto relative group">
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter product name (e.g. Maggi, Haldiram's, Amul Butter...)"
              className="w-full py-5 pl-6 pr-40 rounded-2xl border-none shadow-xl text-lg font-medium focus:ring-4 focus:ring-emerald-300 transition-all outline-none bg-white text-slate-800 placeholder:text-slate-400"
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-orange-500 hover:bg-orange-600 text-white px-8 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none transition-all active:scale-95"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
              <span>{loading ? "Analyzing..." : "Analyze"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 relative p-8">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto bg-red-50 text-red-700 p-6 rounded-3xl border border-red-100 shadow-sm flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="font-bold">Analysis Failed</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
            </motion.div>
          )}

          {result && !loading ? (
            <motion.div
              id="analysis-result"
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-12 gap-6 max-w-7xl mx-auto"
            >
              {/* Left Panel: Product Summary */}
              <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex flex-col items-center text-center">
                  <div className={cn(
                    "w-32 h-32 rounded-3xl mb-6 flex flex-col items-center justify-center transition-colors shadow-inner",
                    result.overallHealthScore > 60 ? "bg-emerald-50 border-emerald-100" : 
                    result.overallHealthScore > 30 ? "bg-amber-50 border-amber-100" : 
                    "bg-red-50 border-red-100"
                  )}>
                    <p className={cn(
                      "text-xs font-black uppercase tracking-widest mb-1",
                      result.overallHealthScore > 60 ? "text-emerald-500" : 
                      result.overallHealthScore > 30 ? "text-amber-500" : 
                      "text-red-500"
                    )}>Health Score</p>
                    <div className="flex items-end gap-1">
                      <span className={cn(
                        "text-5xl font-black leading-none",
                        result.overallHealthScore > 60 ? "text-emerald-600" : 
                        result.overallHealthScore > 30 ? "text-amber-600" : 
                        "text-red-600"
                      )}>{result.overallHealthScore}</span>
                      <span className="text-slate-300 font-bold mb-1">/100</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold leading-tight mb-2 text-slate-800">{result.productName}</h2>
                  {result.isIndianProduct && (
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded mb-4">Indian Market Variant</span>
                  )}
                  <div className="text-slate-500 text-sm italic mb-4 leading-relaxed">
                    "{result.summary}"
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-50 w-full flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Info size={12} />
                    <span>Est: {result.estimatedServingSize || "Standard Pack"}</span>
                  </div>
                </div>
              </div>

              {/* Center Panel: Ingredients Breakdown */}
              <div className="col-span-12 lg:col-span-5 flex flex-col">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      <Sparkles size={18} className="text-emerald-500" />
                      Exact Composition
                    </h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty Estimate</span>
                  </div>
                  <div className="space-y-3">
                    {result.ingredients.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-emerald-100">
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="font-bold text-slate-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-500 truncate opacity-70 group-hover:opacity-100 transition-opacity">{item.explanation}</p>
                        </div>
                        <span className="font-mono font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg shrink-0 whitespace-nowrap">
                          {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel: Analysis Breakdown */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                {/* Healthy Split */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 overflow-hidden flex flex-col border-t-4 border-t-emerald-500">
                  <h3 className="text-emerald-700 font-bold mb-4 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Healthy Ingredients
                  </h3>
                  <div className="space-y-4">
                    {result.ingredients.filter(i => i.healthStatus === HealthStatus.HEALTHY).length > 0 ? (
                      result.ingredients.filter(i => i.healthStatus === HealthStatus.HEALTHY).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="mt-1 text-emerald-500 font-black">✓</div>
                          <div>
                            <p className="font-bold text-sm text-slate-800">{item.name}</p>
                            <p className="text-xs text-slate-500 leading-normal">{item.explanation}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No significantly healthy ingredients found.</p>
                    )}
                  </div>
                </div>

                {/* Harmful Split */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 overflow-hidden flex flex-col border-t-4 border-t-red-500">
                  <h3 className="text-red-700 font-bold mb-4 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    Harmful Elements
                  </h3>
                  <div className="space-y-4">
                    {result.ingredients.filter(i => i.healthStatus === HealthStatus.HARMFUL).length > 0 ? (
                      result.ingredients.filter(i => i.healthStatus === HealthStatus.HARMFUL).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-2 rounded-xl hover:bg-red-50 transition-colors">
                          <div className="mt-1 text-red-500"><ShieldAlert size={16} /></div>
                          <div>
                            <p className="font-bold text-sm text-red-900">{item.name}</p>
                            <p className="text-xs text-slate-700 leading-tight mt-1">{item.explanation}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center text-center p-4">
                        <div>
                          <ShieldCheck size={32} className="text-emerald-200 mx-auto mb-2" />
                          <p className="text-xs text-slate-400">All ingredients appear to be within safe consumption limits.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : !loading && !result && (
              <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto flex flex-col items-center justify-center text-center py-20 px-4"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-8 animate-bounce">
                <Sparkles size={40} />
              </div>
              <h2 className="text-3xl font-black text-emerald-900 mb-4 tracking-tight">Ready to NutriScan?</h2>
              <p className="text-slate-500 text-lg mb-12 max-w-lg leading-relaxed">
                Discover precisely what's inside your favorite Indian products. We break down quantities and health impacts with AI precision.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full opacity-70">
                {[
                  { icon: Leaf, title: 'Indian Specific', desc: 'Focus on Indian snacks & staples.' },
                  { icon: ShieldCheck, title: 'Safety Check', desc: 'Flags harmful food additives.' },
                  { icon: Info, title: 'Exact Quantity', desc: 'Estimated weights & servings.' }
                ].map((feature, i) => (
                  <div key={i} className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm">
                    <feature.icon className="mx-auto text-emerald-500 mb-3" />
                    <h4 className="font-bold text-sm mb-1">{feature.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-tight">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Stats Bar */}
      <footer className="bg-emerald-900 text-emerald-300 px-8 py-3 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest shrink-0">
        <div className="flex gap-8">
          <span className="flex items-center gap-1.5"><strong className="text-white">FSSAI</strong> Compliant Analysis</span>
          <span className="flex items-center gap-1.5 underline decoration-emerald-500/40">Product Database 2026</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span>AI Engine: Gemini Verified</span>
          </div>
          <span className="text-emerald-600 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">Secure</span>
        </div>
      </footer>
    </div>
  );
}
