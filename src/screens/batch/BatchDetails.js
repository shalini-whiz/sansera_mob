import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { dateUtil, util } from "../../commons";
import { appTheme } from "../../lib/Themes";
import FormGen from "../../lib/FormGen"
import CustomHeader from "../../components/CustomHeader";
import { ApiService } from "../../httpservice";
import UserContext from "../UserContext";
import CustomModal from "../../components/CustomModal";
import { useIsFocused } from '@react-navigation/native';
import { min } from "moment";
const { DateTime } = require("luxon");

let batchSchema = [
  {
    "key": "supplier_id", displayName: "Supplier", placeholder: "", value: "", error: "",
    required: true, "label": "supplier", select: true,
    options: [],
    keyName: "_id", valueName: "supplier_name",titleCase:true
  },
  {
    "key": "material_code", displayName: "Material Code", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "Material Code", select: true,
    options: [],
    keyName: "material_code", valueName: "material_code",lowerCase:false
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
    "key": "batch_num", displayName: "Batch", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "batch num", type: "string"
  },
  {
    "key": "created_on", displayName: "Created Date", placeholder: "", value: "", error: "",
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
  const [apiStatus, setApiStatus] = useState(false);
  const [supplier, setSupplier] = useState([])
  const userState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [batchDet, setBatchDet] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();
  const [materials,setMaterials] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isFocused) {
       loadForm();
    }
    return () => { }
  }, [isFocused])

  useEffect(() => {
    if (!props._id) {
      getSuppliers();
    }
    return () => { }
  }, [count])


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (!props._id)
      getSuppliers();
  }, []);

  
  const loadForm =  () => {
    let batchSchemaData = [];
    if (props._id) {
      batchSchemaData = [...createdBatch];
      batchSchemaData.map(item => {
        item["value"] = props._id ? props.content[item.key] + "" : "";
        if (item.type === "date") {
          //convert date here
          item.value = dateUtil.toDateFormat(item.value, "DD MMM YYYY hh:mm");
        }
      });
      setBatchFormData(batchSchemaData);

    }
    else {
      batchSchemaData = [...batchSchema];
      //let formData = await util.formatForm(batchSchemaData);
      setBatchFormData(batchSchemaData);
    }
    setCount(previousCount => previousCount + 1);

  }

  const getSuppliers = async () => {
    setApiStatus(true);

    let apiData = {
      "op": "get_suppliers"
    }
    setRefreshing(false);

    let apiRes = await ApiService.getAPIRes(apiData, "POST", "get_supplier");
    setApiStatus(false);
    if (apiRes && apiRes.status) {
      if (apiRes.response.message && apiRes.response.message.length) {
        setSupplier(apiRes.response.message)
        let formData = [...batchFormData];
        let index = formData.findIndex(item => item.key === "supplier_id");
        if (index != -1) {
          let updatedItem = formData[index];
          const options = apiRes.response.message;
          updatedItem["options"] = options;
          if (apiRes.response.message[0]) updatedItem.value = apiRes.response.message[0]._id;
          let updatedBatchData = [...formData.slice(0, index), updatedItem, ...formData.slice(index + 1)];
          setBatchFormData([...updatedBatchData]);
          loadSupplierMaterials()
        }

      }
    }
  }

  const loadSupplierMaterials = () => {
    let formData = [...batchFormData];
    let sIndex = formData.findIndex(item => item.key === "supplier_id");
    let sItem = formData[sIndex]
    let mIndex = formData.findIndex(materialItem => materialItem.key === "material_code");
    if (mIndex != -1 && sIndex != -1) {
      let selectedSupplierIndex = sItem.options.findIndex(item => item._id === sItem.value);
      let updatedItem = formData[mIndex];
      if(selectedSupplierIndex != -1){
        let material_details = sItem.options[selectedSupplierIndex].material_details
        if (material_details) {
          setMaterials(material_details)
          if (material_details.length && material_details[0]) updatedItem.value = material_details[0].material_code
          updatedItem.options = material_details;
          let updatedBatchData = [...formData.slice(0, mIndex), updatedItem, ...formData.slice(mIndex + 1)];
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
      if (name === "supplier_id"){
        loadSupplierMaterials();        
      }
    }
  };

  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setBatchDet({})
    if (!props._id) {
      let newForm = util.resetForm(batchSchema)
      setBatchFormData(newForm);
      getSuppliers();

    }
  }
  const openDialog = (batchDetails) => {
    showDialog(true);
    let dialogTitle = "Confirm Batch Creation";
    let dialogMessage = batchDetails.batch_num + " is the new batch number generated.";
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
  }

  const handleSubmit = async () => {
    let loginFormData = [...batchFormData]
    let validFormData = await util.validateFormData(loginFormData);
    let isError = validFormData.find(item => {
      if (item.error.length) return item;
    });
    setBatchFormData(validFormData);
    if (!isError) {
      let apiData = await util.filterFormData([...batchFormData]);
      apiData.total_weight = parseFloat(apiData.total_weight)
      apiData.created_by = userState.user.id;
      apiData.op = "add_raw_material";
      setApiStatus(true);
      let apiRes = await ApiService.getAPIRes(apiData, "POST", "batch");
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
          <View style={{ width: '70%', margin: 10, padding: 5 }}><FormGen
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