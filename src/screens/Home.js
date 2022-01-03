
import React, { useEffect,useState } from "react";
import UserAccount from "./UserAccount";
// import ProcessStages from "./StagingList";
import UserContext from "./UserContext";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TopBar from "./TopBar";
import BatchHome from "./batch/BatchHome";
import { clearTopics } from './notification/NotifyHandler';
import CustomModal from "../components/CustomModal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from "./Login";
import ProcessHome from "./process/ProcessHome";
import ProcessStages from "./ProcessStages"
import { roles } from "../constants/appConstants";
import { mqttOptions } from "../constants";
import MQTT from 'sp-react-native-mqtt';

const Tab = createBottomTabNavigator();


const Home = ({ navigation, route }) => {
  const userState = React.useContext(UserContext);
  let [user, setUser] = React.useState({})
  const [dialog, showDialog] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState('')
  const [dialogMessage, setDialogMessage] = React.useState('');
  const [client, setClient] = useState(undefined);
  const [listeningEvent,setListeningEvent] = useState(false);

  let params = {}
  if (route && route.params) {
    params = route.params
  }
  console.log("home user state "+ userState.user)

  useEffect(() => {
    let isMounted = true;
    setUser(userState.user);
    if(userState.user.role ===  "MO"){
      AsyncStorage.getItem("bins").then(binTopics => {
        connectMQTT(JSON.parse(binTopics))
      })
    }
    return () => {
      isMounted = false;
    }
  }, [])

  const connectMQTT = (topics) => {
    let options = { ...mqttOptions }
    MQTT.createClient(options).then((client) => {
      setClient(client)
      client.connect();

      client.on('closed', () => {
        console.log('mqtt.event.closed');
        setListeningEvent(false);

      });

      client.on('error', (msg) => {
        console.log('mqtt.event.error', msg);
        setListeningEvent(false);
      });

      client.on('message', (msg) => {
        console.log('mqtt.event.message', msg);
        //this.setState({ message: JSON.stringify(msg) });

        

      });

      client.on('connect', () => {
        console.log('connected');
        setListeningEvent(true);
        console.log("swtich bins " + JSON.stringify(topics));
        topics.map(item => {
          client.subscribe(item.topic_name, 2)
        })

      });
      setClient(client)

    }).catch((err) => {
      console.log(err);
      setListeningEvent(false);
    });
  }
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
    console.log(props)
    //props.navigation.navigate('Login', { screen: "Login" })

  }

  return (

    <>
      {user ? <TopBar openLogOut={openDialog}/> : <Login/>}
      {user &&  user.role === roles.QA ? <BatchHome/> : false}
      {user && user.role === roles.PL ? <ProcessHome/> : false}
      {user && user.role === roles.MO ? <ProcessStages navigation={navigation} /> : false}
      {dialog ? <CustomModal
        modalVisible={dialog}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
        closeDialog={closeDialog}
        okDialog={logout}
      /> : false}

    </>
  )
}

export default Home;
