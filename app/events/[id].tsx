import axios from '@/lib/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function EventDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [user, setUser] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { fromTab } = useLocalSearchParams();


  useEffect(() => {
    const load = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    };
    load();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvent(res.data);
      } catch (err) {
        console.error('Failed to load event:', err);
        setError('Failed to load event.');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchEvent();
  }, [token]);

const handleShare = async () => {
  try {
    const message = `📅 Check out this event on EventHive!\n\nTitle: ${event.title}\nLocation: ${event.location}\nDate: ${new Date(event.date).toDateString()}\n\n${event.description || ''}`;
    await Share.share({ message });
  } catch (error) {
    console.error('Error sharing event:', error);
  }
};


  const handleBooking = async () => {
    const qty = parseInt(quantity);
    if (!qty || qty < 1 || qty > event.capacity) {
      setError('Please enter a valid quantity.');
      return;
    }
    try {
      const res = await axios.post(
        '/bookings',
        { eventId: id, quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('✅ Booking confirmed!');
      setError('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Booking failed.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}><ActivityIndicator size="large" color="#4f46e5" /></View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}><Text>Event not found.</Text></View>
    );
  }

  return (
    
    <SafeAreaView style={{ flex: 1, backgroundColor: '#eef2ff' }}>
      <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
        <View style={styles.card}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.meta}>📍 {event.location}</Text>
          <Text style={styles.meta}>📅 {new Date(event.date).toDateString()}</Text>

          <Text style={styles.description}>{event.description}</Text>

          <Text style={styles.available}>Available Seats: {event.capacity}</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            placeholder="Enter quantity"
          />

          {success ? <Text style={styles.success}>{success}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
  <Text style={styles.shareButtonText}>Share Event</Text>
</TouchableOpacity>


          <TouchableOpacity style={styles.backButton}  onPress={() => {
    if (fromTab === 'bookings') {
      router.replace('/bookings');
    } else {
      router.replace('/'); // default to home tab
    }
  }}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>📌 Tip: Arrive 10 minutes early to ensure a smooth check-in!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  meta: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    marginVertical: 12,
  },
  available: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  bookButton: {
    backgroundColor: '#ff751c',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  success: {
    color: 'green',
    marginBottom: 8,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#fff7e6',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
  },
  shareButton: {
  marginTop: 10,
  paddingVertical: 10,
  borderRadius: 8,
  backgroundColor: '#4f46e5',
  alignItems: 'center',
},
shareButtonText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 16,
},

});
