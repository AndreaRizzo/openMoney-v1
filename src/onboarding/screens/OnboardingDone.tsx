import React, { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useDashboardTheme } from "@/ui/dashboard/theme";
import { setOnboardingCompleted } from "@/onboarding/onboardingStorage";
import { useOnboardingDraft } from "@/onboarding/state/OnboardingContext";
import { seedOnboardingData } from "@/onboarding/onboardingSeed";
import { useTranslation } from "react-i18next";

type Props = {
  onComplete: () => void;
  shouldSeedOnComplete: boolean;
};

export default function OnboardingDone({ onComplete, shouldSeedOnComplete }: Props): JSX.Element {
  const { tokens } = useDashboardTheme();
  const { draft, resetDraft } = useOnboardingDraft();
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation();

  const handleFinish = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      if (shouldSeedOnComplete) {
        await seedOnboardingData(draft);
        await setOnboardingCompleted(true);
      }
      resetDraft();
      onComplete();
    } catch (error) {
    Alert.alert(t("errors.genericTitle"), (error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.bg }]}>
      <View style={[styles.card, { backgroundColor: tokens.colors.surface }]}>
        <Text style={[styles.title, { color: tokens.colors.text }]}>{t("onboarding.done.title")}</Text>
        <Text style={[styles.subtitle, { color: tokens.colors.muted }]}>
          {t("onboarding.done.subtitle")}
        </Text>
        <Button
          mode="contained"
          buttonColor={tokens.colors.accent}
          onPress={handleFinish}
          style={styles.button}
          loading={busy}
          disabled={busy}
        >
          {t("onboarding.done.button")}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    gap: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  button: {
    marginTop: 8,
    width: "100%",
  },
});
