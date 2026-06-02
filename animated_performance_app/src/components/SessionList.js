import React, { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SessionRow, { ROW_HEIGHT, ROW_SEPARATOR_HEIGHT } from './SessionRow';

const SessionList = ({ sessions }) => {
  const renderItem = useCallback(({ item }) => (
    <SessionRow session={item} />
  ), []);

  const keyExtractor = useCallback((item) => item.id, []);

  const getItemLayout = useCallback((_, index) => ({
    index,
    length: ROW_HEIGHT + ROW_SEPARATOR_HEIGHT,
    offset: (ROW_HEIGHT + ROW_SEPARATOR_HEIGHT) * index,
  }), []);

  return (
    <View style={styles.section}>
      <View style={styles.listHeader}>
        <View>
          <Text style={styles.sectionTitle}>Completed Sessions</Text>
          <Text style={styles.subtitle}>
            FlatList virtualizes these {sessions.length} rows.
          </Text>
        </View>
        <Text style={styles.badge}>{sessions.length} total</Text>
      </View>

      <FlatList
        data={sessions}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={keyExtractor}
        maxToRenderPerBatch={8}
        removeClippedSubviews
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  listHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  section: {
    flex: 1,
    minHeight: 0,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
  },
  separator: {
    height: ROW_SEPARATOR_HEIGHT,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 3,
  },
});

export default SessionList;
