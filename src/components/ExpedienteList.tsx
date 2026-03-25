import { Expediente } from '../types';
import { getStatusColor, getStatusLabel, cn } from '../lib/utils';
import { Calendar, FileText, Trash2, CheckCircle2, Circle, Edit2 } from 'lucide-react';
import { differenceInDays, startOfDay, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  expedientes: Expediente[];
  onDelete: (id: string) => void;
  onToggleArea: (expedienteId: string, areaNombre: string) => void;
  onEdit: (expediente: Expediente) => void;
}

export default function ExpedienteList({ expedientes, onDelete, onToggleArea, onEdit }: Props) {
  if (expedientes.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
        <div className="bg-zinc-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="text-zinc-400" size={32} />
        </div>
        <h3 className="text-zinc-900 font-semibold mb-1">No hay expedientes registrados</h3>
        <p className="text-zinc-500 text-sm">Comienza agregando un nuevo expediente al sistema.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white rounded-2xl border border-zinc-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-bottom border-zinc-200">
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Expediente</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Área / Servicio & Cumplimiento</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Asunto</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Fechas</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Observación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {expedientes.map((exp) => {
              const color = getStatusColor(exp.fechaVencimiento);
              const statusLabel = getStatusLabel(color);
              
              return (
                <tr key={exp.id} className={cn("group hover:bg-zinc-50/50 transition-colors")}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full shadow-sm",
                        color === 'green' ? "bg-emerald-500 shadow-emerald-200" :
                        color === 'amber' ? "bg-amber-500 shadow-amber-200" :
                        "bg-rose-500 shadow-rose-200"
                      )} />
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        color === 'green' ? "bg-emerald-50 text-emerald-700" :
                        color === 'amber' ? "bg-amber-50 text-amber-700" :
                        "bg-rose-50 text-rose-700"
                      )}>
                        {statusLabel}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-semibold text-zinc-900">{exp.numero}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-3 min-w-[250px]">
                      {exp.areas.map((area, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 p-1.5 rounded-lg border border-zinc-100 bg-zinc-50/50 group/area">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-zinc-700">
                              {area.nombre}
                            </span>
                            {area.completada && area.fechaCumplimiento && (
                              <div className="flex flex-col">
                                <span className="text-[9px] font-medium text-emerald-700">
                                  Cumplió: {format(new Date(area.fechaCumplimiento), 'dd/MM/yy', { locale: es })}
                                </span>
                                {(() => {
                                  const delay = differenceInDays(
                                    startOfDay(new Date(area.fechaCumplimiento)),
                                    startOfDay(new Date(exp.fechaVencimiento))
                                  );
                                  if (delay > 0) {
                                    return (
                                      <span className="text-[9px] font-bold text-rose-600">
                                        Retraso: +{delay} {delay === 1 ? 'día' : 'días'}
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => onToggleArea(exp.id, area.nombre)}
                            className={cn(
                              "p-1.5 rounded-md transition-all",
                              area.completada 
                                ? "text-emerald-600 bg-emerald-50" 
                                : "text-zinc-300 hover:text-zinc-500 hover:bg-zinc-200"
                            )}
                            title={area.completada ? "Marcar como pendiente" : "Marcar como cumplido"}
                          >
                            {area.completada ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-700 max-w-xs truncate">
                      {exp.asunto}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                        <Calendar size={10} />
                        <span>Inicia: {format(new Date(exp.fechaInicio), 'dd/MM/yy', { locale: es })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-900">
                        <Calendar size={10} className="text-zinc-400" />
                        <span>Vence: {format(new Date(exp.fechaVencimiento), 'dd/MM/yy', { locale: es })}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3">
                      <p className="text-xs text-zinc-500 italic max-w-[150px] truncate" title={exp.observacion}>
                        {exp.observacion || '-'}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEdit(exp)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(exp.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
