import { Platform } from "react-native";

const isIos = Platform.OS === "ios";

export function getBiometryName(): string {
  return isIos ? "Face ID" : "sblocco biometrico";
}

export function getBiometryToggleLabel(): string {
  return isIos ? "Usa Face ID" : "Usa sblocco biometrico";
}

export function getBiometryUnlockCtaLabel(): string {
  return isIos ? "Usa Face ID" : "Usa biometria";
}
