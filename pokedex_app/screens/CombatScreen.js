import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { getPokemon, getMoveDetails, getEffectivenessForTypes, getOffensiveEffectiveness, calculateStats } from '../api';

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

const TYPE_ORDER = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark',
  'steel', 'fairy',
];

const TYPE_ABBR = {
  normal: 'NRM', fire: 'FIR', water: 'WAT', electric: 'ELE', grass: 'GRA',
  ice: 'ICE', fighting: 'FIG', poison: 'POI', ground: 'GRD', flying: 'FLY',
  psychic: 'PSY', bug: 'BUG', rock: 'ROC', ghost: 'GHO', dragon: 'DRA',
  dark: 'DRK', steel: 'STL', fairy: 'FAI',
};

const formatMultiplier = (value) => {
  if (value === 0) return '0×';
  if (value === 0.25) return '¼×';
  if (value === 0.5) return '½×';
  return `${value}×`;
};

const multiplierColor = (value) => {
  if (value === 0) return '#212121';
  if (value === 0.25) return '#3a5a88';
  if (value === 0.5) return '#4f7cca';
  if (value === 2) return '#ff7a52';
  if (value === 4) return '#ff3d45';
  return '#1f2a58';
};

const cap = (value) => value?.charAt(0).toUpperCase() + value?.slice(1);
const padId = (id) => String(id).padStart(3, '0');
const statLevels = [50, 75, 100];

const MoveBlock = ({ move, expanded, onToggle, details }) => (
  <View style={styles.moveCard}>
    <TouchableOpacity onPress={onToggle} style={styles.moveRow}>
      <Text style={styles.moveName}>{cap(move.name)}</Text>
      <Text style={styles.moveMethod}>{move.method}</Text>
    </TouchableOpacity>
    {expanded && (
      <View style={styles.moveDetails}>
        {details ? (
          <>
            <Text style={styles.moveDetailText}>Type: {cap(details.type.name)}</Text>
            <Text style={styles.moveDetailText}>Power: {details.power ?? '—'}</Text>
            <Text style={styles.moveDetailText}>Accuracy: {details.accuracy ?? '—'}</Text>
            <Text style={styles.moveDetailText}>Category: {cap(details.damage_class.name)}</Text>
          </>
        ) : (
          <ActivityIndicator color="#ff2d55" />
        )}
      </View>
    )}
  </View>
);

export default function CombatScreen() {
  const [query, setQuery] = useState('');
  const [pokemon, setPokemon] = useState(null);
  const [effectiveness, setEffectiveness] = useState({});
  const [offensive, setOffensive] = useState({});
  const [moveDetails, setMoveDetails] = useState({});
  const [expandedMove, setExpandedMove] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    const term = query.trim();
    if (!term) {
      setError('Enter a Pokémon name or number to analyze.');
      return;
    }
    setLoading(true);
    setError(null);
    setPokemon(null);
    setMoveDetails({});
    setExpandedMove(null);
    try {
      const data = await getPokemon(term);
      setPokemon(data);
      const types = data.types.map((typeItem) => typeItem.type.name);
      const [defChart, offChart] = await Promise.all([
        getEffectivenessForTypes(types),
        getOffensiveEffectiveness(types),
      ]);
      setEffectiveness(defChart);
      setOffensive(offChart);
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

  const handleToggleMove = async (move) => {
    const key = move.name;
    if (expandedMove === key) {
      setExpandedMove(null);
      return;
    }
    setExpandedMove(key);
    if (!moveDetails[key]) {
      try {
        const details = await getMoveDetails(key);
        setMoveDetails((prev) => ({ ...prev, [key]: details }));
      } catch {
        setMoveDetails((prev) => ({ ...prev, [key]: { error: true } }));
      }
    }
  };

  const getLearnGroups = () => {
    if (!pokemon?.moves) return {};
    const groups = {
      'level-up': [],
      machine: [],
      tutor: [],
      egg: [],
    };

    pokemon.moves.forEach((moveEntry) => {
      const detail = moveEntry.version_group_details.slice(-1)[0] || moveEntry.version_group_details[0];
      const method = detail?.move_learn_method?.name || 'machine';
      const bucket = groups[method] ? method : 'machine';
      groups[bucket].push({ name: moveEntry.move.name, method: bucket });
    });

    return groups;
  };

  const renderEffectGrid = (chart) =>
    TYPE_ORDER.map((type) => {
      const multiplier = chart[type] ?? 1;
      return (
        <View key={type} style={styles.effectCell}>
          <View
            style={[
              styles.effectBox,
              { backgroundColor: TYPE_COLORS[type] || '#3b4cca' },
            ]}
          >
            <Text style={styles.effectAbbr}>{TYPE_ABBR[type]}</Text>
          </View>
          <View style={[styles.effectMultiplier, { backgroundColor: multiplierColor(multiplier) }]}>
            <Text style={styles.effectMultiplierText}>{formatMultiplier(multiplier)}</Text>
          </View>
        </View>
      );
    });

  const stats = pokemon ? statLevels.map((level) => ({ level, values: calculateStats(pokemon.stats, level) })) : [];
  const groups = getLearnGroups();

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Combat Simulator</Text>
        <View style={styles.searchRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search Pokémon"
            placeholderTextColor="#7b8cbf"
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Go</Text>
          </TouchableOpacity>
        </View>
        {loading && <ActivityIndicator color="#ff2d55" style={{ marginTop: 20 }} />}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {pokemon && !loading && (
          <>
            <View style={styles.heroCard}>
              <Image
                source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
                style={styles.heroSprite}
              />
              <Text style={styles.heroName}>{cap(pokemon.name)}</Text>
              <Text style={styles.heroId}>#{padId(pokemon.id)}</Text>
              <View style={styles.heroTypeRow}>
                {pokemon.types.map((typeItem) => (
                  <View
                    key={typeItem.type.name}
                    style={[styles.heroTypeBadge, { backgroundColor: TYPE_COLORS[typeItem.type.name] || '#3b4cca' }]}
                  >
                    <Text style={styles.heroTypeText}>{cap(typeItem.type.name)}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Calculated Stats</Text>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>Level</Text>
                <Text style={styles.tableCell}>HP</Text>
                <Text style={styles.tableCell}>Atk</Text>
                <Text style={styles.tableCell}>Def</Text>
                <Text style={styles.tableCell}>SpA</Text>
                <Text style={styles.tableCell}>SpD</Text>
                <Text style={styles.tableCell}>Spe</Text>
              </View>
              {stats.map((row) => (
                <View key={row.level} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{row.level}</Text>
                  <Text style={styles.tableCell}>{row.values.HP}</Text>
                  <Text style={styles.tableCell}>{row.values.Attack}</Text>
                  <Text style={styles.tableCell}>{row.values.Defense}</Text>
                  <Text style={styles.tableCell}>{row.values['Sp. Atk']}</Text>
                  <Text style={styles.tableCell}>{row.values['Sp. Def']}</Text>
                  <Text style={styles.tableCell}>{row.values.Speed}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Move List</Text>
              {Object.keys(groups).map((groupKey) => (
                <View key={groupKey} style={styles.moveGroup}>
                  <Text style={styles.moveGroupTitle}>{cap(groupKey.replace('-', ' '))}</Text>
                  {groups[groupKey].length ? (
                    groups[groupKey].map((move) => (
                      <MoveBlock
                        key={move.name}
                        move={move}
                        expanded={expandedMove === move.name}
                        onToggle={() => handleToggleMove(move)}
                        details={moveDetails[move.name]}
                      />
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No moves found for {cap(groupKey)}.</Text>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attacking (this Pokémon attacks)</Text>
              <View style={styles.effectGrid}>{renderEffectGrid(offensive)}</View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Defending (this Pokémon is attacked)</Text>
              <View style={styles.effectGrid}>{renderEffectGrid(effectiveness)}</View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#02082b',
  },
  container: {
    padding: 16,
    paddingBottom: 30,
  },
  title: {
    color: '#f8f8f2',
    fontSize: 24,
    fontFamily: 'Courier',
    marginBottom: 18,
  },
  searchRow: {
    flexDirection: 'row',
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
    borderRadius: 10,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  errorText: {
    marginTop: 18,
    color: '#ff6f91',
    fontFamily: 'Courier',
  },
  heroCard: {
    marginTop: 22,
    padding: 18,
    backgroundColor: '#07162e',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#0f1f3a',
    alignItems: 'center',
  },
  heroSprite: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  heroName: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
    fontSize: 22,
    marginBottom: 4,
  },
  heroId: {
    color: '#7aa4ff',
    fontFamily: 'Courier',
    marginBottom: 10,
  },
  heroTypeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroTypeBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  heroTypeText: {
    color: '#07162e',
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  section: {
    marginTop: 22,
  },
  sectionTitle: {
    color: '#7aa4ff',
    fontFamily: 'Courier',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0c1d3c',
    padding: 12,
    borderRadius: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#081529',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  tableCell: {
    flex: 1,
    color: '#f8f8f2',
    fontFamily: 'Courier',
    textAlign: 'center',
    fontSize: 12,
  },
  moveGroup: {
    marginBottom: 16,
  },
  moveGroupTitle: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
    marginBottom: 8,
  },
  moveCard: {
    backgroundColor: '#081529',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0f1f3a',
    marginBottom: 10,
    overflow: 'hidden',
  },
  moveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  moveName: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
    flex: 1,
  },
  moveMethod: {
    color: '#7aa4ff',
    fontFamily: 'Courier',
  },
  moveDetails: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#0f1f3a',
  },
  moveDetailText: {
    color: '#d1d9ff',
    fontFamily: 'Courier',
    marginBottom: 6,
  },
  emptyText: {
    color: '#7b8cbf',
    fontFamily: 'Courier',
  },
  effectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  effectCell: {
    width: '15%',
    alignItems: 'stretch',
  },
  effectBox: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  effectAbbr: {
    color: '#07162e',
    fontFamily: 'Courier',
    fontWeight: '700',
    fontSize: 12,
  },
  effectMultiplier: {
    marginTop: 4,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  effectMultiplierText: {
    color: '#fff',
    fontFamily: 'Courier',
    fontWeight: '700',
    fontSize: 12,
  },
});
