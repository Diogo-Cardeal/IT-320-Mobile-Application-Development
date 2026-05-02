import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthModal() {
  const { user, signOut, login, register, loading, error: authError, authVisible, closeAuth } = useAuth();
  const visible = authVisible;
  const onClose = closeAuth;
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (!visible) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setLocalError(null);
      setTab('login');
    }
  }, [visible]);

  const handleSubmit = async () => {
    setLocalError(null);
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail && !trimmedPassword) {
      setLocalError('Enter your email and password.');
      return;
    }
    if (!trimmedEmail) {
      setLocalError('Enter your email.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setLocalError('That email address looks invalid.');
      return;
    }
    if (!trimmedPassword) {
      setLocalError('Enter your password.');
      return;
    }
    if (tab === 'register') {
      if (trimmedPassword.length < 6) {
        setLocalError('Password must be at least 6 characters.');
        return;
      }
      if (!confirmPassword.trim()) {
        setLocalError('Please confirm your password.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords must match.');
        return;
      }
    }

    try {
      if (tab === 'login') {
        await login(trimmedEmail, trimmedPassword);
      } else {
        await register(trimmedEmail, trimmedPassword);
      }
      onClose();
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleSignOut = () => {
    signOut();
    onClose();
  };

  return (
    <Modal animationType="slide" visible={visible} transparent>
      <SafeAreaView style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Account</Text>

          {user ? (
            <View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>Signed in</Text>
              </View>
              <Text style={styles.statusLabel}>Signed in as</Text>
              <Text style={styles.statusEmail}>{user.email}</Text>

              <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.tabBar}>
                <TouchableOpacity onPress={() => setTab('login')} style={[styles.tabButton, tab === 'login' && styles.tabActive]}>
                  <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTab('register')} style={[styles.tabButton, tab === 'register' && styles.tabActive]}>
                  <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>Register</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#7b8cbf"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#7b8cbf"
                style={styles.input}
                secureTextEntry
              />
              {tab === 'register' && (
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  placeholderTextColor="#7b8cbf"
                  style={styles.input}
                  secureTextEntry
                />
              )}

              {localError ? <Text style={styles.errorText}>{localError}</Text> : null}
              {!localError && authError ? <Text style={styles.errorText}>{authError}</Text> : null}

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{tab === 'login' ? 'Login' : 'Register'}</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(1, 8, 32, 0.94)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 24,
    backgroundColor: '#07162e',
    padding: 18,
    borderWidth: 1,
    borderColor: '#0f1f3a',
  },
  title: {
    color: '#f8f8f2',
    fontSize: 24,
    fontFamily: 'Courier',
    marginBottom: 18,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 18,
    backgroundColor: '#02082b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0f1f3a',
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#11254e',
  },
  tabText: {
    color: '#7aa4ff',
    fontFamily: 'Courier',
  },
  tabTextActive: {
    color: '#f8f8f2',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#02082b',
    color: '#f8f8f2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: 'Courier',
    borderWidth: 1,
    borderColor: '#0f1f3a',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#ff2d55',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitButtonText: {
    color: '#fff',
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  closeButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  closeText: {
    color: '#7aa4ff',
    fontFamily: 'Courier',
  },
  errorText: {
    color: '#ff6f91',
    fontFamily: 'Courier',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#1f3a26',
    borderWidth: 1,
    borderColor: '#66bb6a',
    marginBottom: 14,
  },
  statusBadgeText: {
    color: '#66bb6a',
    fontFamily: 'Courier',
    fontWeight: '700',
    fontSize: 12,
  },
  statusLabel: {
    color: '#7aa4ff',
    fontFamily: 'Courier',
    marginBottom: 4,
  },
  statusEmail: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
    fontSize: 16,
    marginBottom: 18,
  },
  signOutButton: {
    backgroundColor: '#1c2a49',
    borderWidth: 1,
    borderColor: '#ff6f91',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  signOutButtonText: {
    color: '#ff6f91',
    fontFamily: 'Courier',
    fontWeight: '700',
  },
});
