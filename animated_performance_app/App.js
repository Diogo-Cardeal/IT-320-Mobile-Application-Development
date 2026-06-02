import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AnimatedTimer from './src/components/AnimatedTimer';
import SessionList from './src/components/SessionList';
import { completedSessions } from './src/data/sessions';

const App = () => (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="dark-content" />
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Animated API Performance</Text>
        <Text style={styles.title}>Native Driver Focus Timer</Text>
        <Text style={styles.subtitle}>
          A smooth progress animation paired with a virtualized FlatList.
        </Text>
      </View>

      <AnimatedTimer />
      <SessionList sessions={completedSessions} />
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  eyebrow: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  header: {
    marginBottom: 16,
  },
  safeArea: {
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
  },
  title: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 4,
  },
});

export default App;
