export const ADD_CONTACT = 'ADD_CONTACT';
export const DELETE_CONTACT = 'DELETE_CONTACT';
export const SET_FILTER = 'SET_FILTER';

// Action creator - a function that returns an action object with a type and payload.
// Dispatching this action is the only way to add a contact to the Redux store.
export const addContact = (name, phone) => ({
  type: ADD_CONTACT,
  payload: {
    id: Date.now().toString(),
    name: name.trim(),
    phone: phone.trim(),
  },
});

// This action removes one contact by id when the user long-presses a row.
export const deleteContact = (id) => ({
  type: DELETE_CONTACT,
  payload: id,
});

// This action keeps the search filter in Redux so the list can react to it.
export const setFilter = (text) => ({
  type: SET_FILTER,
  payload: text,
});
