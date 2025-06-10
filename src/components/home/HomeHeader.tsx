// src/components/home/HomeHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  greeting: string;
  userName: string;
  currentDate: string;
  userInitial: string;
  onProfilePress: () => void;
}

const HomeHeader: React.FC<Props> = ({
  greeting,
  userName,
  currentDate,
  userInitial,
  onProfilePress,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>
          {greeting}, {userName}
        </Text>
        <Text style={styles.date}>{currentDate}</Text>
      </View>

      <TouchableOpacity
        style={styles.profileButton}
        onPress={onProfilePress}
      >
        <View style={styles.profileCircle}>
          <Text style={styles.profileInitial}>{userInitial}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 24,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  profileButton: {
    marginLeft: 16,
  },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2979FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default HomeHeader;