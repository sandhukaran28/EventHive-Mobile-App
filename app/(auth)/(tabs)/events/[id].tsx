import axios from '@/lib/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userTickets, setUserTickets] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        try {
          const res = await axios.get(`/events/${id}`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setEvent(res.data);
          const count = res.data.attendees?.filter((a:any) => a === parsedUser.user.id).length || 0;
          setUserTickets(count);
        } catch (e) {
          Alert.alert('Error', 'Could not load event.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id]);

  const handleBooking = async () => {
    const qty = parseInt(quantity);
    if (qty > event.capacity) {
      setError('You cannot book more seats than available.');
      return;
    }

    try {
      const res = await axios.post(
        '/bookings',
        { eventId: id, quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setError('');
      setEvent((prev:any) => ({
        ...prev,
        attendees: [...(prev.attendees || []), ...Array(qty).fill(user.user.id)],
        capacity: prev.capacity - qty,
      }));
      setUserTickets(prev => prev + qty);
    } catch (err) {
      setError('Booking failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Event not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>


        <Text style={styles.heading}>{event.title}</Text>
        <Text style={styles.meta}>📅 {new Date(event.date).toDateString()}</Text>
        <Text style={styles.meta}>📍 {event.location}</Text>
        <Text style={styles.description}>{event.description}</Text>

        <View style={styles.card}>
          <Text style={styles.subheading}>🎟️ Book Your Spot</Text>

          {success && <Text style={[styles.message, { color: 'green' }]}>✅ Booking confirmed!</Text>}
          {error && <Text style={[styles.message, { color: 'red' }]}>{error}</Text>}

          <Text style={styles.label}>Available Seats: {event.capacity}</Text>
          <Text style={styles.label}>Tickets Already Booked: {userTickets}</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={user?.user?.name || ''} editable={false} />

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          <Button title="Confirm Booking" onPress={handleBooking} disabled={success || event.capacity === 0} />
          <View style={{ marginTop: 12 }}>
            <Button title="Go Back" color="#999" onPress={() => router.back()} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4ff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
  },
  banner: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  subheading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  meta: {
    color: '#444',
    fontSize: 14,
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginTop: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
  },
  label: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fdfdfd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  message: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});
