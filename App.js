import React from 'react'
import { StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './src/screens/Login';
import UserContext from './src/screens/UserContext';
import { initNotification } from './src/screens/notification/NotifyHandler';
import { navigationRef } from "./src/screens/notification/NavigationHandler";
import SplashScreen from 'react-native-splash-screen';
import Home from './src/screens/Home';
import TopBar from './src/screens/TopBar';
global.Buffer = global.Buffer || require('buffer').Buffer;
global.process.version = '';
const Stack = createStackNavigator()

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [user, setUser] = React.useState({})
  const [token, setToken] = React.useState(null)
  const [isLoaded, setLoaded] = React.useState(false)
  const saveUser = (userState) => {
    setUser(userState)
  };
  const getUserInfo = async () => {
    let user = await AsyncStorage.getItem("userInfo");
    if (user) {
      setUser(JSON.parse(user))
      setIsLoggedIn(true)
    }
    setLoaded(false);
  }
  //open page notification onclick of notification
  const openNotificationHandler = (pMoveTo, navigateTo) => {
    setTimeout(() => {
      navigateTo();
    }, 50);
  };

  React.useEffect(() => {
    setTimeout(() => {
      if (Platform.OS === 'android') {
        SplashScreen.hide();
      }
    }, 10);

    initNotification(openNotificationHandler);
    const getData = async () => {
      try {
        await getUserInfo()
        if (token !== null)
          await setToken(token)
      } catch (e) {
        // error reading value
      }
      setLoaded(true)
    }
    getData()

    return () => null
  }, [])

  // this is needed so you don't have that blink from Welcome to Home (When you have a token but it's not set yet in the state)
  if (!isLoaded)
    return null

  return (
    <UserContext.Provider value={{ user, saveUser }}>
      {/* {isLoggedIn ? <TopBar/> : <Login/>} */}
      <NavigationContainer independent={true} ref={navigationRef}>
        <Stack.Navigator
          initialRouteName={isLoggedIn ? 'Home' : 'Login'}
          screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={TopBar} />
          <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserContext.Provider>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default App