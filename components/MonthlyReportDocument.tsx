// components/MonthlyReportDocument.tsx
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff' },
  title: { fontSize: 32, textAlign: 'center', marginBottom: 10, color: '#1e40af', fontWeight: 'bold' },
  subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 30, color: '#4b5563' },
  bigProfit: { fontSize: 48, textAlign: 'center', color: '#16a34a', fontWeight: 'bold', marginBottom: 10 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginBottom: 30 },
  card: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12, width: '48%' },
  cardTitle: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  cardValue: { fontSize: 28, fontWeight: 'bold' },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e40af', margin: '30 0 15 0' },
  image: { width: '100%', marginBottom: 30 },
  footer: { marginTop: 40, textAlign: 'center', color: '#9ca3af', fontSize: 10 },
});

export default function MonthlyReportDocument({ report, year, month, chart1, chart2 }: any) {
  const monthName = format(new Date(year, month - 1), 'MMMM yyyy', { locale: es }).replace(/^\w/, c => c.toUpperCase());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Reporte Mensual Airbnb</Text>
        <Text style={styles.subtitle}>{monthName}</Text>
        <Text style={styles.bigProfit}>${report.profit.toLocaleString()}</Text>

        {/* 4 tarjetas */}
        <View style={styles.cards}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ingresos Netos</Text>
            <Text style={{ ...styles.cardValue, color: '#2563eb' }}>${report.totalRevenue.toLocaleString()}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gastos Totales</Text>
            <Text style={{ ...styles.cardValue, color: '#dc2626' }}>${report.totalCosts.toLocaleString()}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Promedio por Noche</Text>
            <Text style={{ ...styles.cardValue, color: '#7c3aed' }}>
              ${(report.profit / report.totalNights || 0).toFixed(0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ocupación</Text>
            <Text style={{ ...styles.cardValue, color: '#9333ea' }}>{report.occupancyRate.toFixed(1)}%</Text>
          </View>
        </View>

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
}