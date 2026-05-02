import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { getPokemonSpecies } from '../api';

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

const cap = (text) => text?.charAt(0).toUpperCase() + text?.slice(1);
const padId = (id) => String(id).padStart(3, '0');

const StatBar = ({ label, value }) => {
  const percent = Math.min((value / 255) * 100, 100);
  const color = value < 60 ? '#ff6f91' : value < 100 ? '#ffb74d' : '#66bb6a';
  return (
    <View style={styles.statRow}>
      <View style={styles.statLabelRow}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <View style={styles.statTrack}>
        <View style={[styles.statFill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

export default function DetailScreen({ route }) {
  const pokemon = route.params?.pokemon;
  const [speciesText, setSpeciesText] = useState('Loading flavor text...');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSpecies = async () => {
      if (!pokemon?.id) return;
      setLoading(true);
      try {
        const species = await getPokemonSpecies(pokemon.id);
        const entry = species.flavor_text_entries.find((item) => item.language.name === 'en');
        setSpeciesText(entry?.flavor_text?.replace(/\n|\f/g, ' ') || 'No flavor text available.');
      } catch {
        setSpeciesText('Flavor text unavailable.');
      } finally {
        setLoading(false);
      }
    };
    loadSpecies();
  }, [pokemon]);

  if (!pokemon) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>No Pokémon data was passed to this screen.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.heroSection}>
            <Image
              source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
              style={styles.artwork}
            />
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.name}>{cap(pokemon.name)}</Text>
                <Text style={styles.subtitle}>#{padId(pokemon.id)}</Text>
              </View>
              <View style={styles.typeRow}>
                {pokemon.types.map((typeItem) => (
                  <View
                    key={typeItem.type.name}
                    style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[typeItem.type.name] || '#3b4cca' }]}
                  >
                    <Text style={styles.typeBadgeText}>{cap(typeItem.type.name)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.infoPanel}>
            <Text style={styles.sectionTitle}>Flavor Text</Text>
            {loading ? (
              <ActivityIndicator color="#ff2d55" />
            ) : (
              <Text style={styles.flavorText}>{speciesText}</Text>
            )}

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Height</Text>
                <Text style={styles.summaryValue}>{pokemon.height / 10}m</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Weight</Text>
                <Text style={styles.summaryValue}>{pokemon.weight / 10}kg</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Base Exp</Text>
                <Text style={styles.summaryValue}>{pokemon.base_experience}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Base Stats</Text>
            {pokemon.stats.map((stat) => (
              <StatBar
                key={stat.stat.name}
                label={stat.stat.name === 'hp' ? 'HP' : stat.stat.name.replace('special-', 'Sp. ')}
                value={stat.base_stat}
              />
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Abilities</Text>
            <View style={styles.abilityRow}>
              {pokemon.abilities.map((abilityItem) => (
                <View key={abilityItem.ability.name} style={styles.abilityBadge}>
                  <Text style={styles.abilityText}>{cap(abilityItem.ability.name.replace('-', ' '))}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
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
  card: {
    backgroundColor: '#07162e',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0f1f3a',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  artwork: {
    width: 240,
    height: 240,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    color: '#7aa4ff',
    fontFamily: 'Courier',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  typeBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  typeBadgeText: {
    color: '#07162e',
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  infoPanel: {
    marginTop: 10,
  },
  sectionTitle: {
    color: '#7aa4ff',
    fontFamily: 'Courier',
    marginBottom: 10,
    fontSize: 14,
  },
  flavorText: {
    color: '#d1d9ff',
    fontFamily: 'Courier',
    marginBottom: 18,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 18,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    backgroundColor: '#0a1b34',
    borderRadius: 14,
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#9fb2ff',
    fontFamily: 'Courier',
    marginBottom: 6,
  },
  summaryValue: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
    fontSize: 16,
    fontWeight: '700',
  },
  statRow: {
    marginBottom: 12,
  },
  statLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statLabel: {
    color: '#e7ecff',
    fontFamily: 'Courier',
  },
  statValue: {
    color: '#e7ecff',
    fontFamily: 'Courier',
  },
  statTrack: {
    width: '100%',
    height: 12,
    backgroundColor: '#0f1f3a',
    borderRadius: 999,
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    borderRadius: 999,
  },
  abilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  abilityBadge: {
    backgroundColor: '#0a1b34',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  abilityText: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#02082b',
  },
  errorText: {
    color: '#ff6f91',
    fontFamily: 'Courier',
  },
});
