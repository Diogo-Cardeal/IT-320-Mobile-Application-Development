import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const ContactForm = ({ onAddContact }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const canSave = name.trim().length > 0 && phone.trim().length > 0;

  const handleSubmit = () => {
    if (!canSave) {
      return;
    }

    onAddContact({ name, phone, email });
    setName('');
    setPhone('');
    setEmail('');
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Add Local Contact</Text>

      <TextInput
        autoCapitalize="words"
        onChangeText={setName}
        placeholder="Name"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={name}
      />
      <TextInput
        keyboardType="phone-pad"
        onChangeText={setPhone}
        placeholder="Phone"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={phone}
      />
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email optional"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={email}
      />

      <Pressable
        disabled={!canSave}
        onPress={handleSubmit}
        style={[styles.primaryButton, !canSave && styles.disabledButton]}
      >
        <Text style={styles.primaryButtonText}>Add Contact</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    color: '#0f172a',
    fontSize: 16,
    marginTop: 8,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    marginTop: 10,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '800',
  },
});

export default ContactForm;
