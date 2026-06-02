import { connect } from 'react-redux';
import ContactTools from '../components/ContactTools';
import { clearAll, fetchContacts, setFilter } from '../redux/actions';

const mapStateToProps = (state) => ({
  filter: state.contacts.filter,
  loading: state.contacts.loading,
});

const mapDispatchToProps = {
  onClearAll: clearAll,
  onFilterChange: setFilter,
  onRefresh: fetchContacts,
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactTools);
