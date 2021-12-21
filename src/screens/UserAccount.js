import React, { useEffect, useReducer } from 'react';
import { StyleSheet, Text, View,TouchableOpacity } from 'react-native';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { util } from '../commons';
import  UserContext  from "./UserContext";
import { clearTopics } from './notification/NotifyHandler';
import TopBar from './TopBar';
import { appTheme } from '../lib/Themes';
import { SvgCss } from "react-native-svg"
import { MachineOp, ForkOp } from "../svgs/UserOp"
import { LogoutIcon } from "../svgs/GenericIcon"
import App from '../../App';
const styles = StyleSheet.create({
  container: {
   flex: 1,
  //margin:2,
   //padding:5
  },
  sucButtonContainer: {
    margin:5,
    borderRadius: 25,
    padding:5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D3380",
  },
  buttonText:{
    color:'white'
  },
  userTitle:{
    fontFamily:appTheme.fonts.semiBold,
    color:appTheme.colors.cardTitle,
    fontSize:30
  },
  canButtonContainer: {
    //flex: 1,
    margin: 5,
    borderRadius: 25,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: appTheme.colors.cancelAction,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 3,
  },
  canButtonTxt: {
    color: appTheme.colors.cancelActionTxt,
    fontSize: 16,
    margin: 5,
    fontFamily: appTheme.fonts.bold

  },
});


const UserAccount = ({navigation,route}) => {
  let [user,setUser] = React.useState({})
  const userState= React.useContext(UserContext);

  useEffect(() => {
    let mounted = true;
    if(mounted){
      setUser(userState.user)
    }
    return () => { 
      mounted = false; 
    }
  },[])

 
  const logout = async() => {
    await AsyncStorage.clear();
    setUser(null);
    clearTopics(userState && userState.user && userState.user.id);
    clearTopics("fifo-push");
    //navigation.push('Login');
    console.log(navigation)
    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: 'Login' }],
    // });
  }

  return (
    <>
    {user ? 
    <View style={[styles.container,{backgroundColor:appTheme.colors.screenBackground,margin:5,padding:5}]}>
      <View style={{display:'flex',flex:1,flexDirection:'column',alignItems:'center',justifyContent:'center',marginTop:50}}>
          {user && user.roleName ? (
            user.role === "manager" ? 
            <SvgCss xml={MachineOp(appTheme.colors.activeTab)} width={250} height={250}/> :
              <SvgCss xml={ForkOp(appTheme.colors.activeTab)} width={250} height={250} /> 
            )
           : false}
          <Text style={styles.userTitle}>{user && user.memberName ? util.capitalize(user.memberName) : ''}</Text>
      
          <TouchableOpacity style={[styles.canButtonContainer, { width: '40%', justifyContent: 'center',
          flexDirection:'row' }]}
            onPress={(e) => logout(e)} >
            <Text style={styles.canButtonTxt}>LOGOUT</Text>
            <SvgCss xml={LogoutIcon(appTheme.colors.cancelActionTxt)} width={20} height={20} style={{margin:2}}/>

          </TouchableOpacity>
      </View>
      <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

       
      </View>
        </View> : <App />}
      </>
  );
}

export default UserAccount;