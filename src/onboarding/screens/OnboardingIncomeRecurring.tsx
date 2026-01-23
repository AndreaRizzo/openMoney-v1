import React, { useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { useDashboardTheme } from "@/ui/dashboard/theme";
import { OnboardingStackParamList } from "@/onboarding/OnboardingNavigator";
import { useOnboardingDraft } from "@/onboarding/state/OnboardingContext";
import { useTranslation } from "react-i18next";

export default function OnboardingIncomeRecurring(): JSX.Element {
  const { tokens } = useDashboardTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<OnboardingStackParamList, "OnboardingIncomeRecurring">>();
  const { draft, updateRecurringIncome } = useOnboardingDraft();
  const { t } = useTranslation();

  const liquidityWalletName = draft.liquidityWallet.name || "Conto principale";

  useEffect(() => {
    updateRecurringIncome({ walletName: liquidityWalletName });
  }, [liquidityWalletName, updateRecurringIncome]);

  const amountValue = draft.recurringIncome.amount;
  const numericAmount = Number(amountValue.replace(",", "."));
  const amountValid = amountValue.length > 0 && !Number.isNaN(numericAmount) && numericAmount > 0;
  const canContinue = amountValid && Boolean(liquidityWalletName.trim());

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }
    navigation.navigate("OnboardingExpensesQuickAdd");
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: tokens.colors.text }]}>{t("onboarding.recurrence.title")}</Text>
        <Text style={[styles.subtitle, { color: tokens.colors.muted }]}>
          {t("onboarding.recurrence.subtitle")}
        </Text>
        <View style={[styles.card, { backgroundColor: tokens.colors.surface }]}>
          <Text style={[styles.sectionLabel, { color: tokens.colors.text }]}>
            {t("onboarding.recurrence.destinationLabel")}
          </Text>
          <Text style={[styles.walletLabel, { color: tokens.colors.text }]}>{liquidityWalletName}</Text>
          <TextInput
            label={t("onboarding.recurrence.incomeNameLabel")}
            value={draft.recurringIncome.name}
            mode="flat"
            onChangeText={(text) => updateRecurringIncome({ name: text })}
            style={styles.input}
            textColor={tokens.colors.text}
          />
          <TextInput
            label={t("onboarding.recurrence.amountLabel")}
            value={draft.recurringIncome.amount}
            mode="flat"
            onChangeText={(text) => updateRecurringIncome({ amount: text })}
            keyboardType="numeric"
            style={styles.input}
            error={amountValue.length > 0 && !amountValid}
            textColor={tokens.colors.text}
          />
          {amountValue.length > 0 && !amountValid && (
            <Text style={[styles.errorText, { color: tokens.colors.error }]}>
              {t("onboarding.recurrence.amountError")}
            </Text>
          )}
          <TextInput
            label={t("onboarding.recurrence.nextDateLabel")}
            value={draft.recurringIncome.nextDate}
            mode="flat"
            onChangeText={(text) => updateRecurringIncome({ nextDate: text })}
            style={styles.input}
            textColor={tokens.colors.text}
          />
          <Text style={[styles.infoText, { color: tokens.colors.muted }]}>
            {t("onboarding.recurrence.frequencyInfo")}
          </Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          mode="contained"
          buttonColor={tokens.colors.accent}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          {t("common.continue")}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingBottom: 120,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  card: {
    borderRadius: 20,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  walletLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    backgroundColor: "transparent",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
