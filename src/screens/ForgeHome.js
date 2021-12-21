
import React, { useEffect } from "react";
import SwapBin from "./SwapBin";
import UserAccount from "./UserAccount";
// import ProcessStages from "./StagingList";
import ProcessStages from "./ProcessStages";
import UserContext from "./UserContext";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { UserIcon, SwapBinIcon, HomeIcon} from "../svgs/TabIcons"
import { SvgCss} from "react-native-svg"
import { appTheme } from "../lib/Themes";
import BatchDetails from "./batch/BatchDetails";
import BatchHome from "./batch/BatchHome";
const Tab = createBottomTabNavigator();

const ForgeHome = ({ navigation, route }) => {
  //const userState = React.useContext(UserContext);
  //let [user, setUser] = React.useState({})
  let params = {}
  if (route && route.params) {
    params = route.params
  }

  useEffect(() => {
    let isMounted = true;
    //setUser(userState.user);
    return () => {
      isMounted = false;
    }
  }, [])


  return (
    <Tab.Navigator initialRouteName="Batch"
      tabBarOptions={{ 
        labelPosition: "below-icon", 
        activeTintColor: appTheme.colors.activeTab,
        inactiveTintColor: appTheme.colors.inactiveTab,
        labelStyle:{
          //padding:5,
        },
        style:{
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
         // height:70
        }
      }} 




      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {          
          if(route.name === "Swap Bin")
            return <SvgCss xml={SwapBinIcon(focused ? appTheme.colors.activeTab : appTheme.colors.inactiveTab)} width={30} height={30}/>
          else if (route.name === "User") 
            return <SvgCss xml={UserIcon(focused ? appTheme.colors.activeTab : appTheme.colors.inactiveTab)} width={30} height={30} />
          else 
            return <SvgCss xml={HomeIcon(focused ? appTheme.colors.activeTab : appTheme.colors.inactiveTab)} width={30} height={30}/>
        },
      })}
      >
      {/* <Tab.Screen name="Stages" initialParams={params} component={ProcessStages}
        options={{
          tabBarLabel: 'Stages',
        }} 
      /> */}

      {/* <Tab.Screen name="Swap Bin" component={SwapBin}
        options={{
          tabBarLabel: 'Swap Bin',
        }}
      /> */}


      <Tab.Screen name="Batch" component={BatchHome}
        options={{
          tabBarLabel: 'Batch',
        }}
      />
      <Tab.Screen name="User" component={UserAccount}
        options={{
          tabBarLabel: 'User',
        }}
      />

    </Tab.Navigator>
  )
}

export default ForgeHome;
