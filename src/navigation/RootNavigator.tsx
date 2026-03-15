import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { WorkItemListScreen } from '../screens/WorkItemListScreen';

export type RootStackParamList = {
  Login: undefined;
  WorkItemList: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#126EB6',
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'JJM Employee' }}
        />
        <RootStack.Screen
          name="WorkItemList"
          component={WorkItemListScreen}
          options={{ title: 'Work Items' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
