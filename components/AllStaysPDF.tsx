// components/AllStaysPDF.tsx
'use client';

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 11 },
  title: { fontSize: 26, marginBottom: 20, textAlign: 'center', color: '#1e40af', fontWeight: 'bold' },
  subtitle: { fontSize: 18, margin: '20 0 10 0', color: '#1e40af', fontWeight: 'bold' },
  monthHeader: { backgroundColor: '#3b82f6', color: 'white', padding: 12, borderRadius: 8, marginBottom: 15 },
  monthTitle: { fontSize: 20, fontWeight: 'bold' },
  monthSummary: { fontSize: 14, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  table: { marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 8, fontWeight: 'bold', borderRadius: 6 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottom: '1px solid #e5e7eb' },
  colGuest: { width: '25%' },
  colDates: { width: '25%' },
  colNights: { width: '10%', textAlign: 'center' },
  colChannel: { width: '12%', textAlign: 'center' },
  colProfit: { width: '15%', textAlign: 'right' },
  colMargin: { width: '13%', textAlign: 'right' },
  profitPositive: { color: '#16a34a', fontWeight: 'bold' },
  profitNegative: { color: '#ef4444', fontWeight: 'bold' },
  footer: { marginTop: 30, textAlign: 'center', color: '#6b7280', fontSize: 10 },
});

interface AllStaysPDFProps {
  staysByMonth: Record<string, any[]>;
  monthlySummaries: any[];
}

const AllStaysPDF = ({ staysByMonth, monthlySummaries }: AllStaysPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Reporte Completo de Estancias Airbnb</Text>
      <Text style={{ textAlign: 'center', marginBottom: 30, color: '#6b7280' }}>
        Generado el {format(new Date(), "dd 'de' MMMM yyyy", { locale: es })}
      </Text>

      {Object.keys(staysByMonth).sort((a, b) => b.localeCompare(a)).map((monthKey) => {
        const stays = staysByMonth[monthKey];
        const [year, month] = monthKey.split('-');
        const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const monthName = format(monthDate, 'MMMM yyyy', { locale: es }).replace(/^\w/, c => c.toUpperCase());

        const summary = monthlySummaries.find(s => 
          s.year === parseInt(year) && s.month === parseInt(month)
        );

        const totalProfit = stays.reduce((sum, s) => sum + s.profit, 0);
        const totalNights = stays.reduce((sum, s) => sum + s.nights, 0);

        return (
          <View key={monthKey}>
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle}>{monthName}</Text>
              <View style={styles.monthSummary}>
                <Text>{stays.length} estancias • {totalNights} noches</Text>
                <Text style={{ fontWeight: 'bold' }}>
                  Ganancia: ${totalProfit.toLocaleString()} 
                  {summary && ` • Margen: ${summary.profitMargin.toFixed(1)}%`}
                </Text>
              </View>
            </View>

            {/* Tabla de estancias del mes */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.colGuest}>Huésped</Text>
                <Text style={styles.colDates}>Fechas</Text>
                <Text style={styles.colNights}>Noches</Text>
                <Text style={styles.colChannel}>Canal</Text>
                <Text style={styles.colProfit}>Ganancia</Text>
                <Text style={styles.colMargin}>Margen</Text>
              </View>

              {stays.map((stay) => (
                <View key={stay._id} style={styles.tableRow}>
                  <Text style={styles.colGuest}>{stay.guestName}</Text>
                  <Text style={styles.colDates}>
                    {format(new Date(stay.startDate), 'dd')} → {format(new Date(stay.endDate), 'dd MMM', { locale: es })}
                  </Text>
                  <Text style={styles.colNights}>{stay.nights}</Text>
                  <Text style={styles.colChannel}>{stay.channel}</Text>
                  <Text style={{ ...styles.colProfit, ...(stay.profit >= 0 ? styles.profitPositive : styles.profitNegative) }}>
                    ${stay.profit.toLocaleString()}
                  </Text>
                  <Text style={styles.colMargin}>{stay.profitMargin.toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}

      <Text style={styles.footer}>
        Total estancias: {Object.values(staysByMonth).flat().length} • 
        Reporte generado con ❤️ por tu app Airbnb Manager
      </Text>
    </Page>
  </Document>
);

export default function ExportAllToPDF({ staysByMonth, monthlySummaries }: AllStaysPDFProps) {
  const generatePDF = async () => {
    const doc = <AllStaysPDF staysByMonth={staysByMonth} monthlySummaries={monthlySummaries} />;
    const asPdf = pdf();
    asPdf.updateContainer(doc);
    const blob = await asPdf.toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_Completos_Estancias_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    link.click();
  };

  return (
    <Button onClick={generatePDF} size="lg">
      <Download className="w-5 h-5 mr-2" />
      Exportar Todo a PDF
    </Button>
  );
}