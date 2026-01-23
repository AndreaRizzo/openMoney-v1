import * as LocalAuthentication from "expo-local-authentication";

let authenticateCallCount = 0;

export type BiometryHardwareInfo = {
  hasHardware: boolean;
  hasEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
};

export async function getBiometryHardwareInfo(): Promise<BiometryHardwareInfo> {
  try {
    console.log("[FaceID] hasHardwareAsync -> start");
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    console.log(`[FaceID] hasHardwareAsync -> ${hasHardware}`);
    console.log("[FaceID] isEnrolledAsync -> start");
    const hasEnrolled = await LocalAuthentication.isEnrolledAsync();
    console.log(`[FaceID] isEnrolledAsync -> ${hasEnrolled}`);
    console.log("[FaceID] supportedAuthenticationTypesAsync -> start");
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    console.log(`[FaceID] supportedAuthenticationTypesAsync -> ${supportedTypes.join(",")}`);
    return {
      hasHardware,
      hasEnrolled,
      supportedTypes,
    };
  } catch (error) {
    console.log("[FaceID] Hardware check error", error);
    return {
      hasHardware: false,
      hasEnrolled: false,
      supportedTypes: [],
    };
  }
}

export async function isBiometryAvailable(): Promise<boolean> {
  try {
    const info = await getBiometryHardwareInfo();
    return info.hasHardware && info.hasEnrolled;
  } catch {
    return false;
  }
}

export async function authenticateForUnlock(): Promise<{ success: boolean; error?: string }> {
  authenticateCallCount += 1;
  const callId = authenticateCallCount;
  console.log(`[FaceID] authenticateAsync call #${callId} -> start`);
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Sblocca Balance",
      cancelLabel: "Annulla",
      disableDeviceFallback: true,
      fallbackLabel: "",
    });
    console.log(
      `[FaceID] authenticateAsync call #${callId} -> success:${result.success} error:${result.errorCode}`
    );
    if (result.success) {
      return { success: true };
    }
    return { success: false, error: result.errorCode ?? "authentication_failed" };
  } catch (error) {
    console.log(`[FaceID] authenticateAsync call #${callId} -> exception`, error);
    return { success: false, error: (error as Error).message ?? "authentication_error" };
  }
}
