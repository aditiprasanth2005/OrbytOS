import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        setErrorMsg(''); // clear previous errors
        if (!email || !password) {
            setErrorMsg("Please enter both email and password.");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Navigation to tabs is handled by the auth listener in _layout.tsx
        } catch (err: any) {
            console.error("Login error:", err);
            
            // Map common Firebase errors to readable messages
            switch (err.code) {
                case 'auth/invalid-credential':
                case 'auth/wrong-password':
                    setErrorMsg("Invalid credentials. Please check your email and password.");
                    break;
                case 'auth/user-not-found':
                    setErrorMsg("Account not found. Please sign up first.");
                    break;
                case 'auth/invalid-email':
                    setErrorMsg("The email address is badly formatted.");
                    break;
                case 'auth/configuration-not-found':
                    setErrorMsg("Firebase Config Error: Enable Email/Password Auth in Firebase Console.");
                    break;
                default:
                    setErrorMsg("Login failed: " + err.message);
                    break;
            }
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0B132B', justifyContent: 'center', padding: 20 }}>
            <Text style={{ color: '#fff', fontSize: 28, marginBottom: 20 }}>Login</Text>

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

            <TouchableOpacity onPress={handleLogin} style={{ backgroundColor: '#6FFFE9', padding: 15, borderRadius: 8 }}>
                <Text style={{ color: '#0B132B', textAlign: 'center', fontWeight: 'bold' }}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={{ color: '#6FFFE9', marginTop: 15, textAlign: 'center' }}>Create account</Text>
            </TouchableOpacity>
        </View>
    );
}