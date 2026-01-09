import React from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";

type Props = {
  status: "loading" | "error";
  error?: string | null;
  onRetry?: () => void;
};

export default function AppBootScreen({ status, error, onRetry }: Props): JSX.Element {
  const isError = status === "error";
  return (
    <View style={styles.container}>
      {!isError && <ActivityIndicator size="large" />}
      <Text variant="titleMedium">{isError ? "Errore di avvio" : "Avvio in corso..."}</Text>
      {isError && <Text style={styles.body}>{error ?? "Errore durante l'avvio."}</Text>}
      {isError && onRetry && (
        <Button mode="contained" onPress={onRetry}>
          Riprova
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  body: {
    textAlign: "center",
  },
});
