import React from 'react';
import { TextInput, View } from 'react-native';
import { connect } from 'react-redux';
import { setFilter } from '../redux/actions';
import styles from '../styles';

const SearchBar = ({ filter, setFilter }) => (
  <View style={styles.searchWrap}>
    <TextInput
      style={styles.searchInput}
      value={filter}
      onChangeText={setFilter}
      placeholder="Search contacts"
      clearButtonMode="while-editing"
    />
  </View>
);

const mapStateToProps = (state) => ({
  filter: state.filter,
});

const mapDispatchToProps = {
  setFilter,
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
