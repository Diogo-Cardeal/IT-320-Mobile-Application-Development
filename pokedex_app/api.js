import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const TYPE_LIST = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark',
  'steel', 'fairy',
];

const GENERATION_MAP = {
  '1': 'generation-i',    'i': 'generation-i',
  '2': 'generation-ii',   'ii': 'generation-ii',
  '3': 'generation-iii',  'iii': 'generation-iii',
  '4': 'generation-iv',   'iv': 'generation-iv',
  '5': 'generation-v',    'v': 'generation-v',
  '6': 'generation-vi',   'vi': 'generation-vi',
  '7': 'generation-vii',  'vii': 'generation-vii',
  '8': 'generation-viii', 'viii': 'generation-viii',
  '9': 'generation-ix',   'ix': 'generation-ix',
};

const fetchJson = async (url, options) => {
  let response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    const networkErr = new Error('Network error — check your internet connection and try again.');
    networkErr.status = 0;
    throw networkErr;
  }

  const rawText = await response.text().catch(() => '');
  let body = null;
  if (rawText) {
    try {
      body = JSON.parse(rawText);
    } catch {
      body = null;
    }
  }

  if (response.ok) {
    return body;
  }

  const apiMessage =
    body?.msg ||
    body?.message ||
    body?.error_description ||
    body?.error ||
    (rawText && rawText.length < 200 ? rawText : '');

  let message;
  switch (response.status) {
    case 400:
      message = apiMessage || 'Bad request — please check the input and try again.';
      break;
    case 401:
      message = apiMessage || 'You are not signed in. Please log in and try again.';
      break;
    case 403:
      message = apiMessage || 'Permission denied for this action.';
      break;
    case 404:
      message = 'Not found — check the name or number and try again.';
      break;
    case 409:
      message = apiMessage || 'That resource already exists.';
      break;
    case 422:
      message = apiMessage || 'Invalid data. Please check the values you entered.';
      break;
    case 429:
      message = 'Too many requests — slow down and try again in a moment.';
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      message = 'Server error — please try again later.';
      break;
    default:
      message = apiMessage || `Request failed (${response.status}).`;
  }

  const error = new Error(message);
  error.status = response.status;
  throw error;
};

export async function getPokemon(name) {
  return await fetchJson(`${POKEAPI_BASE}/pokemon/${encodeURIComponent(name.toString().toLowerCase())}`);
}

export async function getPokemonSpecies(id) {
  return await fetchJson(`${POKEAPI_BASE}/pokemon-species/${encodeURIComponent(id.toString().toLowerCase())}`);
}

export async function getGeneration(id) {
  const key = id.toString().trim().toLowerCase().replace(/^generation-/, '');
  const slug = GENERATION_MAP[key] || `generation-${key}`;
  return await fetchJson(`${POKEAPI_BASE}/generation/${slug}`);
}

export async function getTypeList(typeName) {
  return await fetchJson(`${POKEAPI_BASE}/type/${encodeURIComponent(typeName.toString().toLowerCase())}`);
}

export async function getMoveDetails(moveName) {
  return await fetchJson(`${POKEAPI_BASE}/move/${encodeURIComponent(moveName.toString().toLowerCase())}`);
}

export function calculateStats(baseStats, level) {
  const IV = 15;
  const EV = 0;
  const nature = 1.0;
  return baseStats.reduce((acc, stat) => {
    const base = stat.base_stat;
    const key = stat.stat.name === 'hp'
      ? 'HP'
      : stat.stat.name === 'attack'
      ? 'Attack'
      : stat.stat.name === 'defense'
      ? 'Defense'
      : stat.stat.name === 'special-attack'
      ? 'Sp. Atk'
      : stat.stat.name === 'special-defense'
      ? 'Sp. Def'
      : stat.stat.name === 'speed'
      ? 'Speed'
      : stat.stat.name;

    const value = key === 'HP'
      ? Math.floor(((2 * base + IV + Math.floor(EV / 4)) * level) / 100) + level + 10
      : Math.floor((Math.floor(((2 * base + IV + Math.floor(EV / 4)) * level) / 100) + 5) * nature);

    return { ...acc, [key]: value };
  }, {});
}

const friendlyAuthError = (err) => {
  const text = (err.message || '').toLowerCase();
  if (text.includes('invalid login credentials') || text.includes('invalid_credentials')) {
    return 'Email or password is incorrect.';
  }
  if (text.includes('user already registered') || text.includes('already exists')) {
    return 'An account with this email already exists. Please log in instead.';
  }
  if (text.includes('password should be at least')) {
    return 'Password is too short. Use at least 6 characters.';
  }
  if (text.includes('weak_password') || text.includes('password is too weak')) {
    return 'Password is too weak. Use a longer or more complex password.';
  }
  if (text.includes('unable to validate email') || text.includes('invalid email') || text.includes('email_address_invalid')) {
    return 'That email address looks invalid.';
  }
  if (text.includes('email not confirmed') || text.includes('email_not_confirmed')) {
    return 'Please confirm your email address before logging in.';
  }
  if (text.includes('signups not allowed') || text.includes('signup_disabled')) {
    return 'Sign-ups are currently disabled for this project.';
  }
  if (text.includes('rate limit') || text.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  return err.message;
};

export async function signUp(email, password) {
  try {
    return await fetchJson(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    const friendly = new Error(friendlyAuthError(err));
    friendly.status = err.status;
    throw friendly;
  }
}

export async function signIn(email, password) {
  try {
    return await fetchJson(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    const friendly = new Error(friendlyAuthError(err));
    friendly.status = err.status;
    throw friendly;
  }
}

export async function getAuthUser(accessToken) {
  return await fetchJson(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function saveTeam({ userId, accessToken, name, slots, verdict, totals }) {
  return await fetchJson(`${SUPABASE_URL}/rest/v1/teams`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ user_id: userId, name, slots, verdict, totals }),
  });
}

export async function getSavedTeams(userId, accessToken) {
  return await fetchJson(
    `${SUPABASE_URL}/rest/v1/teams?user_id=eq.${encodeURIComponent(userId)}&select=*`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

export async function deleteTeam(teamId, accessToken) {
  return await fetchJson(
    `${SUPABASE_URL}/rest/v1/teams?id=eq.${encodeURIComponent(teamId)}`,
    {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

export function getKnownTypes() {
  return TYPE_LIST;
}

export async function getEffectivenessForTypes(types) {
  const multipliers = TYPE_LIST.reduce((acc, type) => ({ ...acc, [type]: 1 }), {});

  const typeInfo = await Promise.all(types.map((type) => getTypeList(type)));
  typeInfo.forEach((typeData) => {
    typeData.damage_relations.double_damage_from.forEach((typeItem) => {
      multipliers[typeItem.name] *= 2;
    });
    typeData.damage_relations.half_damage_from.forEach((typeItem) => {
      multipliers[typeItem.name] *= 0.5;
    });
    typeData.damage_relations.no_damage_from.forEach((typeItem) => {
      multipliers[typeItem.name] *= 0;
    });
  });

  return multipliers;
}

export async function getOffensiveEffectiveness(attackerTypes) {
  const typeInfo = await Promise.all(attackerTypes.map((type) => getTypeList(type)));

  const perType = typeInfo.map((typeData) => {
    const m = TYPE_LIST.reduce((acc, type) => ({ ...acc, [type]: 1 }), {});
    typeData.damage_relations.double_damage_to.forEach((t) => { m[t.name] *= 2; });
    typeData.damage_relations.half_damage_to.forEach((t) => { m[t.name] *= 0.5; });
    typeData.damage_relations.no_damage_to.forEach((t) => { m[t.name] *= 0; });
    return m;
  });

  return TYPE_LIST.reduce((acc, defenderType) => {
    acc[defenderType] = Math.max(...perType.map((m) => m[defenderType]));
    return acc;
  }, {});
}
