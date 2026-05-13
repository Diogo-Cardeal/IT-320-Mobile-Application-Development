import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { addContact } from '../redux/actions';
import styles from '../styles';

const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const ContactForm = ({ addContact }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handlePhoneChange = (text) => {
    setPhone(formatPhoneNumber(text));
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const phoneDigits = trimmedPhone.replace(/\D/g, '');

    if (!trimmedName || !trimmedPhone) {
      Alert.alert('Missing info', 'Please enter both a name and phone number.');
      return;
    }

    if (phoneDigits.length !== 10) {
      Alert.alert('Invalid phone', 'Please enter a 10-digit phone number.');
      return;
    }

    addContact(trimmedName, trimmedPhone);
    setName('');
    setPhone('');
  };

  return (
    <View style={styles.form}>
      <Text style={styles.sectionTitle}>New contact</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Name"
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={handlePhoneChange}
        placeholder="123-456-7890"
        keyboardType="phone-pad"
        maxLength={12}
      />
      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>Add Contact</Text>
      </TouchableOpacity>
    </View>
  );
};

// mapDispatchToProps binds action creators to dispatch automatically.
// The component can call addContact(...) instead of store.dispatch(addContact(...)).
const mapDispatchToProps = {
  addContact,
};

// connect() wires this form to Redux through mapDispatchToProps.
export default connect(null, mapDispatchToProps)(ContactForm);
