import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, RefreshControl,ActivityIndicator } from "react-native";
import { util } from "../../commons";
import { appTheme } from "../../lib/Themes";
import { Picker } from '@react-native-picker/picker';
import CustomCard from "../../components/CustomCard";
import { ApiService } from "../../httpservice";
import BatchDetails from "./BatchDetails";
import CustomModal from "../../components/CustomModal";
import { RadioButton } from "react-native-paper";
import UserContext from "../UserContext";
import { useIsFocused } from '@react-navigation/native';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import CustomHeader from "../../components/CustomHeader";
import { act } from "react-test-renderer";



export default function ApproveBatch() {
  const userState = React.useContext(UserContext);
  const isFocused = useIsFocused();

  const [apiError, setApiError] = useState('')
  const [apiStatus,setApiStatus] = useState(false);
  const [batchNum, setBatchNum] = useState('')
  const [status, setStatus] = useState('NEW');
  const [reason, setReason] = useState('');
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
    keyName: "_id", valueName: "reason",
    options: [
      { "_id": "1", "reason": "reason 1" },
      { "_id": "2", "reason": "reason 2" }
    ],
  })
  useEffect(() => {
    if (isFocused) {
      setApiStatus(true);
      loadBatches();
      setAction('')
    }
    return () => { }
  }, [status,isFocused])

  const loadBatches = () => {
    let apiData = {
      "op": "list_raw_material_by_status",
      "status": "NEW"
    }
    apiData.status = status.length ? status : "NEW";
    setRefreshing(false);

    ApiService.getAPIRes(apiData, "POST", "list_raw_material_by_status").then(apiRes => {
      setApiStatus(false);

      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length) {
          let bOptions = { ...batchOptions }
         
          bOptions.options = apiRes.response.message;
          setBatchOptions(bOptions);
          if (bOptions.options[0]){
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
    });

  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadBatches();
  }, []);

  const handleChange = (name) => (value, index) => {
    if (name === "batchNum") {
      setBatchNum(value)
      let bOptions = [...batchOptions.options]
      if(bOptions.length){
        let bDet = bOptions[index];
        setBatchDet(bDet)
      }
      else{
        setBatchDet(undefined)
      }
     
    
    }
    else if (name === "status") {
      setStatus(value)
      //loadBatches()
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
    showDialog(true);
    let batchDetails = { ...batchDet };
    let dialogTitle = "";
    let dialogMessage = "";
    if(action === "rejected") {
      dialogTitle = "Reject Batch";
      dialogMessage = "Are you sure you wish to REJECT "+batchDetails.batch_num
    }
    if(action === "approved") {
      dialogTitle = "Approve Batch"
      dialogMessage = "Are you sure you wish to APPROVE " + batchDetails.batch_num
    }
    if(action === "new") {
      dialogTitle = "Hold Batch";
      dialogMessage = "Are you sure you wish to HOLD " + batchDetails.batch_num
    }
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
  }
  const updateBatch = () => {
    let apiData = {}
    if (action === "rejected") apiData.material_reject_reason = reason
    let batchDetails = { ...batchDet };

    apiData.batch_num = batchDetails.batch_num;
    apiData.status = action.toUpperCase()
    //apiData.approved_by = userState.user.id;
    apiData.op = "update_raw_material";
    if (action === "rejected")
      apiData.reject_weight = 0;
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
    });  
  }
 
  return (
    
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
      <View style={styles.container}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 3,flexDirection:'row',alignItems:'center' }}>
            <Text style={styles.filterLabel}>Select Batch</Text>
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
          <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center'}}>
            <FontAwesome5 name="filter" size={20} style={{ margin: 2, padding: 5, marginLeft: 10 }}  ></FontAwesome5>
            <TouchableOpacity style={{
              flexDirection: 'row', padding: 5, borderRadius: status === "NEW" ? 15 : 0,
              paddingLeft: 10, paddingRight: 10,
              backgroundColor: status === "NEW" ? appTheme.colors.cardTitle : 'white'
            }}


              onPress={(e) => setStatus("NEW")} >
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
              onPress={(e) => setStatus("APPROVED")} >
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


            }} onPress={(e) => setStatus("REJECTED")} >
              <Text style={[styles.filterText, {
                color: appTheme.colors.cancelAction,
                fontFamily: status === "REJECTED" ? appTheme.fonts.bold : appTheme.fonts.regular,
                color: status === "REJECTED" ? 'white' : appTheme.colors.cardTitle,
              }]}>Rejected</Text>
            </TouchableOpacity>
          </View>

        </View>

        <ActivityIndicator size="large" animating={apiStatus} />

        <View style={{flex:1,flexDirection:'row'}}>
          <View style={{
            flexDirection: 'row', justifyContent: 'center', flex: 1, flexDirection: 'column', margin: 10, marginTop: 20,
            borderColor: 'grey', borderWidth: 0.5, padding: 10, borderRadius: 10 }}>
            <CustomHeader title={"Rack Numbers"} size={18} style={{}} />
            <View style={{ flexDirection: 'row', flex: 1 }}>
              {batchDet && batchDet.fifo && batchDet.fifo.map((fifoItem, fifoIndex) => {
                let fifoRack = (fifoIndex === 0) ? fifoItem.element_num : "  |   " + fifoItem.element_num
                return (
                    <Text style={{
                      fontSize: 14,
                      color:  'black'

                    }} key={fifoIndex} >{fifoRack}</Text>
                )
              })}
            </View>

          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', flex: 1 }}>
          </View>

        </View>
       
        {batchDet && batchDet._id ?
          <View style={{ flexDirection: 'row', margin: 1, padding: 1 }}>
           
            <View style={{ flex: 1,margin:20,alignItems:'center' }}>
              {batchNum && batchNum.length ? 
              <View style={{flexDirection:'column'}}>
                <RadioButton.Group onValueChange={handleChange("action")}
                value={action} style={{ flexDirection: 'row', flexWrap: 'wrap', backgroundColor: 'red', color: "blue" }}>
                <View style={{  flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    {batchDet && batchDet.status !== "NEW" ? <>
                        <Text style={[styles.radioText, {
                          color: appTheme.colors.warnAction, marginLeft: 15,
                          fontFamily: action === "new" ? appTheme.fonts.bold : appTheme.fonts.regular
                        }]}>HOLD</Text>
                        <RadioButton value="new" />
                    </>: false}
                   
                      {batchDet && batchDet.status !== "APPROVED" ? <>

                      <Text style={[styles.radioText, { 
                        color: appTheme.colors.successAction, marginLeft:15,
                        fontFamily: action === "approved" ? appTheme.fonts.bold : appTheme.fonts.regular
                        }]}>APPROVE</Text>
                    <RadioButton value="approved" />
                    </> : false}
                    
                  {batchDet.status !== "REJECTED" ? <>
                        <Text style={[styles.radioText, { color: appTheme.colors.cancelAction,
                           marginLeft:15,
                          fontFamily: action === "rejected" ? appTheme.fonts.bold : appTheme.fonts.regular

                           
                           }]}>REJECT</Text><RadioButton value="rejected" /></>: false}
                </View>
              </RadioButton.Group>
              </View>
       : false}
              {action === "rejected" ?
                <View style={{flexDirection:'row',alignItems:'center',}}>
                  <Text style={styles.filterLabel}>Select Reason</Text>
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
              <View style={{ flex: 1,marginTop:40,justifyContent:'center' }}>
                {batchNum && batchNum.length && action.length? <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity style={[styles.successBtn, { flexDirection: 'row' }]} onPress={(e) => openDialog(e)} >
                    <Text style={styles.successText}>SAVE</Text>
                  </TouchableOpacity>
                </View> : false}
              </View>

            </View>
            <View style={{ flex: 1 }}>
              <CustomCard title={"BATCH DETAILS"} cardContent={
                <BatchDetails
                  content={batchDet}
                  editMode={false}
                  _id={batchDet._id}
                  noTitle={true}
                />
              }></CustomCard>
            </View>
           
           
            {dialog ? <CustomModal
              modalVisible={dialog}
              dialogTitle={dialogTitle}
              dialogMessage={dialogMessage}
              closeDialog={closeDialog}
              okDialog={updateBatch}
            /> : <View></View>}
          </View>
          : false}
        {apiError && apiError.length ? (<Text style={{ color: 'red', fontSize: 12, padding: 2, margin: 10 }}> {apiError} </Text>) : (false)}

      </View>


    </ScrollView>
  )
}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    //justifyContent: "center",
    margin: 5
  },
  successBtn: {
    width: "40%",
    borderRadius: 25,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    //marginTop: 40,
    backgroundColor: appTheme.colors.warnAction,
  },
  successText: {
    color: appTheme.colors.warnActionTxt
  },
  radioText:{
    fontSize:16,
  },
  filterText:{
    fontSize:16,
    fontFamily:appTheme.fonts.regular
  },
  filterLabel:{
    fontSize:14,
    fontFamily:appTheme.fonts.regular,
    padding:5
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: "bold"
  },

});