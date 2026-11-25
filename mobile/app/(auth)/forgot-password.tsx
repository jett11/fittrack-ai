import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { colors } from '../../constants/theme'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    setError('')
    setLoading(true)
    const { error } = await resetPassword(email.trim())
    setLoading(false)
    if (error) return setError(error.message)
    setSent(true)
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: colors.lime, fontSize: 24, fontWeight: '800', marginBottom: 4 }}>Reset password</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 28 }}>
          We&rsquo;ll email you a link to set a new password.
        </Text>

        {sent ? (
          <Text style={{ color: colors.green, fontSize: 14 }}>
            Check your email for a reset link. It opens the reset page in your browser — come back and log in once
            you&rsquo;ve set a new password.
          </Text>
        ) : (
          <>
            <TextField
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            {error ? <Text style={{ color: colors.danger, marginTop: 12, fontSize: 13 }}>{error}</Text> : null}
            <View style={{ marginTop: 20 }}>
              <Button onPress={handleReset} loading={loading}>
                Send reset link
              </Button>
            </View>
          </>
        )}

        <Text onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 24, textAlign: 'center', color: colors.textSecondary }}>
          Back to <Text style={{ color: colors.lime, fontWeight: '700' }}>Log in</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
