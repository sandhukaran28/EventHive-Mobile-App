import axios from '@/lib/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function Bookings() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [bookings, setBookings] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = async (authToken:any, page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`/users/bookings?page=${page}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setBookings(res.data.bookings);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (id:any) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`/bookings/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setBookings((prev:any) =>
                prev.map((b:any) => (b._id === id ? { ...b, status: 'canceled' } : b))
              );
            } catch (err) {
              console.error('Failed to cancel booking:', err);
              Alert.alert('Error', 'Could not cancel booking.');
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          fetchBookings(storedToken,currentPage);
        }
      };
      load();
    }, [currentPage])
  );

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.content}>
      <Text style={styles.heading}>Your Bookings 🎟️</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) =>
            item.event ? (
              <View style={styles.card}>
                <Text style={styles.title}>{item.event.title}</Text>
                <Text style={styles.meta}>{new Date(item.event.date).toDateString()}</Text>
                <Text style={styles.meta}>{item.event.location}</Text>
                <Text style={styles.meta}>🎟 Tickets: {item.quantity}</Text>
                <Text style={item.status === 'confirmed' ? styles.statusConfirmed : styles.statusCanceled}>
                  {item.status.toUpperCase()}
                </Text>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => router.push(`/events/${item.event._id}`)}
                >
                  <Text style={{ color: '#1a1a1a' }}>View Event</Text>
                </TouchableOpacity>

                {item.status === 'confirmed' && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelBooking(item._id)}
                  >
                    <Text style={{ color: '#fff' }}>Cancel Booking</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null
          }
        />
      )}

      {/* Pagination Controls */}
      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          <Text style={[styles.pageButton, currentPage === 1 && styles.disabled]}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </Text>
        <TouchableOpacity
          onPress={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <Text style={[styles.pageButton, currentPage === totalPages && styles.disabled]}>Next</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    padding: 16,
  },
   content: {
    padding: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  meta: {
    fontSize: 14,
    color: '#555',
  },
  statusConfirmed: {
    marginTop: 8,
    color: 'green',
    fontWeight: 'bold',
  },
  statusCanceled: {
    marginTop: 8,
    color: 'red',
    fontWeight: 'bold',
  },
  viewButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#b1d0fc',
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    alignItems: 'center',
  },
  pageButton: {
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 16,
  },
  disabled: {
    color: '#bbb',
  },
  pageInfo: {
    fontSize: 14,
    color: '#1a1a1a',
  },
});
