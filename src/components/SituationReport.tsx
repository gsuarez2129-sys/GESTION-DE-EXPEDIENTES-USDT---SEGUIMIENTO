import { Expediente } from '../types';
import { getStatusColor } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AlertCircle, CheckCircle, Clock, BarChart3, FileText } from 'lucide-react';

interface Props {
  expedientes: Expediente[];
}

export default function SituationReport({ expedientes }: Props) {
  const stats = expedientes.reduce((acc, exp) => {
    const color = getStatusColor(exp.fechaVencimiento);
    exp.areas.forEach(area => {
      if (area.completada) {
        acc.alDia++;
      } else {
        if (color === 'amber') acc.proximas++;
        else if (color === 'red') acc.retrasadas++;
        else acc.alDia++;
      }
    });
    return acc;
  }, { alDia: 0, proximas: 0, retrasadas: 0 });

  const data = [
    { name: 'Al Día', value: stats.alDia, color: '#10b981' },
    { name: 'Próximas', value: stats.proximas, color: '#f59e0b' },
    { name: 'Retrasadas', value: stats.retrasadas, color: '#f43f5e' },
  ];

  const total = expedientes.reduce((acc, exp) => acc + exp.areas.length, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-8">
      {/* Summary Cards */}
      <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1 bg-zinc-100 text-zinc-600 rounded-md">
              <FileText size={14} />
            </div>
          </div>
          <div>
            <h4 className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider mb-0">Total</h4>
            <p className="text-xl font-bold text-zinc-900 leading-none">{total}</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1 bg-emerald-50 text-emerald-600 rounded-md">
              <CheckCircle size={14} />
            </div>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-full">
              {total > 0 ? Math.round((stats.alDia / total) * 100) : 0}%
            </span>
          </div>
          <div>
            <h4 className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider mb-0">Al Día</h4>
            <p className="text-xl font-bold text-zinc-900 leading-none">{stats.alDia}</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1 bg-amber-50 text-amber-600 rounded-md">
              <Clock size={14} />
            </div>
          </div>
          <div>
            <h4 className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider mb-0">Próximas</h4>
            <p className="text-xl font-bold text-zinc-900 leading-none">{stats.proximas}</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1 bg-rose-50 text-rose-600 rounded-md">
              <AlertCircle size={14} />
            </div>
          </div>
          <div>
            <h4 className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider mb-0">Retrasadas</h4>
            <p className="text-xl font-bold text-zinc-900 leading-none">{stats.retrasadas}</p>
          </div>
        </div>
      </div>

      {/* Chart Card */}
      <div id="situation-chart" className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <BarChart3 size={14} className="text-zinc-400" />
          <h3 className="text-[9px] font-bold text-zinc-900 uppercase tracking-wider">Distribución</h3>
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={20}
                outerRadius={30}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-2 mt-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-tighter">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
