// App.js - Main component for the Contact List App
// Lesson 6 - Assignment 2

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  SectionList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// ─── Hardcoded contact data (at least 8 contacts) ─────────────────────────────
const contacts = [
  { id: '1',  name: 'Alice Johnson',  phone: '555-0101' },
  { id: '2',  name: 'Bob Martinez',   phone: '555-0102' },
  { id: '3',  name: 'Carol White',    phone: '555-0103' },
  { id: '4',  name: 'David Lee',      phone: '555-0104' },
  { id: '5',  name: 'Eva Brown',      phone: '555-0105' },
  { id: '6',  name: 'Frank Wilson',   phone: '555-0106' },
  { id: '7',  name: 'Grace Kim',      phone: '555-0107' },
  { id: '8',  name: 'Henry Davis',    phone: '555-0108' },
  { id: '9',  name: 'Isla Nguyen',    phone: '555-0109' },
  { id: '10', name: 'James Turner',   phone: '555-0110' },
];

// ─── Helper: build SectionList data from a flat contacts array ─────────────────
// Groups contacts alphabetically by the first letter of their name.
const buildSections = (list) => {
  // Create an object keyed by first letter, e.g. { A: [...], B: [...] }
  const grouped = list.reduce((acc, contact) => {
    const letter = contact.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(contact);
    return acc;
  }, {});

  // Convert to the [ { title: 'A', data: [...] } ] shape SectionList expects
  return Object.keys(grouped)
    .sort()
    .map((letter) => ({ title: letter, data: grouped[letter] }));
};

// ─── Helper: generate initials avatar background color ─────────────────────────
// Maps the first letter to one of several accent colors for visual variety.
const avatarColor = (name) => {
  const colors = ['#4F6EF7', '#9B59B6', '#16A085', '#E67E22', '#C0392B', '#2980B9'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// ─── Main App component ────────────────────────────────────────────────────────
export default function App() {
  // Stores the current text typed in the search bar (controlled component)
  const [query, setQuery] = useState('');

  // Filters contacts whose name includes the search query (case-insensitive)
  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  // Build grouped sections for the SectionList from the filtered results
  const sections = buildSections(filtered);

  // ── Renders a single contact row ────────────────────────────────────────────
  const renderItem = ({ item, index }) => {
    // Alternate row background: even rows are slightly tinted
    const rowStyle = [
      styles.row,
      index % 2 === 0 ? styles.rowEven : styles.rowOdd,
    ];

    return (
      <View style={rowStyle}>
        {/* Avatar circle showing the contact's initials */}
        <View style={[styles.avatar, { backgroundColor: avatarColor(item.name) }]}>
          <Text style={styles.avatarText}>
            {item.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
          </Text>
        </View>

        {/* Contact details: name and phone number */}
        <View style={styles.contactInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
        </View>
      </View>
    );
  };

  // ── Renders the alphabetical section header (e.g. "A", "B", "C") ────────────
  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  // ── Renders the empty state when no contacts match the search query ──────────
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyText}>No contacts found</Text>
      <Text style={styles.emptySubtext}>Try a different name</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── App title ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.title}>My Contacts</Text>
        {/* Contact count: shows how many contacts are currently visible */}
        <Text style={styles.countBadge}>
          Showing {filtered.length} of {contacts.length} contacts
        </Text>
      </View>

      {/* ── Search bar (controlled TextInput) ──────────────────────────────── */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="#999"
          // onChangeText updates query state on every keystroke (real-time filtering)
          onChangeText={(text) => setQuery(text)}
          value={query}
          clearButtonMode="while-editing"  // iOS: shows × button while typing
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* ── Contact list grouped alphabetically using SectionList ──────────── */}
      <SectionList
        sections={sections}
        // keyExtractor gives each row a unique key so React can track changes
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={renderEmpty}
        // A thin separator line between rows
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={filtered.length === 0 && styles.emptyList}
        stickySectionHeadersEnabled={true}  // keeps letter headers visible while scrolling
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Outer container — fills the whole screen
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDF0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: 0.3,
  },
  // Shows "Showing X of Y contacts" below the title
  countBadge: {
    marginTop: 4,
    fontSize: 13,
    color: '#888',
  },

  // ── Search bar ────────────────────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1A1A2E',
  },

  // ── Alphabetical section header (e.g. "A") ────────────────────────────────
  sectionHeader: {
    backgroundColor: '#EDEEF5',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#DCDDE8',
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A5A8A',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // ── Contact row ───────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  // Alternating row colors for readability
  rowEven: {
    backgroundColor: '#FFFFFF',
  },
  rowOdd: {
    backgroundColor: '#FAFAFA',
  },

  // ── Avatar circle ─────────────────────────────────────────────────────────
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // ── Contact name and phone ────────────────────────────────────────────────
  contactInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: '#777',
  },

  // ── Thin line between rows ────────────────────────────────────────────────
  separator: {
    height: 0.5,
    backgroundColor: '#EDEDF0',
    marginLeft: 78,  // indented to align under the contact text (past avatar)
  },

  // ── Empty state (no results) ──────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
