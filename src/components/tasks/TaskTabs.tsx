// src/components/tasks/TaskTabs.tsx - מתוקן עם picker scrollable
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskTab, TabData } from '../../types';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width * 0.22; // רוחב קבוע לכל טאב

interface Props {
  activeTab: TaskTab;
  onTabChange: (tab: TaskTab) => void;
  tabData: TabData[];
}

const TaskTabs: React.FC<Props> = ({
  activeTab,
  onTabChange,
  tabData,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {tabData.map((tab, index) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
              { width: TAB_WIDTH }
            ]}
            onPress={() => onTabChange(tab.key)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.title}
            </Text>
            {tab.count > 0 && (
              <View style={[
                styles.badge,
                activeTab === tab.key && styles.activeBadge
              ]}>
                <Text style={[
                  styles.badgeText,
                  activeTab === tab.key && styles.activeBadgeText
                ]}>
                  {tab.count > 99 ? '99+' : tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#444',
    gap: 6,
    minHeight: 44,
  },
  activeTab: {
    backgroundColor: '#2979FF',
    borderColor: '#2979FF',
  },
  tabText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
    flexShrink: 1,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#fff',
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  activeBadgeText: {
    color: '#2979FF',
  },
});

export default TaskTabs;