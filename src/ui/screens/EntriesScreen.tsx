import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, SegmentedButtons, Switch, Text, TextInput } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { listIncomeEntries, createIncomeEntry, updateIncomeEntry, deleteIncomeEntry } from "@/repositories/incomeEntriesRepo";
import { listExpenseEntries, createExpenseEntry, updateExpenseEntry, deleteExpenseEntry } from "@/repositories/expenseEntriesRepo";
import { listExpenseCategories } from "@/repositories/expenseCategoriesRepo";
import type { ExpenseCategory, ExpenseEntry, IncomeEntry, RecurrenceFrequency } from "@/repositories/types";
import { isIsoDate, todayIso } from "@/utils/dates";
import PremiumCard from "@/ui/dashboard/components/PremiumCard";
import SectionHeader from "@/ui/dashboard/components/SectionHeader";
import PressScale from "@/ui/dashboard/components/PressScale";
import Chip from "@/ui/dashboard/components/Chip";
import { formatEUR, formatShortDate } from "@/ui/dashboard/formatters";
import { useDashboardTheme } from "@/ui/dashboard/theme";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

type EntryType = "income" | "expense";
type FormMode = "create" | "edit";

type EntriesRouteParams = {
  entryType?: EntryType;
  formMode?: FormMode;
  entryId?: number;
};

type FormState = {
  id: number | null;
  name: string;
  amount: string;
  startDate: string;
  categoryId: string;
  active: boolean;
  recurring: boolean;
  frequency: RecurrenceFrequency;
  interval: string;
};

const emptyForm: FormState = {
  id: null,
  name: "",
  amount: "",
  startDate: todayIso(),
  categoryId: "",
  active: true,
  recurring: false,
  frequency: "MONTHLY",
  interval: "1",
};

export default function EntriesScreen(): JSX.Element {
  const { tokens } = useDashboardTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const scrollRef = useRef<ScrollView | null>(null);
  const routeParams = (route.params ?? {}) as EntriesRouteParams;
  const [entryType, setEntryType] = useState<EntryType>(routeParams.entryType ?? "income");
  const [formMode, setFormMode] = useState<FormMode>(routeParams.formMode ?? "create");
  const [editingId, setEditingId] = useState<number | null>(
    routeParams.formMode === "edit" ? routeParams.entryId ?? null : null
  );
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewEntry, setShowNewEntry] = useState(routeParams.formMode === "edit");

  const load = useCallback(async () => {
    const [income, expense, cats] = await Promise.all([
      listIncomeEntries(),
      listExpenseEntries(),
      listExpenseCategories(),
    ]);
    setIncomeEntries(income);
    setExpenseEntries(expense);
    setCategories(cats);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    if (routeParams.entryType) {
      setEntryType(routeParams.entryType);
    }
  }, [routeParams.entryType]);

  useEffect(() => {
    const nextFormMode = routeParams.formMode;
    if (nextFormMode === "edit" && typeof routeParams.entryId === "number") {
      const targetType = routeParams.entryType ?? entryType;
      const entriesList = targetType === "income" ? incomeEntries : expenseEntries;
      const found = entriesList.find((entry) => entry.id === routeParams.entryId);
      if (found) {
        applyEntryToForm(found, targetType);
        setShowNewEntry(true);
      }
      return;
    }
    if (nextFormMode === "create") {
      setFormMode("create");
      setEditingId(null);
      setForm(emptyForm);
      setShowNewEntry(true);
    }
  }, [routeParams.formMode, routeParams.entryId, routeParams.entryType, incomeEntries, expenseEntries]);

  const applyEntryToForm = (entry: IncomeEntry | ExpenseEntry, entryMode: EntryType) => {
    setEntryType(entryMode);
    setForm({
      id: entry.id,
      name: entry.name,
      amount: String(entry.amount),
      startDate: entry.start_date,
      categoryId: "expense_category_id" in entry ? String(entry.expense_category_id) : "",
      active: entry.active === 1,
      recurring: entry.recurrence_frequency !== null && entry.one_shot === 0,
      frequency: entry.recurrence_frequency ?? "MONTHLY",
      interval: entry.recurrence_interval?.toString() ?? "1",
    });
    setFormMode("edit");
    setEditingId(entry.id);
  };

  const resetToCreateMode = () => {
    setForm(emptyForm);
    setFormMode("create");
    setEditingId(null);
    navigation.setParams({ formMode: "create", entryId: undefined, entryType });
  };

  const toggleNewEntryVisibility = () => {
    setShowNewEntry((prev) => {
      const next = !prev;
      if (next) {
        resetToCreateMode();
      }
      return next;
    });
  };

  const saveEntry = async () => {
    setError(null);
    if (!form.name.trim()) {
      setError(t("entries.validation.nameRequired"));
      return;
    }
    if (!isIsoDate(form.startDate)) {
      setError(t("entries.validation.invalidDate"));
      return;
    }
    const amount = Number(form.amount);
    if (!Number.isFinite(amount)) {
      setError(t("entries.validation.amountInvalid"));
      return;
    }
    const recurring = form.recurring;
    const frequency = recurring ? form.frequency : null;
    const interval = recurring ? Number(form.interval) || 1 : null;
    const oneShot = recurring ? 0 : 1;
    const active = form.active ? 1 : 0;

    if (formMode === "create" && form.id) {
      setError(t("entries.validation.removeIdBeforeCreate"));
      return;
    }
    if (formMode === "edit" && !form.id) {
      setError(t("entries.validation.noEntryForEdit"));
      return;
    }

    if (entryType === "income") {
      const payload: Omit<IncomeEntry, "id"> = {
        name: form.name.trim(),
        amount,
        start_date: form.startDate,
        recurrence_frequency: frequency,
        recurrence_interval: interval,
        one_shot: oneShot,
        note: null,
        active,
        wallet_id: null,
      };
      if (formMode === "edit") {
        await updateIncomeEntry(form.id!, payload);
      } else {
        await createIncomeEntry(payload);
      }
    } else {
      const categoryId = Number(form.categoryId);
      if (!Number.isFinite(categoryId)) {
        setError(t("entries.validation.categoryRequired"));
        return;
      }
      const payload: Omit<ExpenseEntry, "id"> = {
        name: form.name.trim(),
        amount,
        start_date: form.startDate,
        recurrence_frequency: frequency,
        recurrence_interval: interval,
        one_shot: oneShot,
        note: null,
        active,
        wallet_id: null,
        expense_category_id: categoryId,
      };
      if (formMode === "edit") {
        await updateExpenseEntry(form.id!, payload);
      } else {
        await createExpenseEntry(payload);
      }
    }

    resetToCreateMode();
    setShowNewEntry(true);
    await load();
  };

  const removeEntry = async () => {
    if (formMode !== "edit" || !form.id) return;
    if (entryType === "income") {
      await deleteIncomeEntry(form.id);
    } else {
      await deleteExpenseEntry(form.id);
    }
    resetToCreateMode();
    setShowNewEntry(true);
    await load();
  };

  const entries = entryType === "income" ? incomeEntries : expenseEntries;

  const activeCategories = useMemo(() => categories.filter((cat) => cat.active === 1), [categories]);
  const categoryById = useMemo(() => {
    const map = new Map<number, ExpenseCategory>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  const toIsoDate = (value: Date): string => {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const datePickerValue = form.startDate && isIsoDate(form.startDate) ? new Date(form.startDate) : new Date();

  const toAnnualAmount = (entry: IncomeEntry | ExpenseEntry): number | null => {
    if (entry.one_shot === 1 || !entry.recurrence_frequency) return null;
    const interval = entry.recurrence_interval && entry.recurrence_interval > 0 ? entry.recurrence_interval : 1;
    const periods =
      entry.recurrence_frequency === "WEEKLY"
        ? 52 / interval
        : entry.recurrence_frequency === "MONTHLY"
          ? 12 / interval
          : 1 / interval;
    return entry.amount * periods;
  };

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      if (a.start_date < b.start_date) return -1;
      if (a.start_date > b.start_date) return 1;
      return 0;
    });
  }, [entries]);

  return (
    <View style={[styles.screen, { backgroundColor: tokens.colors.bg }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.container,
          { gap: tokens.spacing.md, paddingBottom: 160 + insets.bottom, paddingTop: headerHeight + 12 },
        ]}
        alwaysBounceVertical
        bounces
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tokens.colors.accent} />}
      >
        <PremiumCard>
          <SegmentedButtons
            value={entryType}
            onValueChange={(value) => setEntryType(value as EntryType)}
            buttons={[
              { value: "income", label: t("entries.list.tabIncome") },
              { value: "expense", label: t("entries.list.tabExpense") },
            ]}
            style={{ backgroundColor: tokens.colors.surface2 }}
          />
          <View style={styles.actionsRow}>
              <Button
                mode="contained"
                buttonColor={tokens.colors.accent}
                contentStyle={styles.fullWidthButtonContent}
                style={styles.fullWidthButton}
                onPress={toggleNewEntryVisibility}
              >
                {t("entries.actions.toggleForm")}
              </Button>
            </View>
          {showNewEntry && (
            <>
              <View style={styles.formSpacing}>
                <View style={styles.form}>
                <TextInput
                  label={t("entries.form.name")}
                  value={form.name}
                  mode="outlined"
                  outlineColor={tokens.colors.border}
                  activeOutlineColor={tokens.colors.accent}
                  textColor={tokens.colors.text}
                  style={{ backgroundColor: tokens.colors.surface2 }}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
                />
                <TextInput
                  label={t("entries.form.amount")}
                  keyboardType="decimal-pad"
                  value={form.amount}
                  mode="outlined"
                  outlineColor={tokens.colors.border}
                  activeOutlineColor={tokens.colors.accent}
                  textColor={tokens.colors.text}
                  style={{ backgroundColor: tokens.colors.surface2 }}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, amount: text }))}
                />
                <TextInput
                  label={t("entries.form.date")}
                  value={form.startDate}
                  editable={false}
                  mode="outlined"
                  outlineColor={tokens.colors.border}
                  activeOutlineColor={tokens.colors.accent}
                  textColor={tokens.colors.text}
                  style={{ backgroundColor: tokens.colors.surface2 }}
                  onPressIn={() => setShowDatePicker(true)}
                />
                {showDatePicker && (
                  <DateTimePicker
                    value={datePickerValue}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(_, selected) => {
                      if (selected) {
                        setForm((prev) => ({ ...prev, startDate: toIsoDate(selected) }));
                      }
                      setShowDatePicker(false);
                    }}
                  />
                )}
                {entryType === "expense" && (
                  <PremiumCard style={{ backgroundColor: tokens.colors.surface2 }}>
                    <SectionHeader title={t("entries.form.categoryTitle")} />
                    <View style={styles.list}>
                      {activeCategories.length === 0 && (
                        <Text style={{ color: tokens.colors.muted }}>
                          {t("entries.empty.noCategoriesActive")}
                        </Text>
                      )}
                      {activeCategories.map((cat) => (
                        <Button
                          key={cat.id}
                          mode={form.categoryId === String(cat.id) ? "contained" : "outlined"}
                          buttonColor={form.categoryId === String(cat.id) ? cat.color : undefined}
                          textColor={form.categoryId === String(cat.id) ? tokens.colors.text : tokens.colors.muted}
                          onPress={() => setForm((prev) => ({ ...prev, categoryId: String(cat.id) }))}
                          style={
                            form.categoryId !== String(cat.id)
                              ? { borderColor: cat.color }
                              : undefined
                          }
                        >
                          {cat.name}
                        </Button>
                      ))}
                    </View>
                  </PremiumCard>
                )}
                <View style={styles.row}>
                  <Switch
                    value={form.recurring}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, recurring: value }))}
                  />
                  <Text style={{ color: tokens.colors.text }}>{t("entries.form.recurringLabel")}</Text>
                </View>
                {form.recurring && (
                  <>
                    <SegmentedButtons
                      value={form.frequency}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, frequency: value as RecurrenceFrequency }))}
                      buttons={[
                        { value: "WEEKLY", label: t("entries.form.frequency.weekly") },
                        { value: "MONTHLY", label: t("entries.form.frequency.monthly") },
                        { value: "YEARLY", label: t("entries.form.frequency.yearly") },
                      ]}
                      style={{ backgroundColor: tokens.colors.surface2 }}
                    />
                    <TextInput
                      label={t("entries.form.intervalLabel")}
                      keyboardType="numeric"
                      value={form.interval}
                      mode="outlined"
                      outlineColor={tokens.colors.border}
                      activeOutlineColor={tokens.colors.accent}
                      textColor={tokens.colors.text}
                      style={{ backgroundColor: tokens.colors.surface2 }}
                      onChangeText={(text) => setForm((prev) => ({ ...prev, interval: text }))}
                    />
                  </>
                )}
                {error && <Text style={{ color: tokens.colors.red }}>{error}</Text>}
              </View>
            </View>
              <View style={styles.actionsRow}>
                <Button mode="contained" buttonColor={tokens.colors.accent} onPress={saveEntry}>
                  {t("common.save")}
                </Button>
                <Button mode="outlined" textColor={tokens.colors.text} onPress={() => setForm(emptyForm)}>
                  {t("common.reset")}
                </Button>
                {form.id && (
                  <Button mode="outlined" textColor={tokens.colors.red} onPress={removeEntry}>
                    {t("common.delete")}
                  </Button>
                )}
              </View>
            </>
          )}
        </PremiumCard>

        <PremiumCard>
          <SectionHeader title={t("entries.list.sectionTitle")} />
          {entries.length === 0 ? (
            <Text style={{ color: tokens.colors.muted }}>{t("entries.empty.noEntries")}</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.table}>
              <View>
                <View style={styles.headerRow}>
                  <Text style={[styles.headerCell, { color: tokens.colors.muted }, styles.cellDate]} numberOfLines={1}>
                    {t("entries.list.table.date")}
                  </Text>
                  <Text style={[styles.headerCell, { color: tokens.colors.muted }, styles.cellDesc]} numberOfLines={1}>
                    {t("entries.list.table.name")}
                  </Text>
                  <Text style={[styles.headerCell, { color: tokens.colors.muted }, styles.cellAmount]} numberOfLines={1}>
                    {t("entries.list.table.amount")}
                  </Text>
                  <Text style={[styles.headerCell, { color: tokens.colors.muted }, styles.cellAnnual]} numberOfLines={1}>
                    {t("entries.list.table.annual")}
                  </Text>
                  <Text style={[styles.headerCell, { color: tokens.colors.muted }, styles.cellCategory]} numberOfLines={1}>
                    {t("entries.list.table.category")}
                  </Text>
                  <Text style={[styles.headerCell, { color: tokens.colors.muted }, styles.cellAction]} numberOfLines={1}>
                    {t("entries.list.table.action")}
                  </Text>
                </View>
                {sortedEntries.map((entry, index) => {
                  const annualAmount = toAnnualAmount(entry);
                  const category =
                    "expense_category_id" in entry
                      ? categoryById.get(entry.expense_category_id)
                      : null;
                  return (
                      <React.Fragment key={`${entryType}-${entry.id}`}>
                      <View style={styles.row}>
                        <Text style={[styles.cell, { color: tokens.colors.text }, styles.cellDate]}>
                          {formatShortDate(entry.start_date)}
                        </Text>
                        <Text style={[styles.cell, { color: tokens.colors.text }, styles.cellDesc]} numberOfLines={1}>
                          {entry.name}
                        </Text>
                        <Text style={[styles.cell, { color: tokens.colors.text }, styles.cellAmount]}>
                          {formatEUR(entry.amount)}
                        </Text>
                        <Text style={[styles.cell, { color: tokens.colors.muted }, styles.cellAnnual]}>
                          {annualAmount === null ? "—" : formatEUR(annualAmount)}
                        </Text>
                        <View style={[styles.cell, styles.cellCategory]}>
                          {"expense_category_id" in entry ? (
                            <Chip label={category?.name ?? t("entries.list.categoryFallback")} color={category?.color} />
                          ) : (
                            <Chip label={t("entries.list.incomeLabel")} tone="green" />
                          )}
                        </View>
                        <View style={[styles.cell, styles.cellAction]}>
                        <PressScale
                          onPress={() => {
                            navigation.setParams({
                              formMode: "edit",
                              entryId: entry.id,
                              entryType,
                            });
                            setShowNewEntry(true);
                            scrollRef.current?.scrollTo({ y: 0, animated: true });
                          }}
                            style={[
                              styles.actionButton,
                              { borderColor: tokens.colors.accent, backgroundColor: `${tokens.colors.accent}14` },
                            ]}
                          >
                            <Text style={[styles.actionText, { color: tokens.colors.accent }]}>{t("common.edit")}</Text>
                          </PressScale>
                        </View>
                      </View>
                      {index < entries.length - 1 ? (
                        <View style={[styles.separator, { backgroundColor: tokens.colors.border }]} />
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </PremiumCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  formSpacing: {
    marginTop: 16,
  },
  form: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    flexWrap: "wrap",
  },
  addButton: {
    borderRadius: 12,
    minWidth: 44,
  },
  addButtonContent: {
    height: 44,
    width: 44,
    paddingHorizontal: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonLabel: {
    marginVertical: 0,
  },
  fullWidthButton: {
    flex: 1,
  },
  fullWidthButtonContent: {
    height: 44,
  },
  list: {
    gap: 8,
  },
  table: {
    gap: 12,
    paddingBottom: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
    flexWrap: "nowrap",
    width: 760,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    flexWrap: "nowrap",
    width: 760,
  },
  cell: {
    fontSize: 12,
    minWidth: 0,
  },
  cellDate: {
    width: 80,
    flexShrink: 0,
    marginRight: 6,
  },
  cellDesc: {
    width: 180,
    flexShrink: 1,
    marginRight: 6,
  },
  cellCategory: {
    width: 140,
    flexShrink: 0,
    marginRight: 6,
  },
  cellAmount: {
    width: 110,
    flexShrink: 0,
    marginRight: 6,
  },
  cellAnnual: {
    width: 140,
    flexShrink: 0,
  },
  cellAction: {
    width: 90,
    flexShrink: 0,
    marginLeft: 6,
  },
  separator: {
    height: 1,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  actionText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
