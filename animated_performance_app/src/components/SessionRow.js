import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

export const ROW_HEIGHT = 78;
export const ROW_SEPARATOR_HEIGHT = 8;

const SessionRowView = ({ session }) => (
  <View style={styles.row}>
    <View style={styles.leftColumn}>
      <Text numberOfLines={1} style={styles.label}>
        {session.label}
      </Text>
      <Text numberOfLines={1} style={styles.completedAt}>
        {session.completedAt}
      </Text>
    </View>

    <View style={styles.statsColumn}>
      <Text style={styles.duration}>{session.duration}</Text>
      <Text style={styles.score}>{session.focusScore}</Text>
    </View>
  </View>
);

// React.memo avoids re-rendering unchanged rows when timer/status state changes.
// This is safe here because each session object is stable and uses primitive values.
const SessionRow = React.memo(SessionRowView);

const styles = StyleSheet.create({
  completedAt: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 6,
  },
  duration: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
  },
  label: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
  },
  leftColumn: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    height: ROW_HEIGHT,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  score: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  statsColumn: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
});

export default SessionRow;
