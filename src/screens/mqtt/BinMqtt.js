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
  Image,
  ProgressBarAndroid
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
import RequestDevice from './RequestDevice';
// import {ProgressBarAndroid} from '@react-native-community/progress-bar-android';

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
    setLowBatteryData([]);
    //clear low battery cache
    await AsyncStorage.setItem('lowBattery', JSON.stringify([]));
  };

  const openChooseBat = (e, type) => {
    showDialog(true);
    let dialogTitle = 'Choose Devices';
    setDialogType(type);
    setDialogTitle(dialogTitle);
  };

  const openDialog = (e, type) => {
    showDialog(true);
    let dialogTitle = 'Battery Status';
    let dialogMessage = '';
    setDialogType(type);
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
    //PubBatteryMqtt();
    //call publishBatteryMqtt
    e && e.length ? pubStatus(e) : pubBatteryStatus();
  };

  const closeClearModel = () => {
    showDialog(false);
    setDialogTitle('');
    setDialogMessage('');
    setDevices([]);
  };

  const openClearModel = (e,type) => {
    console.log("clearmodel")
    setDialogType(type);
    showDialog(true);
    setDialogTitle('Clear Bin Request');
    setDialogMessage('Are you sure you wish to clear all bin request ');
  };

  const reconnectToBinMQTT = () => {
    if (
      userState &&
      userState.user &&
      (userState.user.role === roles.MO || userState.user.role === roles.FO)
    ) {
      connectBinMQTT();
    }
  };

  const pubBatteryStatus = () => {
    try {
      if (binClient) {
        setLoadBatteryData(true);

        AsyncStorage.getItem('devices').then(devices => {
          JSON.parse(devices).map((item, index, {length}) => {
            setTimeout(() => {
              let publishParams = {devID: item, data: 'GB'};
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

  const pubStatus = item => {
    try {
      if (binClient) {
        let publishParams = {devID: item, data: 'GB'};
        binClient.publish(
          'GET_BAT_STS',
          JSON.stringify(publishParams),
          2,
          false,
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const connectBinMQTT = () => {
    let options = {...binMqttOptions};
    options.clientId = 'binclientId' + Date.now();
    MQTT.createClient(options)
      .then(client => {
        setBinClient(client);
        client.connect();

        client.on('closed', () => {
          console.log('mqtt.event.closed');
          setBinListeningEvent(false);
        });

        client.on('error', msg => {
          console.log('bin mqtt.event.error', msg);
          setBinListeningEvent(false);
        });

        client.on('message', msg => {
          let dataJson = JSON.parse(msg.data);
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
  const publishData = publishData => {
    binClient.on('connect', () => {
      console.log('publish data connected');
    });
  };
  const setUnReadEmptyBin = count => {
    setUnReadEmptyBinData(count.toString());
  };

  const handleBatSts = async dataJson => {
    let apiData = {
      op: 'get_device',
      device_id: dataJson.devID,
      unit_num: userState.user.unit_number,
    };
    let apiRes = await ApiService.getAPIRes(apiData, 'POST', 'mqtt');
    // console.log('apiRes ++', JSON.stringify(apiRes));
    let batteryJson = {
      elemNum: apiRes.response.message[0].element_num,
      devID: dataJson.devID,
      createdOn: new Date(),
      data: dataJson.data,
    };

    AsyncStorage.getItem('lowBattery').then(data => {
      if (data !== null) {
        // We have data!!

        let batteryData = JSON.parse(data);

        // by rakshith
        setLowBatteryData(prev => {
          prev.push(batteryJson);
          return [
            ...new Map(
              prev.map(device => [device.devID, device]), // by rakshith
            ).values(),
          ].sort((a, b) => a.elemNum > b.elemNum);
        });
        // setLowBatteryData(batteryData);
        AsyncStorage.setItem('lowBattery', JSON.stringify(batteryData));
      }
    });
  };

  var reqDevices = [];
  //switch press event handled here
  const handleSwitchPress = (dataJson, msg) => {
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
        //here we are adding to async storage
        AsyncStorage.getItem('emptyBinReq').then(binRequest => {
          let lRequest = [];
          let updateBinCount = false;
          if (!binRequest) {
            lRequest.push(curTop);
            updateBinCount = true;
          } else {
            lRequest = JSON.parse(binRequest);
            let index = lRequest.findIndex(
              item => item.element_id === curTop.element_id,
            );
            if (index > -1) {
              lRequest.splice(index, 1);
              lRequest.splice(0, 0, curTop);
              updateBinCount = true;
            } else {
              lRequest.push(curTop);
              updateBinCount = true;
            }
          }

          // empty bin request

          reqDevices.push(...lRequest);

          const uniqueDevices = [
            ...new Map(
              reqDevices.map(device => [device.element_id, device]),
            ).values(),
          ];

          AsyncStorage.setItem('emptyBinReq', JSON.stringify(uniqueDevices));

          if (updateBinCount) {
            AsyncStorage.getItem('emptyBinCount').then(count => {
              let newEmptyBinCount = 1;
              if (count && count.length) {
                newEmptyBinCount = parseInt(count) + 1;
              }
              setUnReadEmptyBin(newEmptyBinCount);
            });
          }
        });
        reqDevices = [];
      }
    });
  };

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
                  // onPress={e => openChooseBat(e, 'chooseDevices')}
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
                  {/* <MaterialCommunityIcons
                    name="battery"
                    size={30}
                    color={'black'}
                    style={{}}
                  /> */}
                  <Image
                    source={require('../../images/battery.png')}
                    style={{height: 30, width: 50}}
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

          {/* Clear Button */}
          <View
            style={{
              height: 100,
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}>
            <TouchableOpacity
              onPress={e => openClearModel(e, 'openClearModel')}
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

      {dialog && dialogType === 'openClearModel' ? (
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
              <View style={{alignItems: 'center'}}>
                {loadBatteryData ? (
                  <View
                    style={{
                      // backgroundColor: 'green',
                      // paddingHorizontal: 5,
                      height: 5,
                      justifyContent: 'center',
                      borderColor: '#2196F3',
                      borderWidth: 1,
                      borderRadius: 50,
                    }}>
                    <ProgressBarAndroid
                      styleAttr="Horizontal"
                      color="#2196F3"
                      width={1000}
                      height={20}
                    />
                  </View>
                ) : null}
              </View>
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

      {dialog && dialogType === 'chooseDevices' ? (
        <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          height={'50%'}
          okTitle={'BATTERY STATUS'}
          container={
            <RequestDevice closeDialog={closeDialog} openDialog={openDialog} />
          }
        />
      ) : (
        false
      )}
    </View>
  );
};

export default React.memo(BinMqtt);
