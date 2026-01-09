import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import PremiumCard from "@/ui/dashboard/components/PremiumCard";
import SectionHeader from "@/ui/dashboard/components/SectionHeader";
import Chip from "@/ui/dashboard/components/Chip";
import PressScale from "@/ui/dashboard/components/PressScale";
import { useDashboardTheme } from "@/ui/dashboard/theme";
import { formatEUR, formatShortDate } from "@/ui/dashboard/formatters";
import type { RecurrenceRow } from "@/ui/dashboard/types";

type Props = {
  rows: RecurrenceRow[];
  onPressRow?: (row: RecurrenceRow) => void;
};

export default function RecurrencesTableCard({ rows, onPressRow }: Props): JSX.Element {
  const { tokens } = useDashboardTheme();
  return (
    <PremiumCard>
      <SectionHeader title="Prossimi movimenti programmati" />
      {rows.length === 0 ? (
        <Text style={[styles.empty, { color: tokens.colors.muted }]}>Nessun movimento programmato.</Text>
      ) : (
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, { color: tokens.colors.muted }]}>Data</Text>
            <Text style={[styles.headerCell, { color: tokens.colors.muted }]}>Tipo</Text>
            <Text style={[styles.headerCell, { color: tokens.colors.muted }]}>Categoria</Text>
            <Text style={[styles.headerCell, { color: tokens.colors.muted }]}>Descrizione</Text>
            <Text style={[styles.headerCell, { color: tokens.colors.muted }]}>Importo</Text>
          </View>
          {rows.map((item, index) => {
            const amountColor = item.type === "income" ? tokens.colors.green : tokens.colors.red;
            return (
              <React.Fragment key={item.id}>
                <PressScale onPress={() => onPressRow?.(item)} style={styles.row}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.date, { color: tokens.colors.text }]}>{formatShortDate(item.date)}</Text>
                    <Text style={[styles.amount, { color: amountColor }]}>{formatEUR(item.amount)}</Text>
                  </View>
                  <View style={styles.rowChips}>
                    <Chip label={item.type === "income" ? "Entrata" : "Uscita"} tone={item.type === "income" ? "green" : "red"} />
                    {item.recurring ? <Chip label="Ric." tone="blue" /> : null}
                  </View>
                  <Text style={[styles.category, { color: tokens.colors.text }]} numberOfLines={1}>
                    {item.category}
                  </Text>
                  <Text style={[styles.description, { color: tokens.colors.muted }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                </PressScale>
                {index < rows.length - 1 ? (
                  <View style={[styles.separator, { backgroundColor: tokens.colors.border }]} />
                ) : null}
              </React.Fragment>
            );
          })}
        </View>
      )}
    </PremiumCard>
  );
}

const styles = StyleSheet.create({
  table: {
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    paddingBottom: 8,
    gap: 12,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "600",
  },
  row: {
    paddingVertical: 8,
    gap: 6,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowChips: {
    flexDirection: "row",
    gap: 8,
  },
  date: {
    fontSize: 12,
    fontWeight: "600",
  },
  amount: {
    fontSize: 13,
    fontWeight: "700",
  },
  category: {
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    fontSize: 12,
  },
  separator: {
    height: 1,
  },
  empty: {},
});
