import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getPokemon, getGeneration, getTypeList } from '../api';

const TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark',
  'steel', 'fairy',
];

const TYPE_COLORS = {
  normal: '#A8A878',
  fire: '#FF6B35',
  water: '#4FC3F7',
  electric: '#FEDD6A',
  grass: '#66BB6A',
  ice: '#80DEEA',
  fighting: '#D3425F',
  poison: '#AB47BC',
  ground: '#E0C068',
  flying: '#8DA8FE',
  psychic: '#F06292',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7E57C2',
  dark: '#4A4A5A',
  steel: '#B8B8D0',
  fairy: '#F8BBD0',
};

const GENERATIONS = Array.from({ length: 9 }, (_, index) => index + 1);

const padId = (id) => String(id).padStart(3, '0');
const cap = (value) => value?.charAt(0).toUpperCase() + value?.slice(1);

const parseIdFromUrl = (url) => {
  const segments = url.split('/').filter(Boolean);
  return parseInt(segments[segments.length - 1], 10);
};

const getSpriteUrl = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export default function SearchScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState('generation');
  const [activeFilter, setActiveFilter] = useState(null);
  const [results, setResults] = useState([]);
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearResults = () => {
    setResults([]);
    setLabel('');
    setActiveFilter(null);
    setError(null);
  };

  const handleSearch = async () => {
    const term = query.trim();
    if (!term) {
      setError('Enter a Pokémon name or number to search.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getPokemon(term);
      navigation.navigate('Detail', { pokemon: result });
    } catch (err) {
      if (err.status === 404) {
        setError(`No Pokémon matches "${term}". Try a valid name or number.`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGeneration = async (gen) => {
    setLoading(true);
    setError(null);
    setActiveFilter(`gen-${gen}`);
    try {
      const data = await getGeneration(gen);
      const pokemon = data.pokemon_species
        .map((item) => {
          const id = parseIdFromUrl(item.url);
          return {
            id,
            name: item.name,
            spriteUrl: getSpriteUrl(id),
          };
        })
        .sort((a, b) => a.id - b.id);
      setResults(pokemon);
      setLabel(`Generation ${gen}`);
    } catch (err) {
      if (err.status === 404) {
        setError(`Generation ${gen} could not be loaded.`);
      } else {
        setError(err.message);
      }
      setResults([]);
      setLabel('');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectType = async (type) => {
    setLoading(true);
    setError(null);
    setActiveFilter(type);
    try {
      const data = await getTypeList(type);
      const pokemon = data.pokemon
        .map((item) => {
          const id = parseIdFromUrl(item.pokemon.url);
          return {
            id,
            name: item.pokemon.name,
            spriteUrl: getSpriteUrl(id),
          };
        })
        .sort((a, b) => a.id - b.id);
      setResults(pokemon);
      setLabel(`${cap(type)} type`);
    } catch (err) {
      if (err.status === 404) {
        setError(`Type "${type}" could not be loaded.`);
      } else {
        setError(err.message);
      }
      setResults([]);
      setLabel('');
    } finally {
      setLoading(false);
    }
  };

  const openPokemon = async (name) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPokemon(name);
      navigation.navigate('Detail', { pokemon: result });
    } catch (err) {
      if (err.status === 404) {
        setError(`No Pokémon matches "${name}".`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openPokemon(item.name)}>
      <View style={styles.spriteWrapper}>
        <Image source={{ uri: item.spriteUrl }} style={styles.sprite} />
      </View>
      <Text style={styles.cardName}>{cap(item.name)}</Text>
      <Text style={styles.cardId}>#{padId(item.id)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.panel}>
        <Text style={styles.title}>Retro Pokédex Search</Text>
        <View style={styles.searchRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Name or number"
            placeholderTextColor="#7b8cbf"
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Go</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              clearResults();
              setQuery('');
            }}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              filterMode === 'generation' && styles.toggleButtonActive,
            ]}
            onPress={() => {
              clearResults();
              setFilterMode('generation');
            }}
          >
            <Text style={styles.toggleLabel}>Generation</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, filterMode === 'type' && styles.toggleButtonActive]}
            onPress={() => {
              clearResults();
              setFilterMode('type');
            }}
          >
            <Text style={styles.toggleLabel}>Type</Text>
          </TouchableOpacity>
        </View>
        {filterMode === 'generation' ? (
          <View style={styles.optionRow}> 
            {GENERATIONS.map((gen) => (
              <TouchableOpacity
                key={gen}
                style={[
                  styles.optionButton,
                  activeFilter === `gen-${gen}` && styles.optionButtonActive,
                ]}
                onPress={() => handleSelectGeneration(gen)}
              >
                <Text style={styles.optionLabel}>Gen {gen}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.typeGrid}>
            {TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeBadge,
                  { backgroundColor: TYPE_COLORS[type] || '#3b4cca' },
                  activeFilter === type && styles.typeBadgeActive,
                ]}
                onPress={() => handleSelectType(type)}
              >
                <Text style={styles.typeBadgeText}>{cap(type)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {loading ? (
          <ActivityIndicator color="#ff2d55" style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          !!results.length && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsLabel}>{label} · {results.length} Pokémon</Text>
              <FlatList
                data={results}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderCard}
                numColumns={3}
                contentContainerStyle={styles.grid}
              />
            </View>
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#02082b',
  },
  panel: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    color: '#f8f8f2',
    fontSize: 24,
    fontFamily: 'Courier',
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#07162e',
    color: '#f8f8f2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Courier',
    borderWidth: 1,
    borderColor: '#0f1f3a',
  },
  searchButton: {
    backgroundColor: '#ff2d55',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  clearButton: {
    backgroundColor: '#1c2a49',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0f1f3a',
  },
  clearButtonText: {
    color: '#7aa4ff',
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0f1f3a',
    backgroundColor: '#07162e',
  },
  toggleButtonActive: {
    backgroundColor: '#11254e',
    borderColor: '#ff2d55',
  },
  toggleLabel: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
    textAlign: 'center',
  },
  optionRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#07162e',
    borderWidth: 1,
    borderColor: '#0f1f3a',
  },
  optionButtonActive: {
    borderColor: '#ff2d55',
    backgroundColor: '#11254e',
  },
  optionLabel: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
  },
  typeGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBadge: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  typeBadgeActive: {
    opacity: 0.9,
    borderWidth: 1,
    borderColor: '#fff',
  },
  typeBadgeText: {
    color: '#0f1f3a',
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  loader: {
    marginTop: 24,
  },
  resultsSection: {
    marginTop: 20,
    flex: 1,
  },
  resultsLabel: {
    color: '#7aa4ff',
    marginBottom: 12,
    fontFamily: 'Courier',
  },
  grid: {
    paddingBottom: 24,
  },
  card: {
    flex: 1,
    margin: 6,
    padding: 12,
    backgroundColor: '#081534',
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f1f3a',
  },
  spriteWrapper: {
    width: 92,
    height: 92,
    borderRadius: 18,
    backgroundColor: '#0b2145',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sprite: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
  },
  cardName: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  cardId: {
    color: '#7aa4ff',
    fontFamily: 'Courier',
    fontSize: 12,
  },
  errorText: {
    marginTop: 16,
    color: '#ff6f91',
    fontFamily: 'Courier',
  },
});
