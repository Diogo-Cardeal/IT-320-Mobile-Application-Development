import {
  ADD_CONTACT,
  CLEAR_ALL,
  DELETE_CONTACT,
  FETCH_CONTACTS_ERROR,
  FETCH_CONTACTS_LOADING,
  FETCH_CONTACTS_SUCCESS,
  SET_FILTER,
} from './actions';

export const initialContactsState = {
  contacts: [],
  loading: false,
  error: null,
  filter: '',
  lastUpdated: null,
  hasFetched: false,
};

const contactsReducer = (state = initialContactsState, action) => {
  switch (action.type) {
    case FETCH_CONTACTS_LOADING:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_CONTACTS_SUCCESS:
      return {
        ...state,
        contacts: action.payload.contacts,
        loading: false,
        error: null,
        lastUpdated: action.payload.lastUpdated,
        hasFetched: true,
      };

    case FETCH_CONTACTS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        hasFetched: true,
      };

    case ADD_CONTACT:
      return {
        ...state,
        contacts: [action.payload, ...state.contacts],
        error: null,
        hasFetched: true,
      };

    case DELETE_CONTACT:
      return {
        ...state,
        contacts: state.contacts.filter((contact) => contact.id !== action.payload),
      };

    case SET_FILTER:
      return {
        ...state,
        filter: action.payload,
      };

    case CLEAR_ALL:
      return {
        ...initialContactsState,
        hasFetched: true,
      };

    default:
      return state;
  }
};

export default contactsReducer;
