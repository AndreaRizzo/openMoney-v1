import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { Button, Checkbox, Text, TextInput } from "react-native-paper";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { useDashboardTheme } from "@/ui/dashboard/theme";
import { OnboardingStackParamList } from "@/onboarding/OnboardingNavigator";
import { useOnboardingDraft, defaultCategories } from "@/onboarding/state/OnboardingContext";
import { useTranslation } from "react-i18next";

export default function OnboardingCategories(): JSX.Element {
  const { tokens } = useDashboardTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<OnboardingStackParamList, "OnboardingCategories">>();
  const { draft, toggleCategory, addCustomCategory } = useOnboardingDraft();
  const { t } = useTranslation();
  const [newCategory, setNewCategory] = useState("");

  const selectedCategories = useMemo(() => new Set(draft.categories), [draft.categories]);
  const customCategories = useMemo(() => draft.customCategories, [draft.customCategories]);
  const canContinue = selectedCategories.size >= 1;

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }
    navigation.navigate("OnboardingIncomeRecurring");
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      return;
    }
    addCustomCategory(newCategory);
    setNewCategory("");
  };

  const renderCheckbox = (category: string) => (
    <Checkbox.Item
      key={category}
      label={category}
      status={selectedCategories.has(category) ? "checked" : "unchecked"}
      color={tokens.colors.accent}
      onPress={() => toggleCategory(category)}
      uncheckedColor={tokens.colors.text}
      labelStyle={{ color: tokens.colors.text }}
      style={styles.checkboxItem}
      position="leading"
    />
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: tokens.colors.text }]}>
          {t("onboarding.categories.title")}
        </Text>
        <Text style={[styles.subtitle, { color: tokens.colors.muted }]}>
          {t("onboarding.categories.subtitle")}
        </Text>
        <View style={[styles.card, { backgroundColor: tokens.colors.surface }]}>
          <Text style={[styles.sectionLabel, { color: tokens.colors.text }]}>
            {t("onboarding.categories.defaultTitle")}
          </Text>
          {defaultCategories.map((category) => renderCheckbox(category))}
        </View>

        {customCategories.length > 0 && (
          <View style={[styles.card, { backgroundColor: tokens.colors.surface }]}>
            <Text style={[styles.sectionLabel, { color: tokens.colors.text }]}>
              {t("onboarding.categories.addedTitle")}
            </Text>
            {customCategories.map((category) => renderCheckbox(category))}
          </View>
        )}

        <View style={[styles.card, { backgroundColor: tokens.colors.surface }]}>
          <Text style={[styles.sectionLabel, { color: tokens.colors.text }]}>
            {t("onboarding.categories.addLabel")}
          </Text>
          <TextInput
            label={t("onboarding.categories.categoryNameLabel")}
            value={newCategory}
            mode="flat"
            onChangeText={setNewCategory}
            style={styles.input}
            textColor={tokens.colors.text}
          />
          <Button
            mode="outlined"
            textColor={tokens.colors.accent}
            onPress={handleAddCategory}
            disabled={!newCategory.trim()}
            style={styles.addButton}
          >
            {t("onboarding.categories.addButton")}
          </Button>
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
    marginBottom: 12,
  },
  checkboxItem: {
    paddingVertical: 0,
  },
  input: {
    backgroundColor: "transparent",
    marginBottom: 12,
  },
  addButton: {
    borderRadius: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
