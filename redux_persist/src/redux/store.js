import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import { thunk } from 'redux-thunk';
import contactsReducer from './reducers';

const rootReducer = combineReducers({
  contacts: contactsReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['contacts'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// applyMiddleware(thunk) lets Redux dispatch async action creator functions.
// redux-persist saves the Redux state to AsyncStorage and rehydrates on launch.
export const store = createStore(persistedReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);
