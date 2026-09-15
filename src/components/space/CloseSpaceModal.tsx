import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { X, Download, LogOut, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/navigation';

interface CloseSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  spaceName: string;
  guests: any[];
}
export default function CloseSpaceModal({ isOpen, onClose, spaceId, spaceName, guests }: CloseSpaceModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    if (isOpen) {
      const fetchEvals = async () => {
        const { data } = await supabase.from('evaluations').select('*, guest:guests(name)').eq('space_id', spaceId);
        if (data) setEvaluations(data);
      };
      fetchEvals();
    }
  }, [isOpen, spaceId]);

  if (!isOpen) return null;

  const speakersCount = guests.filter(g => g.status === 'finished').length;
  const waitingCount = guests.filter(g => g.status === 'waiting').length;

  const exportPDFAndClose = async () => {
    setIsClosing(true);
    
    // Generar PDF
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(`Reporte de Cierre: ${spaceName}`, 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Total Invitados: ${guests.length}`, 14, 30);
    doc.text(`Oradores que participaron: ${speakersCount}`, 14, 38);
    doc.text(`Oradores pendientes: ${waitingCount}`, 14, 46);
    doc.text(`Evaluaciones realizadas: ${evaluations.length}`, 14, 54);

    if (evaluations.length > 0) {
      doc.text(`Detalle de Evaluaciones:`, 14, 66);
      
      const criteriaList = Array.from(new Set(evaluations.flatMap(e => Object.keys(e.scores))));
      
      const tableData = evaluations.map(ev => {
        const row = [ev.guest?.name || 'Desconocido'];
        let total = 0;
        criteriaList.forEach(c => {
          const val = ev.scores[c] || 0;
          total += val;
          row.push(val.toString());
        });
        const average = criteriaList.length > 0 ? (total / criteriaList.length).toFixed(1) : '0';
        row.push(total.toString());
        row.push(average.toString());
        return row;
      });

      autoTable(doc, {
        head: [['Invitado', ...criteriaList, 'Total', 'Promedio']],
        body: tableData,
        startY: 70,
        styles: { fontSize: 8 },
      });
    }

    doc.save(`reporte_cierre_${spaceName.replace(/\s+/g, '_')}.pdf`);

    // Actualizar BD
    await supabase.from('spaces').update({ status: 'finished' }).eq('id', spaceId);
    
    // Finalizar
    setIsClosing(false);
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-white text-gray-900 relative p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900">
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-cafetin-teal/10 text-cafetin-teal rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Cerrar Mesa</h2>
          <p className="text-gray-500 mt-2">Al cerrar la mesa, ya no se podrán realizar más sorteos ni evaluaciones.</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">KPIs de la Sesión</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-center">
              <p className="text-3xl font-bold text-cafetin-teal">{speakersCount}</p>
              <p className="text-xs text-gray-500 font-medium">Oradores</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-center">
              <p className="text-3xl font-bold text-cafetin-orange">{evaluations.length}</p>
              <p className="text-xs text-gray-500 font-medium">Evaluaciones</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-center col-span-2">
              <p className="text-3xl font-bold text-gray-700">{guests.length}</p>
              <p className="text-xs text-gray-500 font-medium">Invitados Totales</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" className="flex-1 flex gap-2 items-center justify-center bg-red-500 hover:bg-red-600 border-red-500 text-white" onClick={exportPDFAndClose} isLoading={isClosing}>
            <Download size={16} /> Cerrar y PDF
          </Button>
        </div>
      </Card>
    </div>
  );
}
