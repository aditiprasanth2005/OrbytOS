import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error("Logout failed:", err);
            alert("Logout failed: " + err.message);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0B132B' }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 10 }}>
                    👤 Profile
                </Text>
                
                <View style={{ backgroundColor: '#1C2541', padding: 20, borderRadius: 15, width: '100%', alignItems: 'center', marginBottom: 30 }}>
                    <Text style={{ color: '#aaa', marginBottom: 5 }}>Logged in as</Text>
                    <Text style={{ color: '#6FFFE9', fontSize: 18, fontWeight: '500' }}>
                        {auth.currentUser?.email || "No email found"}
                    </Text>
                </View>

                <TouchableOpacity 
                    onPress={handleLogout} 
                    style={{ backgroundColor: '#FF6B6B', padding: 15, borderRadius: 12, width: '100%', alignItems: 'center' }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
