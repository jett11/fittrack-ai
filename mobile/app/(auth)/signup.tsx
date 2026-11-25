import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { colors } from '../../constants/theme'

export default function Signup() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setError('')
    setMessage('')
    setLoading(true)
    const { error } = await signUp(email.trim(), password)
    setLoading(false)
    if (error) return setError(error.message)
    setMessage('Account created — check your email to confirm, then log in.')
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: colors.lime, fontSize: 28, fontWeight: '800', marginBottom: 4 }}>FitTrack AI</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 32 }}>Create your account</Text>

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
        {message ? <Text style={{ color: colors.green, marginTop: 12, fontSize: 13 }}>{message}</Text> : null}

        <View style={{ marginTop: 20 }}>
          <Button onPress={handleSignUp} loading={loading}>
            Sign up
          </Button>
        </View>

        <Link href="/(auth)/login" style={{ marginTop: 20, textAlign: 'center', color: colors.textSecondary }}>
          Already have an account? <Text style={{ color: colors.lime, fontWeight: '700' }}>Log in</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
