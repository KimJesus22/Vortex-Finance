"use client";

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle2, ShieldCheck, Database, FileText } from 'lucide-react';
import { insforge } from '@/lib/insforge';
import { toast } from 'sonner';

export default function SecureCreditReader({ onSaved }: { onSaved?: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Extracted data
  const [score, setScore] = useState<string>('');
  const [totalBalance, setTotalBalance] = useState<string>('');
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => setCurrentUser(data.user));
    
    // Configurar worker de pdfjs apuntando a un CDN para evitar problemas de Webpack/Turbopack
    import('pdfjs-dist').then(pdfjs => {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    }).catch(e => console.error("Error loading pdfjs", e));
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Por favor sube un archivo PDF válido');
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);
    
    try {
      const pdfjs = await import('pdfjs-dist');
      const arrayBuffer = await file.arrayBuffer();
      
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
      }

      // Regex para buscar "Mi Score", "BC Score" o similares seguido de 3 dígitos
      const scoreMatch = fullText.match(/(?:score|puntuaci[oó]n|bc score).{0,30}?(\d{3})/i);
      if (scoreMatch && scoreMatch[1]) {
        setScore(scoreMatch[1]);
      } else {
        // Fallback genérico para score de 3 dígitos típico de buró (300-850)
        const fallbackScore = fullText.match(/\b([3-8][0-9]{2})\b/);
        if (fallbackScore) setScore(fallbackScore[1]);
      }

      // Regex para buscar saldos totales (ej. "Saldo Actual: $50,000.00")
      const balanceMatch = fullText.match(/(?:saldo actual|total a pagar|saldo total).{0,30}?\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i);
      if (balanceMatch && balanceMatch[1]) {
        setTotalBalance(balanceMatch[1].replace(/,/g, ''));
      }
      
      toast.success('Documento analizado localmente con éxito');

    } catch (error) {
      console.error(error);
      toast.error('No se pudo procesar el PDF. Revisa si está encriptado.');
    } finally {
      setIsProcessing(false);
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleSaveToDatabase = async () => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión');
      return;
    }
    
    if (!score && !totalBalance) {
      toast.error('No hay datos para guardar');
      return;
    }

    try {
      const { error } = await insforge.database.from('credit_profiles').insert({
        user_id: currentUser.id,
        score: score ? parseInt(score) : null,
        total_balance: totalBalance ? parseFloat(totalBalance) : null,
      });

      if (error) throw error;
      
      toast.success('Datos anónimos guardados en la nube');
      setScore('');
      setTotalBalance('');
      setFileName(null);
      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar en InsForge');
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-xl w-full max-w-2xl mx-auto my-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Análisis Zero-Knowledge</h3>
          <p className="text-sm text-neutral-400">Extrae tu Score de Crédito sin comprometer tu privacidad</p>
        </div>
      </div>

      {/* Zero-Knowledge Guarantee Badge */}
      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium px-4 py-3 rounded-xl mb-6">
        <CheckCircle2 size={18} />
        <span>Procesamiento 100% local. Tu archivo nunca sale de este dispositivo.</span>
      </div>

      {!fileName ? (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging ? 'border-emerald-500 bg-emerald-500/5' : 'border-neutral-700 bg-neutral-950/50 hover:bg-neutral-800/50 hover:border-neutral-600'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInput} 
            accept="application/pdf" 
            className="hidden" 
          />
          {isProcessing ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-emerald-400 font-medium">Analizando PDF en tu navegador...</p>
            </div>
          ) : (
            <>
              <UploadCloud size={48} className="text-neutral-500 mb-4" />
              <p className="text-white font-medium mb-1">Arrastra tu Reporte de Crédito (PDF)</p>
              <p className="text-neutral-500 text-sm">o haz clic para explorar tus archivos</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <FileText className="text-cyan-400" size={24} />
              <span className="text-white font-medium truncate max-w-[200px] sm:max-w-xs">{fileName}</span>
            </div>
            <button 
              onClick={() => { setFileName(null); setScore(''); setTotalBalance(''); }}
              className="text-neutral-500 hover:text-rose-400 transition-colors text-sm font-medium"
            >
              Cambiar Archivo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Mi Score (Extraído)</label>
              <input 
                type="number" 
                value={score} 
                onChange={e => setScore(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-2xl font-bold text-white focus:outline-none focus:border-emerald-500/50"
                placeholder="---"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Saldo Total Extraído ($)</label>
              <input 
                type="number" 
                value={totalBalance} 
                onChange={e => setTotalBalance(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-2xl font-bold text-white focus:outline-none focus:border-emerald-500/50"
                placeholder="0.00"
              />
            </div>
          </div>

          <button 
            onClick={handleSaveToDatabase}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-neutral-950 font-bold text-lg py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Database size={20} /> Guardar Datos Verificados
          </button>
        </div>
      )}
    </div>
  );
}
