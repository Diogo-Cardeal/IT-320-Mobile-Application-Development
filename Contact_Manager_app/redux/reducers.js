import { ADD_CONTACT, DELETE_CONTACT, SET_FILTER } from './actions';

const initialState = {
  contacts: [
    { id: '1', name: 'Avery Johnson', phone: '555-0134' },
    { id: '2', name: 'Mia Chen', phone: '555-0178' },
  ],
  filter: '',
};

// The reducer takes the current state and an action, and returns a new state.
// It must be a pure function: same inputs always produce the same output.
// Never mutate state directly; always return a new object or array.
const contactsReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_CONTACT:
      // Return a new state object with the new contact added to a new array.
      // Using spread instead of push() keeps the original state immutable.
      return {
        ...state,
        contacts: [...state.contacts, action.payload],
      };

    case DELETE_CONTACT:
      // Filter creates a new array without the deleted contact.
      return {
        ...state,
        contacts: state.contacts.filter((contact) => contact.id !== action.payload),
      };

    case SET_FILTER:
      // Store the search text in Redux so connected components update together.
      return {
        ...state,
        filter: action.payload,
      };

    default:
      // Always return current state for unknown actions.
      return state;
  }
};

export default contactsReducer;
