// src/hooks/useAds.ts
import { AdMob, BannerAdOptions, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import { useEffect, useState } from 'react';

const BANNER_AD_UNIT_ID = {
  ios: 'ca-app-pub-3940256099942544/2934735716',
  android: 'ca-app-pub-3940256099942544/6300978111',
};

const INTERSTITIAL_AD_UNIT_ID = {
  ios: 'ca-app-pub-3940256099942544/4411468910',
  android: 'ca-app-pub-3940256099942544/1033173712',
};

const REWARDED_AD_UNIT_ID = {
  ios: 'ca-app-pub-3940256099942544/1712485313',
  android: 'ca-app-pub-3940256099942544/5224354917',
};

export function useAds() {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const isNative = window.Capacitor?.isNative;
  const platform = (window.Capacitor?.getPlatform() as 'ios' | 'android') || 'ios';

  useEffect(() => {
    if (!isNative) return;
    (async () => {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: ['EMULATOR'],
        initializeForTesting: true,
      });
    })();
  }, [isNative]);

  /**
   * Show a banner ad.
   * @param position   where to place it
   * @param margin     bottom margin in pts to lift it above UI
   */
  const showBanner = async (
    position: BannerAdPosition = BannerAdPosition.BOTTOM_CENTER,
    margin: number = 0,
  ) => {
    if (!isNative) return;

    const options: BannerAdOptions = {
      adId: BANNER_AD_UNIT_ID[platform],
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position,
      margin,                   // ← now honors whatever you pass in
      isTesting: true,
    };

    try {
      await AdMob.showBanner(options);
      setIsAdLoaded(true);
    } catch (e) {
      console.error('Error showing banner ad:', e);
    }
  };
  const hideBanner = async () => {
    if (!isNative || !isAdLoaded) return;
    try {
      await AdMob.removeBanner();
      setIsAdLoaded(false);
    } catch (e) {
      console.error('Error hiding banner ad:', e);
    }
  };

  const showInterstitial = async () => {
    if (!isNative) return;
    try {
      await AdMob.prepareInterstitial({
        adId: INTERSTITIAL_AD_UNIT_ID[platform],
        isTesting: true,
      });
      await AdMob.showInterstitial();
    } catch (e) {
      console.error('Error showing interstitial ad:', e);
    }
  };

  const showRewardedAd = async () => {
    if (!isNative) return;
    try {
      await AdMob.prepareRewardVideoAd({
        adId: REWARDED_AD_UNIT_ID[platform],
        isTesting: true,
      });
      await AdMob.showRewardVideoAd();
    } catch (e) {
      console.error('Error showing rewarded ad:', e);
    }
  };

  const incrementViewCount = () => {
    setViewCount((c) => {
      const next = c + 1;
      if (next % 3 === 0) {
        showInterstitial();
      }
      return next;
    });
  };

  return {
    showBanner,
    hideBanner,
    showInterstitial,
    showRewardedAd,
    incrementViewCount,
    viewCount,
    isAdLoaded,
  };
}
