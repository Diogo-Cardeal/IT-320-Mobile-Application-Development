import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// ─────────────────────────────────────────────
// Single state object holds all form field values
// ─────────────────────────────────────────────
const initialForm = { name: '', generation: '' };

// Maps user input → PokeAPI generation slug
const GENERATION_MAP = {
  '1': 'generation-i',   'i': 'generation-i',
  '2': 'generation-ii',  'ii': 'generation-ii',
  '3': 'generation-iii', 'iii': 'generation-iii',
  '4': 'generation-iv',  'iv': 'generation-iv',
  '5': 'generation-v',   'v': 'generation-v',
  '6': 'generation-vi',  'vi': 'generation-vi',
  '7': 'generation-vii', 'vii': 'generation-vii',
  '8': 'generation-viii','viii': 'generation-viii',
  '9': 'generation-ix',  'ix': 'generation-ix',
};

// Type badge colors
const TYPE_COLORS = {
  fire: '#FF6B35',
  water: '#4FC3F7',
  grass: '#66BB6A',
  electric: '#FFD600',
  psychic: '#F06292',
  ice: '#80DEEA',
  dragon: '#7E57C2',
  dark: '#4A4A5A',
  fairy: '#F8BBD0',
  normal: '#A8A878',
  fighting: '#C03028',
  flying: '#90CAF9',
  poison: '#AB47BC',
  ground: '#E0C068',
  rock: '#B8A038',
  bug: '#A8B820',
  ghost: '#705898',
  steel: '#B8B8D0',
};

const getTypeColor = (type) => TYPE_COLORS[type?.toLowerCase()] || '#9E9E9E';

// Capitalize helper
const cap = (s) => s && s.charAt(0).toUpperCase() + s.slice(1);

// Pad Pokémon ID with leading zeros
const padId = (id) => String(id).padStart(3, '0');

// Stat bar component
const StatBar = ({ label, value }) => {
  const maxStat = 255;
  const pct = Math.min((value / maxStat) * 100, 100);
  const color = value < 50 ? '#EF5350' : value < 90 ? '#FFB300' : '#43A047';
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statBarBg}>
        <View style={[styles.statBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────
// Main App Component
// ─────────────────────────────────────────────
export default function App() {
  const [form, setForm] = useState(initialForm);       // Single state object for all inputs
  const [errors, setErrors] = useState({});            // Inline validation errors
  const [loading, setLoading] = useState(false);       // Loading state
  const [apiError, setApiError] = useState(null);      // API error state
  const [pokemon, setPokemon] = useState(null);        // Single Pokémon result
  const [species, setSpecies] = useState(null);        // Species data (flavor text + generation)
  const [genList, setGenList] = useState(null);        // Full generation roster

  // ── Shared change handler — updates the correct field by key
  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    if (errors[key]) setErrors({ ...errors, [key]: null });
  };

  // ── Input validation
  // Name is only required when generation is also empty
  const validate = () => {
    const newErrors = {};
    const trimmedName = form.name.trim();
    const genInput = form.generation.trim().toLowerCase();

    if (!trimmedName && !genInput) {
      newErrors.name = 'Enter a Pokémon name/number, or a generation to browse.';
    } else if (trimmedName && !/^[a-zA-Z0-9\-]+$/.test(trimmedName)) {
      newErrors.name = 'Only letters, numbers, and hyphens allowed.';
    }
    if (genInput && !GENERATION_MAP[genInput]) {
      newErrors.generation = 'Enter a number (1–9) or roman numeral (I–IX).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit handler — branches on whether name is filled
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError(null);
    setPokemon(null);
    setSpecies(null);
    setGenList(null);

    const trimmedName = form.name.trim().toLowerCase();
    const genInput = form.generation.trim().toLowerCase();

    try {
      // ── BRANCH A: No name → fetch full generation roster
      if (!trimmedName && genInput) {
        const slug = GENERATION_MAP[genInput];
        const res = await fetch(`https://pokeapi.co/api/v2/generation/${slug}`);
        if (!res.ok) throw new Error('Could not load generation data. Please try again.');
        const data = await res.json();

        // Sort by name alphabetically, attach sprite URLs
        const sorted = [...data.pokemon_species]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((p) => ({
            name: p.name,
            // Derive ID from the species URL e.g. .../pokemon-species/4/
            id: parseInt(p.url.split('/').filter(Boolean).pop(), 10),
          }));

        setGenList({
          label: slug.replace('generation-', 'Generation ').toUpperCase(),
          count: sorted.length,
          pokemon: sorted,
        });
        return;
      }

      // ── BRANCH B: Name provided → single Pokémon lookup
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${trimmedName}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error(`"${cap(trimmedName)}" not found. Check the name or number!`);
        throw new Error('Something went wrong. Please try again.');
      }
      const data = await res.json();
      setPokemon(data);

      // Fetch species for flavor text + generation check
      try {
        const speciesRes = await fetch(data.species.url);
        const speciesData = await speciesRes.json();

        // Generation filter — check before showing result
        if (genInput) {
          const expectedSlug = GENERATION_MAP[genInput];
          const actualSlug = speciesData.generation?.name;
          if (actualSlug !== expectedSlug) {
            setApiError(`${cap(data.name)} is not from Generation ${genInput.toUpperCase()}. It's from ${actualSlug?.replace('generation-', 'Gen ').toUpperCase()}.`);
            setPokemon(null);
            return;
          }
        }

        const entry = speciesData.flavor_text_entries?.find(
          (e) => e.language.name === 'en'
        );
        setSpecies({
          text: entry?.flavor_text?.replace(/\f|\n/g, ' ') || '',
          generation: speciesData.generation?.name || '',
        });
      } catch (_) {
        // Non-critical
      }
    } catch (e) {
      setApiError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Clear everything
  const handleClear = () => {
    setForm(initialForm);
    setErrors({});
    setApiError(null);
    setPokemon(null);
    setSpecies(null);
    setGenList(null);
  };

  // ── Determine accent color from primary type
  const accentColor = pokemon
    ? getTypeColor(pokemon.types[0]?.type?.name)
    : '#CC0000';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header */}
          <View style={styles.header}>
            <View style={styles.headerLens}>
              <View style={styles.lensInner} />
            </View>
            <Text style={styles.title}>POKÉDEX</Text>
            <Text style={styles.subtitle}>National Pokémon Database</Text>
          </View>

          {/* ── Form Card */}
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>POKÉMON NAME OR # (optional if browsing by gen)</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="e.g. pikachu or 25 — leave blank to browse"
              placeholderTextColor="#666"
              value={form.name}
              onChangeText={(v) => handleChange('name', v)}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={handleSubmit}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>FILTER BY GENERATION (optional)</Text>
            <TextInput
              style={[styles.input, errors.generation && styles.inputError]}
              placeholder="e.g. 1, 2 … or I, II …"
              placeholderTextColor="#666"
              value={form.generation}
              onChangeText={(v) => handleChange('generation', v)}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {errors.generation ? <Text style={styles.errorText}>{errors.generation}</Text> : null}

            {/* ── Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.searchBtn, loading && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.searchBtnText}>SEARCH</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearBtn}
                onPress={handleClear}
                activeOpacity={0.7}
              >
                <Text style={styles.clearBtnText}>CLEAR</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Loading */}
          {loading && (
            <Text style={styles.loadingText}>Searching Pokédex database…</Text>
          )}

          {/* ── API Error */}
          {apiError && !loading && (
            <View style={styles.apiErrorCard}>
              <Text style={styles.apiErrorText}>⚠ {apiError}</Text>
            </View>
          )}

          {/* ── Result Card */}
          {pokemon && !loading && (
            <View style={[styles.resultCard, { borderColor: accentColor }]}>
              {/* Top strip */}
              <View style={[styles.resultHeader, { backgroundColor: accentColor }]}>
                <Text style={styles.pokeNumber}>#{padId(pokemon.id)}</Text>
                <Text style={styles.pokeName}>{cap(pokemon.name)}</Text>
              </View>

              {/* Sprite */}
              <View style={styles.spriteContainer}>
                <Image
                  source={{
                    uri:
                      pokemon.sprites?.other?.['official-artwork']?.front_default ||
                      pokemon.sprites?.front_default,
                  }}
                  style={styles.sprite}
                  resizeMode="contain"
                />
              </View>

              {/* Types */}
              <View style={styles.typesRow}>
                {pokemon.types.map((t) => (
                  <View
                    key={t.type.name}
                    style={[styles.typeBadge, { backgroundColor: getTypeColor(t.type.name) }]}
                  >
                    <Text style={styles.typeBadgeText}>{t.type.name.toUpperCase()}</Text>
                  </View>
                ))}
              </View>

              {/* Flavor text + generation */}
              {species?.text ? (
                <Text style={styles.flavorText}>"{species.text}"</Text>
              ) : null}
              {species?.generation ? (
                <Text style={styles.generationBadge}>
                  {species.generation.replace('generation-', 'GEN ').toUpperCase()}
                </Text>
              ) : null}

              {/* Physical stats */}
              <View style={styles.physRow}>
                <View style={styles.physBox}>
                  <Text style={styles.physValue}>{(pokemon.height / 10).toFixed(1)} m</Text>
                  <Text style={styles.physLabel}>HEIGHT</Text>
                </View>
                <View style={[styles.physBox, styles.physBorder]}>
                  <Text style={styles.physValue}>{(pokemon.weight / 10).toFixed(1)} kg</Text>
                  <Text style={styles.physLabel}>WEIGHT</Text>
                </View>
                <View style={styles.physBox}>
                  <Text style={styles.physValue}>{pokemon.base_experience ?? '—'}</Text>
                  <Text style={styles.physLabel}>BASE EXP</Text>
                </View>
              </View>

              {/* Base Stats */}
              <Text style={styles.sectionTitle}>BASE STATS</Text>
              <View style={styles.statsContainer}>
                {pokemon.stats.map((s) => (
                  <StatBar
                    key={s.stat.name}
                    label={s.stat.name.replace('special-', 'Sp.').replace('-', ' ').toUpperCase()}
                    value={s.base_stat}
                  />
                ))}
              </View>

              {/* Abilities */}
              <Text style={styles.sectionTitle}>ABILITIES</Text>
              <View style={styles.abilitiesRow}>
                {pokemon.abilities.map((a) => (
                  <View key={a.ability.name} style={styles.abilityTag}>
                    <Text style={styles.abilityText}>
                      {cap(a.ability.name.replace('-', ' '))}
                      {a.is_hidden ? ' (Hidden)' : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Generation Roster */}
          {genList && !loading && (
            <View style={styles.rosterCard}>
              <View style={styles.rosterHeader}>
                <Text style={styles.rosterTitle}>{genList.label}</Text>
                <Text style={styles.rosterCount}>{genList.count} POKÉMON</Text>
              </View>
              <FlatList
                data={genList.pokemon}
                keyExtractor={(item) => item.name}
                numColumns={3}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.rosterItem}>
                    <Image
                      source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png` }}
                      style={styles.rosterSprite}
                      resizeMode="contain"
                    />
                    <Text style={styles.rosterName}>{cap(item.name)}</Text>
                    <Text style={styles.rosterNum}>#{padId(item.id)}</Text>
                  </View>
                )}
              />
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const DARK = '#0d0d1a';
const CARD_BG = '#16213e';
const INPUT_BG = '#0f3460';
const RED = '#CC0000';
const TEXT = '#e0e0e0';
const MUTED = '#8899aa';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 20 },

  // Header
  header: { alignItems: 'center', marginBottom: 24 },
  headerLens: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#4FC3F7',
    borderWidth: 4, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#4FC3F7', shadowOpacity: 0.8, shadowRadius: 12,
  },
  lensInner: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 36, fontWeight: '900',
    color: '#fff', letterSpacing: 6,
  },
  subtitle: { color: MUTED, fontSize: 11, letterSpacing: 3, marginTop: 2 },

  // Form card
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1, borderColor: '#1e3a5f',
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10, elevation: 6,
  },
  fieldLabel: {
    color: MUTED, fontSize: 10, letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    marginBottom: 6,
  },
  input: {
    backgroundColor: INPUT_BG,
    color: TEXT,
    borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    borderWidth: 1, borderColor: '#1e4070',
  },
  inputError: { borderColor: '#EF5350', borderWidth: 1.5 },
  errorText: { color: '#EF5350', fontSize: 11, marginTop: 4, marginLeft: 4 },

  // Buttons
  buttonRow: { flexDirection: 'row', marginTop: 18, gap: 10 },
  searchBtn: {
    flex: 1, backgroundColor: RED,
    paddingVertical: 13, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: RED, shadowOpacity: 0.5, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  searchBtnText: {
    color: '#fff', fontSize: 14, fontWeight: '800',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  clearBtn: {
    paddingVertical: 13, paddingHorizontal: 20,
    borderRadius: 10, borderWidth: 1.5, borderColor: MUTED,
    alignItems: 'center', justifyContent: 'center',
  },
  clearBtnText: {
    color: MUTED, fontSize: 13, fontWeight: '700', letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },

  // Loading
  loadingText: {
    color: MUTED, textAlign: 'center', marginVertical: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 13, letterSpacing: 1,
  },

  // API Error
  apiErrorCard: {
    backgroundColor: '#2d0a0a', borderRadius: 12,
    padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#EF5350',
  },
  apiErrorText: { color: '#EF5350', fontSize: 13, textAlign: 'center' },

  // Result card
  resultCard: {
    backgroundColor: CARD_BG, borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 14, elevation: 8,
  },
  resultHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12,
  },
  pokeNumber: {
    color: 'rgba(0,0,0,0.4)', fontSize: 14, fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    letterSpacing: 2,
  },
  pokeName: {
    color: '#fff', fontSize: 22, fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    letterSpacing: 3,
  },

  // Sprite
  spriteContainer: { alignItems: 'center', paddingVertical: 10, backgroundColor: 'rgba(0,0,0,0.15)' },
  sprite: { width: 160, height: 160 },

  // Types
  typesRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  typeBadge: {
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20,
  },
  typeBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 2 },

  // Flavor text
  flavorText: {
    color: MUTED, fontStyle: 'italic', textAlign: 'center',
    marginHorizontal: 20, marginBottom: 14, fontSize: 13, lineHeight: 19,
  },

  generationBadge: {
    color: MUTED, fontSize: 10, letterSpacing: 3,
    textAlign: 'center', marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  physRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1e3a5f', borderRadius: 12, overflow: 'hidden' },
  physBox: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  physBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#1e3a5f' },
  physValue: { color: TEXT, fontSize: 16, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  physLabel: { color: MUTED, fontSize: 9, letterSpacing: 2, marginTop: 2 },

  // Stats
  sectionTitle: {
    color: MUTED, fontSize: 10, letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    marginHorizontal: 16, marginBottom: 10,
  },
  statsContainer: { paddingHorizontal: 16, marginBottom: 16 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  statLabel: { color: MUTED, fontSize: 9, width: 68, letterSpacing: 0.5 },
  statValue: { color: TEXT, fontSize: 12, fontWeight: '700', width: 32, textAlign: 'right', marginRight: 8 },
  statBarBg: { flex: 1, height: 6, backgroundColor: '#1e3a5f', borderRadius: 3, overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: 3 },

  // Generation roster
  rosterCard: {
    backgroundColor: CARD_BG, borderRadius: 16,
    borderWidth: 1, borderColor: '#1e3a5f',
    overflow: 'hidden', marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10, elevation: 6,
  },
  rosterHeader: {
    backgroundColor: RED,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12,
  },
  rosterTitle: {
    color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  rosterCount: {
    color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  rosterItem: {
    flex: 1, alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 4,
    borderWidth: 0.5, borderColor: '#1e3a5f',
  },
  rosterSprite: { width: 72, height: 72 },
  rosterName: {
    color: TEXT, fontSize: 10, fontWeight: '600',
    textAlign: 'center', marginTop: 2,
  },
  rosterNum: { color: MUTED, fontSize: 9, letterSpacing: 1 },

  // Abilities
  abilitiesRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  abilityTag: { backgroundColor: '#1e3a5f', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  abilityText: { color: TEXT, fontSize: 12 },
});
