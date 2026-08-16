import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ACCESS_TOKEN_KEY } from '../api/client';
import { getPersistedLoginMode } from '../hooks/useAuth';
import { CameraScreen } from '../screens/CameraScreen';
import { ComponentListScreen } from '../screens/ComponentListScreen';
import { LoginChoiceScreen } from '../screens/LoginChoiceScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { UploadPhotoScreen } from '../screens/UploadPhotoScreen';
import { WorkItemDetailsScreen } from '../screens/WorkItemDetailsScreen';
import { WorkItemListScreen } from '../screens/WorkItemListScreen';
import { AgreementListScreen } from '../screens/AgreementListScreen';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  LoginChoice: undefined;
  Login: undefined;
  AgreementList: undefined;
  WorkItemList: {
    agreementId: string;
    isTpi?: boolean;
  };
  WorkItemDetails: {
    workItemId: string;
    title: string;
    isTpi?: boolean;
  };
  ComponentList: {
    workItemId: string;
    title: string;
    work_code?: string;
    isTpi?: boolean;
  };
  UploadPhoto: {
    workItemId: string;
    componentId: string;
    componentName: string;
    capturedPhotoPath?: string;
    capturedAt?: string;
    latitude?: number;
    longitude?: number;
    isTpi?: boolean;
  };
  Camera: {
    workItemId: string;
    componentId: string;
    componentName: string;
    isTpi?: boolean;
  };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList>('LoginChoice');

  useEffect(() => {
    let isMounted = true;

    const loadAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        const mode = await getPersistedLoginMode();

        if (isMounted) {
          if (token) {
            setInitialRoute('AgreementList');
          } else if (mode) {
            setInitialRoute('Login');
          } else {
            setInitialRoute('LoginChoice');
          }
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
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <RootStack.Screen name="LoginChoice" component={LoginChoiceScreen} />
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="AgreementList" component={AgreementListScreen} />
        <RootStack.Screen name="WorkItemList" component={WorkItemListScreen} />
        <RootStack.Screen
          name="WorkItemDetails"
          component={WorkItemDetailsScreen}
        />
        <RootStack.Screen
          name="ComponentList"
          component={ComponentListScreen}
        />
        <RootStack.Screen name="UploadPhoto" component={UploadPhotoScreen} />
        <RootStack.Screen name="Camera" component={CameraScreen} />
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
