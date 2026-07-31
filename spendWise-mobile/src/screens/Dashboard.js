import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

const transactions = [
  { id: '1', title: 'Groceries', amount: '-$45.00', date: 'Today', type: 'expense' },
  { id: '2', title: 'Salary', amount: '+$3,200.00', date: 'Yesterday', type: 'income' },
  { id: '3', title: 'Coffee Shop', amount: '-$4.50', date: 'Yesterday', type: 'expense' },
  { id: '4', title: 'Electric Bill', amount: '-$80.00', date: 'Jul 28', type: 'expense' },
];

export default function Dashboard() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>Alex 👏</Text>
          </View>
          <TouchableOpacity style={styles.profilePicPlaceholder} />
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
          {['Send', 'Receive', 'Top Up', 'More'].map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionBtn}>
              <View style={styles.actionIconPlaceholder} />
              <Text style={styles.actionText}>{action}</Text>
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
                <View style={styles.transactionIcon} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60, // extra padding for mobile status bar if needed
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
  profilePicPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
  },
  balanceCard: {
    backgroundColor: '#1f2937', // Dark slate theme
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
  actionIconPlaceholder: {
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
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    marginRight: 16,
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
});
