import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { deleteContact } from '../redux/actions';
import styles from '../styles';

const ContactList = ({ contacts, deleteContact }) => {
  const renderContact = ({ item }) => (
    <TouchableOpacity
      style={styles.contactRow}
      onLongPress={() => deleteContact(item.id)}
      delayLongPress={350}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.contactDetails}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phone}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.listSection}>
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Contacts</Text>
        <Text style={styles.countText}>{contacts.length}</Text>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        ListEmptyComponent={<Text style={styles.emptyText}>No contacts match your search.</Text>}
        contentContainerStyle={contacts.length === 0 ? styles.emptyList : null}
      />
    </View>
  );
};

// mapStateToProps tells connect() which store data this component needs.
// The list receives sorted and filtered contacts, not the whole Redux state.
const mapStateToProps = (state) => {
  const filterText = state.filter.trim().toLowerCase();

  const filteredContacts = state.contacts.filter((contact) => {
    const nameMatches = contact.name.toLowerCase().includes(filterText);
    const phoneMatches = contact.phone.toLowerCase().includes(filterText);
    return nameMatches || phoneMatches;
  });

  return {
    contacts: [...filteredContacts].sort((a, b) => a.name.localeCompare(b.name)),
  };
};

const mapDispatchToProps = {
  deleteContact,
};

// connect() passes selected state and bound action creators as props.
export default connect(mapStateToProps, mapDispatchToProps)(ContactList);
