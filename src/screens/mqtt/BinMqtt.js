
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
const { Bar } = require("react-native-progress")
import * as Progress from 'react-native-progress';

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
  const [loadBatteryData, setLoadBatteryData] = useState(false)
  const [lowBatteryData, setLowBatteryData] = useState([])

  useEffect(() => {
    if (isFocused) {
      if (userState && userState.user) setUser(userState.user);
      if (userState && userState.user && userState.user.role === roles.MO) {
        connectBinMQTT()
      }
    }
    return () => {
    }
  }, [isFocused])

  const closeDialog = async () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setDialogType('')
    //clear low battery cache
    setLowBatteryData([])
    await AsyncStorage.setItem("lowBattery", JSON.stringify([]))


  }
  const openDialog = (e, type) => {
    showDialog(true);
    let dialogTitle = "Battery Status";
    let dialogMessage = "";
    setDialogType(type)
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
    //PubBatteryMqtt();
    //call publishBatteryMqtt
    pubBatteryStatus();
  }
  const reconnectToBinMQTT = () => {

    if (userState && userState.user && userState.user.role === roles.MO) {
      connectBinMQTT()
    }
  }

  const pubBatteryStatus = () => {
    try {
      if (binClient) {
        setLowBatteryData([])
        AsyncStorage.setItem("lowBattery", JSON.stringify([]))

        setLoadBatteryData(true)

        AsyncStorage.getItem("devices").then(devices => {
          JSON.parse(devices).map((item, index, { length }) => {
            setTimeout(() => {
              let publishParams = { devID: item, data: "GB" }
              console.log("devices publishParams here " + JSON.stringify(publishParams))
              binClient.publish("GET_BAT_STS", JSON.stringify(publishParams), 2, false)
              if (index + 1 === length) {
                setLoadBatteryData(false)
                //client.disconnect()
              }
            }, 1000 * index)
          });
        })
      }
    } catch (e) {
      console.log(e)
    }
  }
  const connectBinMQTT = () => {
    let options = { ...binMqttOptions }
    options.clientId = "binclientId" + Date
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
        console.log('mqtt.event.message bin mqtt', msg);
        console.log("bin request : " + JSON.stringify(msg))
        let dataJson = JSON.parse(msg.data)
        console.log(dataJson)
        console.log("++++++++")
        console.log(msg.topic)
        console.log("++++++++")

        if (msg.topic === "SWITCH_PRESS") {
          setTimeout(() => {
            handleSwitchPress(dataJson, msg)
          }, 10000)
        }

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
    let batteryJson = { devID: dataJson.devID, createdOn: new Date(), data: dataJson.data }
    AsyncStorage.getItem("lowBattery").then(data => {
      if (data !== null) {
        // We have data!!
        let batteryData = JSON.parse(data);
        batteryData.push(batteryJson)
        setLowBatteryData(batteryData)
        AsyncStorage.setItem("lowBattery", JSON.stringify(batteryData))
      }
    })
  }

  const handleSwitchPress = async (dataJson, msg) => {
    console.log("handleSwitchPress msg : " + JSON.stringify(msg))
    console.log("handleSwitchPress dataJson : " + JSON.stringify(dataJson))
    let deviceId = dataJson.devID;
    let binRequest = await AsyncStorage.getItem("emptyBinReq");
    console.log("binRequest " + binRequest)
    let request = [];
    let updateBinCount = false;
    let bins = await AsyncStorage.getItem("bins");
    let binData = JSON.parse(bins)
    let index = binData.findIndex(item => item.device_id === deviceId)
    if (index > -1) {
      let curTop = {
        "topic_name": msg.topic, "element_id": deviceId,
        "element_num": binData[index].element_num
      }
      console.log("curTop .. " + JSON.stringify(curTop))
      if (!binRequest) {
        request.push(curTop)
        updateBinCount = true;
      }
      else {
        request = JSON.parse(binRequest);
        let index = request.findIndex(item => item.element_id === curTop.element_id)
        console.log("check index " + index);
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
    }

    // let apiRes = await ApiService.getAPIRes(apiData, "POST", "mqtt")
    // console.log("apiRes .. " + JSON.stringify(apiRes))
    // if (apiRes && apiRes.status) {
    //   let deviceList = apiRes.response.message;
    //   if (deviceList[0].type === "rack") return;
    //   let curTop = {
    //     "topic_name": msg.topic, "element_id": deviceList[0].device_id,
    //     "element_num": deviceList[0].element_num
    //   }
    //   let binRequest = await AsyncStorage.getItem("emptyBinReq");
    //   console.log("binRequest " + binRequest)
    //   let request = [];
    //   let updateBinCount = false;
    //   if (!binRequest) {
    //     request.push(curTop)
    //     updateBinCount = true;
    //   }
    //   else {
    //     request = JSON.parse(binRequest);
    //     let index = request.findIndex(item => item.element_id === curTop.element_id)
    //     if (index > -1) {
    //       request.splice(index, 1);
    //       request.splice(0, 0, curTop)
    //       updateBinCount = true;
    //     }
    //     else {
    //       request.push(curTop)
    //       updateBinCount = true
    //     }
    //   }
    //   AsyncStorage.setItem("emptyBinReq", JSON.stringify(request));
    //   if (updateBinCount) {
    //     let count = await AsyncStorage.getItem("emptyBinCount")
    //     let newEmptyBinCount = 1;
    //     if (count && count.length)
    //       newEmptyBinCount = parseInt(count) + 1;
    //     setUnReadEmptyBin(newEmptyBinCount);
    //   }
    // }

  }

  const handleSwitchPress1 = (dataJson, msg) => {

    let deviceId = dataJson.devID;
    let apiData = { op: "get_device", device_id: deviceId, unit_num: userState.user.unit_number };
    ApiService.getAPIRes(apiData, "POST", "mqtt").then(apiRes => {
      if (apiRes && apiRes.status) {
        let deviceList = apiRes.response.message;
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

      {dialog && (dialogType === "batteryStatus") ? <CustomModal
        modalVisible={dialog} dialogTitle={dialogTitle}
        height={'70%'}
        dialogMessage={dialogMessage} okDialog={closeDialog}
        loadBatteryData={loadBatteryData}
        okTitle={"BATTERY STATUS"}

        container={
          <>
            <Bar progress={0.3} width={loadBatteryData ? 1000 : 0} />
            <LowBattery loadBatteryData={loadBatteryData} batteryData={lowBatteryData} />
          </>


        }
      /> : false}

    </View>
  )
}

export default React.memo(BinMqtt);
