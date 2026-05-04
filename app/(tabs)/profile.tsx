import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../firebase";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ Properly track auth state — no race condition
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Navigation back to /login is handled by _layout.tsx auth listener
        } catch (err: any) {
            console.error("Logout failed:", err);
            alert("Logout failed: " + err.message);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#0B132B", justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#6FFFE9" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#0B132B" }}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>

                <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold", marginBottom: 10 }}>
                    👤 Profile
                </Text>

                <View style={{
                    backgroundColor: "#1C2541",
                    padding: 20,
                    borderRadius: 15,
                    width: "100%",
                    alignItems: "center",
                    marginBottom: 30
                }}>
                    <Text style={{ color: "#aaa", marginBottom: 5 }}>Logged in as</Text>
                    <Text style={{ color: "#6FFFE9", fontSize: 18 }}>
                        {user?.email || "No email"}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    style={{
                        backgroundColor: "#FF6B6B",
                        padding: 15,
                        borderRadius: 12,
                        width: "100%",
                        alignItems: "center"
                    }}
                >
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Logout</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}