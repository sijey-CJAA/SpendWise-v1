import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

const transactions = [
  { id: '1', title: 'Groceries', amount: '-$45.00', date: 'Today', type: 'expense', icon: require('../../assets/groceries.png') },
  { id: '2', title: 'Salary', amount: '+$3,200.00', date: 'Yesterday', type: 'income', icon: require('../../assets/salary.png') },
  { id: '3', title: 'Coffee Shop', amount: '-$4.50', date: 'Yesterday', type: 'expense', icon: require('../../assets/coffee.png') },
  { id: '4', title: 'Electric Bill', amount: '-$80.00', date: 'Jul 28', type: 'expense', icon: require('../../assets/electric.png') },
];

const actions = [
  { name: 'Send', icon: require('../../assets/send.png') },
  { name: 'Receive', icon: require('../../assets/receive.png') },
  { name: 'Top Up', icon: require('../../assets/topup.png') },
  { name: 'More', icon: require('../../assets/more.png') },
];

export default function Dashboard() {
  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Top Navbar */}
      <View style={styles.topNav}>
        <View style={styles.navLogoContainer}>
          <ExpoImage 
            source={require('../../assets/SpendWiseLogo.svg')} 
            style={styles.navLogo} 
            contentFit="contain"
          />
          <Text style={styles.navTitle}>SpendWise</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="#1f2937" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>Alex 👏</Text>
          </View>
          <TouchableOpacity>
            <ExpoImage source={require('../../assets/profile.png')} style={styles.profilePic} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>$4,850.50</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#4ade80' }]} />
              <View>
                <Text style={styles.statLabel}>Income</Text>
                <Text style={styles.statValue}>$5,000</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#f87171' }]} />
              <View>
                <Text style={styles.statLabel}>Expenses</Text>
                <Text style={styles.statValue}>$149.50</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {actions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionBtn}>
              <View style={styles.actionIconContainer}>
                <ExpoImage source={action.icon} style={styles.actionIcon} />
              </View>
              <Text style={styles.actionText}>{action.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.map((item) => (
            <View key={item.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={styles.transactionIconContainer}>
                  <ExpoImage source={item.icon} style={styles.transactionIcon} />
                </View>
                <View>
                  <Text style={styles.transactionTitle}>{item.title}</Text>
                  <Text style={styles.transactionDate}>{item.date}</Text>
                </View>
              </View>
              <Text 
                style={[
                  styles.transactionAmount, 
                  { color: item.type === 'income' ? '#10b981' : '#1f2937' }
                ]}
              >
                {item.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Custom Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* Left Side: Home Icon */}
        <TouchableOpacity style={styles.bottomNavItem}>
          <Ionicons name="home" size={26} color="#3b82f6" />
          <View style={styles.navIndicator} />
        </TouchableOpacity>

        {/* Middle: Floating Add Button */}
        <View style={styles.fabWrapper}>
          <TouchableOpacity style={styles.fab}>
            <ExpoImage 
              source={require('../../assets/add.svg')} 
              style={styles.fabIcon} 
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Right Side: Placeholder for now */}
        <TouchableOpacity style={styles.bottomNavItem}>
          <Ionicons name="apps-outline" size={26} color="#9ca3af" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#f9fafb',
  },
  navLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLogo: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  navTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100, // Make room for the bottom nav
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
  },
  balanceCard: {
    backgroundColor: '#1f2937',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  balanceLabel: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: -1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    width: 24,
    height: 24,
  },
  actionText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  transactionsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 20,
    height: 20,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    height: 80,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 15,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3b82f6',
    marginTop: 4,
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6', // App primary color for the add button
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30, // Floats the button up
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  fabIcon: {
    width: 26,
    height: 26,
    tintColor: '#ffffff',
  }
});
