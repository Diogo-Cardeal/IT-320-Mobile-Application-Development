import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import ContactListScreen from '../components/ContactListScreen';
import { deleteContact, fetchContacts } from '../redux/actions';

const getVisibleContacts = (contacts, filter) => {
  const normalizedFilter = filter.trim().toLowerCase();

  if (!normalizedFilter) {
    return contacts;
  }

  return contacts.filter((contact) => {
    const searchableText = `${contact.name} ${contact.email} ${contact.phone} ${contact.location}`;

    return searchableText.toLowerCase().includes(normalizedFilter);
  });
};

const ContactListContainer = ({
  fetchContacts,
  hasFetched,
  loading,
  ...screenProps
}) => {
  useEffect(() => {
    if (!hasFetched && !loading) {
      fetchContacts();
    }
  }, [fetchContacts, hasFetched, loading]);

  return (
    <ContactListScreen
      {...screenProps}
      loading={loading}
      onRefresh={fetchContacts}
    />
  );
};

const mapStateToProps = (state) => {
  const {
    contacts,
    error,
    filter,
    hasFetched,
    lastUpdated,
    loading,
  } = state.contacts;

  return {
    contacts: getVisibleContacts(contacts, filter),
    error,
    filter,
    hasFetched,
    lastUpdated,
    loading,
    totalCount: contacts.length,
  };
};

const mapDispatchToProps = {
  fetchContacts,
  onDeleteContact: deleteContact,
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactListContainer);
