import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/src/constants/colors';
import { supabase } from '@/src/lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.confirmedContainer}>
        <View style={styles.confirmedCard}>
          <Text style={styles.confirmedTitle}>Check your email</Text>
          <Text style={styles.confirmedMessage}>
            If an account exists for {email.trim()}, you'll receive a password reset link shortly.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(auth)/sign-in')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Back to Sign In"
          >
            <Text style={styles.buttonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.description}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {error && (
            <View style={styles.errorBox} accessibilityLiveRegion="polite">
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Email address"
              accessibilityHint="Enter the email address associated with your account"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Send Reset Link"
            accessibilityState={{ disabled: isLoading }}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back to Sign In"
          >
            <Text style={styles.backLinkText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.backgroundWhite,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  form: {
    gap: 16,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: colors.errorLight,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  confirmedContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.backgroundWhite,
  },
  confirmedCard: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  confirmedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  confirmedMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
