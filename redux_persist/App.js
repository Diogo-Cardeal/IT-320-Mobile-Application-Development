import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import ContactFormContainer from './src/containers/ContactFormContainer';
import ContactListContainer from './src/containers/ContactListContainer';
import ContactToolsContainer from './src/containers/ContactToolsContainer';
import { persistor, store } from './src/redux/store';

const RehydrateLoader = () => (
  <View style={styles.loader}>
    <ActivityIndicator size="large" color="#2563eb" />
    <Text style={styles.loaderText}>Restoring saved contacts...</Text>
  </View>
);

const AppContent = () => (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="dark-content" />
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Lesson 12 Assignment 2</Text>
        <Text style={styles.title}>Async Redux Contacts</Text>
        <Text style={styles.subtitle}>
          RandomUser API data with Redux Thunk and Redux Persist.
        </Text>
      </View>

      <ContactFormContainer />
      <ContactToolsContainer />
      <ContactListContainer />
    </View>
  </SafeAreaView>
);

const App = () => (
  <Provider store={store}>
    <PersistGate loading={<RehydrateLoader />} persistor={persistor}>
      <AppContent />
    </PersistGate>
  </Provider>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  eyebrow: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  header: {
    marginBottom: 16,
  },
  loader: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loaderText: {
    color: '#475569',
    fontSize: 15,
    marginTop: 12,
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
