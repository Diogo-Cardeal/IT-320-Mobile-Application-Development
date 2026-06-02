import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const TIMER_DURATION_MS = 12000;
const JS_STRESS_MS = 1800;

const AnimatedTimer = () => {
  // progress is stored in a ref so the Animated.Value is not recreated on render.
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);
  const [status, setStatus] = useState('Native-driver animation is running.');
  const [runCount, setRunCount] = useState(1);

  const startProgressAnimation = useCallback(() => {
    progress.stopAnimation(() => {
      progress.setValue(0);
      setStatus('Native-driver animation is running.');

      // useNativeDriver: true keeps this transform animation off the JS thread.
      // Layout props like width cannot use the native driver, so scaleX is used.
      Animated.timing(progress, {
        toValue: 1,
        duration: TIMER_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setStatus('Session complete. Restart to run it again.');
        }
      });
    });
  }, [progress]);

  useEffect(() => {
    startProgressAnimation();

    return () => {
      progress.stopAnimation();
    };
  }, [progress, startProgressAnimation]);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 700,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [pulse]);

  const restartAnimation = () => {
    setRunCount((currentRunCount) => currentRunCount + 1);
    startProgressAnimation();
  };

  const stressJavaScriptThread = () => {
    setStatus('Blocking the JS thread. Watch the bar keep moving.');

    requestAnimationFrame(() => {
      const endTime = Date.now() + JS_STRESS_MS;

      while (Date.now() < endTime) {
        Math.sqrt(Math.random() * Date.now());
      }

      setStatus('JS thread released. Native-driver animation stayed smooth.');
    });
  };

  const progressScaleX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.001, 1],
  });

  const progressTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [trackWidth ? -trackWidth / 2 : 0, 0],
  });

  const statusOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 1],
  });

  const statusScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.12],
  });

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.sectionTitle}>12 Second Focus Run</Text>
          <Text style={styles.runText}>Run #{runCount}</Text>
        </View>

        <Animated.View
          style={[
            styles.statusDot,
            {
              opacity: statusOpacity,
              transform: [{ scale: statusScale }],
            },
          ]}
        />
      </View>

      <View
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        style={styles.progressTrack}
      >
        <Animated.View
          style={[
            styles.progressFill,
            {
              transform: [
                { translateX: progressTranslateX },
                { scaleX: progressScaleX },
              ],
            },
          ]}
        />
      </View>

      <Text style={styles.statusText}>{status}</Text>

      <View style={styles.buttonRow}>
        <Pressable onPress={restartAnimation} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Restart Animation</Text>
        </Pressable>

        <Pressable onPress={stressJavaScriptThread} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Stress JS Thread</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ea',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 14,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0f766e',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 11,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  progressFill: {
    backgroundColor: '#14b8a6',
    borderRadius: 999,
    height: '100%',
    width: '100%',
  },
  progressTrack: {
    backgroundColor: '#ccfbf1',
    borderRadius: 999,
    height: 18,
    overflow: 'hidden',
  },
  runText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 11,
  },
  secondaryButtonText: {
    color: '#0369a1',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
  },
  statusDot: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  statusText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
});

export default AnimatedTimer;
