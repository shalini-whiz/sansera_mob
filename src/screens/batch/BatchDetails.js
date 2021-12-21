import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl,ActivityIndicator } from "react-native";
import { dateUtil, util } from "../../commons";
import { appTheme } from "../../lib/Themes";
import FormGen from "../../lib/FormGen"
import CustomHeader from "../../components/CustomHeader";
import { ApiService } from "../../httpservice";
import UserContext from "../UserContext";
import CustomModal from "../../components/CustomModal";
import { useIsFocused } from '@react-navigation/native';
const { DateTime } = require("luxon");

let batchSchema = [
  {
    "key": "supplier_id", displayName: "Supplier", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "supplier", select: true, 
    options: [],
    keyName: "_id", valueName: "supplier_name"
  },
  {
    "key": "type", displayName: "Type", placeholder: "", value: "steel", error: "",
    required: true, lowerCase: true, "label": "type", select: true, options: [
      { "_id": "steel", "value": "Steel" },
      { "_id": "aluminium", "value": "Aluminium" }
    ],
    keyName: "_id", valueName: "value"
  },
  {
    "key": "heat_num", displayName: "Heat Number", placeholder: "", value: "",
    error: "", required: true, label: "heat number", type: "string"
  },
  {
    "key": "total_weight", displayName: "Total Quantity (in Kg)", placeholder: "", value: "",
    error: "", required: true, label: "quantity", type: "number"
  },
]


let createdBatch = [
  {
    "key": "create_on", displayName: "Created Date", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "created date", type: "date"
  },
  {
    "key": "supplier", displayName: "Supplier", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "supplier", type: "string"
  },
  {
    "key": "type", displayName: "Type", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "type", type: "string"
  },
  {
    "key": "heat_num", displayName: "Heat Number", placeholder: "", value: "",
    error: "", required: true, label: "heat number", type: "string"
  },
  {
    "key": "total_weight", displayName: "Total Quantity (in Kg)", placeholder: "", value: "",
    error: "", required: true, label: "quantity", type: "number"
  },
  {
    "key": "created_by", displayName: "Created By", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "created by", type: "string"
  },
  {
    "key": "status", displayName: "Status", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "status", type: "string"
  }
]
export default function BatchDetails(props) {
  const [batchFormData, setBatchFormData] = useState([])
  const [apiError, setApiError] = useState('')
  const [apiStatus,setApiStatus] = useState(false);
  const [supplier,setSupplier] = useState([])
  const userState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [batchDet, setBatchDet] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();

  useEffect( () => {
    if (isFocused) {
      async function loadDefaults() {
        await loadForm();
        if (!props._id){
          setApiStatus(true);
          await getSuppliers();

        }
      }
      loadDefaults();
    }
    return () => { }
  }, [isFocused])
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    console.log(batchFormData)
    if(!props._id)
    getSuppliers();
  }, []);
  const loadForm = async () => {
    let batchSchemaData = [];
    if(props._id){
      batchSchemaData = [...createdBatch];
      batchSchemaData.map(item => {
        item["value"] = props._id ? props.content[item.key]+"" : "";
        if(item.type === "date"){
          //convert date here
          item.value = dateUtil.toDateFormat(item.value,"DD MMM YYYY hh:mm");
        }
      });
      setBatchFormData(batchSchemaData);

    }
    else{
      console.log("set form here ");
      batchSchemaData = [...batchSchema];
      console.log("before set "+batchSchemaData)
      //let formData = await util.formatForm(batchSchemaData);
      setBatchFormData(batchSchemaData);
     

    }
  }

  const getSuppliers = async () => {
    let apiData = {
      "op": "get_suppliers"
    }
    console.log("get supplier api data "+JSON.stringify(apiData))
    setRefreshing(false);

    let apiRes = await ApiService.getAPIRes(apiData, "POST", "get_supplier");
    console.log("supplier response "+JSON.stringify(apiRes));
    setApiStatus(false);
    if (apiRes && apiRes.status) {
      if (apiRes.response.message && apiRes.response.message.length) {
        setSupplier(apiRes.response.message)
        let formData = [...batchFormData];
        console.log(JSON.stringify(formData))
        let index = formData.findIndex(item => item.key === "supplier_id");
        console.log(index);
        if (index != -1) {
          let updatedItem = formData[index];
                  const options = apiRes.response.message;
          updatedItem["options"] = options;
          if(apiRes.response.message[0])updatedItem.value = apiRes.response.message[0]._id;
          let updatedBatchData = [...formData.slice(0, index), updatedItem, ...formData.slice(index + 1)];
          setBatchFormData([...updatedBatchData]);
        }

      }
    }
  }

  const handleChange = (name) => value => {
    let formData = [...batchFormData]
    let index = formData.findIndex(item => item.key === name);
    if (index != -1) {
      let updatedItem = formData[index]
      updatedItem["value"] = value;
      let updatedBatchData = [...formData.slice(0, index), updatedItem, ...formData.slice(index + 1)];
      setBatchFormData([...updatedBatchData]);
    }
  };

  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setBatchDet({})
    if(!props._id)
    {
      let newForm = util.resetForm(batchSchema)
      setBatchFormData(newForm);
      getSuppliers();

    }
  }
  const openDialog = (batchDetails) => {
    console.log("show dialog here")
    showDialog(true);
    console.log("newly created batch "+JSON.stringify(batchDetails))
    let dialogTitle = "Confirm Batch Creation";
    let dialogMessage = batchDetails.batch_num+" is the new batch number generated. Please click ok to confirm";
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
  }

  const handleSubmit = async () => {
    let loginFormData = [...batchFormData]
    let validFormData = await util.validateFormData(loginFormData);
    let isError = validFormData.find(item => {
      if (item.error.length) return item;
    });
    console.log(isError)
    setBatchFormData(validFormData);
    if (!isError) {
      let apiData = await util.filterFormData([...batchFormData]);
      apiData.total_weight = parseFloat(apiData.total_weight)
      apiData.created_by = userState.user.id;
      apiData.op = "add_raw_material";
      console.log("create batch : "+JSON.stringify(apiData))
      setApiStatus(true);
      let apiRes = await ApiService.getAPIRes(apiData, "POST", "batch");
      console.log("create batch res: " + JSON.stringify(apiRes))
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message) {
          setBatchDet(apiRes.response.message);
          openDialog(apiRes.response.message);
        }
      }
    }
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
        {props.noTitle ? false 
          : <CustomHeader title={props.title ? props.title : ""} />}
        
        {props._id ? <FormGen
          handleChange={handleChange} 
          editMode={props._id ? props.editMode : true}
         
          labelDataInRow={true}
          formData={batchFormData}

        /> : 
        <View style={{width:'70%',margin:10,padding:5}}><FormGen
          handleChange={handleChange} 
          editMode={props._id ? props.editMode : true}
          formData={batchFormData} labelDataInRow={true}
        /></View>}
        {dialog ? <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          okDialog={closeDialog}
        /> : <View></View>}
          
        <ActivityIndicator size="large" animating={apiStatus} />

        {apiError && apiError.length ? (<Text style={{ color: 'red', fontSize: 12, padding: 2, margin: 10 }}> {apiError} </Text>) : (false)}

        {props._id ? <></> : <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity style={[styles.successBtn, { flexDirection: 'row' }]} onPress={(e) => handleSubmit(e)} >
            <Text style={styles.successText}>SAVE</Text>
          </TouchableOpacity>
        </View>}
        
      </View>


    </ScrollView>
  )
}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    margin: 1
  },
  successBtn: {
    width: "40%",
    borderRadius: 25,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
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