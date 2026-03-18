import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ACCESS_TOKEN_KEY } from '../api/client';
import { CameraScreen } from '../screens/CameraScreen';
import { ComponentListScreen } from '../screens/ComponentListScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { UploadPhotoScreen } from '../screens/UploadPhotoScreen';
import { WorkItemDetailsScreen } from '../screens/WorkItemDetailsScreen';
import { WorkItemListScreen } from '../screens/WorkItemListScreen';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  Login: undefined;
  WorkItemList: undefined;
  WorkItemDetails: {
    workItemId: string;
    title: string;
  };
  ComponentList: {
    workItemId: string;
    title: string;
  };
  UploadPhoto: {
    workItemId: string;
    componentId: string;
    componentName: string;
    capturedPhotoPath?: string;
    capturedAt?: string;
    latitude?: number;
    longitude?: number;
  };
  Camera: {
    workItemId: string;
    componentId: string;
    componentName: string;
  };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasStoredToken, setHasStoredToken] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        if (isMounted) {
          setHasStoredToken(Boolean(token));
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    loadAuthState();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName={hasStoredToken ? 'WorkItemList' : 'Login'}
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
        <RootStack.Screen
          name="WorkItemDetails"
          component={WorkItemDetailsScreen}
          options={{ title: 'Work Item Details' }}
        />
        <RootStack.Screen
          name="ComponentList"
          component={ComponentListScreen}
          options={{ title: 'Components' }}
        />
        <RootStack.Screen
          name="UploadPhoto"
          component={UploadPhotoScreen}
          options={{ title: 'Upload Photo' }}
        />
        <RootStack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ title: 'Capture Photo' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.white,
  },
};
