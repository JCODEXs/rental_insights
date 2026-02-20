// components/MonthlyReportPDF.tsx
'use client';

import { useRef } from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactECharts from 'echarts-for-react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { marginBottom: 30 },
  title: { fontSize: 32, textAlign: 'center', color: '#1e40af', fontWeight: 'bold' },
  subtitle: { fontSize: 18, textAlign: 'center', color: '#4b5563', marginTop: 10 },
  bigProfit: { fontSize: 48, textAlign: 'center', color: '#16a34a', fontWeight: 'bold', marginTop: 20 },
  marginBadge: { fontSize: 28, textAlign: 'center', marginTop: 10 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 30, gap: 20 },
  card: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 12, width: '48%', border: '1px solid #e2e8f0' },
  cardTitle: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  cardValue: { fontSize: 28, fontWeight: 'bold' },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e40af', margin: '30 0 15 0' },
  image: { width: '100%', marginVertical: 20 },
  footer: { marginTop: 50, textAlign: 'center', color: '#9ca3af', fontSize: 10 },
});

export default function ExportMonthlyPDF({ report, year, month }: { report: any; year: number; month: number }) {
  const chart1Ref = useRef<any>(null);
  const chart2Ref = useRef<any>(null);
  

  const generatePDF = async () => {
    report.setGenerating(true);

    try {
      const chart1 = chart1Ref.current?.getEchartsInstance().getDataURL({ pixelRatio: 2, backgroundColor: '#ffffff' });
      const chart2 = chart2Ref.current?.getEchartsInstance().getDataURL({ pixelRatio: 2, backgroundColor: '#ffffff' });

      const monthName = format(new Date(year, month - 1), 'MMMM yyyy', { locale: es }).replace(/^\w/, c => c.toUpperCase());

      const Doc = () => (
        <Document>
          <Page size="A4" style={styles.page}>
            {/* ENCABEZADO */}
            <View style={styles.header}>
              <Text style={styles.title}>Reporte Mensual Airbnb</Text>
              <Text style={styles.subtitle}>Resumen {monthName}</Text>
              <Text style={styles.bigProfit}>${report.profit.toLocaleString()}</Text>
              <Text style={styles.marginBadge}>
                Margen promedio: {report.avgMargin.toFixed(1)}%
              </Text>
            </View>

            {/* 4 TARJETAS DE RESUMEN */}
            <View style={styles.cards}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Ingresos Netos</Text>
                <Text style={{ ...styles.cardValue, color: '#2563eb' }}>
                  ${report.totalRevenue.toLocaleString()}
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Gastos Totales</Text>
                <Text style={{ ...styles.cardValue, color: '#dc2626' }}>
                  ${report.totalCosts.toLocaleString()}
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Promedio por Noche</Text>
                <Text style={{ ...styles.cardValue, color: '#7c3aed' }}>
                  ${(report.profit / report.totalNights || 0).toFixed(0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Ocupación</Text>
                <Text style={{ ...styles.cardValue, color: '#9333ea' }}>
                  {report.occupancyRate.toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* GRÁFICOS */}
            <Text style={styles.chartTitle}>Ganancia por Estancia</Text>
            <Image src={chart1} style={styles.image} />

            <Text style={styles.chartTitle}>Distribución de Gastos</Text>
            <Image src={chart2} style={styles.image} />

            <Text style={styles.footer}>
              Generado el {format(new Date(), "dd 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}
            </Text>
          </Page>
        </Document>
      );

      const blob = await pdf(<Doc />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Mensual_${monthName.replace(' ', '_')}_${year}.pdf`;
      a.click();
    } catch (err) {
      alert('Error generando PDF');
      console.error(err);
    } finally {
      report.setGenerating(false);
    }
  };

  return (
    <div className="mt-10">
      {/* Gráficos reales (visibles) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ReactECharts ref={chart1Ref} option={report.barOption} style={{ height: 400 }} />
        <ReactECharts ref={chart2Ref} option={report.pieOption} style={{ height: 400 }} />
      </div>

      <Button onClick={generatePDF} disabled={report.generating} size="lg" className="w-full">
        {report.generating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generando PDF completo...
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-2" />
            Exportar Reporte Mensual Completo a PDF
          </>
        )}
      </Button>
    </div>
  );
}
// // components/MonthlyReportPDF.tsx
// 'use client';

// import { useRef, useState } from 'react';
// import { Document, Page, Text, View, StyleSheet, pdf, Image, Font } from '@react-pdf/renderer';
// import { format } from 'date-fns';
// import { es } from 'date-fns/locale';
// import html2canvas from 'html2canvas';
// import ReactECharts from 'echarts-for-react';
// import { Button } from '@/components/ui/button';
// import { Download, Loader2 } from 'lucide-react';

// const styles = StyleSheet.create({
//   page: { padding: 40, backgroundColor: '#f9fafb' },
//   title: { fontSize: 32, marginBottom: 10, textAlign: 'center', color: '#1e40af', fontWeight: 'bold' },
//   subtitle: { fontSize: 20, marginBottom: 20, textAlign: 'center', color: '#6b7280' },
//   section: { marginBottom: 30 },
//   header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, paddingBottom: 20, borderBottom: '2px solid #e5e7eb' },
//   summaryCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadow: 5, marginBottom: 20 },
//   bigNumber: { fontSize: 36, fontWeight: 'bold', color: '#16a34a' },
//   label: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
//   chartImage: { width: '100%', marginTop: 20 },
//   footer: { marginTop: 50, textAlign: 'center', color: '#9ca3af', fontSize: 10 },
// });

// interface MonthlyReportPDFProps {
//   report: any;
//   year: number;
//   month: number;
// }

// const MonthlyReportPDF = ({ report, year, month }: MonthlyReportPDFProps) => {
//   const monthName = format(new Date(year, month - 1), 'MMMM yyyy', { locale: es }).replace(/^\w/, c => c.toUpperCase());

//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         {/* Encabezado */}
//         <Text style={styles.title}>Reporte Mensual Airbnb</Text>
//         <Text style={styles.subtitle}>{monthName}</Text>

//         {/* Resumen principal */}
//         <View style={styles.header}>
//           <View>
//             <Text style={styles.label}>Ganancia Neta</Text>
//             <Text style={styles.bigNumber}>${report.profit.toLocaleString()}</Text>
//           </View>
//           <View>
//             <Text style={styles.label}>Margen Promedio</Text>
//             <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#8b5cf6' }}>
//               {report.avgMargin.toFixed(1)}%
//             </Text>
//           </View>
//           <View>
//             <Text style={styles.label}>Estancias / Noches</Text>
//             <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
//               {report.totalStays} / {report.totalNights}
//             </Text>
//           </View>
//         </View>

//         {/* Aquí irán las imágenes de los gráficos */}
//         <View style={styles.section}>
//           <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1e40af' }}>
//             Ganancia por Estancia
//           </Text>
//           <Image src={report.chart1Url} style={styles.chartImage} />
//         </View>

//         <View style={styles.section}>
//           <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1e40af' }}>
//             Distribución de Gastos
//           </Text>
//           <Image src={report.chart2Url} style={styles.chartImage} />
//         </View>

//         <Text style={styles.footer}>
//           Reporte generado el {format(new Date(), "dd 'de' MMMM yyyy", { locale: es })} • Tu App Airbnb Manager
//         </Text>
//       </Page>
//     </Document>
//   );
// };

// export default function ExportMonthlyPDF({ report, year, month }: MonthlyReportPDFProps) {
//   const chart1Ref = useRef<HTMLDivElement>(null);
//   const chart2Ref = useRef<HTMLDivElement>(null);
//   const [generating, setGenerating] = useState(false);

//   const generatePDF = async () => {
//     setGenerating(true);

//     try {
//       // Capturar gráficos como imágenes
//       const canvas1 = await html2canvas(chart1Ref.current!);
//       const canvas2 = await html2canvas(chart2Ref.current!);

//       const chart1Url = canvas1.toDataURL('image/png');
//       const chart2Url = canvas2.toDataURL('image/png');

//       const doc = <MonthlyReportPDF report={{ ...report, chart1Url, chart2Url }} year={year} month={month} />;
//       const asPdf = pdf();
//       asPdf.updateContainer(doc);
//       const blob = await asPdf.toBlob();
//       const url = URL.createObjectURL(blob);

//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `Reporte_Mensual_${year}-${String(month).padStart(2, '0')}.pdf`;
//       link.click();
//     } catch (err) {
//       alert('Error generando PDF: ' + (err as any).message);
//     } finally {
//       setGenerating(false);
//     }
//   };

//   return (
//     <>
//       {/* Gráficos ocultos para capturar */}
//       <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
//         <div ref={chart1Ref}>
//           <ReactECharts option={report.barOption} style={{ height: 400, width: 800 }} />
//         </div>
//         <div ref={chart2Ref}>
//           <ReactECharts option={report.pieOption} style={{ height: 400, width: 800 }} />
//         </div>
//       </div>

//       <Button onClick={generatePDF} disabled={generating} size="lg">
//         {generating ? (
//           <>
//             <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//             Generando PDF...
//           </>
//         ) : (
//           <>
//             <Download className="w-5 h-5 mr-2" />
//             Exportar Reporte a PDF
//           </>
//         )}
//       </Button>
//     </>
//   );
// }