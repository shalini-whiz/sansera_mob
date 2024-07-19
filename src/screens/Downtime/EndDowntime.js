//import liraries
import React, {useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, RefreshControl, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import { ApiService } from '../../httpservice';
import UserContext from '../UserContext';
import { ScrollView } from 'react-native-gesture-handler';
import { appTheme } from '../../lib/Themes';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { dateUtil } from '../../commons';
import AppStyles from '../../styles/AppStyles';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomModal from '../../components/CustomModal';
import ErrorModal from '../../components/ErrorModal';


// create a component
const EndDowntime = () => {

    const [apiError, setApiError] = useState('');
    const [apiStatus, setApiStatus] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [process, setProcess] = useState([]);
    const [processName, setProcessName] = useState('');
    const [stages, setStages] = useState([]);
    const [stageName, setStageName] = useState([]);
    const userState = React.useContext(UserContext);
    const isFocused = useIsFocused();

    // time 
    const [date, setDate] = useState(new Date());
    const [minDate, setMinDate] = useState(date);
    const [show, setShow] = useState(false);
    const [mode, setMode] = useState('date');

    const [dialog, showDialog] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');


    const onDateTimeChange = (event, selectedDate) => {
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
        loadProcess();
      }, []);

    useEffect(() => {
        if (isFocused) {
          loadProcess();
        }
      }, [isFocused]);

    useEffect(() => {
          setApiStatus(true);
          loadStages();
       
      }, [processName]);
    useEffect(() => {
          setApiStatus(true);
          loadMintime();
      }, [processName,stageName]);

    const loadProcess = () => {
       let apiData = {
         op: 'get_downtime_records',
         unit_num: userState.user.unit_number, // required
         }
        setRefreshing(false);
        ApiService.getAPIRes(apiData, 'POST', 'downtime').then(apiRes => {
          if (apiRes && apiRes.status) {
            if (apiRes.response.message && apiRes.response.message.length) {
                const res = apiRes.response.message
                const fArray=  res.filter((dt) => dt.downtime[dt.downtime.length-1].end_time == null) 
                const uniqueObjects = [...new Map(fArray.map(item => [item.process_name, item])).values()]
              setProcess(uniqueObjects);
              setProcessName(uniqueObjects[0].process_name)

              
            }
          } else if (apiRes && apiRes.response.message) {
            setApiError(apiRes.response.message); 
          }
        });
      };


    const loadStages = () => {
      let apiData = {
        op: 'get_downtime_records',
        unit_num: userState.user.unit_number,
        process_name: processName,
      };

      ApiService.getAPIRes(apiData, 'POST', 'downtime').then(apiRes => {
        setApiStatus(false);
        if (apiRes && apiRes.status) {
          if (apiRes.response.message && apiRes.response.message.length) {
            const arr = apiRes.response.message;
            const fArray = arr.filter(
              dt => dt.downtime[dt.downtime.length - 1].end_time == null,
            );
            setStages(fArray);
            setStageName(fArray[0].stage_name);
            loadMintime()
          }
        } else if (apiRes && apiRes.response.message) {
          setApiError(apiRes.response.message);
        }
      });
    }; 
    const loadMintime = () => {
      let apiData = {
        op: 'get_downtime_records',
        unit_num: userState.user.unit_number,
        process_name: processName,
        stage_name:stageName
      };

      ApiService.getAPIRes(apiData, 'POST', 'downtime').then(apiRes => {
        setApiStatus(false);
        if (apiRes && apiRes.status) {
          if (apiRes.response.message && apiRes.response.message.length) {
            const arr = apiRes.response.message;
            arr.filter(
              dt => {
                console.log(dt) ;setMinDate(dt.downtime[dt.downtime.length - 1].start_time)}
            );
          }
        } else if (apiRes && apiRes.response.message) {
          setApiError(apiRes.response.message);
        }
      });
    }; 


    

    // console.log(processName,stageName,minDate)

    const handleDowntime = () => {
      const apidate = dateUtil.toDateFormat(date, 'YYYY-MM-DD hh:mm:ss A');
      const apiData = {
        op: 'update_stage_downtime_record',
        unit_num: userState.user.unit_number,
        process_name: processName,
        stage_name: stageName,
        end_time: apidate,
      };

      ApiService.getAPIRes(apiData, 'POST', 'downtime').then(apiRes => {
        if (apiRes && apiRes.status) {
          Alert.alert('success');
          loadProcess();
          loadStages();
          showDialog(false)
        } else if (apiRes && apiRes.response.message) {
          showDialog(false)
          console.log(apiRes.response.message)
          setApiError(apiRes.response.message);
        }
      });
    };

    const closeDialog = () => {
      showDialog(false);
      setDialogTitle('');
    };
    const openDialog =() => {
      showDialog(true);
      setDialogTitle('Confirm End Downtime');
    };

    const errOKAction = () => {
      setApiError('');
    };

    return (
      <ScrollView 
          style={{flex: 1}} 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} 
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            margin: 2,
          }}>
          <View style={styles.container}>
            {/* process picker */}
            <View style={styles.dropdown}>
              <View style={{flex: 1}}>
                <Text style={styles.text}>Process Name</Text>
                {/* {!processName?<Text style={{flex:1,color:"red",textAlign:"left",position:"absolute"}} >Process Not Found</Text>:null} */}
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

            {/* stage picker */}
            <View style={styles.dropdown}>
              <View style={{flex: 1}}>
                <Text style={styles.text}>Stage Name</Text>
              </View>
              <View style={{flex: 2}}>
                <Picker
                  selectedValue={stageName}
                  onValueChange={value => setStageName(value)}
                  mode="dialog"
                  style={{backgroundColor: '#ECF0FA', flex: 1}}
                  itemStyle={{}}
                  dropdownIconColor={appTheme.colors.cardTitle}>
                  {stages.map((stage, index) => {
                    return (
                      <Picker.Item
                        style={{backgroundColor: '#ECF0FA'}}
                        label={stage.stage_name}
                        value={stage.stage_name}
                        key={index}
                      />
                    );
                  })}
                </Picker>
              </View>
            </View>

            <View style={[styles.dropdown, {marginVertical: 0}]}>
              <View style={{flex: 1}}>
                <Text style={styles.text}>Start Time</Text>
              </View>
              <View style={styles.datetimeWrapper}>
                {/* date picker */}
                <View style={styles.date}>
                  <TouchableOpacity disabled onPress={() => showMode('date')}>
                    <MaterialIcons
                      name="calendar-month"
                      size={25}
                      color={'#ccc'}
                      style={{marginHorizontal: 20, margin: 5}}></MaterialIcons>
                  </TouchableOpacity>
                  <Text
                    style={{
                      borderLeftWidth: 1,
                      paddingHorizontal: 20,
                      color: 'black',
                    }}>
                    {dateUtil.toDateFormat(minDate)}
                  </Text>
                </View>

                {/* time picker */}
                <View style={styles.time}>
                  <TouchableOpacity disabled onPress={() => showMode('time')}>
                    <MaterialIcons
                      name="clock"
                      size={25}
                      color={'#ccc'}
                      style={{marginHorizontal: 20, margin: 5}}></MaterialIcons>
                  </TouchableOpacity>
                  <Text
                    style={{
                      borderLeftWidth: 1,
                      paddingHorizontal: 20,
                      color: 'black',
                    }}>
                    {dateUtil.toTimeFormat(minDate, 'hh:mm A')}
                  </Text>
                </View>
              </View>
            </View>
            <View style={[styles.dropdown, {marginVertical: 0}]}>
              <View style={{flex: 1}}>
                <Text style={styles.text}>End Time</Text>
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
            // disabled={stages.length < 1}
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
          {apiError && apiError.length ? (
            <ErrorModal msg={apiError} okAction={errOKAction} />
          ) : (
            false
          )}

          {show && (
            <DateTimePicker
              value={date}
              mode={mode}
              display="default"
              onChange={onDateTimeChange}
              minimumDate={new Date(minDate)}
              is24Hour={false}
            />
          )}

          {dialog ? (
            <CustomModal
              modalVisible={dialog}
              dialogTitle={dialogTitle}
              okDialog={handleDowntime}
              closeDialog={closeDialog}
              // container={
              //   <View style={{alignItems:"center",flex:1}} >
                  
              //     <View style={{flex:1,flexDirection:"row", margin:1}} >
                 
              //     <Text style={{color:"black",fontSize:16}} >{processName}</Text>

              //     </View>
              //     <View style={{flex:1,flexDirection:"row", margin:1}} >
              //     <Text style={{color:"black",fontSize:16}} >Stage :</Text>
              //     <Text style={{color:"black",fontSize:16}} >{stageName}</Text>

              //     </View>
              //     <View style={{flex:1,flexDirection:"row", margin:1}} >
              //     <Text style={{color:"black",fontSize:16}} >Time: </Text>
              //     <Text style={{color:"black",fontSize:16}} >{dateUtil.toDateFormat(date, 'YYYY-MM-DD hh:mm:ss A')}</Text>

              //     </View>
              //   </ View>
              // }
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
export default EndDowntime;
