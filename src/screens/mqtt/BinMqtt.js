import React, {useEffect, useState} from 'react';
import UserContext from '../UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MQTT from 'sp-react-native-mqtt';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {appTheme} from '../../lib/Themes';
import {ApiService} from '../../httpservice';
import {roles} from '../../constants/appConstants';
import {useIsFocused} from '@react-navigation/native';
import {binMqttOptions} from '../../constants/urlConstants';
import {EmptyBinContext} from '../../context/EmptyBinContext';
import LowBattery from '../battery/LowBattery';
import CustomModal from '../../components/CustomModal';
import PubBatteryMqtt from './PubBatteryMqtt';
import * as Progress from 'react-native-progress';
import {getItem, setItem} from '../../context/SyncStorage';
import {FlatList} from 'react-native-gesture-handler';
import AppStyles from '../../styles/AppStyles';

const {Bar} = require('react-native-progress');
const BinMqtt = props => {
  const userState = React.useContext(UserContext);
  const isFocused = useIsFocused();
  let [user, setUser] = React.useState({});
  const [binClient, setBinClient] = useState(undefined);
  const [binListeningEvent, setBinListeningEvent] = useState(false);
  const {setUnReadEmptyBinData, unReadTask} = React.useContext(EmptyBinContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('');
  const [loadBatteryData, setLoadBatteryData] = useState(false);
  const [lowBatteryData, setLowBatteryData] = useState([]);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    if (isFocused) {
<<<<<<< HEAD
      console.log('user effect binmqtt ');
=======
>>>>>>> 07d2d1f4919fb55d2430a5997aca9f41e6730369
      if (userState && userState.user) setUser(userState.user);
      if (
        userState &&
        userState.user &&
        (userState.user.role === roles.MO || userState.user.role === roles.FO)
      ) {
        connectBinMQTT();
      }
    }
    return () => {};
  }, [isFocused]);

  const closeDialog = async () => {
    showDialog(false);
    setDialogTitle('');
    setDialogMessage('');
    setDialogType('');
    //clear low battery cache
<<<<<<< HEAD
    console.log('clear low battery data ');
    await AsyncStorage.setItem('lowBattery', JSON.stringify([]));
  };
=======
    setLowBatteryData([])
    await AsyncStorage.setItem("lowBattery", JSON.stringify([]))


  }
>>>>>>> 07d2d1f4919fb55d2430a5997aca9f41e6730369
  const openDialog = (e, type) => {
    showDialog(true);
    let dialogTitle = 'Battery Status';
    let dialogMessage = '';
    setDialogType(type);
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
    //PubBatteryMqtt();
    //call publishBatteryMqtt
    pubBatteryStatus();
  };

  const closeClearModel = () => {
    showDialog(false);
    setDialogTitle('');
    setDialogMessage('');
    setDevices([]);
  };

  const openClearModel = type => {
    showDialog(true);
    setDialogTitle('Clear Bin Request');
    setDialogMessage('Are you sure you wish to clear all bin request ');
  };

  const reconnectToBinMQTT = () => {
<<<<<<< HEAD
    console.log(111);
    console.log(userState.user);
    console.log(roles.MO);
    console.log(userState.user.role === roles.MO);
    if (
      userState &&
      userState.user &&
      (userState.user.role === roles.MO || userState.user.role === roles.FO)
    ) {
      connectBinMQTT();
=======

    if (userState && userState.user && userState.user.role === roles.MO) {
      connectBinMQTT()
>>>>>>> 07d2d1f4919fb55d2430a5997aca9f41e6730369
    }
  };

  const pubBatteryStatus = () => {
    try {
<<<<<<< HEAD
      console.log('binClient here ' + binClient);
      if (binClient) {
        setLoadBatteryData(true);
=======
      if (binClient) {
        setLowBatteryData([])
        AsyncStorage.setItem("lowBattery", JSON.stringify([]))

        setLoadBatteryData(true)
>>>>>>> 07d2d1f4919fb55d2430a5997aca9f41e6730369

        AsyncStorage.getItem('devices').then(devices => {
          JSON.parse(devices).map((item, index, {length}) => {
            setTimeout(() => {
              let publishParams = {devID: item, data: 'GB'};
              console.log(
                'devices publishParams here ' + JSON.stringify(publishParams),
              );
              binClient.publish(
                'GET_BAT_STS',
                JSON.stringify(publishParams),
                2,
                false,
              );
              if (index + 1 === length) {
                setLoadBatteryData(false);
                //client.disconnect()
              }
            }, 1000 * index);
          });
        });
      }
    } catch (e) {
      console.log(e);
    }
  };
  const connectBinMQTT = () => {
<<<<<<< HEAD
    let options = {...binMqttOptions};
    options.clientId = 'binclientId' + Date.now();
    console.log(options);
    MQTT.createClient(options)
      .then(client => {
        setBinClient(client);
        client.connect();
=======
    let options = { ...binMqttOptions }
    options.clientId = "binclientId" + Date
      .now()
    MQTT.createClient(options).then((client) => {
      setBinClient(client)
      client.connect();
>>>>>>> 07d2d1f4919fb55d2430a5997aca9f41e6730369

        client.on('closed', () => {
          console.log('mqtt.event.closed');
          setBinListeningEvent(false);
        });

        client.on('error', msg => {
          console.log('bin mqtt.event.error', msg);
          setBinListeningEvent(false);
        });

        client.on('message', msg => {
          console.log('mqtt.event.message bin mqtt', msg);
          console.log('bin request : ' + JSON.stringify(msg));
          let dataJson = JSON.parse(msg.data);
          console.log(dataJson);
          console.log('++++++++');
          console.log(msg.topic);
          console.log('++++++++');

          if (msg.topic === 'SWITCH_PRESS') handleSwitchPress(dataJson, msg);
          if (msg.topic === 'BAT_STS') handleBatSts(dataJson);
        });

        client.on('connect', () => {
          console.log('connected');
          setBinListeningEvent(true);
          let mqttTopics = ['SWITCH_PRESS', 'BAT_STS'];
          mqttTopics.map(item => {
            client.subscribe(item, 2);
          });
        });
        setBinClient(client);
      })
      .catch(err => {
        console.log('bin switch err : ' + err);
        setBinListeningEvent(false);
      });
  };

<<<<<<< HEAD
  const publishData = publishData => {
    binClient.on('connect', () => {
      console.log('publish data connected');
    });
  };
  const setUnReadEmptyBin = count => {
    setUnReadEmptyBinData(count.toString());
  };
=======
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
>>>>>>> 07d2d1f4919fb55d2430a5997aca9f41e6730369

  const handleBatSts = dataJson => {
    let batteryJson = {
      devID: dataJson.devID,
      createdOn: new Date(),
      data: dataJson.data,
    };
    AsyncStorage.getItem('lowBattery').then(data => {
      if (data !== null) {
        // We have data!!
<<<<<<< HEAD
        console.log('which data : ' + JSON.parse(data));
        let batteryData = JSON.parse(data);
        batteryData.push(batteryJson);
        setLowBatteryData(batteryData);
        AsyncStorage.setItem('lowBattery', JSON.stringify(batteryData));
=======
        let batteryData = JSON.parse(data);
        batteryData.push(batteryJson)
        setLowBatteryData(batteryData)
        AsyncStorage.setItem("lowBattery", JSON.stringify(batteryData))
>>>>>>> 07d2d1f4919fb55d2430a5997aca9f41e6730369
      }
    });
  };

<<<<<<< HEAD
  //switch press event handled here
  const handleSwitchPress = (dataJson, msg) => {
    //
    // switch press event dataJson
    console.log('switch press event dataJson ' + JSON.stringify(dataJson));

    // switch press event msg
    console.log('switch press event msg ' + JSON.stringify(msg));
=======
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
>>>>>>> 07d2d1f4919fb55d2430a5997aca9f41e6730369

    let deviceId = dataJson.devID;
    let apiData = {
      op: 'get_device',
      device_id: deviceId,
      unit_num: userState.user.unit_number,
    };

    ApiService.getAPIRes(apiData, 'POST', 'mqtt').then(apiRes => {
      if (apiRes && apiRes.status) {
        let deviceList = apiRes.response.message;
        if (deviceList[0].type === 'rack') return;
        let curTop = {
          topic_name: msg.topic,
          element_id: deviceList[0].device_id,
          element_num: deviceList[0].element_num,
        };
        setDevices(prev =>
          !prev.includes(curTop.element_num)
            ? [curTop.element_num, ...prev]
            : [...prev],
        );

        // curTop
        console.log('curTop ++++ ' + JSON.stringify(curTop));

        //here we are adding to async storage

        getItem('emptyBinReq').then(binRequest => {
          // AsyncStorage.getItem('emptyBinReq').then(binRequest => {

          let request = [];
          let updateBinCount = false;
          if (!binRequest) {
            request.push(curTop);
            updateBinCount = true;
          } else {
            request = JSON.parse(binRequest);
            let index = request.findIndex(
              item => item.element_id === curTop.element_id,
            );

            // request index
            console.log('request index ' + index);

            if (index > -1) {
              // console.log(
              //   'splice ++++++++\n+++++++++++++++',
              //   JSON.stringify(request.splice(index, 1)),
              // );
              // console.log(
              //   'splice ++++++++\n+++++++++++++++',
              //   JSON.stringify(request.splice(0, 0, curTop)),
              // );
              request.splice(index, 1);
              request.splice(0, 0, curTop);
              updateBinCount = true;
            } else {
              request.push(curTop);

              console.log(
                '///////////////////////////// curTop ' +
                  JSON.stringify(curTop),
              );

              updateBinCount = true;
            }
          }

          // empty bin request
          console.log('empty bin request : ' + JSON.stringify(request));

          AsyncStorage.setItem('emptyBinReq', JSON.stringify(request));

          if (updateBinCount) {
            AsyncStorage.getItem('emptyBinCount').then(count => {
              let newEmptyBinCount = 1;
              if (count && count.length) newEmptyBinCount = parseInt(count) + 1;
              setUnReadEmptyBin(newEmptyBinCount);
            });
          }
        });
      }
<<<<<<< HEAD
    });
  };

=======
    })
  }
>>>>>>> 07d2d1f4919fb55d2430a5997aca9f41e6730369
  return (
    <View style={{flexDirection: 'column', padding: 5}}>
      {user && (user.role === roles.MO || user.role === roles.FO) ? (
        binListeningEvent ? (
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: 'white',
              marginHorizontal: user.role === roles.FO ? 10 : null,
              padding: user.role === roles.FO ? 1 : null,
            }}>
            <View
              style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
              <Text
                style={{
                  color: appTheme.colors.successAction,
                  marginRight: 10,
                  fontFamily: appTheme.fonts.bold,
                }}>
                {' '}
                CONNECTED
              </Text>
              <MaterialCommunityIcons
                name="wifi"
                size={30}
                color={appTheme.colors.successAction}
                style={{}}
              />
            </View>
            {user && user.role === roles.MO ? (
              <>
                <View style={{flex: 1}}>
                  <Text
                    style={{
                      color: appTheme.colors.cancelAction,
                      marginRight: 10,
                      fontFamily: appTheme.fonts.bold,
                    }}>
                    {' '}
                    {unReadTask && unReadTask.length && unReadTask != '0'
                      ? ' ' + unReadTask + ' unread notifications'
                      : ''}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={e => openDialog(e, 'batteryStatus')}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    flex: 3,
                    marginRight: 10,
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      fontFamily: appTheme.fonts.bold,
                    }}></Text>
                  <MaterialCommunityIcons
                    name="battery"
                    size={30}
                    color={'black'}
                    style={{}}
                  />
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        ) : (
          <View style={{flexDirection: 'row', backgroundColor: 'white'}}>
            <TouchableOpacity
              onPress={e => reconnectToBinMQTT(e)}
              style={{flexDirection: 'row', justifyContent: 'center', flex: 1}}>
              <Text
                style={{
                  color: 'red',
                  marginRight: 10,
                  fontFamily: appTheme.fonts.bold,
                }}>
                RECONNECT
              </Text>
              <MaterialCommunityIcons
                name="wifi-off"
                size={30}
                color={'red'}
                style={{}}
              />
            </TouchableOpacity>
          </View>
        )
      ) : null}
      {/* Switch Press */}
      {user && user.role === roles.FO && devices && devices != 0 ? (
        <View
          style={{
            backgroundColor: '#242a85',
            marginHorizontal: 10,
            flexDirection: 'row',
            alignItems: 'center',
            maxHeight: 122,
          }}>
          <View
            style={{
              flex: 1,
              minWidth: '80%',
              margin: 8,
            }}>
            <FlatList
              data={devices}
              numColumns={5}
              renderItem={item => (
                <View
                  style={{
                    alignItems: 'center',
                    marginHorizontal: 10,
                    margin: 10,
                    paddingHorizontal: 40,
                    paddingVertical: 15,
                    backgroundColor: '#fff',
                    maxWidth: 250,
                    borderRadius: 14,
                  }}>
                  <Text
                    style={[
                      AppStyles.title,
                      {textAlign: 'center', fontSize: 16},
                    ]}>
                    Switch Pressed
                  </Text>
                  <Text
                    style={[
                      AppStyles.warnButtonTxt,
                      {textAlign: 'center', fontSize: 18},
                    ]}>
                    {item.item}
                  </Text>
                </View>
              )}
            />
          </View>

<<<<<<< HEAD
          {/* Clear Button */}
          <View
            style={{
              height: 100,
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}>
            <TouchableOpacity
              onPress={openClearModel}
              style={{
                height: 80,
                width: 80,
                backgroundColor: '#c75252',
                justifyContent: 'center',
                borderRadius: 10,
              }}>
              <Text
                style={[
                  AppStyles.warnButtonTxt,
                  {
                    textAlign: 'center',
                    fontSize: 18,
                    color: '#fff',
                    margin: 2,
                  },
                ]}>
                CLEAR ALL
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
=======
      {dialog && (dialogType === "batteryStatus") ? <CustomModal
        modalVisible={dialog} dialogTitle={dialogTitle}
        height={'70%'}
        dialogMessage={dialogMessage} okDialog={closeDialog}
        loadBatteryData={loadBatteryData}
        okTitle={"BATTERY STATUS"}
>>>>>>> 07d2d1f4919fb55d2430a5997aca9f41e6730369

      {dialog ? (
        <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          okDialog={closeClearModel}
          closeDialog={() => {
            showDialog(false);
          }}
          height={'40%'}
        />
      ) : (
        false
      )}

      {dialog && dialogType === 'batteryStatus' ? (
        <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          height={'70%'}
          dialogMessage={dialogMessage}
          okDialog={closeDialog}
          loadBatteryData={loadBatteryData}
          okTitle={'BATTERY STATUS'}
          container={
            <>
              <Bar progress={0.3} width={loadBatteryData ? 1000 : 0} />
              <LowBattery
                loadBatteryData={loadBatteryData}
                batteryData={lowBatteryData}
              />
            </>
          }
        />
      ) : (
        false
      )}
    </View>
  );
};

export default React.memo(BinMqtt);
