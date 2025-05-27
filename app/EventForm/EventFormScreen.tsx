import axios from '@/lib/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EventFormScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    capacity: '1',
  });

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) setToken(storedToken);
    };
    loadToken();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm({
          title: res.data.title,
          description: res.data.description,
          location: res.data.location,
          date: res.data.date.split('T')[0],
          capacity: res.data.capacity.toString(),
        });
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch event.');
        router.replace('/(auth)/(tabs)');
      } finally {
        setLoading(false);
      }
    };
    if (id && token) fetchEvent();
  }, [id, token]);

  const handleChange = (key:any, value:any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.location || !form.date || !form.capacity) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        capacity: parseInt(form.capacity),
      };

      if (id) {
        await axios.put(`/events/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('/events', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      router.replace('/(auth)/(tabs)');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>{id ? 'Edit Event' : 'Create Event'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={form.title}
          onChangeText={(text) => handleChange('title', text)}
        />

        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Description"
          multiline
          numberOfLines={4}
          value={form.description}
          onChangeText={(text) => handleChange('description', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Location"
          value={form.location}
          onChangeText={(text) => handleChange('location', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={form.date}
          onChangeText={(text) => handleChange('date', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Capacity"
          keyboardType="numeric"
          value={form.capacity}
          onChangeText={(text) => handleChange('capacity', text)}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>{submitting ? 'Saving...' : id ? 'Update Event' : 'Create Event'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
  },
  scrollContainer: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  textarea: {
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#ff751c',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',

  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
    backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '500',
  },
});
