import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, signOut } from '../config/firebase';



export default function Dashboard() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(menuAnim, {
      toValue: isMenuOpen ? 1 : 0,
      useNativeDriver: true,
      bounciness: 12,
      speed: 14,
    }).start();
  }, [isMenuOpen]);

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
        <View style={{ zIndex: 10 }}>
          <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)}>
            <Animated.View style={{ 
              transform: [{ 
                rotate: menuAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) 
              }] 
            }}>
              <Ionicons name={isMenuOpen ? "close" : "menu"} size={28} color="#3b82f6" />
            </Animated.View>
          </TouchableOpacity>
          
          <Animated.View 
            pointerEvents={isMenuOpen ? 'auto' : 'none'}
            style={[styles.dropdownMenu, {
              opacity: menuAnim,
              transform: [{
                translateX: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0]
                })
              }, {
                scale: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.85, 1]
                })
              }]
            }]}
          >
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={async () => {
                try {
                  await signOut(auth);
                  router.replace('/');
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.spendingsCard}>
          <Text style={styles.welcomeText}>Welcome, User 👋</Text>
          
          <Text style={styles.spendingsTitle}>Total Spendings</Text>
          
          <View style={styles.spendingsRow}>
            <View style={styles.spendingItem}>
              <Text style={styles.spendingLabel}>Today</Text>
              <Text style={styles.spendingAmount}>$45.00</Text>
            </View>
            <View style={styles.spendingItem}>
              <Text style={styles.spendingLabel}>This Week</Text>
              <Text style={styles.spendingAmount}>$120.50</Text>
            </View>
            <View style={styles.spendingItem}>
              <Text style={styles.spendingLabel}>This Month</Text>
              <Text style={styles.spendingAmount}>$450.00</Text>
            </View>
          </View>
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
          <Ionicons name="apps-outline" size={26} color="#64748b" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#d1fae5',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#d1fae5',
    zIndex: 10,
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
    color: '#1e3a8a',
    letterSpacing: -0.5,
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100, // Make room for the bottom nav
  },
  spendingsCard: {
    backgroundColor: '#1e3a8a',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 32,
  },
  spendingsTitle: {
    color: '#93c5fd',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  spendingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  spendingItem: {
    alignItems: 'center',
    flex: 1,
  },
  spendingLabel: {
    color: '#bfdbfe',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  spendingAmount: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
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
    backgroundColor: '#d1fae5',
    height: 80,
    borderTopWidth: 1,
    borderTopColor: '#a7f3d0',
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
  },
  dropdownMenu: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    minWidth: 160,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 17,
    color: '#ef4444',
    fontWeight: '600',
  }
});
