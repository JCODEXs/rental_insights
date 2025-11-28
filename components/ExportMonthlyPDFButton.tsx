// components/ExportMonthlyPDFButton.tsx
'use client';

import { useRef, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import MonthlyReportDocument from './MonthlyReportDocument';


export default function ExportMonthlyPDFButton({ report, year, month }: { report: any; year: number; month: number }) {
  const chart1Ref = useRef<any>(null);
  const chart2Ref = useRef<any>(null);
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);

    try {
      // Capturamos los gráficos con ECharts nativo (nunca falla con lab())
      const chart1 = chart1Ref.current?.getEchartsInstance().getDataURL({
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });

      const chart2 = chart2Ref.current?.getEchartsInstance().getDataURL({
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });

      const blob = await pdf(
        <MonthlyReportDocument
          report={report} 
          year={year} 
          month={month} 
          chart1={chart1} 
          chart2={chart2} 
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Mensual_${year}-${String(month).padStart(2, '0')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error generando el PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      {/* Gráficos ocultos solo para capturar */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <ReactECharts ref={chart1Ref} option={report.barOption} style={{ height: 400, width: 800 }} />
        <ReactECharts ref={chart2Ref} option={report.pieOption} style={{ height: 400, width: 800 }} />
      </div>

      <Button 
        onClick={generatePDF} 
        disabled={generating} 
        size="lg" 
        className="w-full mt-8"
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generando PDF...
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-2" />
            Exportar Reporte Completo a PDF
          </>
        )}
      </Button>
    </>
  );
}