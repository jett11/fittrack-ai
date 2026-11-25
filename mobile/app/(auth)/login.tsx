import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { colors } from '../../constants/theme'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setError('')
    setLoading(true)
    const { error } = await signIn(email.trim(), password)
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: colors.lime, fontSize: 28, fontWeight: '800', marginBottom: 4 }}>FitTrack AI</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 32 }}>Welcome back</Text>

        <View style={{ gap: 12 }}>
          <TextField
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        </View>

        {error ? <Text style={{ color: colors.danger, marginTop: 12, fontSize: 13 }}>{error}</Text> : null}

        <View style={{ marginTop: 20 }}>
          <Button onPress={handleSignIn} loading={loading}>
            Log in
          </Button>
        </View>

        <Link href="/(auth)/forgot-password" style={{ marginTop: 16, textAlign: 'center', color: colors.textSecondary }}>
          Forgot password?
        </Link>

        <Link href="/(auth)/signup" style={{ marginTop: 20, textAlign: 'center', color: colors.textSecondary }}>
          Don&rsquo;t have an account? <Text style={{ color: colors.lime, fontWeight: '700' }}>Sign up</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
