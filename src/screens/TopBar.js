

 import React, { useEffect } from "react";
 import {   StyleSheet, View,Image,Text } from 'react-native';
 import  UserContext  from "./UserContext";
import { SvgCss } from 'react-native-svg';
import { AppIcon } from '../svgs/AppIcon';
import { MachineOp,ForkOp } from "../svgs/UserOp"
import App from "../../App";
import { util } from "../commons";
import { appTheme } from "../lib/Themes";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { NavigationContainer } from "@react-navigation/native";
import BatchHome from "./batch/BatchHome";

import { Dimensions } from 'react-native'
import UserAccount from "./UserAccount";
import ProcessHome from "./process/ProcessHome";

function GenericHome({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home Screen</Text>
    </View>
  );
}



function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}
    >
      <DrawerItemList {...props} />
     
    </DrawerContentScrollView>
  );
}

  const Drawer = createDrawerNavigator();
function MyDrawer() {
  const userState = React.useContext(UserContext)
  let homePage = GenericHome;
  if (userState && userState.user && userState.user.role == "QA")
     homePage = BatchHome
  if (userState && userState.user && userState.user.role == "PA")
    homePage = ProcessHome
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions= {{
        drawerStyle: {
         // width: Dimensions.get('window').width
        },
      }}
    >
      <Drawer.Screen name="Home" component={homePage} />
      <Drawer.Screen name="Logout" component={UserAccount} />
    </Drawer.Navigator>
  );
}

 const TopBar = () => {
   const userState = React.useContext(UserContext);
   let [user,setUser] = React.useState({}) 
   useEffect(() => {
     let isMounted = true;
     setUser(userState.user);
     return () => { 
       isMounted = false; 
     }
    },[])


 
   
   return (
     <>
       {userState.user ? 
      <NavigationContainer independent={true}>
          
          <MyDrawer/>
           

          {/* <View style={{
            flexDirection: "column", flex: 4, justifyContent: 'center', alignContent: 'center',
            alignItems: 'center'
          }}>
            <Image
              style={styles.tinyLogo}
              source={require('../images/sansera.png')} />
          </View>
          <View style={{
            justifyContent: 'center', alignContent: 'center', flexDirection: 'column', alignItems: 'center'
          }}>
           
            {user && user.memberName ? 
            <Text style={{color:appTheme.colors.cardTitle,fontSize:10,fontFamily:appTheme.fonts.semiBold}}>Welcome {util.capitalize(user.memberName)}</Text> :false }


           </View>

        </View>
   </View>  */}

      </NavigationContainer>
   :false}
     </>
   )
 }
 
 const styles = StyleSheet.create({
   sectionContainer: {
     marginTop: 32,
     paddingHorizontal: 24,
   },
   sectionTitle: {
     fontSize: 24,
     fontWeight: '600',
   },
   sectionDescription: {
     marginTop: 8,
     fontSize: 18,
     fontWeight: '400',
   },
   highlight: {
     fontWeight: '700',
   },
 });
 
 export default TopBar;
 