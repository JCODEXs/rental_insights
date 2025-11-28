// components/StayPDF.tsx
'use client';

import { Document, Page, Text, View, StyleSheet, pdf, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Opcional: Fuente bonita (descarga Roboto o usa la default)
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, fontFamily: 'Helvetica' },
  title: { fontSize: 28, marginBottom: 20, textAlign: 'center', color: '#1e40af' },
  subtitle: { fontSize: 18, marginBottom: 15, color: '#1e40af', fontWeight: 'bold' },
  section: { marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  label: { color: '#6b7280' },
  value: { fontWeight: 'bold' },
  table: { marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #e5e7eb', paddingVertical: 6 },
  tableColName: { width: '50%' },
  tableColQty: { width: '15%', textAlign: 'center' },
  tableColPrice: { width: '20%', textAlign: 'right' },
  tableColTotal: { width: '15%', textAlign: 'right', fontWeight: 'bold' },
  total: { fontSize: 20, marginTop: 20, textAlign: 'right' },
  profitBox: { backgroundColor: '#dcfce7', padding: 20, borderRadius: 8, marginTop: 30, textAlign: 'center' },
  profitText: { fontSize: 32, fontWeight: 'bold', color: '#16a34a' },
});

interface StayPDFProps {
  stay: any;
}

const StayPDF = ({ stay }: StayPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Encabezado */}
      <Text style={styles.title}>Reporte de Estancia - Airbnb</Text>
      <Text style={{ textAlign: 'center', marginBottom: 30, color: '#6b7280' }}>
        Generado el {format(new Date(), "dd 'de' MMMM yyyy", { locale: es })}
      </Text>

      {/* Info principal */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Información General</Text>
        <View style={styles.row}><Text style={styles.label}>Huésped:</Text><Text style={styles.value}>{stay.guestName}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Fechas:</Text><Text style={styles.value}>
          {format(new Date(stay.startDate), "dd MMM", { locale: es })} → {format(new Date(stay.endDate), "dd MMM yyyy", { locale: es })}
        </Text></View>
        <View style={styles.row}><Text style={styles.label}>Noches / Huéspedes:</Text><Text style={styles.value}>{stay.nights} noches • {stay.guests} personas</Text></View>
        <View style={styles.row}><Text style={styles.label}>Canal:</Text><Text style={styles.value}>{stay.channel.toUpperCase()}</Text></View>
      </View>

      {/* Ingresos */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Ingresos</Text>
        <View style={styles.row}><Text style={styles.label}>Ingreso bruto:</Text><Text style={styles.value}>${stay.grossRevenue.toLocaleString()}</Text></View>
        {stay.platformFee > 0 && <View style={styles.row}><Text style={styles.label}>Comisión plataforma:</Text><Text style={styles.value}>-${stay.platformFee.toLocaleString()}</Text></View>}
        {stay.cleaningFeeCharged > 0 && <View style={styles.row}><Text style={styles.label}>Cargo limpieza huésped:</Text><Text style={styles.value}>+${stay.cleaningFeeCharged.toLocaleString()}</Text></View>}
        <View style={{ ...styles.row, marginTop: 10, paddingTop: 10, borderTop: '2px solid #1e40af' }}>
          <Text style={{ ...styles.label, fontSize: 16 }}>INGRESO NETO:</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e40af' }}>${stay.netRevenue.toLocaleString()}</Text>
        </View>
      </View>

      {/* Gastos */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Gastos Detallados</Text>
        <View style={styles.row}><Text style={styles.label}>Limpieza + lavandería:</Text><Text style={styles.value}>${stay.cleaningCost.toLocaleString()}</Text></View>

        {stay.consumables.length > 0 && (
          <>
            <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Consumibles:</Text>
            <View style={styles.table}>
              {stay.consumables.map((c: any, i: number) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.tableColName}>{c.name}</Text>
                  <Text style={styles.tableColQty}>×{c.qty}</Text>
                  <Text style={styles.tableColPrice}>${c.unitCost.toLocaleString()}</Text>
                  <Text style={styles.tableColTotal}>${c.total.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {stay.otherExpenses.length > 0 && (
          <>
            <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Otros gastos:</Text>
            {stay.otherExpenses.map((e: any, i: number) => (
              <View key={i} style={styles.row}>
                <Text style={styles.label}>{e.description}:</Text>
                <Text style={styles.value}>${e.amount.toLocaleString()}</Text>
              </View>
            ))}
          </>
        )}

        <View style={{ ...styles.row, marginTop: 15, paddingTop: 10, borderTop: '2px solid #ef4444' }}>
          <Text style={{ ...styles.label, fontSize: 16 }}>TOTAL GASTOS:</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ef4444' }}>${stay.totalCost.toLocaleString()}</Text>
        </View>
      </View>

      {/* RESULTADO FINAL */}
      <View style={styles.profitBox}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>GANANCIA NETA</Text>
        <Text style={styles.profitText}>${stay.profit.toLocaleString()}</Text>
        <Text style={{ fontSize: 24, marginTop: 10 }}>Margen: {stay.profitMargin.toFixed(1)}%</Text>
      </View>

      {stay.notes && (
        <View style={{ marginTop: 30 }}>
          <Text style={styles.subtitle}>Notas</Text>
          <Text>{stay.notes}</Text>
        </View>
      )}
    </Page>
  </Document>
);

export default function ExportPDFButton({ stay }: { stay: any }) {
  const generatePDF = async () => {
    const doc = <StayPDF stay={stay} />;
    const asPdf = pdf();
    asPdf.updateContainer(doc);
    const blob = await asPdf.toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Estancia_${stay.guestName.replace(/\s+/g, '_')}_${format(new Date(stay.startDate), 'yyyy-MM-dd')}.pdf`;
    link.click();
  };

  return (
    <Button onClick={generatePDF} size="lg">
      <Download className="w-5 h-5 mr-2" />
      Exportar PDF
    </Button>
  );
}