import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Database } from '@/src/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Native storage adapter using expo-secure-store
const ExpoSecureStoreAdapter = {
  getItem: (key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): Promise<void> => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string): Promise<void> => {
    return SecureStore.deleteItemAsync(key);
  },
};

// Web storage adapter using localStorage
const WebStorageAdapter = {
  getItem: (key: string): Promise<string | null> => {
    if (typeof localStorage === 'undefined') {
      return Promise.resolve(null);
    }
    return Promise.resolve(localStorage.getItem(key));
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
    return Promise.resolve();
  },
};

// Use appropriate storage based on platform
const storage = Platform.OS === 'web' ? WebStorageAdapter : ExpoSecureStoreAdapter;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
