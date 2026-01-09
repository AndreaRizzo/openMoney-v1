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
            <Text style={[styles.headerCell, { color: tokens.colors.muted }, styles.cellDate]}>Data</Text>
            <Text style={[styles.headerCell, { color: tokens.colors.muted }, styles.cellType]}>Tipo</Text>
            <Text style={[styles.headerCell, { color: tokens.colors.muted }, styles.cellCategory]}>Categoria</Text>
            <Text style={[styles.headerCell, { color: tokens.colors.muted }, styles.cellDesc]}>Descrizione</Text>
            <Text style={[styles.headerCell, { color: tokens.colors.muted }, styles.cellAmount]}>Importo</Text>
          </View>
          {rows.map((item, index) => {
            const amountColor = item.type === "income" ? tokens.colors.green : tokens.colors.red;
            return (
              <React.Fragment key={item.id}>
                <PressScale onPress={() => onPressRow?.(item)} style={styles.row}>
                  <Text style={[styles.cell, { color: tokens.colors.text }, styles.cellDate]}>{formatShortDate(item.date)}</Text>
                  <View style={[styles.cell, styles.cellType]}>
                    <Chip label={item.type === "income" ? "Entrata" : "Uscita"} tone={item.type === "income" ? "green" : "red"} />
                    {item.recurring ? <Chip label="Ric." tone="blue" /> : null}
                  </View>
                  <Text style={[styles.cell, { color: tokens.colors.text }, styles.cellCategory]} numberOfLines={1}>
                    {item.category}
                  </Text>
                  <Text style={[styles.cell, { color: tokens.colors.text }, styles.cellDesc]} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <Text style={[styles.cell, styles.cellAmount, { color: amountColor }]}>
                    {formatEUR(item.amount)}
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
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  cell: {
    fontSize: 12,
  },
  cellDate: {
    width: 62,
  },
  cellType: {
    width: 120,
    flexDirection: "row",
    gap: 6,
  },
  cellCategory: {
    flex: 1,
    marginRight: 6,
  },
  cellDesc: {
    flex: 1,
    marginRight: 6,
  },
  cellAmount: {
    width: 88,
    textAlign: "right",
    fontWeight: "600",
  },
  separator: {
    height: 1,
  },
  empty: {},
});
