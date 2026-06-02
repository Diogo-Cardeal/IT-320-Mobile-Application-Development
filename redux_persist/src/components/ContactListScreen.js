import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return 'Not fetched yet';
  }

  return new Date(timestamp).toLocaleString();
};

const getInitials = (name) => name
  .split(' ')
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase();

const ContactAvatar = ({ contact }) => {
  if (contact.thumbnail) {
    return <Image source={{ uri: contact.thumbnail }} style={styles.avatarImage} />;
  }

  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitials}>{getInitials(contact.name)}</Text>
    </View>
  );
};

const ContactRow = ({ contact, onDeleteContact }) => (
  <View style={styles.card}>
    <ContactAvatar contact={contact} />

    <View style={styles.contactBody}>
      <View style={styles.nameRow}>
        <Text numberOfLines={1} style={styles.contactName}>
          {contact.name}
        </Text>
        {contact.isLocal && <Text style={styles.localBadge}>Local</Text>}
      </View>
      <Text numberOfLines={1} style={styles.contactMeta}>
        {contact.phone}
      </Text>
      <Text numberOfLines={1} style={styles.contactMeta}>
        {contact.email}
      </Text>
      <Text numberOfLines={1} style={styles.contactLocation}>
        {contact.location}
      </Text>
    </View>

    <Pressable
      onPress={() => onDeleteContact(contact.id)}
      style={styles.deleteButton}
    >
      <Text style={styles.deleteButtonText}>Delete</Text>
    </Pressable>
  </View>
);

const ContactListScreen = ({
  contacts,
  error,
  filter,
  lastUpdated,
  loading,
  onDeleteContact,
  onRefresh,
  totalCount,
}) => {
  const isInitialLoading = loading && contacts.length === 0;
  const emptyMessage = filter
    ? 'No saved contacts match that search.'
    : 'No contacts saved. Add one locally or refresh the API.';

  return (
    <View style={styles.section}>
      <View style={styles.listHeader}>
        <View>
          <Text style={styles.sectionTitle}>Saved Contacts</Text>
          <Text style={styles.lastUpdated}>
            Last updated: {formatTimestamp(lastUpdated)}
          </Text>
        </View>
        <Text style={styles.countText}>
          {contacts.length} of {totalCount}
        </Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Fetch failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={onRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      )}

      {isInitialLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Fetching contacts...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={contacts.length === 0 && styles.emptyList}
          data={contacts}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>{emptyMessage}</Text>}
          refreshControl={(
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          )}
          renderItem={({ item }) => (
            <ContactRow contact={item} onDeleteContact={onDeleteContact} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: '#bfdbfe',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarImage: {
    borderRadius: 22,
    height: 44,
    width: 44,
  },
  avatarInitials: {
    color: '#1e3a8a',
    fontSize: 14,
    fontWeight: '800',
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 12,
  },
  contactBody: {
    flex: 1,
    minWidth: 0,
  },
  contactLocation: {
    color: '#2563eb',
    fontSize: 12,
    marginTop: 2,
  },
  contactMeta: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  contactName: {
    color: '#0f172a',
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  countText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 15,
    lineHeight: 21,
    paddingHorizontal: 18,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  errorTitle: {
    color: '#7f1d1d',
    fontSize: 15,
    fontWeight: '800',
  },
  lastUpdated: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 3,
  },
  listHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  loadingBox: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 36,
  },
  loadingText: {
    color: '#475569',
    fontSize: 15,
    marginTop: 10,
  },
  localBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    color: '#166534',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  retryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#dc2626',
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  section: {
    flex: 1,
    minHeight: 0,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '800',
  },
});

export default ContactListScreen;
