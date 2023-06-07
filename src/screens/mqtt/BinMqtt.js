
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
import { EmptyBinContext } from "../../context/EmptyBinContext";
import LowBattery from "../battery/LowBattery";
import CustomModal from "../../components/CustomModal";
import PubBatteryMqtt from "./PubBatteryMqtt";



const BinMqtt = (props) => {
  const userState = React.useContext(UserContext);
  const isFocused = useIsFocused();
  let [user, setUser] = React.useState({})
  const [binClient, setBinClient] = useState(undefined);
  const [binListeningEvent, setBinListeningEvent] = useState(false);
  const { setUnReadEmptyBinData, unReadTask } = React.useContext(EmptyBinContext)
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('')

  useEffect(() => {
    if (isFocused) {
      console.log("user effect binmqtt ")
      if (userState && userState.user) setUser(userState.user);
      if (userState && userState.user && userState.user.role === roles.MO) {
        connectBinMQTT()

        // let binTopics;
        // if (props && props.binTopics && props.binTopics.length)
        //   binTopics = JSON.parse(props.binTopics)
        // AsyncStorage.getItem("bins").then(topics => {
        //   if (topics) binTopics = JSON.parse(topics)
        //   if (binTopics && binTopics.length)
        //     connectBinMQTT(binTopics)
        // })
      }
    }
    return () => {
    }
  }, [isFocused])

  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setDialogType('')
  }
  const openDialog = (e, type) => {
    showDialog(true);
    let dialogTitle = "Battery Status";
    let dialogMessage = "";
    setDialogType(type)
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
    PubBatteryMqtt()

    //call publishBatteryMqtt
  }
  const reconnectToBinMQTT = () => {
    console.log(111)
    console.log(userState.user)
    console.log(roles.MO)
    console.log(userState.user.role === roles.MO)
    if (userState && userState.user && userState.user.role === roles.MO) {
      connectBinMQTT()

      // let binTopics;
      // if (props && props.binTopics && props.binTopics.length)
      //   binTopics = JSON.parse(props.binTopics)
      // AsyncStorage.getItem("bins").then(topics => {
      //   if (topics) binTopics = JSON.parse(topics)
      //   if (binTopics && binTopics.length)
      //     // connectBinMQTT(binTopics)
      // })
    }
  }


  const connectBinMQTT = () => {
    let options = { ...binMqttOptions }
    options.clientId = "binclientId" + Date
      .now()
    console.log(options);
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
        console.log('mqtt.event.message bin mqtt', msg);
        console.log("bin request : " + JSON.stringify(msg))
        let dataJson = JSON.parse(msg.data)
        console.log(dataJson)
        console.log("++++++++")
        console.log(msg.topic)
        console.log("++++++++")

        if (msg.topic === "SWITCH_PRESS") handleSwitchPress(dataJson, msg)
        if (msg.topic === "BAT_STS") handleBatSts(dataJson)
      });

      client.on('connect', () => {
        console.log('connected');
        setBinListeningEvent(true);
        let mqttTopics = ['SWITCH_PRESS', 'BAT_STS']
        mqttTopics.map(item => {
          client.subscribe(item, 2)
        })

      });
      setBinClient(client)

    }).catch((err) => {
      console.log("bin switch err : " + err);
      setBinListeningEvent(false);
    });
  }

  const setUnReadEmptyBin = (count) => {
    setUnReadEmptyBinData(count.toString())
  }

  const handleBatSts = (dataJson) => {
    console.log("low battery " + JSON.stringify(dataJson))
    let batteryJson = { devID: dataJson.devID, createdOn: new Date(), data: dataJson.data }
    AsyncStorage.getItem("lowBattery").then(data => {
      console.log("data here " + data)
      console.group(typeof data)

      if (data !== null) {
        // We have data!!
        console.log(JSON.parse(data));
        let batteryData = JSON.parse(data);
        batteryData.push(batteryJson)
        AsyncStorage.setItem("lowBattery", JSON.stringify(batteryData))
      }

    })
  }

  const handleSwitchPress = (dataJson, msg) => {
    let deviceId = dataJson.devID;
    let apiData = { op: "get_device", device_id: deviceId, unit_num: userState.user.unit_number };
    ApiService.getAPIRes(apiData, "POST", "mqtt").then(apiRes => {
      console.log("apiRes here binmqtt " + JSON.stringify(apiRes))
      if (apiRes && apiRes.status) {
        let deviceList = apiRes.response.message;
        console.log(deviceList[0].type)
        if (deviceList[0].type === "rack") return;
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
          if (updateBinCount) {
            AsyncStorage.getItem("emptyBinCount").then(count => {
              let newEmptyBinCount = 1;
              if (count && count.length)
                newEmptyBinCount = parseInt(count) + 1;
              setUnReadEmptyBin(newEmptyBinCount);
            })
          }
        });
      }
    })
  }

  return (
    <View style={{ flexDirection: 'column', padding: 5 }}>
      {user && user.role === roles.MO ? (binListeningEvent ?
        <View style={{ flexDirection: 'row', backgroundColor: 'white' }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Text style={{ color: appTheme.colors.successAction, marginRight: 10, fontFamily: appTheme.fonts.bold }}> CONNECTED
            </Text>
            <MaterialCommunityIcons name="wifi" size={30} color={appTheme.colors.successAction} style={{}} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              color: appTheme.colors.cancelAction, marginRight: 10,
              fontFamily: appTheme.fonts.bold
            }}> {(unReadTask && unReadTask.length && unReadTask != "0" ? (" " + unReadTask + " unread notifications") : '')}
            </Text>
          </View>
          <TouchableOpacity onPress={(e) => openDialog(e, "batteryStatus")}
            style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 3, marginRight: 10 }}>
            <Text style={{ color: 'black', fontFamily: appTheme.fonts.bold }}></Text>
            <MaterialCommunityIcons name="battery" size={30} color={"black"} style={{}} />
          </TouchableOpacity>
        </View> :
        <View style={{ flexDirection: 'row', backgroundColor: 'white' }}>
          <TouchableOpacity onPress={(e) => reconnectToBinMQTT(e)}
            style={{ flexDirection: 'row', justifyContent: 'center', flex: 1 }}>
            <Text style={{ color: 'red', marginRight: 10, fontFamily: appTheme.fonts.bold }}>RECONNECT</Text>
            <MaterialCommunityIcons name="wifi-off" size={30} color={"red"} style={{}} />
          </TouchableOpacity>
        </View>) : false}

      {dialog && (dialogType === "batteryStatus") ? <CustomModal modalVisible={dialog} dialogTitle={dialogTitle}
        dialogMessage={dialogMessage} okDialog={closeDialog}
        okTitle={"BATTERY STATUS"} container={<LowBattery />}
      /> : false}

    </View>
  )
}

export default React.memo(BinMqtt);
