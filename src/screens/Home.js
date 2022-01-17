
import React, { useEffect } from "react";
import UserContext from "./UserContext";
import TopBar from "./TopBar";
import BatchHome from "./batch/BatchHome";
import { clearTopics } from './notification/NotifyHandler';
import CustomModal from "../components/CustomModal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from "./Login";
import ProcessHome from "./process/ProcessHome";
import ProcessStages from "./ProcessStages"
import { roles } from "../constants/appConstants";
import { View } from "react-native";
import { useIsFocused } from '@react-navigation/native';




const Home = () => {
  const userState = React.useContext(UserContext);
  let [user, setUser] = React.useState({})
  const [dialog, showDialog] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState('')
  const [dialogMessage, setDialogMessage] = React.useState('');
  const isFocused = useIsFocused();

  useEffect(() => {
    if(isFocused){
      if (userState && userState.user) setUser(userState.user);
    }
    return () => { }
  }, [isFocused])

  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
  }
  const openDialog = () => {
    showDialog(true);
    setDialogTitle('Confirm Logout');
    let message = "Are you sure you want to log out ?"
    setDialogMessage(message);
  }
  const logout = async () => {
    closeDialog()
    await AsyncStorage.clear();
    setUser(null);
    clearTopics(userState && userState.user && userState.user.id);
    clearTopics("fifo-push");
  }

  return (

    <View style={{flexDirection:'column',flex:1}}>
      {user ? <TopBar openLogOut={openDialog}/> : <Login/>}   
      {user &&  user.role === roles.QA ? <BatchHome/> : false}
      {user && user.role === roles.PL ? <ProcessHome/> : false}
      {user && user.role === roles.MO ? <ProcessStages  /> : false}
      {dialog ? <CustomModal
        modalVisible={dialog}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
        closeDialog={closeDialog}
        okDialog={logout}
      /> : false}

    </View>
  )
}

export default Home;
