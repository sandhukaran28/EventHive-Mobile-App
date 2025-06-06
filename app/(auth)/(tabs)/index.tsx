import axios from "@/lib/axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`/events?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data.events);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      console.error(
        "Error fetching events:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const getUserData = async () => {
    const storedToken = await AsyncStorage.getItem("token");
    const storedUser = await AsyncStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchEvents(1); // fetch bookings again (or events)
      setCurrentPage(1); // reset pagination if needed
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`/events/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setEvents((prev) => prev.filter((e: any) => e._id !== id));
          } catch (err: any) {
            console.error("Delete failed:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to delete event.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    getUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
      };
      loadUser();
    }, [])
  );

  useEffect(() => {
    if (token) fetchEvents(currentPage);
  }, [token, currentPage]);

  return (
    <View style={styles.container}>
      {/* Top Row */}

      <Text style={styles.heading}>
        Welcome, {user?.isAdmin ? "Admin" : user?.name || "Guest"} 👋
      </Text>
      <Text style={styles.subtext}>
        Here's what's happening with your events today.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item: any) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{item.location}</Text>
              <Text style={styles.meta}>
                {new Date(item.date).toDateString()}
              </Text>

              {user?.isAdmin ? (
                <View style={styles.adminActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push(`/EventForm/${item._id}`)}
                  >
                    <Text>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteEvent(item._id)}
                  >
                    <Text style={{ color: "#fff" }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() =>
                    router.push({
                      pathname: "/events/[id]",
                      params: { id: item._id, fromTab: "home" },
                    })
                  }
                >
                  <Text style={{ color: "#fff" }}>View Details</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.noEvents}>No events found.</Text>
          }
          ListFooterComponent={
            <View style={styles.pagination}>
              <TouchableOpacity
                onPress={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <Text
                  style={[
                    styles.pageButton,
                    currentPage === 1 && styles.disabled,
                  ]}
                >
                  Previous
                </Text>
              </TouchableOpacity>

              <Text style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <Text
                  style={[
                    styles.pageButton,
                    currentPage === totalPages && styles.disabled,
                  ]}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Floating Admin Button */}
      {user?.isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/EventForm")}
        >
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginBottom: 80,
    backgroundColor: "#f0f4ff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "600",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  subtext: {
    color: "#444",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  meta: {
    color: "#666",
    fontSize: 13,
  },
  viewButton: {
    marginTop: 10,
    backgroundColor: "#ff751c",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  adminActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  editButton: {
    padding: 10,
    backgroundColor: "#e0e7ff",
    borderRadius: 8,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: "#ef4444",
    borderRadius: 8,
  },
  noEvents: {
    textAlign: "center",
    color: "#666",
    marginTop: 40,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    alignItems: "center",
  },
  pageButton: {
    color: "#4f46e5",
    fontWeight: "600",
    fontSize: 16,
  },
  disabled: {
    color: "#bbb",
  },
  pageInfo: {
    fontSize: 14,
    color: "#1a1a1a",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4f46e5",
    borderRadius: 30,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  fabText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
});
