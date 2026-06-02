import { connect } from 'react-redux';
import ContactForm from '../components/ContactForm';
import { addContact } from '../redux/actions';

const mapDispatchToProps = {
  onAddContact: addContact,
};

export default connect(null, mapDispatchToProps)(ContactForm);
