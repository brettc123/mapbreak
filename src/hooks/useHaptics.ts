import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function useHaptics() {
  const isNative = window.Capacitor?.isNative;

  const lightImpact = async () => {
    if (!isNative) return;
    await Haptics.impact({ style: ImpactStyle.Light });
  };

  const mediumImpact = async () => {
    if (!isNative) return;
    await Haptics.impact({ style: ImpactStyle.Medium });
  };

  const heavyImpact = async () => {
    if (!isNative) return;
    await Haptics.impact({ style: ImpactStyle.Heavy });
  };

  const selectionImpact = async () => {
    if (!isNative) return;
    await Haptics.selectionStart();
  };

  const notificationImpact = async () => {
    if (!isNative) return;
    await Haptics.notification();
  };

  return {
    lightImpact,
    mediumImpact,
    heavyImpact,
    selectionImpact,
    notificationImpact,
  };
}