import React, { useState } from 'react';
import { Expediente } from '../types';
import { Plus, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  onAdd?: (data: {
    numero: string;
    asunto: string;
    areaServicio: string;
    fechaInicio: string;
    fechaVencimiento: string;
    observacion?: string;
  }) => void;
  onUpdate?: (id: string, data: {
    numero: string;
    asunto: string;
    areaServicio: string;
    fechaInicio: string;
    fechaVencimiento: string;
    observacion?: string;
  }) => void;
  onDelete?: (id: string) => void;
  initialData?: Expediente;
  onClose?: () => void;
}

const AREAS_OPCIONES = [
  "SUST-Servicio de Farmacia",
  "SUST-Servicio de Nutrición y Dietética",
  "SUSD-Servicio de Hemoterapia y Banco de Sangre",
  "SUSD-Servicio de Patología Clínica",
  "SUSD-Servicio de Anatomía Patológica",
  "SUSD-Servicio de Diagnóstico por Imágenes",
  "SUSD-Servicio de Genética",
  "SUASP-Área Referencia y Contrareferencia",
  "SUASP-Área de Telesalud"
];

export default function ExpedienteForm({ onAdd, onUpdate, onDelete, initialData, onClose }: Props) {
  const [isOpen, setIsOpen] = useState(!!initialData);
  const [formData, setFormData] = useState({
    numero: initialData?.numero || '',
    asunto: initialData?.asunto || '',
    areaServicio: initialData?.areas ? initialData.areas.map(a => a.nombre).join(', ') : '',
    fechaInicio: initialData?.fechaInicio || new Date().toISOString().split('T')[0],
    fechaVencimiento: initialData?.fechaVencimiento || '',
    observacion: initialData?.observacion || '',
  });

  const [isAreaListOpen, setIsAreaListOpen] = useState(false);
  const selectedAreas = formData.areaServicio ? formData.areaServicio.split(', ') : [];

  const handleAreaToggle = (area: string) => {
    let newAreas: string[];
    if (selectedAreas.includes(area)) {
      newAreas = selectedAreas.filter(a => a !== area);
    } else {
      newAreas = [...selectedAreas, area];
    }
    setFormData({ ...formData, areaServicio: newAreas.join(', ') });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.numero || !formData.asunto || !formData.fechaVencimiento || !formData.areaServicio) return;
    
    if (initialData && onUpdate) {
      onUpdate(initialData.id, formData);
    } else if (onAdd) {
      onAdd(formData);
    }
    
    if (!initialData) {
      setFormData({
        numero: '',
        asunto: '',
        areaServicio: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaVencimiento: '',
        observacion: '',
      });
    }
    setIsOpen(false);
    onClose?.();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleDelete = () => {
    if (initialData && onDelete) {
      if (window.confirm('¿Estás seguro de que deseas eliminar este expediente?')) {
        onDelete(initialData.id);
        onClose?.();
      }
    }
  };

  if (!isOpen && !initialData) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium text-sm"
      >
        <Plus size={18} />
        Nuevo Expediente
      </button>
    );
  }

  if (!isOpen && initialData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h2 className="text-lg font-semibold text-zinc-900">
            {initialData ? 'Editar Expediente' : 'Registrar Expediente'}
          </h2>
          <button onClick={handleClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Número de Expediente</label>
              <input
                type="text"
                required
                placeholder="Ej: EXP-2024-001"
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Área / Servicio (Selección Múltiple)</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAreaListOpen(!isAreaListOpen)}
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-left flex items-center justify-between hover:border-zinc-300 transition-all"
              >
                <span className="text-sm text-zinc-600 truncate">
                  {selectedAreas.length === 0 
                    ? "Seleccionar áreas..." 
                    : `${selectedAreas.length} seleccionadas`}
                </span>
                <Plus className={cn("w-4 h-4 transition-transform", isAreaListOpen && "rotate-45")} />
              </button>
              
              {isAreaListOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-zinc-200 rounded-lg shadow-xl p-3 max-h-60 overflow-y-auto space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {AREAS_OPCIONES.map((area) => (
                    <label key={area} className="flex items-center gap-3 cursor-pointer group p-1 hover:bg-zinc-50 rounded transition-colors">
                      <div 
                        onClick={(e) => {
                          e.preventDefault();
                          handleAreaToggle(area);
                        }}
                        className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center transition-all",
                          selectedAreas.includes(area) 
                            ? "bg-zinc-900 border-zinc-900 text-white" 
                            : "bg-white border-zinc-300 group-hover:border-zinc-400"
                        )}
                      >
                        {selectedAreas.includes(area) && <CheckCircle2 size={14} />}
                      </div>
                      <span className={cn(
                        "text-sm transition-colors",
                        selectedAreas.includes(area) ? "text-zinc-900 font-medium" : "text-zinc-600"
                      )}>
                        {area}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedAreas.length === 0 && (
              <p className="text-[10px] text-rose-500 mt-1 font-medium">Debe seleccionar al menos un área.</p>
            )}
            {selectedAreas.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedAreas.map(area => (
                  <span key={area} className="text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full border border-zinc-200">
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Asunto / Título</label>
            <input
              type="text"
              required
              placeholder="Descripción breve del trámite"
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
              value={formData.asunto}
              onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Fecha Inicio</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Fecha Vencimiento</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                value={formData.fechaVencimiento}
                onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Observación</label>
            <textarea
              rows={3}
              placeholder="Notas adicionales sobre el expediente..."
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all resize-none"
              value={formData.observacion}
              onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
            />
          </div>
          
          <div className="pt-4 flex gap-3">
            {initialData && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors font-medium text-sm"
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium text-sm"
            >
              {initialData ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
