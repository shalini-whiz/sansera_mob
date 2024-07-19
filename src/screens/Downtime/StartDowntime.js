//import liraries
import React, {useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import { ApiService } from '../../httpservice';
import UserContext from '../UserContext';
import { ScrollView } from 'react-native-gesture-handler';
import { appTheme } from '../../lib/Themes';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { dateUtil } from '../../commons';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ErrorModal from '../../components/ErrorModal';


import AppStyles from '../../styles/AppStyles';
import { ActivityIndicator } from 'react-native';
import CustomModal from '../../components/CustomModal';



// create a component
const StartDowntime = () => {

    const [apiError, setApiError] = useState('');
    const [apiStatus, setApiStatus] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [process, setProcess] = useState([]);
    const [processName, setProcessName] = useState('');
    const [stages, setStages] = useState([]);
    const [stageName, setStageName] = useState([]);

    const [reason, setReason] = useState("");

    const userState = React.useContext(UserContext);
    const isFocused = useIsFocused();

    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const [mode, setMode] = useState('date');

    const [dialog, showDialog] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
  
    const onChange = (event, selectedDate) => {
      const currentDate = selectedDate || date;
      setShow(Platform.OS === 'ios');
      setDate(currentDate);
    };
  
    const showMode = (currentMode) => {
      setShow(true);
      setMode(currentMode);
    };

    const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      setApiStatus(true)
      loadProcess()
      loadStages();
    }, []);

    const errOKAction = () => {
      setApiError('');
    };
  

    useEffect(() => {
        if (isFocused) {
          setApiStatus(true);
          loadProcess();
          loadStages();
        }
        return () => {};
      }, [isFocused]);

    const loadProcess = () => {
        let apiData = {
          op: 'get_process',
          unit_num: userState.user.unit_number,
          status:["CREATED","RUNNING","HOLD"],
        };
        apiData.sort_by = 'batch_num';
        apiData.sort_order = 'DSC';
        setRefreshing(false);
        ApiService.getAPIRes(apiData, 'POST', 'process').then(apiRes => {
          setApiStatus(false);
          if (apiRes && apiRes.status) {
            if (apiRes.response.message && apiRes.response.message.length) {
              setProcess(apiRes.response.message);
            }
          } else if (apiRes && apiRes.response.message) {
            setApiError(apiRes.response.message);
          }
        });
      };
    
    const loadStages = () => {
        let apiData = {
          op: 'get_stages',
          type: 'Steel',
          unit_num: userState.user.unit_number,
        };
        
        ApiService.getAPIRes(apiData, 'POST', 'process').then(apiRes => {
            if (apiRes && apiRes.status) {
                if (apiRes.response.message && apiRes.response.message.stages.length) {
                    const filteredStages=apiRes.response.message.stages.filter((stg) => stg!=="Rework" && stg!=="Billet punching"  && stg!=="Under heat")
                setStages(filteredStages);
                }
            } else if (apiRes && apiRes.response.message) {
                setApiError(apiRes.response.message);
            }
            });
    } 
    
    const handleDowntime = () => {
      const apidate = dateUtil.toDateFormat(date, 'YYYY-MM-DD hh:mm:ss A');
      const apiData = {
        op: 'update_stage_downtime_record',
        unit_num: userState.user.unit_number,
        process_name: processName,
        stage_name: stageName,
        start_time: apidate,
        reason: reason,
      };

      ApiService.getAPIRes(apiData,"POST","downtime").then(apiRes=>{
        if (apiRes && apiRes.status) {
          Alert.alert("success")
          setReason("")
          showDialog(false);
            
        } else if (apiRes && apiRes.response.message) {
            setApiError(apiRes.response.message);
            showDialog(false);
        }
    })
    };
    
    const closeDialog = () => {
      showDialog(false);
      setDialogTitle('');
    };
    const openDialog =() => {
      showDialog(true);
      setDialogTitle('Confirm Start Downtime');
    };

    return (
      <ScrollView style={{flex: 1}} refreshControl=
        {<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            margin: 2,
          }}>
          <View style={styles.container}>
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />

            <View style={styles.dropdown}>
              {/* process picker */}
              <View style={{flex: 1}}>
                <Text style={styles.text}>Process Name</Text>
              </View>
              <View style={{flex: 2}}>
                <Picker
                  selectedValue={processName}
                  onValueChange={value => setProcessName(value)}
                  mode="dialog"
                  style={{backgroundColor: '#ECF0FA', flex: 1}}
                  itemStyle={{}}
                  dropdownIconColor={appTheme.colors.cardTitle}>
                  {process.map((pickerItem, pickerIndex) => {
                    return (
                      <Picker.Item
                        style={{backgroundColor: '#ECF0FA'}}
                        label={pickerItem.process_name}
                        value={pickerItem.process_name}
                        key={pickerIndex}
                      />
                    );
                  })}
                </Picker>
              </View>
            </View>
            <View style={styles.dropdown}>
              <View style={{flex: 1}}>
                <Text style={styles.text}>Stage Name</Text>
              </View>
              <View style={{flex: 2}}>
                {/* stage picker */}
                <Picker
                  selectedValue={stageName}
                  onValueChange={value => setStageName(value)}
                  mode="dialog"
                  style={{backgroundColor: '#ECF0FA', flex: 1}}
                  itemStyle={{}}
                  dropdownIconColor={appTheme.colors.cardTitle}>
                  {stages.map((stagename, index) => {
                    return (
                      <Picker.Item
                        style={{backgroundColor: '#ECF0FA'}}
                        label={stagename}
                        value={stagename}
                        key={index}
                      />
                    );
                  })}
                </Picker>
              </View>
            </View>

            <View style={styles.dropdown}>
              <View style={{flex: 1}}>
                <Text style={styles.text}>Reason</Text>
              </View>
              <View style={{flex: 2}}>
                <TextInput
                  style={[
                    AppStyles.filterText,
                    {flex: 1, fontSize: 16, paddingLeft: 15},
                  ]}
                  value={reason}
                  onChangeText={text => setReason(text)}
                />
              </View>
            </View>

            <View style={[styles.dropdown, {marginVertical: 0}]}>
              <View style={{flex: 1}}>
                <Text style={styles.text}>Start Time</Text>
              </View>
              <View style={styles.datetimeWrapper}>
                {/* date picker */}
                <View style={styles.date}>
                  <TouchableOpacity onPress={() => showMode('date')}>
                    <MaterialIcons
                      name="calendar-month"
                      size={25}
                      color={'black'}
                      style={{marginHorizontal: 20, margin: 5}}></MaterialIcons>
                  </TouchableOpacity>
                  <Text
                    style={{
                      borderLeftWidth: 1,
                      paddingHorizontal: 20,
                      color: 'black',
                    }}>
                    {dateUtil.toDateFormat(date)}
                  </Text>
                </View>

                {/* time picker */}
                <View style={styles.time}>
                  <TouchableOpacity onPress={() => showMode('time')}>
                    <MaterialIcons
                      name="clock"
                      size={25}
                      color={'black'}
                      style={{marginHorizontal: 20, margin: 5}}></MaterialIcons>
                  </TouchableOpacity>
                  <Text
                    style={{
                      borderLeftWidth: 1,
                      paddingHorizontal: 20,
                      color: 'black',
                    }}>
                    {dateUtil.toTimeFormat(date, 'hh:mm A')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {apiStatus ? (
            <ActivityIndicator size={'large'}></ActivityIndicator>
          ) : null}

          <TouchableOpacity
            // disabled={process.length < 1}
            style={[
              AppStyles.successBtn,
              {
                marginTop: '2%',
                backgroundColor: appTheme.colors.successAction,
              },
            ]}
            onPress={openDialog}>
            <Text style={AppStyles.successText}>SAVE</Text>
          </TouchableOpacity>

          {show && (
            <DateTimePicker
              value={date}
              mode={mode}
              is24Hour={false}
              display="default"
              onChange={onChange}
            />
          )}

          {apiError && apiError.length ? (
            <ErrorModal msg={apiError} okAction={errOKAction} />
          ) : (
            false
          )}

          {dialog ? (
            <CustomModal
              modalVisible={dialog}
              dialogTitle={dialogTitle}
              // dialogMessage={dialogMessage}
              okDialog={handleDowntime}
              closeDialog={closeDialog}
            />
          ) : (
            false
          )}

        </View>
      </ScrollView>
    );
};


// define your styles
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    width: '50%',
    justifyContent: 'center',
    paddingHorizontal:29,
    paddingVertical:20,
    elevation:10
  },
  dropdown: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    marginLeft:0
  },
  text: {
    padding: 20,
  },
  datetimeWrapper: {
    flex: 2,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor:"green"
    // margin: 10,
    // marginLeft: 0,
  },
  date: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,    
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  time: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    marginHorizontal: 0,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  saveButton: {width: 100},
});

//make this component available to the app
export default StartDowntime;
