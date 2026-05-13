import React from 'react';
import { SafeAreaView, StatusBar, Text, View } from 'react-native';
import { Provider } from 'react-redux';
import store from './redux/store';
import ContactForm from './screens/ContactForm';
import ContactList from './screens/ContactList';
import SearchBar from './screens/SearchBar';
import styles from './styles';

const ContactManager = () => (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="dark-content" />
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contact Manager</Text>
      </View>
      <ContactForm />
      <SearchBar />
      <ContactList />
    </View>
  </SafeAreaView>
);

const App = () => (
  // Provider wraps the app and makes the Redux store available to connected components.
  <Provider store={store}>
    <ContactManager />
  </Provider>
);

export default App;
