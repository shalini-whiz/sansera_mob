import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import { util } from "../../commons";
import { appTheme } from "../../lib/Themes";
import FormGen from "../../lib/FormGen"
import CustomHeader from "../../components/CustomHeader";
import { Picker } from '@react-native-picker/picker';
import CustomCard from "../../components/CustomCard";
import { ApiService } from "../../httpservice";
import BatchDetails from "./BatchDetails";
import CustomModal from "../../components/CustomModal";
import { useIsFocused } from '@react-navigation/native';


export default function ClearInventory() {
  const isFocused = useIsFocused();

  const [apiError, setApiError] = useState('')
  const [apiStatus,setApiStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false)
  const [batchNum, setBatchNum] = useState('')
  const [batchDet, setBatchDet] = useState({})
  const [dialog,showDialog] = useState(false);
  const [dialogTitle,setDialogTitle] = useState('')
  const [dialogMessage,setDialogMessage] = useState('');

  const [batchOptions, setBatchOptions] = useState({
    keyName: "_id", valueName: "batch_num",
    options: [],
  })

  useEffect(() => {
    if(isFocused){
      console.log("load batches on cleaer inventory batch")
      setApiStatus(true);
      loadBatches();
    }
    return () => { }
  }, [isFocused])

  const loadBatches = () => {
    let apiData = {
      "op": "list_raw_material_by_status",
      "status": "REJECTED"
    }
    setRefreshing(false);

    ApiService.getAPIRes(apiData, "POST", "list_raw_material_by_status").then(apiRes => {
      setApiStatus(false);
      console.log(JSON.stringify(apiRes))
      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length) {
          let bOptions = { ...batchOptions }
          bOptions.options = apiRes.response.message;
          setBatchOptions(bOptions)
          if(bOptions.options[0]){
            setBatchNum(bOptions.options[0]._id)
            setBatchDet(bOptions.options[0])
          }
        }
        else{
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
      let bDet = bOptions[index];
      if (bDet && bDet.batch_num === "select") setBatchDet(undefined)
      else setBatchDet(bDet);
    }
    
  };

  const closeDialog = () =>{
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
  }
  const openDialog = () => {
    showDialog(true);
    setDialogTitle('Confirm Clear Inventory');
    let batchDetails = {...batchDet}; 
    let message = "The racks associated with batch number "+batchDetails.batch_num+" will be deleted"
    setDialogMessage(message);
  }

  const removeBatch = async () => {
      let apiData = {}
      let batchDetails = { ...batchDet };
      apiData.batch_num = batchDetails.batch_num;
      apiData.status = "REMOVED"
      apiData.op = "update_material_fifo";
      apiData.fifo = [];
      console.log("apiData " + JSON.stringify(apiData))
      setApiStatus(true);
      ApiService.getAPIRes(apiData, "POST", "batch").then(apiRes => {
        console.log("on remove :  "+JSON.stringify(apiRes))
        setApiStatus(false);
        if (apiRes && apiRes.status) {
          if (apiRes.response.message) {
            closeDialog();
            loadBatches();
            setBatchDet({})
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
        <View style={{flexDirection:'row'}}>
          <View style={{flex:2,margin:2,flexDirection:'row',alignItems:'center'}}>
            <Text style={{padding:5,fontSize:14}}>Select Batch</Text>
            <Picker
              selectedValue={batchNum}
              onValueChange={handleChange("batchNum")}
              mode="dialog"
              style={{ backgroundColor: "#ECF0FA",flex:1 }}
              itemStyle={{}}
              dropdownIconColor={appTheme.colors.cardTitle}
            >
              {batchOptions.options.map((pickerItem, pickerIndex) => {
                let labelV = (batchOptions.keyName && pickerItem[batchOptions.keyName]) ? pickerItem[batchOptions.keyName] : (pickerItem.key ? pickerItem.key : "");
                let label = (batchOptions.valueName && pickerItem[batchOptions.valueName]) ? pickerItem[batchOptions.valueName] : (pickerItem.value ? pickerItem.value : "");
                return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={label} value={labelV} 
                key={pickerIndex} />)
              })}
            </Picker>
          </View>
          <View style={{flex:3,margin:2}}>
            
          </View>
          

        </View>
        <ActivityIndicator size="large" animating={apiStatus} />

        {batchDet && batchDet._id ?
          <View style={{ flexDirection: 'row', margin: 5, padding: 5 }}>
           
            <View style={{ flex: 2 }}>
              <View style={{
                flexDirection: 'column',marginBottom:120}}>
              <CustomHeader title={"Rack Numbers"} size={16}/>
              {console.log(JSON.stringify(batchDet.fifo))}
              <View style={{flexDirection:'row',}}>
              {batchDet.fifo.map((fifoItem,fifoIndex) =>{
                console.log("fifoItem "+fifoItem.element_num);
                console.log(fifoIndex)
                let fifoRack = (fifoIndex === 0) ? fifoItem.element_num : ", "+fifoItem.element_num
                return(<Text style={{color:'red',fontSize:14}} key={fifoIndex}>{fifoRack}</Text>)

              })}
              </View>
              </View>
              {batchNum && batchNum.length ? <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <TouchableOpacity style={[styles.successBtn, { flexDirection: 'row' }]} onPress={(e) => openDialog(e)} >
                  <Text style={styles.successText}>DELETE</Text>
                </TouchableOpacity>
              </View> : false}
            </View>
            <View style={{ flex: 2 }}>
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
              okDialog={removeBatch}
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


  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: "bold"
  },

});