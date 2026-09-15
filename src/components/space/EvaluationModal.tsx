import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Download, Plus, Trash2, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
}

export default function EvaluationModal({ isOpen, onClose, spaceId }: EvaluationModalProps) {
  const defaultCriteria = ['Claridad en la exposición', 'Dominio del tema', 'Comunicación', 'Trabajo en equipo'];
  
  const [criteriaList, setCriteriaList] = useState<string[]>([]);
  const [newCriterion, setNewCriterion] = useState('');
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<string>('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load custom criteria from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      fetchGuestsAndEvals();
      const saved = localStorage.getItem(`cafetin_criteria_${spaceId}`);
      if (saved) {
        try {
          setCriteriaList(JSON.parse(saved));
        } catch(e) {
          setCriteriaList(defaultCriteria);
        }
      } else {
        setCriteriaList(defaultCriteria);
      }
    }
  }, [isOpen, spaceId]);

  // Sync criteria to localStorage when it changes
  useEffect(() => {
    if (criteriaList.length > 0) {
      localStorage.setItem(`cafetin_criteria_${spaceId}`, JSON.stringify(criteriaList));
    }
  }, [criteriaList, spaceId]);

  const fetchGuestsAndEvals = async () => {
    const { data: gData } = await supabase.from('guests').select('*').eq('space_id', spaceId);
    if (gData) setGuests(gData);

    const { data: eData } = await supabase.from('evaluations').select('*, guest:guests(name)').eq('space_id', spaceId);
    if (eData) setEvaluations(eData);
  };

  const handleAddCriterion = () => {
    if (newCriterion.trim() && !criteriaList.includes(newCriterion.trim())) {
      setCriteriaList([...criteriaList, newCriterion.trim()]);
      setNewCriterion('');
    }
  };

  const handleRemoveCriterion = (c: string) => {
    setCriteriaList(criteriaList.filter(item => item !== c));
  };

  const handleScoreChange = (criterion: string, score: number) => {
    setScores(prev => ({ ...prev, [criterion]: score }));
  };

  const handleSaveEvaluation = async () => {
    if (!selectedGuest) return;
    setIsSaving(true);

    const { error } = await supabase.from('evaluations').insert([{
      space_id: spaceId,
      guest_id: selectedGuest,
      scores
    }]);

    if (!error) {
      alert("Evaluación guardada con éxito");
      setScores({});
      setSelectedGuest('');
      fetchGuestsAndEvals();
    }
    setIsSaving(false);
  };

  const getClassification = (scores: Record<string, number>, criteriaCount: number) => {
    const values = Object.values(scores) as number[];
    const total = values.reduce((a, b) => a + b, 0);
    const maxPossible = criteriaCount * 5;
    const percentage = maxPossible > 0 ? (total / maxPossible) * 100 : 0;
    
    if (percentage >= 80) return "Rockstar";
    if (percentage >= 60) return "Promesa";
    return "En proceso";
  };

  const getStats = (scores: Record<string, number>) => {
    const values = Object.values(scores) as number[];
    const total = values.reduce((a, b) => a + b, 0);
    const average = values.length > 0 ? (total / values.length).toFixed(1) : '0';
    return { total, average };
  };

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Invitado," + criteriaList.join(",") + ",Total,Promedio,Clasificacion\n";

    evaluations.forEach(ev => {
      const row = [ev.guest?.name || 'Desconocido'];
      criteriaList.forEach(c => {
        row.push(ev.scores[c] || 0);
      });
      const { total, average } = getStats(ev.scores);
      row.push(total);
      row.push(average);
      row.push(getClassification(ev.scores, criteriaList.length));
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "evaluaciones_cafetin.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Evaluaciones - Cafetin", 14, 15);
    
    const tableData = evaluations.map(ev => {
      const row = [ev.guest?.name || 'Desconocido'];
      criteriaList.forEach(c => row.push(ev.scores[c]?.toString() || '0'));
      const { total, average } = getStats(ev.scores);
      row.push(total.toString());
      row.push(average.toString());
      row.push(getClassification(ev.scores, criteriaList.length));
      return row;
    });

    autoTable(doc, {
      head: [['Invitado', ...criteriaList, 'Total', 'Promedio', 'Clasific.']],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
    });

    doc.save('evaluaciones_cafetin.pdf');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative bg-white text-gray-900">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Módulo de Evaluación</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-800">Nueva Evaluación</h3>
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-700 mb-1 block">Seleccionar Invitado</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-900 focus:outline-none focus:border-cafetin-teal bg-gray-50"
                value={selectedGuest}
                onChange={e => setSelectedGuest(e.target.value)}
              >
                <option value="">Selecciona alguien...</option>
                {guests.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-6 space-y-4">
              {criteriaList.map(criterion => (
                <div key={criterion} className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center text-sm font-bold text-gray-800">
                    <span>{criterion}</span>
                    <button onClick={() => handleRemoveCriterion(criterion)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[1,2,3,4,5].map(num => (
                      <button 
                        key={num}
                        onClick={() => handleScoreChange(criterion, num)}
                        className={`w-10 h-10 rounded-full border-2 font-bold flex items-center justify-center transition-colors ${scores[criterion] === num ? 'bg-cafetin-orange border-cafetin-orange text-white' : 'border-gray-200 text-gray-600 bg-white hover:border-cafetin-orange/50'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-6">
              <Input 
                placeholder="Añadir nuevo criterio..." 
                value={newCriterion}
                onChange={e => setNewCriterion(e.target.value)}
              />
              <Button variant="secondary" onClick={handleAddCriterion}><Plus size={20} /></Button>
            </div>

            <Button variant="primary" fullWidth onClick={handleSaveEvaluation} isLoading={isSaving} disabled={!selectedGuest}>
              Guardar Evaluación
            </Button>
          </div>

          {/* Historial y Exportación */}
          <div className="md:border-l md:border-gray-200 md:pl-8">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Evaluaciones Guardadas</h3>
            
            <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {evaluations.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay evaluaciones guardadas aún en esta mesa.</p>
              ) : (
                [...evaluations].sort((a, b) => getStats(b.scores).total - getStats(a.scores).total).map(ev => {
                  const { total, average } = getStats(ev.scores);
                  const classification = getClassification(ev.scores, criteriaList.length);
                  const maxPossible = criteriaList.length * 5;
                  
                  return (
                    <div key={ev.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-gray-900 text-base">{ev.guest?.name}</p>
                        <span className="font-bold text-xs bg-cafetin-teal/10 text-cafetin-teal px-2 py-1 rounded-full">{classification}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(ev.scores).map(([crit, val]) => (
                          <span key={crit} className="bg-white px-2 py-1 rounded-md text-xs border border-gray-200 text-gray-700 shadow-sm flex gap-1 items-center">
                            {crit}: <span className="font-bold text-cafetin-orange text-sm">{String(val)}</span>
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-xs font-bold text-gray-700">
                         <span>Total: {total} / {maxPossible}</span>
                         <span>Promedio: {average} ★</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex gap-3 mt-auto">
              <Button variant="outline" className="flex-1 flex items-center justify-center gap-2 border-gray-300 text-gray-700" onClick={exportPDF}>
                <Download size={16} /> PDF
              </Button>
              <Button variant="outline" className="flex-1 flex items-center justify-center gap-2 border-gray-300 text-gray-700" onClick={exportCSV}>
                <Download size={16} /> CSV
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
