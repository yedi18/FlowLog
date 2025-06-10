// src/components/home/ProgressCard.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface Props {
  completedCount: number;
  totalCount: number;
  progressAnim: Animated.Value;
}

const ProgressCard: React.FC<Props> = ({
  completedCount,
  totalCount,
  progressAnim,
}) => {
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  useEffect(() => {
    const percentage = totalCount > 0 ? completedCount / totalCount : 0;

    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [completedCount, totalCount, progressAnim]);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Today's Progress</Text>
        <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }
          ]}
        />
      </View>

      <Text style={styles.progressSubtext}>
        {completedCount} of {totalCount} tasks completed
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#2979FF',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2979FF',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProgressCard;