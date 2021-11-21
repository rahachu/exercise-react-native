/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import TabOneScreen from '../screens/TabOneScreen';
import TabTwoScreen from '../screens/TabTwoScreen';
import HomeScreen from '../screens/HomeScreen';
import { BottomTabParamList, TabParamList, TabTwoParamList } from '../types';
import QnAScreen from '../screens/QnAScreen';
import CalendarScreen from '../screens/CalendarScreen';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="HOME"
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint, keyboardHidesTabBar: true }}>
      <BottomTab.Screen
        name="HOME"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="home-sharp" color={color} />,
        }}
        component={HomeScreen}
      />
      <BottomTab.Screen
        name="QNA"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="chatbubble-ellipses-sharp" color={color} />,
        }}
        component={QnAScreen}
      />
      <BottomTab.Screen
        name="CALENDAR"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
        component={CalendarScreen}
      />
      <BottomTab.Screen
        name="TabSearch"
        component={TabSearchNavigator}
        options={{
          tabBarIcon: () => <SearchBarIcon name="search-outline" />,
          tabBarLabel: '',
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}

function SearchBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name'];}) {
  return <Ionicons size={30} style={
    { 
      marginBottom: 40,
      borderRadius: 20, 
      backgroundColor: '#319CEC',
      padding: 15,
      color: '#FFFFFF',
    }
  } {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab

const TabTwoStack = createStackNavigator<TabTwoParamList>();

function TabSearchNavigator() {
  return (
    <TabTwoStack.Navigator>
      <TabTwoStack.Screen
        name="TabTwoScreen"
        component={TabTwoScreen}
        options={{ headerTitle: 'Search Something' }}
      />
    </TabTwoStack.Navigator>
  );
}
