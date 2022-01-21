import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { util } from "../../commons";
import { ApiService } from "../../httpservice";
import UserContext from "../UserContext";
import CustomModal from "../../components/CustomModal";
import { useIsFocused } from '@react-navigation/native';
import { appTheme } from "../../lib/Themes";
import { default as AppStyles } from "../../styles/AppStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorModal from "../../components/ErrorModal";
import { taskState } from "../../constants/appConstants";
import PublishMqtt from "../mqtt/PublishMqtt";



export default function BinTask(props) {
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const userState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();
  const [binTask, setBinTask] = useState([])
  const [stage, setStage] = useState('')
  const [task, setTask] = useState({})
  const [binNo,setBinNo] = useState('')
  useEffect(() => {
    if (isFocused) {
      loadData();
    }
    return () => { }
  }, [isFocused])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData()
  }, []);

  const loadData =  async () => {
    let stage = await AsyncStorage.getItem("stage")
    setStage(stage);
    let apiData = {};
    apiData.op = "get_request"
    apiData.process_name = props.processEntity.process_name
    apiData.stage = stage
    apiData.task_state = ["REQUESTED", "DELIVERED"]
    setBinTask([])
    ApiService.getAPIRes(apiData,"POST","task").then(apiRes => {
      console.log("apiRes here "+JSON.stringify(apiRes))
      if(apiRes && apiRes.status){
        if(apiRes.response.message && apiRes.response.message.length)
          setBinTask(apiRes.response.message);
      }
      else if(apiRes.response.message){
        setBinTask([])
        setApiError(apiRes.response.message)
      }
    })
    

  }

  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setDialogType('')
    setTask({})
    setBinNo('')
  }

  const showBin = async (e, type, item) => {
    console.log("Show bin clicked ")
    let dialogTitle = "";
    let dialogMessage = "";
    setDialogType(type)
    let apiData = {}
    apiData.op = "get_next_element"
    apiData.process_name = props.processEntity.process_name
    apiData.stage_name = stage;
    setApiStatus(true);
    let apiRes = await ApiService.getAPIRes(apiData,"POST","process");
    console.log("get next element "+JSON.stringify(apiRes));
    if(apiRes && apiRes.status && apiRes.response.message){
      PublishMqtt({topic: apiRes.response.message.element_id});
      setBinNo(apiRes.response.message.element_num)
      if (type === "fulfilled") {
        showDialog(true);
        dialogTitle = "Confirm Filled Bin Request";
        dialogMessage = "Are you sure you wish to confirm filled bin request "
        setDialogTitle(dialogTitle);
        setDialogMessage(dialogMessage);
        setTask(item)

      }
    }
    else {
      Alert.alert("Bin not found")
    }
    
    
  }

  const openDialog = (e, type, item) => {
    showDialog(true);
    let dialogTitle = "";
    let dialogMessage = "";
    setDialogType(type)
    console.log("type : "+type)
    if (type === "cancel") {
      dialogTitle = "Cancel Filled Bin Request";
      dialogMessage = "Are you sure you wish to cancel filled bin request "
    }
   
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
    setTask(item)
  }

  const updateRequest = () => {
    let invokeApi = false;
    let apiData = {}
    apiData.op = "update"
    apiData._id = task._id
    if (dialogType === "fulfilled") {
      apiData.task_state = taskState.FULFILL
      invokeApi = true;
    }
    else if(dialogType === "cancel"){
      apiData.task_state = taskState.CANCEL
    }
    console.log("api Data here " + JSON.stringify(apiData))

    ApiService.getAPIRes(apiData, "POST", "task").then(apiRes => {
      console.log("task update " + JSON.stringify(apiRes))
      console.log(apiRes.status);
      if (apiRes && apiRes.status) {
        let msg = "";
        if (dialogType === "fulfilled") msg = "Task fulfilled"
        if (dialogType === "cancel") msg = "Task Cancelled";
        loadData();
        Alert.alert(msg);
        closeDialog();
      }
      else if(apiRes.response.message)
      setApiError(apiRes.response.message)
    })
  }

  const errOKAction = () => {
    setApiError('')
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.mainContainer}>
        {binTask && binTask.length ? binTask.map((item, index) => {
          return (<View style={{ flexDirection: 'row', padding: 5, backgroundColor: 'white', margin: 5 }} key={index}>
            <View style={{flexDirection:'column',flex:3,padding:5}}>

            <Text 
            style={[AppStyles.subtitle, {justifyContent: 'flex-start',  color: 'black', padding: 1 }]}>
              {item.requester_id === item.resolver_id ?  item.stage+" - Requested Filled Bin" : "Requested forklift "+item.resolver_emp_name+" to pick Filled Bin" }</Text>
              <Text
                style={[AppStyles.info, { justifyContent: 'flex-start', color: 'black', padding: 1 }]}>
                {item.created_on}</Text>
              </View>
            {item.task_state.toLowerCase() === "requested" && item.requester_id === item.resolver_id ? 
              <TouchableOpacity style={[AppStyles.warnButtonContainer, { flex: 1, margin: 10 }]}
                onPress={(e) => showBin(e, "fulfilled", item)}
              >
                <Text style={AppStyles.warnButtonTxt}>SHOW BIN</Text>
              </TouchableOpacity> 
            
            : false}

            {item.task_state.toLowerCase() === "requested" && item.requester_id != item.resolver_id ?
              <TouchableOpacity style={[ { flex: 1, margin: 10 }]}
              >
              </TouchableOpacity>

              : false}
            {item.task_state.toLowerCase() === "requested" ? 
           
            <TouchableOpacity style={[AppStyles.canButtonContainer, { flex: 1, margin: 10 }]}
              onPress={(e) => openDialog(e, "cancel", item)}
            >
              <Text style={AppStyles.canButtonTxt}>CANCEL</Text>
            </TouchableOpacity> : false}
          </View>)
        }) : false}
        {dialog && dialogType === "fulfilled" ? <CustomModal modalVisible={dialog} dialogTitle={dialogTitle}
          dialogMessage={dialogMessage} 
          okDialog={updateRequest} closeDialog={closeDialog}
          okTitle={"PICK UP"}
          container={
            <View style={{ flexDirection: 'column', alignItems: 'center', width: '70%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', padding: 5 }}>
                <Text style={[AppStyles.subtitle, { flex: 1, justifyContent: 'flex-start', color: 'black' }]}>BIN No : </Text>
                <Text style={[AppStyles.title, { flex: 2, textAlign: 'left', color: appTheme.colors.cardTitle, fontFamily: appTheme.fonts.bold }]}>{binNo} </Text>

              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', padding: 5 }}>
                <Text style={[AppStyles.subtitle, { flex: 1, justifyContent: 'flex-start', color: 'black' }]}>Stage : </Text>
                <Text style={[AppStyles.title, { flex: 2, textAlign: 'left', color: appTheme.colors.cardTitle,fontFamily:appTheme.fonts.bold }]}>{stage} </Text>

              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', padding: 5 }}>
                <Text style={[AppStyles.subtitle, { flex: 1, justifyContent: 'flex-start', color: 'black' }]}>Process : </Text>
                <Text style={[AppStyles.title, { flex: 2, textAlign: 'left', color: appTheme.colors.cardTitle, fontFamily: appTheme.fonts.bold }]}>{props.processEntity.process_name} </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', padding: 5 }}>
                <Text style={[AppStyles.subtitle, { flex: 1, justifyContent: 'flex-start', color: 'black' }]}>Requested On : </Text>
                <Text style={[AppStyles.title, { flex: 2, textAlign: 'left', color: appTheme.colors.cardTitle, fontFamily: appTheme.fonts.bold }]}>{task.created_on} </Text>
              </View>
            </View>
          }
        /> : false}


        {dialog && dialogType === "cancel" ? <CustomModal modalVisible={dialog} dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          okDialog={updateRequest} closeDialog={closeDialog}
          container={
            <View style={{ flexDirection: 'column', alignItems: 'center', width: '70%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', padding: 5 }}>
                <Text style={[AppStyles.subtitle, { flex: 1, justifyContent: 'flex-start', color: 'black' }]}>Stage : </Text>
                <Text style={[AppStyles.title, { flex: 2, textAlign: 'left', color: appTheme.colors.cardTitle, fontFamily: appTheme.fonts.bold }]}>{stage} </Text>

              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', padding: 5 }}>
                <Text style={[AppStyles.subtitle, { flex: 1, justifyContent: 'flex-start', color: 'black' }]}>Process : </Text>
                <Text style={[AppStyles.title, { flex: 2, textAlign: 'left', color: appTheme.colors.cardTitle, fontFamily: appTheme.fonts.bold }]}>{props.processEntity.process_name} </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', padding: 5 }}>
                <Text style={[AppStyles.subtitle, { flex: 1, justifyContent: 'flex-start', color: 'black' }]}>Requested On : </Text>
                <Text style={[AppStyles.title, { flex: 2, textAlign: 'left', color: appTheme.colors.cardTitle, fontFamily: appTheme.fonts.bold }]}>{task.created_on} </Text>
              </View>
            </View>
          }
        /> : false}

        {apiError && apiError.length ? (<ErrorModal msg={apiError} okAction={errOKAction} />) : false}

        

      </View>


    </ScrollView>
  )
}
const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: "center",
    margin: 10,
  },

});