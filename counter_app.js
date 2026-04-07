// CounterApp.js
// A simple counter app built with React Native and Expo
// Demonstrates: useState, onPress, StyleSheet, JSX, View, Text, TouchableOpacity

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

// This is the main component — it displays the counter and handles all user interactions
export default function App() {

  // useState stores the current counter value; setCount is used to update it
  const [count, setCount] = useState(0);

  // ─── Event Handlers ───────────────────────────────────────────────────────

  // This function adds 1 to the counter
  const increment = () => setCount(count + 1);

  // This function subtracts 1 from the counter, but prevents it going below 0
  const decrement = () => {
    if (count > 0) {
      setCount(count - 1);
    }
    // If already at 0, do nothing (floor of 0 enforced)
  };

  // This function resets the counter to 0
  const reset = () => setCount(0);

  // ─── Milestone & Floor Message Logic ──────────────────────────────────────

  // Returns a message string based on the current count value
  const getMessage = () => {
    if (count === 0) return "Tap + to start counting!";
    if (count === 10) return "🎉 You reached 10!";
    if (count === 25) return "🔥 You reached 25!";
    if (count === 50) return "🏆 You reached 50!";
    if (count === 100) return "💯 You hit 100!";
    return ""; // No message for other values
  };

  // Determine the count text colour based on value
  const countColor =
    count === 0
      ? styles.countZero
      : count >= 50
      ? styles.countHigh
      : count >= 10
      ? styles.countMid
      : styles.countNormal;

  // ─── JSX (what gets rendered on screen) ───────────────────────────────────

  return (
    // SafeAreaView keeps content away from notches and status bars
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* App title */}
        <Text style={styles.title}>Counter App</Text>

        {/* Count display card */}
        <View style={styles.card}>
          <Text style={styles.label}>Current Count</Text>

          {/* The current number — styled differently based on value */}
          <Text style={[styles.count, countColor]}>{count}</Text>

          {/* Milestone / floor message — only shows when getMessage() returns text */}
          {getMessage() !== "" && (
            <Text style={styles.message}>{getMessage()}</Text>
          )}
        </View>

        {/* Button row: Decrement, Reset, Increment */}
        <View style={styles.buttonRow}>

          {/* Decrement button — greyed out when count is already 0 */}
          <TouchableOpacity
            style={[styles.button, styles.buttonDecrement, count === 0 && styles.buttonDisabled]}
            onPress={decrement}
            activeOpacity={count === 0 ? 1 : 0.75} // No visual feedback when disabled
          >
            <Text style={styles.buttonText}>−</Text>
          </TouchableOpacity>

          {/* Reset button */}
          <TouchableOpacity
            style={[styles.button, styles.buttonReset]}
            onPress={reset}
            activeOpacity={0.75}
          >
            <Text style={[styles.buttonText, styles.buttonTextReset]}>Reset</Text>
          </TouchableOpacity>

          {/* Increment button */}
          <TouchableOpacity
            style={[styles.button, styles.buttonIncrement]}
            onPress={increment}
            activeOpacity={0.75}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>

        </View>

        {/* Helper hint when counter is at 0 */}
        {count === 0 && (
          <Text style={styles.hint}>Decrement is disabled at 0</Text>
        )}

      </View>
    </SafeAreaView>
  );
}

// ─── StyleSheet ─────────────────────────────────────────────────────────────
// StyleSheet.create() optimises styles for React Native (similar to CSS)

const PURPLE = '#7C3AED';
const GREEN  = '#059669';
const RED    = '#DC2626';
const GRAY   = '#6B7280';
const AMBER  = '#D97706';

const styles = StyleSheet.create({

  // Outer safe area — fills the whole screen
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },

  // Main container — centres everything vertically and horizontally
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // App title at the top
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 32,
    letterSpacing: 0.3,
  },

  // White card that houses the count display
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
    marginBottom: 36,
    // Shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    // Elevation (Android)
    elevation: 3,
  },

  // "Current Count" label above the number
  label: {
    fontSize: 14,
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },

  // The big count number
  count: {
    fontSize: 80,
    fontWeight: '700',
    lineHeight: 88,
  },

  // Count colour states
  countZero:   { color: GRAY },
  countNormal: { color: '#1C1C1E' },
  countMid:    { color: PURPLE },
  countHigh:   { color: GREEN },

  // Milestone / status message inside the card
  message: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '500',
    color: PURPLE,
  },

  // Row that holds the three buttons
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  // Base button style shared by all three buttons
  button: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Increment (+) button — green circle
  buttonIncrement: {
    backgroundColor: GREEN,
    width: 68,
    height: 68,
  },

  // Decrement (−) button — red circle
  buttonDecrement: {
    backgroundColor: RED,
    width: 68,
    height: 68,
  },

  // Disabled state for decrement when count is 0
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },

  // Reset button — outlined pill in the centre
  buttonReset: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 22,
  },

  // White text used on the coloured + and − buttons
  buttonText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 36,
  },

  // Darker text for the outlined reset button
  buttonTextReset: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
  },

  // Small hint text shown below the buttons when count is 0
  hint: {
    marginTop: 20,
    fontSize: 13,
    color: '#9CA3AF',
  },
});