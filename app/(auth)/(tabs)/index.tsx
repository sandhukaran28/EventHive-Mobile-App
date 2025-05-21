import axios from '@/lib/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`/events?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data.events);
      setTotalPages(res.data.totalPages);
    } catch (err:any) {
      console.error('Error fetching events:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserData = async () => {
    const storedToken = await AsyncStorage.getItem('token');
    const storedUser = await AsyncStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  };

  const handleDeleteEvent = async (id: string) => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`/events/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setEvents((prev) => prev.filter((e:any) => e._id !== id));
          } catch (err:any) {
            console.error('Delete failed:', err.response?.data || err.message);
            Alert.alert('Error', 'Failed to delete event.');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    if (token) fetchEvents(currentPage);
  }, [token, currentPage]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Welcome, {user?.isAdmin ? 'Admin' : user?.name || 'Guest'} 👋
      </Text>
      <Text style={styles.subtext}>Here's what's happening with your events today.</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item:any) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{item.location}</Text>
              <Text style={styles.meta}>{new Date(item.date).toDateString()}</Text>

              {user?.isAdmin ? (
                <View style={styles.adminActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push(`/edit-event/${item._id}`)}
                  >
                    <Text>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteEvent(item._id)}
                  >
                    <Text style={{ color: '#fff' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => router.push(`/events/${item._id}`)}
                >
                  <Text style={{ color: '#fff' }}>View Details</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.noEvents}>No events found.</Text>}
        />
      )}

      {/* Pagination */}
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
          <Text style={[styles.pageButton, currentPage === totalPages && styles.disabled]}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f4ff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  subtext: {
    color: '#444',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    color: '#666',
    fontSize: 13,
  },
  viewButton: {
    marginTop: 10,
    backgroundColor: '#ff751c',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    padding: 10,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  noEvents: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
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
