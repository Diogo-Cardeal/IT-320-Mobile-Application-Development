import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const ContactTools = ({
  filter,
  loading,
  onClearAll,
  onFilterChange,
  onRefresh,
}) => (
  <View style={styles.section}>
    <TextInput
      autoCapitalize="none"
      onChangeText={onFilterChange}
      placeholder="Search saved contacts"
      placeholderTextColor="#94a3b8"
      style={styles.input}
      value={filter}
    />

    <View style={styles.buttonRow}>
      <Pressable
        disabled={loading}
        onPress={onRefresh}
        style={[styles.secondaryButton, loading && styles.disabledButton]}
      >
        <Text style={styles.secondaryButtonText}>
          {loading ? 'Refreshing...' : 'Refresh API'}
        </Text>
      </Pressable>

      <Pressable onPress={onClearAll} style={styles.clearButton}>
        <Text style={styles.clearButtonText}>Clear All</Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 11,
  },
  clearButtonText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.65,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    color: '#0f172a',
    fontSize: 16,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 11,
  },
  secondaryButtonText: {
    color: '#1d4ed8',
    fontSize: 14,
    fontWeight: '800',
  },
  section: {
    marginBottom: 12,
  },
});

export default ContactTools;
