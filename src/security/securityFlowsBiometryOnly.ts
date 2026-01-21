import { Alert } from "react-native";
import {
  authenticateForUnlock,
  isBiometryAvailable,
} from "@/security/securityBiometry";
import { setBiometryEnabled } from "@/security/securityStorage";

export async function handleBiometryToggle(nextValue: boolean, securityEnabled: boolean): Promise<boolean> {
  if (!securityEnabled) {
    await setBiometryEnabled(false);
    return false;
  }

  if (nextValue) {
    const available = await isBiometryAvailable();
    if (!available) {
      Alert.alert("Face ID non disponibile");
      await setBiometryEnabled(false);
      return false;
    }

    const { success, error } = await authenticateForUnlock();
    if (!success) {
      const title = "Impossibile attivare Face ID";
      const message =
        error === "lockout"
          ? "Troppi tentativi falliti, usa il codice per sbloccare e riprova più tardi."
          : "Face ID non è riuscito a verificarti. Verifica che il dispositivo sia pronto e riprova.";
      Alert.alert(title, message);
      await setBiometryEnabled(false);
      return false;
    }
  }

  await setBiometryEnabled(nextValue);
  return nextValue;
}
