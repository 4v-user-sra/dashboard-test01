import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, ComposedChart, BarChart, Bar, Cell, Tooltip, LabelList } from 'recharts';
import { TrendingUp, Target, Users, Package, Activity } from 'lucide-react';

// --- MOCK DATA ---

const currentDate = 15;
const totalDays = 30;
const idealPercent = (currentDate / totalDays) * 100;

const kpiData = {
  financeiro: { target: 2000000, current: 1100000 },
  volume: { target: 5000, current: 3200 }
};

const rankingData = [
  { id: 1, name: "Roberto Silva", sales: 450000, target: 500000, avatar: "roberto" },
  { id: 2, name: "Amanda Costa", sales: 420000, target: 500000, avatar: "amanda" },
  { id: 3, name: "Carlos Souza", sales: 380000, target: 500000, avatar: "carlos" },
  { id: 4, name: "Fernanda Lima", sales: 350000, target: 500000, avatar: "fernanda" },
  { id: 5, name: "Juliana Alves", sales: 310000, target: 500000, avatar: "juliana" },
  { id: 6, name: "Marcos Rocha", sales: 290000, target: 500000, avatar: "marcos" },
  { id: 7, name: "Diego Martins", sales: 250000, target: 500000, avatar: "diego" },
  { id: 8, name: "Luciana Reis", sales: 220000, target: 500000, avatar: "luciana" },
  { id: 9, name: "Bruno Gomes", sales: 180000, target: 500000, avatar: "bruno" },
  { id: 10, name: "Patrícia Melo", sales: 150000, target: 500000, avatar: "patricia" },
];

const lineData = Array.from({ length: totalDays }, (_, i) => {
  const day = i + 1;
  const baseValue = 50000 * day;
  const variance = (Math.random() - 0.2) * 30000;
  
  const isPast = day <= currentDate;
  const isToday = day === currentDate;
  
  const atual = isPast ? Math.round(baseValue + variance) : null;
  
  let projecao = null;
  if (day >= currentDate) {
    if (isToday) {
      projecao = atual;
    } else {
      const growthRate = 60000;
      projecao = Math.round((50000 * currentDate) + (growthRate * (day - currentDate)));
    }
  }

  return {
    dia: day.toString().padStart(2, '0'),
    atual,
    projecao
  };
});

const productData = [
  { name: 'Seguro Auto', percent: 45, quantity: 1440 },
  { name: 'Seguro Vida', percent: 25, quantity: 800 },
  { name: 'Empresarial', percent: 18, quantity: 576 },
  { name: 'Residencial', percent: 12, quantity: 384 },
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
const DoubleBezelCard = ({ children, className = "", flex1 = false, wrapperClassName = "" }: any) => (
  <div className={`bg-white/[0.02] border border-white/[0.05] p-[5px] rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${flex1 ? 'flex-1 min-h-0 flex flex-col' : ''} ${wrapperClassName}`}>
    <div className={`bg-[#050505]/40 backdrop-blur-3xl rounded-[calc(2rem-5px)] border border-white/[0.03] ${flex1 ? 'flex-1 min-h-0 flex flex-col' : ''} ${className}`}>
      {children}
    </div>
  </div>
);

const ProgressBar = ({ label, current, target, formatFn, showIdealMarker = true }: any) => {
  const percent = (current / target) * 100;
  const color = getStatusColor(percent, idealPercent);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex flex-col gap-2 group">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] group-hover:text-white/60 transition-colors">{label}</span>
        <div className="text-right">
          <span className="text-xl font-extrabold text-white tracking-tight">{formatFn(current)}</span>
          <span className="text-[10px] font-semibold text-white/40 ml-2">/ {formatFn(target)}</span>
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
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="h-screen bg-[#050505] text-white font-['Plus_Jakarta_Sans'] flex flex-col overflow-hidden relative selection:bg-[#d8751e]/30">
      
      {/* Vibe Archetype: Ethereal Glass Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#d8751e]/20 blur-[120px] mix-blend-screen transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute top-[40%] -right-[10%] w-[45vw] h-[60vw] rounded-full bg-[#00AE00]/15 blur-[120px] mix-blend-screen transition-opacity duration-1000 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIvPjwvc3ZnPg==')] opacity-[0.15] mix-blend-overlay"></div>
      </div>

      <main className="relative z-10 flex-1 p-4 md:p-6 flex flex-col gap-5 max-w-[1600px] mx-auto w-full min-h-0">
        
        {/* Header Section */}
        <header className="flex justify-between items-end pb-4 shrink-0 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] translate-y-0 opacity-100">
          <div className="flex items-center gap-4">
             <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase">
                  DASHBOARD <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F39C38] to-[#d8751e]">TEST 01</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00AE00] shadow-[0_0_8px_#00AE00] animate-pulse"></div>
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.3em]">Status Atualizado</p>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Ciclo Operacional</span>
              <span className="text-sm font-extrabold text-white tracking-widest">DIA {currentDate.toString().padStart(2, '0')} <span className="text-white/30 font-medium">/ {totalDays}</span></span>
            </div>
          </div>
        </header>

        {/* Top KPIs (Metas Globais) */}
        <DoubleBezelCard className="p-6 flex flex-col justify-center shrink-0 transition-all duration-700 delay-100 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
            <ProgressBar 
              label="Volume Financeiro (R$)" 
              current={kpiData.financeiro.current} 
              target={kpiData.financeiro.target} 
              formatFn={formatCurrency} 
            />
            <ProgressBar 
              label="Volume de Vendas (Qtd)" 
              current={kpiData.volume.current} 
              target={kpiData.volume.target} 
              formatFn={formatNumber} 
            />
          </div>
        </DoubleBezelCard>

        {/* Main Grid: Ranking (Left) & Charts (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 flex-1 min-h-0 transition-all duration-700 delay-200 ease-[cubic-bezier(0.32,0.72,0,1)]">
          
          {/* Left Column: Ranking */}
          <DoubleBezelCard flex1 className="p-5 flex flex-col" wrapperClassName="xl:col-span-4">
            <div className="flex items-center justify-between mb-5 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                  <Users size={14} className="text-[#d8751e]" />
                </div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">Ranking Vendedores</h2>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/60 tracking-wider">
                TOP 10
              </div>
            </div>
            
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {rankingData.map((seller, index) => {
                const percent = (seller.sales / seller.target) * 100;
                const avatarUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${seller.avatar}&backgroundColor=transparent`;
                
                return (
                  <div key={seller.id} className="flex flex-col gap-2 group cursor-pointer active:scale-[0.98] transition-transform duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-white/30 font-bold text-xs w-4 font-mono">{index + 1}</span>
                        <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 group-hover:border-white/30">
                          <img src={avatarUrl} alt={seller.name} className="w-6 h-6 opacity-80 mix-blend-screen grayscale group-hover:grayscale-0 transition-all" />
                        </div>
                        <span className="font-semibold text-[13px] text-white/80 group-hover:text-white transition-colors">{seller.name}</span>
                      </div>
                      <span className="font-bold text-xs text-white tracking-tight">{formatCurrency(seller.sales)}</span>
                    </div>
                    {/* Seller Progress Bar */}
                    <div className="h-[3px] bg-white/5 rounded-full overflow-hidden ml-7 w-[calc(100%-28px)] group-hover:bg-white/10 transition-colors">
                      <div 
                        className="h-full rounded-full transition-all duration-[1200ms] ease-[cubic-bezier(0.32,0.72,0,1)]" 
                        style={{ 
                          width: mounted ? `${percent}%` : '0%', 
                          backgroundColor: index < 3 ? '#00AE00' : 'rgba(255,255,255,0.4)',
                          boxShadow: index < 3 ? '0 0 8px rgba(0,174,0,0.5)' : 'none'
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </DoubleBezelCard>

          {/* Right Column: Charts */}
          <div className="xl:col-span-8 flex flex-col gap-5 min-h-0">
            
            {/* Top Right: Line Chart (Projeção) */}
            <DoubleBezelCard flex1 className="p-5 flex flex-col">
              <div className="flex items-center justify-between mb-5 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                    <TrendingUp size={14} className="text-[#d8751e]" />
                  </div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">Evolução & Projeção</h2>
                </div>
                <div className="flex gap-4 text-[9px] font-bold uppercase tracking-widest text-white/50">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-[#d8751e] rounded-sm shadow-[0_0_8px_rgba(216,117,30,0.5)]"></div> Realizado
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-0 border-t border-dashed border-[#d8751e] opacity-80"></div> Projeção
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
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600, fontFamily: 'ui-monospace, SFMono-Regular, monospace' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600, fontFamily: 'ui-monospace, SFMono-Regular, monospace' }} 
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
                      dataKey="projecao" 
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

            {/* Bottom Right: Bar Chart (Mix de Produtos) */}
            <DoubleBezelCard className="p-5 h-[220px] shrink-0 flex flex-col">
              <div className="flex items-center gap-2.5 mb-3 shrink-0">
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                  <Package size={14} className="text-[#00AE00]" />
                </div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">Volume de Produtos Vendidos</h2>
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
                      width={100} 
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#050505]/90 backdrop-blur-xl border border-white/10 p-3 rounded-lg shadow-2xl flex flex-col gap-2">
                              <span className="text-white font-bold text-xs uppercase tracking-wider border-b border-white/10 pb-1.5">{data.name}</span>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between gap-6">
                                  <span className="text-white/50 font-medium text-[10px] uppercase tracking-wider">Volume:</span>
                                  <span className="text-[#00AE00] font-bold text-xs">{data.quantity} un.</span>
                                </div>
                                <div className="flex items-center justify-between gap-6">
                                  <span className="text-white/50 font-medium text-[10px] uppercase tracking-wider">Participação:</span>
                                  <span className="text-white font-bold text-xs">{data.percent}%</span>
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
                      barSize={16}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    >
                      <LabelList 
                        dataKey="quantity" 
                        position="right" 
                        fill="rgba(255,255,255,0.6)" 
                        fontSize={10} 
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
