import { createStore } from 'redux';
import contactsReducer from './reducers';

// createStore() creates the Redux store from the root reducer.
// Provider in App.js passes this store to every connected component.
const store = createStore(contactsReducer);

export default store;
