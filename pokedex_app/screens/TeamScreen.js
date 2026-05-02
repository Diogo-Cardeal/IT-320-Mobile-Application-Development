import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../AuthContext';
import { getPokemon, getEffectivenessForTypes, getOffensiveEffectiveness, saveTeam, getSavedTeams, deleteTeam } from '../api';

const TYPE_ORDER = [
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

const cap = (value) => value?.charAt(0).toUpperCase() + value?.slice(1);

const emptySlots = Array.from({ length: 6 }, () => null);

export default function TeamScreen() {
  const { user, accessToken, openAuth } = useAuth();
  const [query, setQuery] = useState('');
  const [team, setTeam] = useState(emptySlots);
  const [teamName, setTeamName] = useState('My Team');
  const [evaluation, setEvaluation] = useState({ weaknesses: 0, advantage: 0, verdict: 'Bad', totals: {} });
  const [savedTeams, setSavedTeams] = useState([]);
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState('');

  useEffect(() => {
    calculateTeamEvaluation(team);
  }, [team]);

  useEffect(() => {
    if (user?.id && accessToken) {
      loadSavedTeams();
    }
  }, [user, accessToken]);

  const calculateTeamEvaluation = (slots) => {
    const members = slots.filter(Boolean);
    const totals = TYPE_ORDER.reduce((acc, type) => {
      const values = members.map((member) => member.effectiveness?.[type] ?? 1);
      const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 1;
      return { ...acc, [type]: Number(average.toFixed(2)) };
    }, {});

    const weaknesses = Object.values(totals).filter((value) => value > 1).length;
    const advantage = TYPE_ORDER.filter((defenderType) =>
      members.some((member) => (member.offensive?.[defenderType] ?? 1) > 1),
    ).length;

    const verdict = advantage >= weaknesses + 4
      ? 'Good'
      : advantage >= weaknesses
      ? 'OK'
      : 'Bad';
    setEvaluation({ weaknesses, advantage, verdict, totals });
  };

  const loadSavedTeams = async () => {
    if (!accessToken) return;
    try {
      const list = await getSavedTeams(user.id, accessToken);
      setSavedTeams(Array.isArray(list) ? list : []);
    } catch {
      setSavedTeams([]);
    }
  };

  const handleAddPokemon = async () => {
    const term = query.trim();
    if (!term) {
      setError('Enter a Pokémon name or number to add.');
      return;
    }
    if (team.every(Boolean)) {
      setError('Your team is full. Remove one slot before adding another Pokémon.');
      return;
    }
    setLoading(true);
    setError(null);
    setConfirm('');
    try {
      const data = await getPokemon(term);
      if (team.some((slot) => slot?.id === data.id)) {
        setError('This Pokémon is already on your team.');
        return;
      }
      const types = data.types.map((item) => item.type.name);
      const [effectiveness, offensive] = await Promise.all([
        getEffectivenessForTypes(types),
        getOffensiveEffectiveness(types),
      ]);
      const nextTeam = [...team];
      const index = nextTeam.findIndex((slot) => !slot);
      nextTeam[index] = {
        id: data.id,
        name: data.name,
        spriteUrl: data.sprites.other['official-artwork'].front_default,
        types,
        effectiveness,
        offensive,
      };
      setTeam(nextTeam);
      setQuery('');
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

  const handleRemove = (index) => {
    const nextTeam = [...team];
    nextTeam[index] = null;
    setTeam(nextTeam);
    setConfirm('');
  };

  const handleSave = async () => {
    if (!user?.id || !accessToken) {
      setError('Your session has expired. Please log in again to save teams.');
      openAuth();
      return;
    }
    if (!team.some(Boolean)) {
      setError('Add at least one Pokémon before saving.');
      return;
    }
    if (savedTeams.length >= 4) {
      setError('You already have 4 saved teams. Delete one before saving a new team.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await saveTeam({
        userId: user.id,
        accessToken,
        name: teamName || 'My Team',
        slots: team,
        verdict: evaluation.verdict,
        totals: evaluation.totals,
      });
      setConfirm('Team saved successfully.');
      setTeam(emptySlots);
      setTeamName('My Team');
      setQuery('');
      loadSavedTeams();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!accessToken) {
      setError('Your session has expired. Please log in again.');
      openAuth();
      return;
    }
    setError(null);
    setConfirm('');
    try {
      await deleteTeam(teamId, accessToken);
      setExpandedTeamId(null);
      setSavedTeams((prev) => prev.filter((item) => item.id !== teamId));
      setConfirm('Team deleted.');
    } catch (err) {
      setError(err.message);
    }
  };

  const renderSlot = (slot, index) => (
    <View key={String(index)} style={styles.slotCard}>
      {slot ? (
        <>
          <Image source={{ uri: slot.spriteUrl }} style={styles.slotSprite} />
          <Text style={styles.slotName}>{cap(slot.name)}</Text>
          <View style={styles.slotTypesRow}>
            {slot.types.map((type) => (
              <View key={type} style={[styles.smallTypeBadge, { backgroundColor: TYPE_COLORS[type] || '#3b4cca' }]}> 
                <Text style={styles.smallTypeText}>{cap(type)}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(index)}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptySlot}>
          <Text style={styles.emptyText}>Empty slot</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Team Builder</Text>
        <View style={styles.searchRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search Pokémon to add"
            placeholderTextColor="#7b8cbf"
            style={styles.searchInput}
            returnKeyType="done"
            onSubmitEditing={handleAddPokemon}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddPokemon}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.teamGrid}>{team.map(renderSlot)}</View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Team Evaluation</Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Weaknesses</Text>
            <Text style={styles.metricValue}>{evaluation.weaknesses}</Text>
          </View>
          <View style={styles.metricTrack}><View style={[styles.metricFill, { width: `${Math.min((evaluation.weaknesses / 18) * 100, 100)}%`, backgroundColor: '#ff3d45' }]} /></View>
          <View style={[styles.metricRow, { marginTop: 10 }]}>
            <Text style={styles.metricLabel}>Advantage</Text>
            <Text style={styles.metricValue}>{evaluation.advantage}</Text>
          </View>
          <View style={styles.metricTrack}><View style={[styles.metricFill, { width: `${Math.min((evaluation.advantage / 18) * 100, 100)}%`, backgroundColor: '#66bb6a' }]} /></View>
          <View style={styles.verdictRow}>
            <Text style={styles.verdictLabel}>Verdict</Text>
            <View style={[styles.verdictBadge, evaluation.verdict === 'Good' ? styles.goodBadge : evaluation.verdict === 'OK' ? styles.okBadge : styles.badBadge]}>
              <Text style={styles.verdictText}>{evaluation.verdict}</Text>
            </View>
          </View>
        </View>

        <View style={styles.savePanel}>
          <TextInput
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Team name"
            placeholderTextColor="#7b8cbf"
            style={styles.teamNameInput}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Team</Text>
          </TouchableOpacity>
        </View>
        {loading && <ActivityIndicator color="#ff2d55" style={{ marginTop: 12 }} />}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {!!confirm && <Text style={styles.confirmText}>{confirm}</Text>}

        <View style={styles.savedSection}>
          <Text style={styles.savedTitle}>Saved Teams</Text>
          {savedTeams.length ? (
            savedTeams.map((item) => {
              const slots = Array.isArray(item.slots) ? item.slots.filter(Boolean) : [];
              const isExpanded = expandedTeamId === item.id;
              return (
                <View key={item.id} style={styles.savedCard}>
                  <TouchableOpacity
                    onPress={() => setExpandedTeamId(isExpanded ? null : item.id)}
                    style={styles.savedHeader}
                  >
                    <Text style={styles.savedName}>{item.name}</Text>
                    <View style={[styles.savedBadge, item.verdict === 'Good' ? styles.goodBadge : item.verdict === 'OK' ? styles.okBadge : styles.badBadge]}>
                      <Text style={styles.savedBadgeText}>{item.verdict}</Text>
                    </View>
                  </TouchableOpacity>
                  {isExpanded && (
                    <View style={styles.savedExpanded}>
                      <View style={styles.savedSlotsGrid}>
                        {slots.map((slot) => (
                          <View key={`${item.id}-${slot.id}`} style={styles.savedSlot}>
                            {slot.spriteUrl ? (
                              <Image source={{ uri: slot.spriteUrl }} style={styles.savedSlotSprite} />
                            ) : (
                              <View style={styles.savedSlotSprite} />
                            )}
                            <Text style={styles.savedSlotName}>{cap(slot.name)}</Text>
                            <View style={styles.savedSlotTypes}>
                              {(slot.types || []).map((type) => (
                                <View key={type} style={[styles.savedSlotTypeBadge, { backgroundColor: TYPE_COLORS[type] || '#3b4cca' }]}>
                                  <Text style={styles.savedSlotTypeText}>{cap(type)}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        ))}
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteTeam(item.id)}
                      >
                        <Text style={styles.deleteButtonText}>Delete Team</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <Text style={styles.savedEmpty}>No teams saved yet.</Text>
          )}
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
  title: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
    fontSize: 24,
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
  addButton: {
    backgroundColor: '#ff2d55',
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },
  slotCard: {
    width: '48%',
    minHeight: 160,
    backgroundColor: '#081529',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#0f1f3a',
    padding: 12,
    marginBottom: 12,
  },
  slotSprite: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  slotName: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
    marginBottom: 8,
  },
  slotTypesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  smallTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  smallTypeText: {
    color: '#07162e',
    fontFamily: 'Courier',
    fontSize: 10,
    fontWeight: '700',
  },
  removeButton: {
    backgroundColor: '#1c2a49',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ff6f91',
    fontFamily: 'Courier',
  },
  emptySlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#7aa4ff',
    fontFamily: 'Courier',
  },
  summaryCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#07162e',
    borderWidth: 1,
    borderColor: '#0f1f3a',
  },
  summaryTitle: {
    color: '#7aa4ff',
    fontFamily: 'Courier',
    marginBottom: 14,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricLabel: {
    color: '#d1d9ff',
    fontFamily: 'Courier',
  },
  metricValue: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  metricTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#0f1f3a',
    borderRadius: 999,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: 999,
  },
  verdictRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  verdictLabel: {
    color: '#d1d9ff',
    fontFamily: 'Courier',
  },
  verdictBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  verdictText: {
    color: '#fff',
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  goodBadge: {
    backgroundColor: '#66bb6a',
  },
  okBadge: {
    backgroundColor: '#ffb74d',
  },
  badBadge: {
    backgroundColor: '#ff3d45',
  },
  savePanel: {
    marginTop: 18,
  },
  teamNameInput: {
    backgroundColor: '#07162e',
    color: '#f8f8f2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Courier',
    borderWidth: 1,
    borderColor: '#0f1f3a',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#ff2d55',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  errorText: {
    marginTop: 12,
    color: '#ff6f91',
    fontFamily: 'Courier',
  },
  confirmText: {
    marginTop: 12,
    color: '#66bb6a',
    fontFamily: 'Courier',
  },
  savedSection: {
    marginTop: 22,
  },
  savedTitle: {
    color: '#7aa4ff',
    fontFamily: 'Courier',
    marginBottom: 12,
  },
  savedCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#081529',
    borderWidth: 1,
    borderColor: '#0f1f3a',
    marginBottom: 10,
  },
  savedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedName: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
  },
  savedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  savedBadgeText: {
    color: '#fff',
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  savedEmpty: {
    color: '#7aa4ff',
    fontFamily: 'Courier',
  },
  savedExpanded: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#0f1f3a',
  },
  savedSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  savedSlot: {
    width: '31%',
    backgroundColor: '#0a1b34',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  savedSlotSprite: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  savedSlotName: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
    fontSize: 11,
    textTransform: 'capitalize',
    marginBottom: 4,
    textAlign: 'center',
  },
  savedSlotTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  savedSlotTypeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 999,
  },
  savedSlotTypeText: {
    color: '#07162e',
    fontFamily: 'Courier',
    fontSize: 9,
    fontWeight: '700',
  },
  deleteButton: {
    marginTop: 12,
    backgroundColor: '#1c2a49',
    borderWidth: 1,
    borderColor: '#ff6f91',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ff6f91',
    fontFamily: 'Courier',
    fontWeight: '700',
  },
});
