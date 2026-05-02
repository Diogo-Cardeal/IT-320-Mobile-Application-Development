import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './AuthContext';
import SearchScreen from './screens/SearchScreen';
import DetailScreen from './screens/DetailScreen';
import CombatScreen from './screens/CombatScreen';
import TeamScreen from './screens/TeamScreen';
import AuthModal from './screens/AuthModal';

const Tab = createBottomTabNavigator();
const SearchStackNav = createNativeStackNavigator();
const CombatStackNav = createNativeStackNavigator();
const TeamStackNav = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#02082b',
    card: '#07162e',
    text: '#f8f8f2',
    border: '#0f1f3a',
    notification: '#ff2d55',
  },
};

function HeaderAccountButton() {
  const { user, openAuth } = useAuth();
  const iconName = user ? 'person-circle' : 'person-circle-outline';
  const iconColor = user ? '#66bb6a' : '#ff2d55';
  return (
    <TouchableOpacity onPress={openAuth} style={styles.accountButton}>
      <Ionicons name={iconName} size={28} color={iconColor} />
    </TouchableOpacity>
  );
}

const headerOptions = {
  headerStyle: {
    backgroundColor: '#02082b',
    shadowColor: 'transparent',
  },
  headerTintColor: '#f8f8f2',
  headerTitleStyle: {
    fontFamily: 'Courier',
    fontSize: 18,
  },
  headerRight: () => <HeaderAccountButton />,
};

function SearchStack() {
  return (
    <SearchStackNav.Navigator screenOptions={headerOptions}>
      <SearchStackNav.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
      <SearchStackNav.Screen name="Detail" component={DetailScreen} options={{ title: 'Pokémon Detail' }} />
    </SearchStackNav.Navigator>
  );
}

function CombatStack() {
  return (
    <CombatStackNav.Navigator screenOptions={headerOptions}>
      <CombatStackNav.Screen name="Combat" component={CombatScreen} options={{ title: 'Combat' }} />
    </CombatStackNav.Navigator>
  );
}

function TeamStack() {
  return (
    <TeamStackNav.Navigator screenOptions={headerOptions}>
      <TeamStackNav.Screen name="Team" component={TeamScreen} options={{ title: 'Team Builder' }} />
    </TeamStackNav.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#ff2d55',
        tabBarInactiveTintColor: '#9aa5b9',
        tabBarStyle: {
          backgroundColor: '#07162e',
          borderTopColor: '#0f1f3a',
          paddingBottom: 4,
          height: 62,
        },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            SearchTab: 'search',
            CombatTab: 'flash',
            TeamTab: 'people',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="SearchTab" component={SearchStack} options={{ title: 'Search' }} />
      <Tab.Screen name="CombatTab" component={CombatStack} options={{ title: 'Combat' }} />
      <Tab.Screen name="TeamTab" component={TeamStack} options={{ title: 'Team' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={theme}>
        <StatusBar style="light" />
        <MainTabs />
        <AuthModal />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  accountButton: {
    marginRight: 10,
  },
});
