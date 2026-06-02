export const FETCH_CONTACTS_LOADING = 'FETCH_CONTACTS_LOADING';
export const FETCH_CONTACTS_SUCCESS = 'FETCH_CONTACTS_SUCCESS';
export const FETCH_CONTACTS_ERROR = 'FETCH_CONTACTS_ERROR';
export const ADD_CONTACT = 'ADD_CONTACT';
export const DELETE_CONTACT = 'DELETE_CONTACT';
export const SET_FILTER = 'SET_FILTER';
export const CLEAR_ALL = 'CLEAR_ALL';

const RANDOM_USER_URL = 'https://randomuser.me/api/?results=20&nat=us,ca,gb,au';

const normalizeUser = (user) => ({
  id: user.login.uuid || `${user.email}-${user.cell}`,
  name: `${user.name.first} ${user.name.last}`,
  email: user.email,
  phone: user.phone,
  location: `${user.location.city}, ${user.location.country}`,
  thumbnail: user.picture.thumbnail,
  isLocal: false,
});

// This thunk fetches real API data and dispatches loading, success, or error.
export const fetchContacts = () => async (dispatch) => {
  dispatch({ type: FETCH_CONTACTS_LOADING });

  try {
    const response = await fetch(RANDOM_USER_URL);

    if (!response.ok) {
      throw new Error('The contact API did not respond successfully.');
    }

    const data = await response.json();

    dispatch({
      type: FETCH_CONTACTS_SUCCESS,
      payload: {
        contacts: data.results.map(normalizeUser),
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    dispatch({
      type: FETCH_CONTACTS_ERROR,
      payload: error.message || 'Unable to fetch contacts right now.',
    });
  }
};

export const addContact = ({ name, phone, email }) => ({
  type: ADD_CONTACT,
  payload: {
    id: `local-${Date.now()}`,
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim() || 'local contact',
    location: 'Added locally',
    thumbnail: null,
    isLocal: true,
  },
});

export const deleteContact = (id) => ({
  type: DELETE_CONTACT,
  payload: id,
});

export const setFilter = (text) => ({
  type: SET_FILTER,
  payload: text,
});

export const clearAll = () => ({
  type: CLEAR_ALL,
});
