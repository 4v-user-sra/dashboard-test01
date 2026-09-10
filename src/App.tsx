import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, ComposedChart, BarChart, Bar, Cell, Tooltip, LabelList } from 'recharts';
import { TrendingUp, Target, Users, Package, Activity } from 'lucide-react';

// --- MOCK DATA ---

const currentDate = 15;
const totalDays = 30;
const idealPercent = (currentDate / totalDays) * 100;

const kpiData = {
  segurosNovos: { target: 1200000, current: 800000 },
  renovacoes: { target: 800000, current: 650000 },
};

const historicoDados = [
  { id: 1, tipoEntrada: 'Automóvel', dataHora: '10/09/2026 10:10', observacao: 'Nova apólice gerada. Bônus classe 4 aplicado.', time: 'Há 2 min' },
  { id: 2, tipoEntrada: 'Vida Individual', dataHora: '10/09/2026 09:57', observacao: 'Atualização de faixa etária do segurado.', time: 'Há 15 min' },
  { id: 3, tipoEntrada: 'Residencial', dataHora: '10/09/2026 09:30', observacao: 'Inclusão de cobertura vendaval.', time: 'Há 42 min' },
  { id: 4, tipoEntrada: 'Empresarial', dataHora: '10/09/2026 08:12', observacao: 'Inadimplência > 60 dias. Encaminhado cobrança.', time: 'Há 2 horas' },
  { id: 5, tipoEntrada: 'Frota', dataHora: '10/09/2026 07:12', observacao: 'Frota atualizada (12 veículos) confirmada.', time: 'Há 3 horas' },
  { id: 6, tipoEntrada: 'Mobi Livre', dataHora: '10/09/2026 06:12', observacao: 'Aguardando vistoria prévia do equipamento.', time: 'Há 4 horas' },
];

const lineData = Array.from({ length: totalDays }, (_, i) => {
  const day = i + 1;
  const baseValue = 50000 * day;
  const variance = (Math.random() - 0.2) * 30000;
  
  const isPast = day <= currentDate;
  const isToday = day === currentDate;
  
  const atual = isPast ? Math.round(baseValue + variance) : null;
  
  let meta = null;
  if (day >= currentDate) {
    if (isToday) {
      meta = atual;
    } else {
      const growthRate = 60000;
      meta = Math.round((50000 * currentDate) + (growthRate * (day - currentDate)));
    }
  }

  return {
    dia: day.toString().padStart(2, '0'),
    atual,
    meta
  };
});

const productData = [
  { name: 'Automóvel', percent: 30, quantity: 1500 },
  { name: 'Residencial', percent: 20, quantity: 1000 },
  { name: 'Condomínio', percent: 15, quantity: 750 },
  { name: 'Empresarial', percent: 10, quantity: 500 },
  { name: 'Frota', percent: 8, quantity: 400 },
  { name: 'Equipamento', percent: 5, quantity: 250 },
  { name: 'Evento', percent: 4, quantity: 200 },
  { name: 'Mobi Livre', percent: 3, quantity: 150 },
  { name: 'Vida', percent: 3, quantity: 150 },
  { name: 'RC Profissional', percent: 1, quantity: 50 },
  { name: 'Demais produtos', percent: 1, quantity: 50 },
];

// --- UTILS ---

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

const getStatusColor = (percent: number, ideal: number) => {
  if (percent >= ideal) return "#00AE00"; // Green
  if (percent >= ideal - 10) return "#F39C38"; // Orange
  return "#E61919"; // Red
};

// --- COMPONENTS ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#050505]/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
        <p className="text-white/60 text-[10px] mb-2 font-bold tracking-[0.2em] uppercase">Dia {label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm font-bold">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-white">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Double-Bezel Architecture Container (Doppelrand)
const DoubleBezelCard = ({ children, className = "", wrapperClassName = "" }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !spotlightRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.background = `radial-gradient(500px circle at ${x}px ${y}px, rgba(243,156,56,0.15), transparent 40%)`;
  };

  const handleMouseLeave = () => {
    if (spotlightRef.current) {
      spotlightRef.current.style.background = 'transparent';
    }
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`bg-white/[0.02] border border-white/[0.05] p-[4px] rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group/card ${wrapperClassName}`}
    >
      <div 
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 opacity-0 group-hover/card:opacity-100"
      />
      <div className={`bg-[#050505]/40 backdrop-blur-3xl rounded-[calc(2rem-4px)] border border-white/[0.03] h-full relative z-20 ${className}`}>
        {children}
      </div>
    </div>
  );
};

const ProgressBar = ({ label, subLabel, current, target, formatFn, showIdealMarker = true }: any) => {
  const percent = (current / target) * 100;
  const color = getStatusColor(percent, idealPercent);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex flex-col gap-2 group">
      <div className="flex justify-between items-end">
        <div className="flex flex-col justify-end pb-0.5">
          <span className="text-[11px] md:text-[13px] font-extrabold text-[#F39C38] uppercase tracking-[0.1em] drop-shadow-md group-hover:text-[#d8751e] transition-colors">{label}</span>
          {subLabel && <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-1">{subLabel}</span>}
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-white tracking-tight">{formatFn(current)}</span>
            <span className="text-[10px] font-bold text-[#00AE00] bg-[#00AE00]/10 px-1.5 py-0.5 rounded border border-[#00AE00]/20">
              {percent.toFixed(1)}%
            </span>
          </div>
          <span className="text-[10px] font-semibold text-white/40 mt-1">META: {formatFn(target)}</span>
        </div>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-[1200ms] ease-[cubic-bezier(0.32,0.72,0,1)]" 
          style={{ 
            width: mounted ? `${Math.min(percent, 100)}%` : '0%', 
            backgroundColor: color, 
            boxShadow: `0 0 16px ${color}80` 
          }} 
        />
        {showIdealMarker && (
          <div 
            className="absolute -top-1 -bottom-1 w-[3px] bg-white z-10 rounded-full shadow-[0_0_8px_white]" 
            style={{ left: `${idealPercent}%` }} 
            title="Ideal Esperado"
          />
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [mounted, setMounted] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => { 
    setMounted(true); 
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-[100dvh] xl:h-screen bg-[#050505] text-white font-['Plus_Jakarta_Sans'] flex flex-col overflow-x-hidden xl:overflow-hidden relative selection:bg-[#d8751e]/30 cursor-none">
      <style>{`
        * { cursor: none !important; }
      `}</style>
      
      {/* Custom Global Cursor */}
      <div 
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 w-4 h-4 rounded-full border-[1.5px] border-[#F39C38] z-[9999] transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out flex items-center justify-center bg-[#F39C38]/10 backdrop-blur-sm shadow-[0_0_10px_rgba(243,156,56,0.3)]"
        style={{ left: '-1000px', top: '-1000px' }}
      >
        <div className="w-1 h-1 bg-[#F39C38] rounded-full"></div>
      </div>

      {/* Vibe Archetype: Ethereal Glass Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#d8751e]/20 blur-[120px] mix-blend-screen transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute top-[40%] -right-[10%] w-[45vw] h-[60vw] rounded-full bg-[#00AE00]/15 blur-[120px] mix-blend-screen transition-opacity duration-1000 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIvPjwvc3ZnPg==')] opacity-[0.15] mix-blend-overlay"></div>
      </div>

      <main className="relative z-10 flex-1 p-3 md:p-5 flex flex-col gap-4 max-w-[1600px] mx-auto w-full xl:min-h-0">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-3 pb-2 shrink-0 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] translate-y-0 opacity-100">
          <div className="flex items-center gap-3">
             <div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white uppercase">
                  DASHBOARD <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F39C38] to-[#d8751e]">TEST 01</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00AE00] shadow-[0_0_8px_#00AE00] animate-pulse"></div>
                  <p className="text-[10px] md:text-[11px] font-bold text-white/50 uppercase tracking-[0.3em]">Status Atualizado</p>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-[10px] md:text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Ciclo Operacional</span>
              <span className="text-sm md:text-base font-extrabold text-white tracking-widest">DIA {currentDate.toString().padStart(2, '0')} <span className="text-white/30 font-medium">/ {totalDays}</span></span>
            </div>
          </div>
        </header>

        {/* Top KPIs (Metas Globais) */}
        <DoubleBezelCard wrapperClassName="shrink-0 transition-all duration-700 delay-100 ease-[cubic-bezier(0.32,0.72,0,1)]" className="p-4 flex flex-col justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="pb-4 sm:pb-0 sm:pr-8 border-b sm:border-b-0 sm:border-r border-[#2A2A2A]">
              <ProgressBar 
                label="Seguros Novos" 
                current={kpiData.segurosNovos.current} 
                target={kpiData.segurosNovos.target} 
                formatFn={formatCurrency} 
              />
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-8">
              <ProgressBar 
                label="Renovações" 
                current={kpiData.renovacoes.current} 
                target={kpiData.renovacoes.target} 
                formatFn={formatCurrency} 
              />
            </div>
          </div>
        </DoubleBezelCard>

        {/* Main Grid: Ranking (Left) & Charts (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1 xl:min-h-0 transition-all duration-700 delay-200 ease-[cubic-bezier(0.32,0.72,0,1)]">
          
          {/* Left Column: Ranking & Mix de Produtos */}
          <div className="xl:col-span-4 flex flex-col gap-4 xl:min-h-0">
            
            {/* Top Left: Bar Chart (Mix de Produtos) */}
            <DoubleBezelCard wrapperClassName="h-[280px] xl:h-auto xl:flex-1 xl:min-h-0 flex flex-col" className="p-4 flex flex-col">
              <div className="flex items-center gap-2.5 mb-3 shrink-0">
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                  <Package size={16} className="text-[#00AE00]" />
                </div>
                <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/80">Volume de Produtos Vendidos</h2>
              </div>
              
              <div className="flex-1 w-full h-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      width={140} 
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#050505]/90 backdrop-blur-xl border border-white/10 p-3 rounded-lg shadow-2xl flex flex-col gap-2">
                              <span className="text-white font-bold text-sm uppercase tracking-wider border-b border-white/10 pb-1.5">{data.name}</span>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between gap-6">
                                  <span className="text-white/50 font-medium text-xs uppercase tracking-wider">Volume:</span>
                                  <span className="text-[#00AE00] font-bold text-sm">{data.quantity} un.</span>
                                </div>
                                <div className="flex items-center justify-between gap-6">
                                  <span className="text-white/50 font-medium text-xs uppercase tracking-wider">Participação:</span>
                                  <span className="text-white font-bold text-sm">{data.percent}%</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="percent" 
                      radius={[0, 4, 4, 0]} 
                      barSize={14}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    >
                      <LabelList 
                        dataKey="quantity" 
                        position="right" 
                        fill="rgba(255,255,255,0.7)" 
                        fontSize={11} 
                        fontWeight={700}
                        formatter={(val: number) => `${val}`}
                      />
                      {productData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? "#00AE00" : index === 1 ? "#F39C38" : index === 2 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DoubleBezelCard>

            {/* Bottom Left: Histórico de Entrada de Dados */}
            <DoubleBezelCard wrapperClassName="shrink-0 flex flex-col xl:flex-1 xl:min-h-0" className="p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 md:mb-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                    <Activity size={16} className="text-[#00AE00]" />
                  </div>
                  <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/80">Histórico de Dados</h2>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-[#00AE00]/10 border border-[#00AE00]/20 text-[10px] font-bold text-[#00AE00] tracking-wider animate-pulse">
                  LOG
                </div>
              </div>
              
              <div className="flex flex-col gap-2.5 flex-1 pr-1 overflow-y-auto custom-scrollbar">
                {historicoDados.map((item) => (
                  <div key={item.id} className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 hover:border-white/10 transition-colors shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/90">{item.tipoEntrada}</span>
                      <span className="text-[10px] font-bold text-white/40">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed pr-2 mt-0.5">
                      <span className="text-white/80 font-semibold mr-1.5">{item.dataHora} —</span>
                      {item.observacao}
                    </p>
                  </div>
                ))}
              </div>
            </DoubleBezelCard>

          </div>

          {/* Right Column: Charts */}
          <div className="xl:col-span-8 flex flex-col xl:min-h-0">
            
            {/* Top Right: Line Chart (Meta) */}
            <DoubleBezelCard wrapperClassName="h-[350px] xl:h-auto xl:flex-1 xl:min-h-0 flex flex-col" className="p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4 md:mb-5 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                    <TrendingUp size={16} className="text-[#00AE00]" />
                  </div>
                  <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/80">Evolução & Meta</h2>
                </div>
                <div className="flex gap-4 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-white/50">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-[#d8751e] rounded-sm shadow-[0_0_8px_rgba(216,117,30,0.5)]"></div> Realizado
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-0 border-t border-dashed border-[#d8751e] opacity-80"></div> Meta
                  </div>
                </div>
              </div>
              
              <div className="flex-1 w-full h-full min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={lineData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAtual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d8751e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#d8751e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="dia" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, fontFamily: 'ui-monospace, SFMono-Regular, monospace' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, fontFamily: 'ui-monospace, SFMono-Regular, monospace' }} 
                      tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area 
                      type="monotone" 
                      dataKey="atual" 
                      stroke="#d8751e" 
                      strokeWidth={3} 
                      fill="url(#colorAtual)" 
                      activeDot={{ r: 5, fill: "#050505", stroke: "#d8751e", strokeWidth: 2 }}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="meta" 
                      stroke="#d8751e" 
                      strokeWidth={2} 
                      strokeDasharray="4 4" 
                      dot={false}
                      activeDot={false}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </DoubleBezelCard>
            
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}} />
    </div>
  );
}
