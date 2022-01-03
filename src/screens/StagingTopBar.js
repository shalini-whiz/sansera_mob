
import React, { useEffect } from "react";
import {  StyleSheet, Text, View, Image } from 'react-native';
import { util } from "../commons";
import UserContext from "./UserContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { SvgCss } from 'react-native-svg';
import { AppIcon } from '../svgs/AppIcon';
import { MachineOp, ForkOp } from "../svgs/UserOp"
import {DownArrow } from "../svgs/ArrowIcon"
import { appTheme } from "../lib/Themes";

const StagingTopBar = () => {
  const userState = React.useContext(UserContext);
  let [user, setUser] = React.useState({})
  useEffect(() => {
    let isMounted = true;
    setUser(userState.user);
    return () => {
      isMounted = false;
    }
  }, [])


  return (
    <View style={{ display: 'flex' }}>
      <View style={{ flexDirection: 'row', padding: 10, display: 'flex', backgroundColor: appTheme.colors.topBarBackground }}>
        <SvgCss xml={AppIcon} width={40} height={40}/>

       
        <View style={{ flexDirection: "column", flex: 4,justifyContent:'center',alignContent:'center',
        alignItems:'center' }}>
            
             
             
            <Image
              style={styles.tinyLogo}
              source={require('../images/sansera.png')}/>
              
            
           
          
        </View>
        <View style={{
          justifyContent: 'center', alignContent: 'center', flexDirection: 'column',alignItems:'center'
        }}>
          {/* {user && user.role ? (user.role === "manager" ? <SvgCss xml={MachineOp('#FFC107')} width={35} height={35} />
            : <SvgCss xml={ForkOp('#FFC107')} width={35} height={35} />) : false} */}
          {user && user.memberName ? 
          <Text style={{ color: appTheme.colors.cardTitle, fontSize: 10,alignSelf:'center',fontFamily:appTheme.fonts.semiBold }}>Welcome {util.capitalize(user.memberName)}</Text> : false}


        </View>
      </View>
    </View>
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

export default StagingTopBar;
