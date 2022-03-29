import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, RefreshControl,ActivityIndicator } from "react-native";
import { util } from "../../commons";
import { appTheme } from "../../lib/Themes";
import { Picker } from '@react-native-picker/picker';
import { ApiService } from "../../httpservice";
import BatchDetails from "./BatchDetails";
import CustomModal from "../../components/CustomModal";
import { RadioButton } from "react-native-paper";
import UserContext from "../UserContext";
import { useIsFocused } from '@react-navigation/native';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import CustomHeader from "../../components/CustomHeader";
import { act } from "react-test-renderer";
import AppStyles from "../../styles/AppStyles";
import ErrorModal from "../../components/ErrorModal";



export default function ApproveBatch({navigation}) {
  const userState = React.useContext(UserContext);
  const isFocused = useIsFocused();

  const [apiError, setApiError] = useState('')
  const [apiStatus,setApiStatus] = useState(false);
  const [batchNum, setBatchNum] = useState('')
  const [status, setStatus] = useState('NEW');
  const [reason, setReason] = useState('');
  const [reasonId, setReasonId] = useState('');
  const [batchDet, setBatchDet] = useState({})
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [action,setAction] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const [batchOptions, setBatchOptions] = useState({
    keyName: "_id", valueName: "batch_num",
    options: [],
  })
  const [statusOptions, setStatusOptions] = useState({
    keyName: "_id", valueName: "value",
    options: [
      { "_id": "NEW", "value": "Hold" },
      { "_id": "APPROVED", "value": "Approved" },
      { "_id": "REJECTED", "value": "Rejected" }
    ],
  })
  const [reasonOptions, setReasonOptions] = useState({
    keyName: "_id", valueName: "rejection_reason",
    options: [
      
    ],
  })
  useEffect(() => {
    if (isFocused) {
      setApiStatus(true);
      loadBatches();
      setAction('')
      loadReasons()
    }
    return () => { }
  }, [navigation,isFocused,status])

  const loadBatches = () => {
    let apiData = {
      "op": "list_raw_material_by_status",
      
     // "status": "NEW"
    }
    apiData.status = status.length ? status : "NEW";
    apiData.sort_by = 'updated_on'
    apiData.sort_order = 'DSC'
    ApiService.getAPIRes(apiData, "POST", "list_raw_material_by_status").then(apiRes => {
      setApiStatus(false);
      setRefreshing(false);

      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length) {
          let bOptions = { ...batchOptions }
         
          bOptions.options = apiRes.response.message;
          setBatchOptions(bOptions);
          let index = -1;
          if(batchNum.length)
            index = apiRes.response.message.findIndex(item => item._id === batchNum);
         
          

          if (bOptions.options[0] && (batchNum === '' || index === -1)) {
            setBatchNum(bOptions.options[0]._id)
            setBatchDet(bOptions.options[0])
          }
        }
        else
        {
          let bOptions = { ...batchOptions }
          bOptions.options = []
          setBatchOptions(bOptions)
          setBatchNum('')
          setBatchDet({})
        }
      }
      else if(apiRes && apiRes.response.message)
        setApiError(apiRes.response.message)
        
    });

  }

  const loadReasons = () => {
    let apiData = { "op": "get_batch_reasons", }
  
    ApiService.getAPIRes(apiData, "POST","get_batch_reason").then(apiRes => {
      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length) {
          let reasonObj = { ...reasonOptions }
          reasonObj.options = apiRes.response.message;
          setReasonOptions(reasonObj);
          setReasonId(reasonObj.options[0]._id)
          setReason(reasonObj.options[0].rejection_reason)
        }
        else {
          let reasonObj = { ...reasonOptions }
          reasonObj.options = [];
          setReasonOptions(reasonObj)
          setReasonId('')
          setReason()
        }
      }
      else if (apiRes && apiRes.response.message)
        setApiError(apiRes.response.message)

    });

  }
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadBatches();
  });

  const handleStatusChange = (value) => {
    setBatchNum('')
    setBatchDet({})
    setStatus(value)
  }

  const handleChange = (name) => (value, index) => {
    if (name === "batchNum") {
      let bOptions = [...batchOptions.options]
      if(bOptions.length){
        let bIndex = bOptions.findIndex(item => item._id === value);
        if(bIndex > -1){
          let bDet = bOptions[bIndex];
          setBatchDet(bDet)
          setBatchNum(value)
        }
        
      }
      else{
        setBatchDet({})
        setBatchNum('')
      }
     
    
    }
   
    else if (name === "action") setAction(value)
    else if (name === "reason") {
      setReason(value)
    }
  };

  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
  }
  const openDialog = () => {
    let batchDetails = { ...batchDet };
    if(batchDet.fifo && batchDet.fifo.length && action === "approved"){
      showDialog(true);
      let dialogTitle = "";
      let dialogMessage = "";
     
      if(action === "approved") {
        dialogTitle = "Approve Batch"
        dialogMessage = "Are you sure you wish to APPROVE " + batchDetails.batch_num
      }
     
      setDialogTitle(dialogTitle);
      setDialogMessage(dialogMessage);
    }
    else if(action === "rejected" || action === "new"){
      showDialog(true);
      let dialogTitle = "";
      let dialogMessage = "";
      if (action === "rejected") {
        dialogTitle = "Reject Batch";
        dialogMessage = "Are you sure you wish to REJECT " + batchDetails.batch_num
      }
      if (action === "new") {
        dialogTitle = "Hold Batch";
        dialogMessage = "Are you sure you wish to HOLD " + batchDetails.batch_num
      }
      setDialogTitle(dialogTitle);
      setDialogMessage(dialogMessage);
    }
    else{
      setApiError("Racks are empty")
    }
  }
  const updateBatch = () => {
    let apiData = {}
    if (action === "rejected") apiData.material_reject_reason = reasonId
    let batchDetails = { ...batchDet };

    apiData.batch_num = batchDetails.batch_num;
    apiData.status = action.toUpperCase()
    //apiData.approved_by = userState.user.id;
    apiData.op = "update_raw_material";
    if (action === "rejected")
      apiData.reject_weight = 0;

    console.log("apiData her "+JSON.stringify(apiData))
    setApiStatus(true);

    ApiService.getAPIRes(apiData, "POST", "batch").then(apiRes => {
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message) {
          closeDialog();
          loadBatches();
          setAction('')
        }
      }
      else if(apiRes && apiRes.response.message){
        setApiError(apiRes.response.message)
      }
    });  
  }
 
  const errOKAction = () => {
    setApiError('')
  }
  return (
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> }
      >
      <View style={styles.container}>
        <View style={{ flexDirection: 'row',backgroundColor:'white',margin:5,padding:5 }}>
          <View style={{ flex: 1,flexDirection:'row',alignItems:'center' }}>
            <Text style={AppStyles.filterLabel}>Select Batch</Text>
            <Picker
              selectedValue={batchNum}
              onValueChange={handleChange("batchNum")}
              mode="dialog"
              style={{ backgroundColor: "#ECF0FA",flex:1 }}
              itemStyle={{}}
              dropdownIconColor={appTheme.colors.cardTitle}
            >
              {batchOptions.options && batchOptions.options.map((pickerItem, pickerIndex) => {
                let labelV = (batchOptions.keyName && pickerItem[batchOptions.keyName]) ? pickerItem[batchOptions.keyName] : (pickerItem.key ? pickerItem.key : "");
                let label = (batchOptions.valueName && pickerItem[batchOptions.valueName]) ? pickerItem[batchOptions.valueName] : (pickerItem.value ? pickerItem.value : "");
                return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={label} value={labelV} key={pickerIndex} />)
              })}
            </Picker>
            

          </View>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            <FontAwesome5 name="filter" size={20} style={{ margin: 2, padding: 5, marginLeft: 10 }}  ></FontAwesome5>
            <TouchableOpacity style={{
              flexDirection: 'row', padding: 5, borderRadius: status === "NEW" ? 15 : 0,
              paddingLeft: 10, paddingRight: 10,
              backgroundColor: status === "NEW" ? appTheme.colors.cardTitle : 'white'
            }}
              onPress={(e) => handleStatusChange("NEW")} >
              <Text style={[styles.filterText, {
                fontFamily: status === "NEW" ? appTheme.fonts.bold : appTheme.fonts.regular,
                color: status === "NEW" ? 'white' : appTheme.colors.cardTitle,

              }]}>Hold</Text>
            </TouchableOpacity>
            <Text style={{}}> / </Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row', padding: 5,
                borderRadius: status === "APPROVED" ? 15 : 0,
                backgroundColor: status === "APPROVED" ? appTheme.colors.cardTitle : 'white'
              }}
              onPress={(e) => handleStatusChange("APPROVED")}
              
              >
              <Text style={[styles.filterText, {
                fontFamily: status === "APPROVED" ? appTheme.fonts.bold : appTheme.fonts.regular,
                color: status === "APPROVED" ? 'white' : appTheme.colors.cardTitle,
              }]}>Approved</Text>
            </TouchableOpacity>
            <Text style={{}}> / </Text>
            <TouchableOpacity style={{
              flexDirection: 'row', padding: 5,
              backgroundColor: status === "REJECTED" ? appTheme.colors.cardTitle : 'white',
              borderRadius: status === "REJECTED" ? 15 : 0,


            }} 
            
              onPress={(e) => handleStatusChange("REJECTED")}

            >
              <Text style={[styles.filterText, {
                color: appTheme.colors.cancelAction,
                fontFamily: status === "REJECTED" ? appTheme.fonts.bold : appTheme.fonts.regular,
                color: status === "REJECTED" ? 'white' : appTheme.colors.cardTitle,
              }]}>Rejected</Text>
            </TouchableOpacity>
          </View>

        </View>

        {apiStatus ? <ActivityIndicator size="large" animating={apiStatus} /> : false}
        {batchDet && batchDet._id ?
          <View style={{ flexDirection: 'row', margin: 1, padding: 1 }}>
           
            <View style={{ flex: 1,margin:5,backgroundColor:'white',
            flexDirection:'column' }}>
              
              <View style={{
                flexDirection: 'row', margin: 10, marginTop: 20,
                borderColor: 'grey', borderWidth: 0.5, padding: 10, borderRadius: 10,
              }}>
                <View style={{flexDirection:'column'}}>
                <CustomHeader title={"Rack Numbers"} size={18} style={{}} />
                <View style={{ flexDirection: 'row' }}>
                  {batchDet && batchDet.fifo && batchDet.fifo.map((fifoItem, fifoIndex) => {
                    let fifoRack = (fifoIndex === 0) ? fifoItem.element_num : "  |   " + fifoItem.element_num
                    return (
                      <Text style={{
                        fontSize: 14,
                        color: 'black'

                      }} key={fifoIndex} >{fifoRack}</Text>
                    )
                  })}
                </View>
                </View>

              </View>
              {batchNum && batchNum.length ? 
              <View style={{flexDirection:'row',justifyContent:'center'}}>
                <RadioButton.Group onValueChange={handleChange("action")}
                value={action} style={{ flexDirection: 'row', flexWrap: 'wrap', backgroundColor: 'red', color: "blue" }}>
                <View style={{  flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    {batchDet && batchDet.status !== "NEW" ? <>
                        <RadioButton value="new" />
                        <Text style={[styles.radioText, {
                          color: appTheme.colors.warnAction, marginLeft: 15,
                          fontFamily: action === "new" ? appTheme.fonts.bold : appTheme.fonts.regular
                        }]}>HOLD</Text>
                    </>: false}
                   
                      {batchDet && batchDet.status !== "APPROVED" ? <>
                        <RadioButton value="approved" />
                      <Text style={[styles.radioText, { 
                        color: appTheme.colors.successAction, marginLeft:15,
                        fontFamily: action === "approved" ? appTheme.fonts.bold : appTheme.fonts.regular
                        }]}>APPROVE</Text>
                    </> : false}
                    
                  {batchDet.status !== "REJECTED" ? <>
                        <RadioButton value="rejected" />
                        <Text style={[styles.radioText, { color: appTheme.colors.cancelAction,
                           marginLeft:15,
                          fontFamily: action === "rejected" ? appTheme.fonts.bold : appTheme.fonts.regular

                           
                           }]}>REJECT</Text></>: false}
                </View>
              </RadioButton.Group>
              </View>
       : false}
              {action === "rejected" ?
                <View style={{flexDirection:'row',alignItems:'center',margin:5}}>
                  <Text style={AppStyles.filterLabel}>Select Reason</Text>
                  <Picker
                    selectedValue={reason}
                    onValueChange={handleChange("reason")}
                    mode="dialog"
                    style={{ backgroundColor: "#ECF0FA",flex:1 }}
                    itemStyle={{}}
                    dropdownIconColor={appTheme.colors.cardTitle}
                  >
                    {reasonOptions.options.map((pickerItem, pickerIndex) => {
                      let labelV = (reasonOptions.keyName && pickerItem[reasonOptions.keyName]) ? pickerItem[reasonOptions.keyName] : (pickerItem.key ? pickerItem.key : "");
                      let label = (reasonOptions.valueName && pickerItem[reasonOptions.valueName]) ? pickerItem[reasonOptions.valueName] : (pickerItem.value ? pickerItem.value : "");
                      return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={label} value={labelV} key={pickerIndex} />)
                    })}
                  </Picker>
                </View> : false
              }
              <View style={{ flex: 1,marginTop:40,justifyContent:'center',padding:20 }}>
                {batchNum && batchNum.length && action.length? <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity style={[AppStyles.successBtn, { flexDirection: 'row',width:'60%',padding:10 }]} onPress={(e) => openDialog(e)} >
                    <Text style={AppStyles.successText}>SAVE</Text>
                  </TouchableOpacity>
                </View> : false}
              </View>

            </View>
            <View style={[styles.sectionContainer,{ flex: 1 }]}>
                <BatchDetails content={batchDet} editMode={false} _id={batchDet._id} title="BATCH DETAILS" />
            </View>
           
            {dialog ? 
            <CustomModal modalVisible={dialog} dialogTitle={dialogTitle} dialogMessage={dialogMessage} 
            closeDialog={closeDialog} okDialog={updateBatch} /> : false}
          </View>
          : false}
        {apiError && apiError.length ? (<ErrorModal msg={apiError} okAction={errOKAction} />) : false}

      </View>


    </ScrollView>
  )
}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    margin: 5
  },
  sectionContainer: {
    backgroundColor: 'white',
    margin: 5,
    padding: 5
  },
  radioText:{
    fontSize:16,
  },
  filterText:{
    fontSize:16,
    fontFamily:appTheme.fonts.regular
  },

});