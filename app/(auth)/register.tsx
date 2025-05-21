import axios from '@/lib/axiosConfig'; // Adjust path if needed
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await axios.post('/auth/register', {
        name,
        email,
        password,
        isAdmin: false,
      });

      console.log('Registered:', res.data);
      setSuccessMsg('🎉 Registration successful! Redirecting to login...');
      setTimeout(() => router.replace('/login'), 2000);
    } catch (err:any) {
      console.error('Registration failed:', err.response?.data || err.message);
      if (err.response?.data?.errors?.length > 0) {
        setError(err.response.data.errors[0].msg);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Image
            source={require('@/assets/images/logo.png')} // Add your logo
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Join EventHive</Text>
          <Text style={styles.subtitle}>Create your account to get started</Text>

          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#999"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {successMsg ? <Text style={styles.success}>{successMsg}</Text> : null}

          <TouchableOpacity
            onPress={handleRegister}
            style={styles.button}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Registering...' : 'Register'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/login')} style={{ marginTop: 16 }}>
            <Text style={styles.link}>
              Already have an account? <Text style={{ fontWeight: '600' }}>Login here</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.quote}>
            “Your journey with EventHive starts with a single click.”{'\n'}
            <Text style={{ fontStyle: 'italic' }}>– Team EventHive</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  logo: {
    width: 160,
    height: 160,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  subtitle: {
    textAlign: 'center',
    color: '#444',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    backgroundColor: '#fdfdfd',
  },
  button: {
    backgroundColor: '#ff751c',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 8,
  },
  success: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 8,
  },
  link: {
    textAlign: 'center',
    color: '#4f46e5',
  },
  quote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
});
