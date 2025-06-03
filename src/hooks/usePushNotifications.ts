import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSupabase } from './useSupabase';

export function usePushNotifications() {
  console.log('🚀 === PUSH NOTIFICATIONS HOOK LOADED - NEW VERSION ===');
  console.log('📅 Hook version timestamp:', new Date().toISOString());
  
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<PushNotificationSchema[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const { supabase, user } = useSupabase();
  const isNative = window.Capacitor?.isNative;
  
  // Use refs to prevent multiple initializations
  const listenersSetup = useRef(false);
  const registrationInProgress = useRef(false);

  // Update user token in database
  const updateUserToken = useCallback(async (tokenValue: string) => {
    console.log('=== updateUserToken called ===');
    console.log('User ID:', user?.id || 'anonymous');
    console.log('Token:', tokenValue ? tokenValue.substring(0, 20) + '...' : 'null');
    
    try {
      console.log('📤 Updating push token...');
      
      const tokenData = {
        user_id: user?.id || null,
        token: tokenValue,
        platform: window.Capacitor?.getPlatform() || 'unknown',
        updated_at: new Date().toISOString(),
        device_id: user?.id ? null : tokenValue
      };
      
      console.log('📄 Token data to save:', tokenData);
      
      const upsertConfig = user?.id 
        ? { onConflict: 'user_id' }
        : { onConflict: 'token' };
      
      console.log('🔧 Upsert config:', upsertConfig);
      
      const { data, error: insertError } = await supabase
        .from('user_push_tokens')
        .upsert(tokenData, upsertConfig);
      
      console.log('📊 Database response - data:', data);
      console.log('📊 Database response - error:', insertError);
      
      if (insertError) {
        console.error('❌ Error updating push token:', insertError);
        console.error('❌ Full error details:', JSON.stringify(insertError, null, 2));
        setError(`Database error: ${insertError.message}`);
      } else {
        console.log('✅ Push token updated successfully', data);
        setError(null);
      }
    } catch (error) {
      console.error('❌ Error updating push token:', error);
      setError('Failed to save push token');
    }
  }, [supabase, user?.id]);

  // Remove user token from database
  const removeUserToken = useCallback(async () => {
    console.log('=== removeUserToken called ===');
    console.log('User ID:', user?.id || 'anonymous');
    console.log('Current token:', token ? token.substring(0, 20) + '...' : 'none');
    
    try {
      console.log('🗑️ Removing push token...');
      
      let query;
      if (user?.id) {
        console.log('🔍 Deleting by user_id:', user.id);
        query = supabase
          .from('user_push_tokens')
          .delete()
          .eq('user_id', user.id);
      } else if (token) {
        console.log('🔍 Deleting by token:', token.substring(0, 20) + '...');
        query = supabase
          .from('user_push_tokens')
          .delete()
          .eq('token', token);
      } else {
        console.log('⚠️ No user ID or token available for deletion - this is normal for first-time users');
        return true;
      }
      
      const { data, error: deleteError } = await query;
      
      if (deleteError) {
        console.error('❌ Error removing push token:', deleteError);
        setError(`Database error: ${deleteError.message}`);
        return false;
      } else {
        console.log('✅ Push token removed successfully', data);
        setError(null);
        return true;
      }
    } catch (error) {
      console.error('❌ Error removing push token:', error);
      setError('Failed to remove push token');
      return false;
    }
  }, [supabase, user?.id, token]);

  // Initialize push notifications
  const registerNotifications = useCallback(async () => {
    if (!isNative) {
      console.log('Not running on native platform, skipping push notification registration');
      setError('Push notifications are only available on mobile devices');
      return false;
    }

    // Prevent multiple simultaneous registrations
    if (registrationInProgress.current) {
      console.log('Registration already in progress, skipping...');
      return false;
    }

    // Only skip if we're already initialized AND not previously disabled
    if (isInitialized && permissionStatus && !isDisabled && token) {
      console.log('Push notifications already initialized with token');
      return true;
    }

    try {
      registrationInProgress.current = true;
      console.log('Requesting push notification permissions...');
      setError(null);
      setIsDisabled(false);
      
      // Check current permissions first
      const currentPermission = await PushNotifications.checkPermissions();
      if (currentPermission.receive === 'granted') {
        setPermissionStatus(true);
        
        console.log('Permission already granted, registering for push notifications...');
        console.log('🔧 About to call PushNotifications.register() for existing permission...');
        await PushNotifications.register();
        console.log('✅ PushNotifications.register() completed for existing permission');
        
        // Add debugging timeout
        setTimeout(() => {
          if (!token && !isDisabled) {
            console.log('⚠️ No token received after 3 seconds - checking Firebase setup');
            console.log('📱 Make sure GoogleService-Info.plist is properly configured');
            console.log('🔥 Firebase integration is required for iOS push notifications');
            setError('No token received - check Firebase configuration');
          }
        }, 3000);
        
        setIsInitialized(true);
        return true;
      }
      
      // Request permissions
      const permission = await PushNotifications.requestPermissions();
      const granted = permission.receive === 'granted';
      setPermissionStatus(granted);

      if (granted) {
        console.log('Push notification permission granted, registering...');
        console.log('🔧 About to call PushNotifications.register()...');
        await PushNotifications.register();
        console.log('✅ PushNotifications.register() completed');
        
        // Add debugging timeout
        setTimeout(() => {
          if (!token && !isDisabled) {
            console.log('⚠️ No token received after 3 seconds');
            console.log('🔥 This usually means Firebase is not properly configured');
            setError('No token received - check Firebase setup');
          }
        }, 3000);
        
        setIsInitialized(true);
        return true;
      } else {
        console.log('Push notification permission denied');
        setError('Push notification permission was denied. Please enable in device settings.');
        setIsInitialized(true);
        return false;
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      setError(`Registration failed: ${error.message || 'Unknown error'}`);
      setIsInitialized(true);
      return false;
    } finally {
      registrationInProgress.current = false;
    }
  }, [isNative, isInitialized, permissionStatus, isDisabled, token]);

  // Disable push notifications (app-level)
  const disableNotifications = useCallback(async () => {
    console.log('Disabling push notifications...');
    
    try {
      setIsDisabled(true);
      setIsInitialized(false);
      setToken(null);
      setNotifications([]);
      setError(null);
      
      await removeUserToken();
      
      console.log('Push notifications disabled successfully');
      return true;
    } catch (error) {
      console.error('Error disabling push notifications:', error);
      setError('Failed to disable push notifications');
      return false;
    }
  }, [removeUserToken]);

  // Enable push notifications
  const enableNotifications = useCallback(async () => {
    console.log('Enabling push notifications...');
    
    try {
      setIsDisabled(false);
      setError(null);
      
      if (!isNative) {
        throw new Error('Push notifications are only available on mobile devices');
      }
      
      const result = await registerNotifications();
      console.log('Enable notifications result:', result);
      return result;
    } catch (error) {
      console.error('Error in enableNotifications:', error);
      setError(error.message || 'Failed to enable push notifications');
      throw error;
    }
  }, [registerNotifications, isNative]);

  // Check current permission status
  const checkPermissions = useCallback(async () => {
    if (!isNative) return false;

    try {
      const permission = await PushNotifications.checkPermissions();
      const granted = permission.receive === 'granted';
      setPermissionStatus(granted);
      
      console.log('Push notification permission status:', granted ? 'granted' : 'denied');
      return granted;
    } catch (error) {
      console.error('Error checking push notification permissions:', error);
      setError(`Permission check failed: ${error.message}`);
      return false;
    }
  }, [isNative]);

  // Get delivered notifications
  const getDeliveredNotifications = useCallback(async () => {
    if (!isNative) return [];
    
    try {
      const { notifications } = await PushNotifications.getDeliveredNotifications();
      return notifications;
    } catch (error) {
      console.error('Error getting delivered notifications:', error);
      return [];
    }
  }, [isNative]);

  // Clear all notifications
  const clearNotifications = useCallback(async () => {
    if (!isNative) return;
    
    try {
      await PushNotifications.removeAllDeliveredNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [isNative]);

  // Check if notifications are effectively enabled
  const isEnabled = permissionStatus && !isDisabled;

  // Set up event listeners (only once)
  useEffect(() => {
    if (!isNative || isDisabled || listenersSetup.current) return;
    
    let registrationListener: any;
    let notificationReceivedListener: any;
    let notificationActionPerformedListener: any;
    let registrationErrorListener: any;

    const setupListeners = async () => {
      console.log('Setting up push notification listeners...');
      listenersSetup.current = true;

      try {
        // Registration success
        registrationListener = await PushNotifications.addListener('registration', (token: Token) => {
          console.log('🎉 === PUSH REGISTRATION SUCCESS LISTENER FIRED ===');
          console.log('📱 Received token:', token.value.substring(0, 20) + '...');
          console.log('👤 User ID:', user?.id || 'anonymous');
          console.log('🔄 Is disabled:', isDisabled);
          
          setToken(token.value);
          setError(null);
          
          console.log('💾 About to call updateUserToken...');
          updateUserToken(token.value);
        });

        // Registration error
        registrationErrorListener = await PushNotifications.addListener('registrationError', (error: any) => {
          console.error('🔥 Push registration error:', error);
          setError(`Registration error: ${error.error}`);
        });

        // Notification received (app in foreground)
        notificationReceivedListener = await PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: PushNotificationSchema) => {
            console.log('Push notification received:', notification);
            setNotifications(prev => [...prev, notification]);
          }
        );

        // Notification tapped (app in background)
        notificationActionPerformedListener = await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (notification: any) => {
            console.log('Push notification action performed:', notification);
            
            setNotifications(prev => {
              const exists = prev.some(n => n.id === notification.notification.id);
              if (!exists) {
                return [...prev, notification.notification];
              }
              return prev;
            });
          }
        );
      } catch (error) {
        console.error('Error setting up push notification listeners:', error);
        setError(`Listener setup failed: ${error.message}`);
        listenersSetup.current = false;
      }
    };

    setupListeners();

    return () => {
      console.log('Cleaning up push notification listeners...');
      if (registrationListener) registrationListener.remove();
      if (notificationReceivedListener) notificationReceivedListener.remove();
      if (notificationActionPerformedListener) notificationActionPerformedListener.remove();
      if (registrationErrorListener) registrationErrorListener.remove();
      listenersSetup.current = false;
    };
  }, [isNative, user?.id, updateUserToken, isDisabled]);

  // Update token when user changes
  useEffect(() => {
    if (token && !isDisabled) {
      updateUserToken(token);
    }
  }, [token, user?.id, updateUserToken, isDisabled]);

  // Check permissions on mount
  useEffect(() => {
    if (isNative) {
      checkPermissions();
    }
  }, [isNative, checkPermissions]);

  // Auto-initialize when app loads
  useEffect(() => {
    if (isNative && !isInitialized && !isDisabled && !registrationInProgress.current) {
      console.log('Auto-checking permissions for push notifications...');
      checkPermissions().then(hasPermission => {
        if (hasPermission && !isDisabled && !registrationInProgress.current) {
          console.log('Has permission and not disabled, auto-registering...');
          registerNotifications();
        }
      });
    }
  }, [isNative, isInitialized, checkPermissions, registerNotifications, isDisabled]);

  return {
    token: isDisabled ? null : token,
    notifications: isDisabled ? [] : notifications,
    permissionStatus,
    isInitialized,
    error,
    isEnabled,
    isDisabled,
    registerNotifications,
    enableNotifications,
    disableNotifications,
    checkPermissions,
    getDeliveredNotifications,
    clearNotifications,
    isNative
  };
}