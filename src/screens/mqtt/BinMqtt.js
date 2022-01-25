
import React, { useEffect, useState } from "react";
import UserContext from "../UserContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import MQTT from 'sp-react-native-mqtt';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, Alert, ActivityIndicator } from "react-native";
import { appTheme } from "../../lib/Themes";
import { ApiService } from "../../httpservice";
import { roles } from "../../constants/appConstants";
import { useIsFocused } from '@react-navigation/native';
import { binMqttOptions } from "../../constants/urlConstants";



const BinMqtt = (props) => {
  const userState = React.useContext(UserContext);
  const isFocused = useIsFocused();
  let [user, setUser] = React.useState({})
  const [binClient, setBinClient] = useState(undefined);
  const [binListeningEvent, setBinListeningEvent] = useState(false);

  useEffect(() => {
    if (isFocused) {
      console.log("user effect binmqtt ")
      if (userState && userState.user) setUser(userState.user);
      if (userState && userState.user && userState.user.role === roles.MO) {
        let binTopics;
        if (props && props.binTopics && props.binTopics.length)
          binTopics = JSON.parse(props.binTopics)
        AsyncStorage.getItem("bins").then(topics => {
          if (topics) binTopics = JSON.parse(topics)
          if (binTopics && binTopics.length)
            connectBinMQTT(binTopics)
        })
      }
    }
    return () => {
    }
  }, [isFocused])

  const reconnectToBinMQTT = () => {
    if (userState && userState.user && userState.user.role === roles.MO) {
      let binTopics;
      if (props && props.binTopics && props.binTopics.length)
        binTopics = JSON.parse(props.binTopics)
      AsyncStorage.getItem("bins").then(topics => {
        if (topics) binTopics = JSON.parse(topics)
        if (binTopics && binTopics.length)
          connectBinMQTT(binTopics)
      })
    }
  }

  const connectBinMQTT = (topics) => {
    let options = { ...binMqttOptions }
    options.clientId = "binclientId"+Date
    .now()
    MQTT.createClient(options).then((client) => {
      setBinClient(client)
      client.connect();

      client.on('closed', () => {
        console.log('mqtt.event.closed');
        setBinListeningEvent(false);
      });

      client.on('error', (msg) => {
        console.log('bin mqtt.event.error', msg);
        setBinListeningEvent(false);
      });

      client.on('message', (msg) => {
        console.log('mqtt.event.message', msg);
        console.log("bin request : " + JSON.stringify(msg))
        let deviceId = msg.topic.split("/")[1];
        let apiData = { op: "get_device", device_id: deviceId };
        ApiService.getAPIRes(apiData, "POST", "mqtt").then(apiRes => {
          if (apiRes && apiRes.status) {
            let deviceList = apiRes.response.message;
            let curTop = {
              "topic_name": msg.topic, "element_id": deviceList[0].device_id,
              "element_num": deviceList[0].element_num
            }
            AsyncStorage.getItem("emptyBinReq").then(binRequest => {
              let request = [];
              let updateBinCount = false;
              if (!binRequest) {
                request.push(curTop)
                updateBinCount = true;
              }
              else {
                request = JSON.parse(binRequest);
                let index = request.findIndex(item => item.element_id === curTop.element_id)
                if (index > -1) {
                  request.splice(index, 1);
                  request.splice(0, 0, curTop)
                  updateBinCount = true;
                }
                else {
                  request.push(curTop)
                  updateBinCount = true
                }
              }
              AsyncStorage.setItem("emptyBinReq", JSON.stringify(request));
              if(updateBinCount){
                AsyncStorage.getItem("unReadEmptyBin").then(count => {
                  let newEmptyBinCount = 1;
                  if (count && count.length)
                    newEmptyBinCount = parseInt(count) + 1;
                  setUnReadEmptyBin(newEmptyBinCount);
                  AsyncStorage.setItem("unReadEmptyBin",newEmptyBinCount.toString())
                })
              }              
            });

          }
        })
        //this.setState({ message: JSON.stringify(msg) });



      });

      client.on('connect', () => {
        console.log('connected');
        setBinListeningEvent(true);
        topics.map(item => {
          client.subscribe(item.topic_name, 2)
        })

      });
      setBinClient(client)

    }).catch((err) => {
      console.log("bin switch err : " + err);
      setBinListeningEvent(false);
    });
  }

  const setUnReadEmptyBin = (count) =>{
    console.log("on set "+count);
    props.setEmptyBinCount(count.toString())
  } 

  return (

    <View style={{ flexDirection: 'column',padding:5 }}>
      {user && user.role === roles.MO ? (binListeningEvent ?
        <View style={{ flexDirection: 'row',backgroundColor:'white' }}>
          <Text style={{ color: appTheme.colors.successAction, marginRight: 10, fontFamily: appTheme.fonts.bold }}> CONNECTED
          </Text>
          <MaterialCommunityIcons name="wifi" size={30} color={appTheme.colors.successAction} style={{}} />
        </View> : 
        <View style={{ flexDirection: 'row', backgroundColor: 'white' }}>

        <TouchableOpacity onPress={(e) => reconnectToBinMQTT(e)} style={{flexDirection:'row',justifyContent:'center'}}>
          <Text style={{ color: 'red', marginRight: 10, fontFamily: appTheme.fonts.bold }}>RECONNECT</Text>
          <MaterialCommunityIcons name="wifi-off" size={30} color={"red"} style={{}} />

        </TouchableOpacity></View>) : false}
    </View>
  )
}

export default BinMqtt;
