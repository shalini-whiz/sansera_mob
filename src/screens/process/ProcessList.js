import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Touchable,
  Pressable,
} from 'react-native';
import {appTheme} from '../../lib/Themes';
import {ApiService} from '../../httpservice';
import CustomModal from '../../components/CustomModal';
import UserContext from '../UserContext';
import {useIsFocused} from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RejectionData from './RejectionData';
import ErrorModal from '../../components/ErrorModal';
import {ProcessFifo} from './ProcessFifo';
import PublishMqtt from '../mqtt/PublishMqtt';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {SvgCss} from 'react-native-svg';
import {BinOutIcon} from '../../svgs/BinIcon';

export default function ProcessList() {
  const flatlistRef = useRef();

  const userState = React.useContext(UserContext);
  const isFocused = useIsFocused();

  const [apiError, setApiError] = useState('');
  const [apiStatus, setApiStatus] = useState(false);
  const [indicator, setIndicator] = useState(false);
  const [batchDet, setBatchDet] = useState({});
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [process, setProcess] = useState([]);
  const [processDet, setProcessDet] = useState({});

  useEffect(() => {
    if (isFocused) {
      setApiStatus(true);
      loadProcess();
    }
    return () => {};
  }, [isFocused]);

  const loadProcess = (process, msg) => {
    let apiData = {
      op: 'get_process',
      unit_num: userState.user.unit_number,
    };
    apiData.sort_by = 'updated_on';
    apiData.sort_order = 'DSC';
    setRefreshing(false);
    setApiStatus(true);

    ApiService.getAPIRes(apiData, 'POST', 'process').then(apiRes => {
      closeDialog();
      setApiStatus(false);
      setIndicator(false);

      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length) {
          setProcess(apiRes.response.message);
          process && msg ? Alert.alert(`${msg}`, `Process : ${process}`) : null;
        }
      } else if (apiRes && apiRes.response.message) {
        setApiError(apiRes.response.message);
        setApiStatus(false);
        setIndicator(false);
        setProcess([]);
      }
    });
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProcess();
  }, []);

  const publishBin = data => {
    if (data.status === 'HOLD') {
      processDet.process.map(stageItem => {
        if (stageItem.fifo && stageItem.fifo.length) {
          stageItem.fifo.map(fifoItem => {
            PublishMqtt({topic: fifoItem.element_id});
          });
        }
      });
    }
  };

  const closeDialog = () => {
    showDialog(false);
    setDialogTitle('');
    setDialogMessage('');
    setDialogType('');
  };
  const openDialog = (type, item) => {
    showDialog(true);
    let dialogTitle = '';
    let dialogMessage = '';
    let dialogType = '';
    dialogType = type;
    if (type === 'rejection') {
      dialogTitle = ''; // no title
    } else if (type === 'consumption') {
      dialogTitle = 'Consumption Data';
    } else if (type === 'processFifo') {
      dialogTitle = 'Process : ' + item.process_name;
    } else if (type === 'startProcess') {
      dialogTitle = 'Start Process ' + item.process_name;
    } else if (type === 'stopProcess') {
      dialogTitle = 'Stop Process ' + item.process_name;
    } else if (type === 'finishProcess')
      dialogTitle = 'Finish Process ' + item.process_name;

    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
    setDialogType(dialogType);
    setProcessDet(item);
  };

  const updateProcess = () => {
    let apiData = {op: 'update_process'};
    apiData.process_name = processDet.process_name;

    apiData.status =
      dialogType === 'startProcess'
        ? 'RUNNING'
        : dialogType === 'stopProcess'
        ? 'HOLD'
        : dialogType === 'finishProcess'
        ? 'FINISHED'
        : '';

    if (apiData.status === 'FINISHED') {
      apiData.component_count = processDet.component_count;
      apiData.finished_component = processDet.component_count;
    }
    let msg =
      dialogType === 'startProcess'
        ? 'RUNNING'
        : dialogType === 'stopProcess'
        ? 'STOPPED'
        : dialogType === 'finishProcess'
        ? 'FINISHED'
        : '';
    setApiStatus(true);
    setIndicator(true);
    closeDialog();
    ApiService.getAPIRes(apiData, 'POST', 'process').then(apiRes => {
      if (apiRes) {
        if (apiRes.status) {
          publishBin(apiData);
          loadProcess(processDet.process_name, msg); // rakshith
        } else if (apiRes.response.message) {
          setApiError(apiRes.response.message);
          setApiStatus(false);
          setIndicator(false);
        }
      }
    });
  };

  const updateFifo = () => {
    closeDialog();
    loadProcess();
  };
  const errOKAction = () => {
    setApiError('');
  };

  const onPressFunctionTop = () => {
    flatlistRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };
  const onPressFunctionDown = () => {
    flatlistRef.current?.scrollToEnd({animated: true});
  };
  return (
    <>
      {/* start <--- */}
      {/*---> end by Rakshith */}

      {process && process.length ? (
        <>
          {indicator ? (
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.15)',
                width: '100%',
                height: 2000,
                position: 'absolute',
                zIndex: 1,
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" animating={apiStatus} />
            </View>
          ) : (
            false
          )}

          {/*---> end by Rakshith */}
          <ScrollView
            ref={flatlistRef}
            contentContainerStyle={styles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <View style={styles.container}>
              {process.map((item, index) => {
                // console.log(JSON.stringify(item.process[6].ok_component));

                return (
                  <View style={styles.processContainer} key={index}>
                    <View style={{flexDirection: 'row'}} key={index}>
                      <Text style={[styles.title, {textAlign: 'left'}]}>
                        {item.process_name}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          flex: 1,
                          justifyContent: 'flex-end',
                        }}>
                        {item.status.toLowerCase() === 'created' ||
                        item.status.toLowerCase() === 'hold' ? (
                          <TouchableOpacity
                            style={[{alignSelf: 'center'}]}
                            onPress={e => openDialog('startProcess', item)}>
                            <Text
                              style={{
                                textAlign: 'right',
                                fontSize: 20,
                                color:
                                  item.status.toLowerCase() === 'hold'
                                    ? '#eb8500'
                                    : 'green', ////UI_Enhancement issue 8
                                fontFamily: appTheme.fonts.bold,
                              }}>
                              START
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          false
                        )}

                        {item.status.toLowerCase() === 'running' ? (
                          <>
                            <TouchableOpacity
                              style={[{alignSelf: 'center'}]}
                              onPress={e => openDialog('stopProcess', item)}>
                              <Text
                                style={{
                                  textAlign: 'right',
                                  fontSize: 20,
                                  color: 'red',
                                  fontFamily: appTheme.fonts.bold,
                                }}>
                                STOP
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[{alignSelf: 'center', paddingLeft: 20}]}
                              onPress={e => openDialog('finishProcess', item)}>
                              <Text
                                style={{
                                  textAlign: 'right',
                                  fontSize: 20,
                                  color: 'green',
                                  fontFamily: appTheme.fonts.bold,
                                }}>
                                FINISH
                              </Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          false
                        )}
                      </View>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text
                        style={[
                          styles.subtitle,
                          {textAlign: 'center', flex: 1, maxWidth: '8%'},
                        ]}></Text>
                      <Text
                        style={[
                          styles.subtitle,
                          {textAlign: 'left', flex: 1, maxWidth: '8%'},
                        ]}>
                        Batch
                      </Text>
                      <Text
                        style={[
                          styles.subtitle,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        Heat Number
                      </Text>
                      <Text
                        style={[
                          styles.subtitle,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        Supplier
                      </Text>
                      {/* <Text style={[styles.subtitle, { textAlign: 'center', flex: 1 }]}>Total Components</Text>
                      <Text style={[styles.subtitle, { textAlign: 'center', flex: 1 }]}>Total Quantity (kg)</Text> */}
                      <Text
                        style={[
                          styles.subtitle,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        Target Count
                      </Text>
                      <Text
                        style={[
                          styles.subtitle,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        Finished Count
                      </Text>

                      <Text
                        style={[
                          styles.subtitle,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        Status
                      </Text>
                      <Text
                        style={[
                          styles.subtitle,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        Process Data
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <TouchableOpacity
                        style={[
                          {
                            alignSelf: 'flex-start',
                            flex: 1,
                            maxWidth: '8%',
                            alignItems: 'center',
                          },
                        ]} // UI_Enhancement 28
                        onPress={e => openDialog('processFifo', item)}>
                        <SvgCss
                          // xml={BinInIcon(appTheme.colors.cardTitle)}

                          xml={BinOutIcon('green')} //UI_Enhancement issue 9, //UI_Enhancement issue 21
                          width={50}
                          height={20}
                        />
                        {/* <MaterialIcons
                            name="edit"
                            size={22}
                            style={{marginLeft: 10}}
                            color="green"></MaterialIcons> */}
                      </TouchableOpacity>
                      <Text
                        style={[
                          styles.tableContent,
                          {
                            textAlign: 'left',
                            flex: 1,
                            maxWidth: '8%'
                          },
                        ]}>
                        {item.batch_num}
                      </Text>
                      <Text
                        style={[
                          styles.tableContent,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        {item.heat_num}
                      </Text>
                      <Text
                        style={[
                          styles.tableContent,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        {item.supplier}
                      </Text>

                      <Text
                        style={[
                          styles.tableContent,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        {item.component_count}
                      </Text>

                      <Text
                        style={[
                          styles.tableContent,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        {item.process[6].ok_component}
                      </Text>

                      <Text
                        style={[
                          styles.tableContent,
                          {textAlign: 'center', flex: 1},
                        ]}>
                        {item.status}
                      </Text>

                      <TouchableOpacity
                        style={[{flex: 1, alignItems: 'center'}]}
                        onPress={e => openDialog('rejection', item)}>
                        <FontAwesome
                          name="eye"
                          size={20}
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                          }}></FontAwesome>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {dialog && dialogType === 'rejection' ? (
              <CustomModal
                modalVisible={dialog}
                dialogTitle={dialogTitle}
                dialogMessage={dialogMessage}
                height={'80%'}
                closeDialog={closeDialog}
                container={<RejectionData processEntity={processDet} />}
              />
            ) : (
              false
            )}

            {dialog && dialogType === 'processFifo' ? (
              <CustomModal
                modalVisible={dialog}
                dialogTitle={dialogTitle}
                dialogMessage={dialogMessage}
                height={'80%'}
                // closeDialog={closeDialog}
                container={
                  <ProcessFifo
                    processDet={processDet}
                    closeDialog={closeDialog}
                    okDialog={updateFifo}
                  />
                }
              />
            ) : (
              false
            )}

            {dialog &&
            (dialogType === 'startProcess' ||
              dialogType === 'stopProcess' ||
              dialogType === 'finishProcess') ? (
              <CustomModal
                modalVisible={dialog}
                dialogTitle={dialogTitle}
                dialogMessage={dialogMessage}
                closeDialog={closeDialog}
                okDialog={updateProcess}
              />
            ) : (
              false
            )}
            {apiError && apiError.length ? (
              <ErrorModal msg={apiError} okAction={errOKAction} />
            ) : (
              false
            )}
          </ScrollView>

          <Pressable style={styles.button} onPress={onPressFunctionDown}>
            <Icon
              name="angle-down"
              size={50}
              color={appTheme.colors.gradientColor1}
            />
          </Pressable>
          <Pressable
            style={[styles.button, {bottom: 0, top: -10}]}
            onPress={onPressFunctionTop}>
            <Icon
              name="angle-up"
              size={50}
              color={appTheme.colors.gradientColor1}
            />
          </Pressable>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" animating={apiStatus} />
        </>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    left: -5,
    bottom: 5,
  },
  arrow: {
    fontSize: 48,
    textAlign: 'center',
    color: 'white',
  },
  container: {
    flex: 1,
    //backgroundColor: "#fff",
    //justifyContent: "center",
    margin: 7,
    marginLeft: 37,
  },
  processContainer: {
    flexDirection: 'column',
    margin: 8,
    backgroundColor: 'white',
    padding: 10,
  },
  successBtn: {
    width: '40%',
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    //marginTop: 40,
    backgroundColor: appTheme.colors.warnAction,
  },
  successText: {
    color: appTheme.colors.warnActionTxt,
  },
  radioText: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 16,
    fontFamily: appTheme.fonts.regular,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: appTheme.fonts.regular,
    padding: 5,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    color: appTheme.colors.cardTitle,
    fontFamily: appTheme.fonts.bold,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    //fontWeight: "bold",
    fontFamily: appTheme.fonts.regular,
    color: appTheme.colors.cardTitle,
  },
  tableContent: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: appTheme.fonts.regular,
  },
  tableHeader: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
});
