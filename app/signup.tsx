import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebase';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();

    const handleSignup = async () => {
        setErrorMsg(''); // Clear previous errors

        // Basic validation
        if (!email || !password) {
            setErrorMsg("Please enter both email and password.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMsg("Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            setErrorMsg("Password must be at least 6 characters long.");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // DO NOT manually route. The auth listener in _layout.tsx will detect 
            // the new logged-in state and push to /(tabs)
        } catch (err: any) {
            console.error("Signup error:", err);

            // Map common Firebase errors to readable messages
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setErrorMsg("This email is already in use. Please log in instead.");
                    break;
                case 'auth/invalid-email':
                    setErrorMsg("The email address is badly formatted.");
                    break;
                case 'auth/weak-password':
                    setErrorMsg("Password should be at least 6 characters.");
                    break;
                case 'auth/configuration-not-found':
                    setErrorMsg("Firebase Config Error: Enable Email/Password Auth in Firebase Console.");
                    break;
                default:
                    setErrorMsg("Signup failed: " + err.message);
                    break;
            }
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0B132B', justifyContent: 'center', padding: 20 }}>
            <Text style={{ color: '#fff', fontSize: 28, marginBottom: 20 }}>Signup</Text>

            {errorMsg ? (
                <Text style={{ color: '#FF6B6B', marginBottom: 15, fontWeight: 'bold' }}>{errorMsg}</Text>
            ) : null}

            <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ backgroundColor: '#1C2541', color: '#fff', padding: 12, marginBottom: 10, borderRadius: 8 }}
            />

            <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry
                onChangeText={setPassword}
                style={{ backgroundColor: '#1C2541', color: '#fff', padding: 12, marginBottom: 20, borderRadius: 8 }}
            />

            <TouchableOpacity onPress={handleSignup} style={{ backgroundColor: '#6FFFE9', padding: 15, borderRadius: 8 }}>
                <Text style={{ color: '#0B132B', textAlign: 'center', fontWeight: 'bold' }}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={{ color: '#6FFFE9', marginTop: 15, textAlign: 'center' }}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    );
}