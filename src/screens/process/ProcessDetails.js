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
import { RadioButton } from "react-native-paper";
import BatchDetails from "../batch/BatchDetails";
import AsyncStorage from '@react-native-async-storage/async-storage';


let batchSchema = [
  {
    "key": "batch_num", displayName: "Batch", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "batch", select: true,
    options: [],
    keyName: "batch_num", valueName: "batch_num",lowerCase:false
  },
  {
    "key": "customer_id", displayName: "Customer", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "customer", select: true, options: [],
    keyName: "_id", valueName: "customer_name"
  },
  {
    "key": "component_id", displayName: "Component Id", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "Component", select: true, options: [],
    keyName: "_id", valueName: "value",lowerCase:false
  },
  {
    "key": "component_count", displayName: "Components Required (Count)", placeholder: "", value: "",
    error: "", required: true, label: "components", type: "number"
  },
]

let created_process_schema = [
  {
    "key": "batch_num", displayName: "Batch", placeholder: "", value: "", error: "",
    lowerCase: true, "label": "batch",
  },
  {
    "key": "created_on", displayName: "Batch Created On", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "batch created on",type:"date"
  },
  {
    "key": "supplier", displayName: "Supplier", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, 
  },
  {
    "key": "heat_num", displayName: "Heat Number", placeholder: "", value: "",
    error: "", required: true, label: "components", type: "string"
  },
  {
    "key": "component_count", displayName: "Required Components", placeholder: "", value: "",
    error: "", required: true, label: "components", type: "number"
  },
  {
    "key": "component_id", displayName: "Component Id", placeholder: "", value: "",
    error: "", required: true, label: "component id", tyoe:'string'
  },
  {
    "key": "created_by", displayName: "Created By", placeholder: "", value: "",
    error: "", required: true, label: "created by", type: 'string'
  },
  {
    "key": "ok_component", displayName: "OK Component", placeholder: "", value: "",defaultValue:0,
    error: "", required: true, label: "ok component", type: 'number'
  },
]


export default function ProcessDetails(props) {
  const [batchFormData, setBatchFormData] = useState([])
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const [supplier, setSupplier] = useState([])
  const appState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [processDet, setProcessDet] = useState({})
  const [batchDet,setBatchDet] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();
  const [batches,setBatches] = useState([])
  const [customers,setCustomers] = useState([])
  const [forgeM,setForgeM] = useState([])
  const [forgeId,setForgeId] = useState('')
  const [count,setCount] = useState(0);
  const [forgeErr,setForgeErr] = useState('')
  const [groups,setGroups] = useState([])

  useEffect(() => {
    if (isFocused) {
      loadForm();
    }
    return () => { }
  }, [isFocused])

  useEffect(() => {
    loadData();
    return () => { }
  }, [count])


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const loadForm =  () => {
    if (props && props.processEntity){
      created_process_schema.map(item => {
        item["value"] = props.processEntity[item.key] ? props.processEntity[item.key] + "" : "";
        
        if (item.type === "date") {
          //convert date here
          item.value = dateUtil.toDateFormat(item.value, "DD MMM YYYY hh:mm");
        }
        if(props.processEntity && props.processEntity.process && props.processEntity.process.length){
          AsyncStorage.getItem("stage").then(value => {
            let ok_comp_index = created_process_schema.findIndex(item => item.key === "ok_component")
            let stage_ok_comp_index = props.processEntity.process.findIndex(item => item.stage_name === value)
            created_process_schema[ok_comp_index].value = props.processEntity.process[stage_ok_comp_index].ok_component + ""
            setBatchFormData(created_process_schema);
          })
        }
        
      });
    }
    else
    {
      setBatchFormData([...batchSchema]);
    }
    setCount(previousCount => previousCount + 1);
  }

  const updateForm = (obj) => {
    let formData = [...batchFormData];
    let index = formData.findIndex(item => item.key === obj.key);
      if (index != -1) {
        let updatedItem = formData[index];
        if(obj.options){
          const options = obj.options;
          updatedItem["options"] = options;
          if(options && options[0]) {
            updatedItem.value = obj.key === "batch_num" ? options[0].batch_num : options[0]._id;
            if(obj.key === "batch_num") {
              setBatchDet(options[0]);
            }
          }
        }
        let updatedBatchData = [...formData.slice(0, index), updatedItem, ...formData.slice(index + 1)];
        setBatchFormData([...updatedBatchData]);
    }
    if(obj.key === "customer_id")
      loadComponents()

  }

  const loadData = async () => {
    setApiStatus(true);
    setRefreshing(false);

    let cust_apiData = { "op": "get_customers" }
    let forge_apiData = { "op": "list_forge_machines"}
    let batch_apiData = {
      "op": "list_raw_material_by_status",
      "status": ["APPROVED"] 
    }

    setRefreshing(false);
    setCustomers([])
    setForgeM([])
    setBatches([])

    ApiService.getAPIRes(cust_apiData,"POST","customer").then(apiRes => {
      if(apiRes && apiRes.status){
        if (apiRes.response.message && apiRes.response.message.length) {
          setCustomers(apiRes.response.message)
          updateForm({ key:"customer_id",options:apiRes.response.message}) 
        } 
      }
    })
    ApiService.getAPIRes(forge_apiData, "POST", "forgeMachine").then(apiRes => {
      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length){
          setForgeM(apiRes.response.message)
        }
      }
    })
    ApiService.getAPIRes(batch_apiData, "POST", "batch").then(apiRes => {

      setApiStatus(false)
      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length){
          setBatches(apiRes.response.message)
          updateForm({ key: "batch_num", options: apiRes.response.message })
        }
      }
    })

  
  }

  const handleRadioChange = (name) => (value, index) => {
    if (name === "forge") {
      setForgeId(value)
    }
  };

  const handleChange = (name) => value => {
    let formData = [...batchFormData]
    let index = formData.findIndex(item => item.key === name);
    if (index != -1) {
      let updatedItem = formData[index]
      updatedItem["value"] = value;
     
      let updatedBatchData = [...formData.slice(0, index), updatedItem, ...formData.slice(index + 1)];
      setBatchFormData([...updatedBatchData]);
      if(name === "customer_id"){
        loadComponents()
      }
      if(name === "batch_num"){
        loadBatch()
      }
    }
  };

  const loadBatch = () => {
    let formData = [...batchFormData];
    let bIndex = formData.findIndex(item => item.key === "batch_num");
    let batchList = formData[bIndex].options;
    let oIndex = batchList.findIndex(item => item.batch_num === formData[bIndex].value)
    setBatchDet({})
    if(oIndex > -1)
    {
      setBatchDet(batchList[oIndex])
    }
  }
  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setProcessDet({})
    if (!props._id) {
      let newForm = util.resetForm(batchSchema)
      setBatchFormData(newForm);
      loadData();

    //  getSuppliers();

    }
  }
  const openDialog = (batchDetails) => {
    showDialog(true);
    let dialogTitle = "Confirm Batch Creation";
    let dialogMessage = batchDetails.process_name + " is the new process generated. Please click ok to confirm";
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
  }

  const handleSubmit = async () => {
    let loginFormData = [...batchFormData]
    let validFormData = await util.validateFormData(loginFormData);
    let isError = validFormData.find(item => {
      if (item.error.length) return item;
    }); 

    setForgeErr('')
    let apiData = await util.filterFormData([...batchFormData]);
    apiData.op = "add_process", 

    setBatchFormData(validFormData);
    if(! forgeId.length)
      setForgeErr("Forge Machine required")
    
    if(!isError && forgeId.length){
      apiData.forge_machine_id  = forgeId;
      setForgeErr('')
      setApiStatus(true);
      let apiRes = await ApiService.getAPIRes(apiData, "POST", "process");
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message) {
          setProcessDet(apiRes.response.message);
          openDialog(apiRes.response.message);
          util.resetForm(batchFormData);
        }
      }
    }

   
  }

  const loadComponents = () => {
    let formData = [...batchFormData];
    let cIndex = formData.findIndex(item => item.key === "customer_id");
    let cItem = formData[cIndex]
    let compIndex = formData.findIndex(item => item.key === "component_id");
    if (compIndex != -1 && cIndex != -1) {
      let selectedCustomerIndex = cItem.options.findIndex(item => item._id === cItem.value);
      let updatedItem = formData[compIndex];
      if (selectedCustomerIndex != -1) {
        let component_ids = cItem.options[selectedCustomerIndex].component_ids;
        if (component_ids && component_ids.length) {
          updatedItem.value = component_ids[0]
          let options = []
          component_ids.map(item => {
            options.push({"_id":item,"value":item});
          })
          updatedItem.options = options;
          let updatedBatchData = [...formData.slice(0, compIndex), updatedItem, ...formData.slice(compIndex + 1)];
          setBatchFormData([...updatedBatchData]);
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
          : <CustomHeader title={props.title ? props.title : ""} align={"center"} />}
            {props && props.processEntity ? false : 
            
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 2, margin: 10, padding: 5 }}>
                <View style={{ flexDirection: 'row' }}></View>
                <Text style={{ alignSelf: 'center', fontSize: 16, fontFamily: appTheme.fonts.regular, flex: 1 }}>Forge Machine</Text>
                <RadioButton.Group onValueChange={handleRadioChange("forge")}
                  value={forgeId} style={{ flexDirection: 'row', flexWrap: 'wrap', backgroundColor: 'red', color: "blue" }}>
                  <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {forgeM.map((forgeMItem, index) => {
                      return (
                        <View style={{ flexDirection: 'row', flex: 1 }} key={index}>
                          <RadioButton value={forgeMItem._id} />
                          <Text style={[styles.radioText, {
                            marginLeft: 15,
                            fontFamily: appTheme.fonts.regular,
                            color: 'black'
                          }]}>{forgeMItem.forge_machine_id}</Text>
                        </View>)
                    })}
                  </View>
                </RadioButton.Group>
                {forgeErr && forgeErr.length ? (<Text style={{ color: 'red', fontSize: 12, padding: 2, margin: 10 }}> {forgeErr} </Text>) : (false)}
                <FormGen
                  handleChange={handleChange}
                  editMode={props._id ? props.editMode : true}
                  formData={batchFormData} labelDataInRow={true}
                  style={{ backgroundColor: 'blue' }}
                labelFlex={props._id ? 1 : 1}
                dataFlex={props._id ? 1 : 2}
                />



              </View>

              <View style={{ flex: 2 }}>
                {/* 
              <CustomHeader title="BATCH DETAILS" align="center"/>
              {batchDet && batchDet._id ? <BatchDetails
                content={batchDet}
                editMode={false}
                _id={batchDet._id}
                noTitle={true}
              /> : false} */}
             
              </View>
            </View>
            }
        {props && props.processEntity ? <FormGen
          handleChange={handleChange}
          editMode={false}
          formData={batchFormData} labelDataInRow={true}
          style={{ backgroundColor: 'blue' }}
        /> : false}
            

          
       
          
        {dialog ? <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          okDialog={closeDialog}
        /> : <View></View>}

        <ActivityIndicator size="large" animating={apiStatus} />

        {apiError && apiError.length ? (<Text style={{ color: 'red', fontSize: 12, padding: 2, margin: 10 }}> {apiError} </Text>) : (false)}

        {props.processEntity ? <></> : <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
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