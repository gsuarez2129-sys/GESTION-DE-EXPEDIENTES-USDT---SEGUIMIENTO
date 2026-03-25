import React, { useState, useEffect } from 'react';
import { Expediente } from './types';
import ExpedienteForm from './components/ExpedienteForm';
import ExpedienteList from './components/ExpedienteList';
import SituationReport from './components/SituationReport';
import { Layout, FileText, Download, Filter, Search, FileSpreadsheet, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { getStatusColor } from './lib/utils';

const STORAGE_KEY = 'expedientes_data';

export default function App() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingExpediente, setEditingExpediente] = useState<Expediente | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setExpedientes(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expedientes));
  }, [expedientes]);

  const handleAdd = (data: any) => {
    const areasList = data.areaServicio.split(', ').map((nombre: string) => ({
      nombre,
      completada: false
    }));

    const newExp: Expediente = {
      numero: data.numero,
      asunto: data.asunto,
      areas: areasList,
      fechaInicio: data.fechaInicio,
      fechaVencimiento: data.fechaVencimiento,
      observacion: data.observacion,
      id: crypto.randomUUID(),
    };
    setExpedientes([newExp, ...expedientes]);
  };

  const handleUpdate = (id: string, data: any) => {
    setExpedientes(
      expedientes.map((e) => {
        if (e.id === id) {
          // If areas changed, we need to preserve completion status for existing areas if possible
          // or just reset if it's a major change. Let's try to preserve.
          const newAreaNames = data.areaServicio.split(', ');
          const updatedAreas = newAreaNames.map((nombre: string) => {
            const existing = e.areas.find(a => a.nombre === nombre);
            return existing || { nombre, completada: false };
          });

          return {
            ...e,
            numero: data.numero,
            asunto: data.asunto,
            areas: updatedAreas,
            fechaInicio: data.fechaInicio,
            fechaVencimiento: data.fechaVencimiento,
            observacion: data.observacion
          };
        }
        return e;
      })
    );
    setEditingExpediente(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este expediente?')) {
      setExpedientes(expedientes.filter((e) => e.id !== id));
    }
  };

  const handleToggleArea = (expedienteId: string, areaNombre: string) => {
    setExpedientes(
      expedientes.map((e) => {
        if (e.id === expedienteId) {
          const updatedAreas = e.areas.map((a) => {
            if (a.nombre === areaNombre) {
              const newCompletada = !a.completada;
              return {
                ...a,
                completada: newCompletada,
                fechaCumplimiento: newCompletada ? new Date().toISOString().split('T')[0] : undefined
              };
            }
            return a;
          });
          return { ...e, areas: updatedAreas };
        }
        return e;
      })
    );
  };

  const handleExportExcel = () => {
    const dataToExport = expedientes.flatMap(exp => 
      exp.areas.map(area => ({
        'Número': exp.numero,
        'Área / Servicio': area.nombre,
        'Asunto': exp.asunto,
        'Fecha Inicio': exp.fechaInicio,
        'Fecha Vencimiento': exp.fechaVencimiento,
        'Cumplido': area.completada ? 'SÍ' : 'NO',
        'Fecha Cumplimiento': area.fechaCumplimiento || '-',
        'Observación': exp.observacion || '-'
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expedientes');
    
    // Generate buffer and download
    XLSX.writeFile(workbook, `Reporte_Expedientes_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleExportPDF = async () => {
    const chartElement = document.getElementById('situation-chart');
    if (!chartElement) return;

    try {
      const canvas = await html2canvas(chartElement);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Header
      pdf.setFontSize(18);
      pdf.setTextColor(20, 20, 20);
      pdf.text('Reporte de Situación de Expedientes', 20, 20);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Fecha de generación: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 20, 28);
      
      // Chart
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 20, 35, imgWidth, imgHeight);
      
      // Analysis
      const yPos = 35 + imgHeight + 15;
      pdf.setFontSize(14);
      pdf.setTextColor(20, 20, 20);
      pdf.text('Análisis de Cumplimiento', 20, yPos);
      
      const delayedAreas: { area: string, numero: string }[] = [];
      expedientes.forEach(exp => {
        const isDelayed = getStatusColor(exp.fechaVencimiento) === 'red';
        if (isDelayed) {
          exp.areas.forEach(area => {
            if (!area.completada) {
              delayedAreas.push({ area: area.nombre, numero: exp.numero });
            }
          });
        }
      });
      
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      
      if (delayedAreas.length === 0) {
        pdf.text('No se registran áreas con expedientes vencidos en este momento.', 20, yPos + 10);
      } else {
        pdf.text('Se han identificado las siguientes áreas con expedientes fuera de plazo:', 20, yPos + 10);
        
        let currentY = yPos + 20;
        delayedAreas.forEach((item) => {
          if (currentY > 270) {
            pdf.addPage();
            currentY = 20;
          }
          pdf.setFont('helvetica', 'bold');
          pdf.text(`• ${item.area} (${item.numero}):`, 25, currentY);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Expediente con retraso en la presentación.`, 100, currentY);
          currentY += 8;
        });
        
        pdf.setFontSize(10);
        pdf.setTextColor(150, 0, 0);
        pdf.text('Nota: Se requiere atención inmediata para regularizar estos expedientes.', 20, currentY + 5);
      }
      
      pdf.save(`reporte-expedientes-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const filteredExpedientes = expedientes.filter(
    (e) =>
      e.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.asunto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.areas.some(a => a.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Sidebar / Header Navigation */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-zinc-900 p-2 rounded-xl">
                <Layout className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Gestor de Expedientes</h1>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                  Sistema de Gestión de Tareas
                </p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Expedientes</p>
                <p className="text-sm font-bold text-zinc-900">{expedientes.length}</p>
              </div>
              <div className="h-8 w-px bg-zinc-200" />
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Reporte Diario</p>
                <p className="text-sm font-medium text-zinc-900">
                  {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
                </p>
              </div>
              <div className="h-8 w-px bg-zinc-200" />
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors text-sm font-medium"
                  title="Exportar a Excel"
                >
                  <FileSpreadsheet size={18} />
                  <span className="hidden lg:inline">Excel</span>
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors text-sm font-medium"
                  title="Exportar a PDF"
                >
                  <FileDown size={18} />
                  <span className="hidden lg:inline">PDF</span>
                </button>
                <ExpedienteForm onAdd={handleAdd} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Situation Report Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Reporte de Situación</h2>
              <p className="text-zinc-500 text-sm">Resumen ejecutivo del estado de cumplimiento de expedientes.</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
              <Download size={14} />
              Exportar PDF
            </button>
          </div>
          <SituationReport expedientes={expedientes} />
        </section>

        {/* Main Content Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por número, asunto o área..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all text-sm shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-colors text-sm font-medium shadow-sm">
                <Filter size={16} />
                Filtros
              </button>
              <div className="sm:hidden flex gap-2">
                <button 
                  onClick={handleExportExcel}
                  className="p-2 text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
                >
                  <FileSpreadsheet size={20} />
                </button>
                <ExpedienteForm onAdd={handleAdd} />
              </div>
            </div>
          </div>

          <ExpedienteList
            expedientes={filteredExpedientes}
            onDelete={handleDelete}
            onToggleArea={handleToggleArea}
            onEdit={setEditingExpediente}
          />
        </section>
      </main>

      {/* Edit Modal */}
      {editingExpediente && (
        <ExpedienteForm
          initialData={editingExpediente}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onClose={() => setEditingExpediente(null)}
        />
      )}

      {/* Footer / Status Bar */}
      <footer className="mt-20 border-t border-zinc-200 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <FileText size={16} />
            <span className="text-xs font-medium uppercase tracking-widest">Gestor de Expedientes v1.0</span>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Vigente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Próximo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Vencido</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
