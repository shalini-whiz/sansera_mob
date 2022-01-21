import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { dateUtil, util } from "../../commons";
import { appTheme } from "../../lib/Themes";
import FormGen from "../../lib/FormGen"
import CustomHeader from "../../components/CustomHeader";
import { ApiService } from "../../httpservice";
import UserContext from "../UserContext";
import CustomModal from "../../components/CustomModal";
import { useIsFocused } from '@react-navigation/native';
import { RadioButton } from "react-native-paper";
import ProcessDetails from "../process/ProcessDetails";
import { default as AppStyles } from "../../styles/AppStyles";
import App from "../../../App";
import WeightDetails from "../process/WeightDetails";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShowRack from "./ShowRack";
import ErrorModal from "../../components/ErrorModal";
import PublishMqtt from "../mqtt/PublishMqtt";


let stageWeightSchema = [
  {
    "key": "hold_materials_weight", displayName: "Hold Material Weight (kg)", placeholder: "", value: 0, error: "",
    required: true, "label": "Hold Material Weight", type: "number", defaultValue: 0, nonZero: true
  },
  {
    "key": "ok_component", displayName: "End Billet Weight (kg)", placeholder: "", value: 0, error: "",
    required: true, "label": "Billet Weight", type: "number", defaultValue: 0, nonZero: true
  },
  // {
  //   "key": "ok_component", displayName: "OK Component (Count)", placeholder: "", value: 0,
  //   error: "", required: true, label: "components", type: "number",defaultValue:0,nonZero:true
  // },
]



export default function WorkPlan(props) {
  const [batchFormData, setBatchFormData] = useState([])
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const userState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [batchDet, setBatchDet] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();
  const [count, setCount] = useState(0);
  const [rackData, setRackData] = useState({})


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

  const loadForm = () => {
    let batchSchemaData = [...stageWeightSchema];
    setBatchFormData(batchSchemaData);
    setCount(previousCount => previousCount + 1);
  }

  const loadData = () => {
    setRefreshing(false)
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
    setRackData({})
  }

  const openDialog = (batchDetails) => {
    showDialog(true);
    let dialogTitle = "Confirm Batch Creation";
    let dialogMessage = batchDetails.process_name + " is the new process generated. Please click ok to confirm";
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
  }

  const showRack = (e) => {
    let apiData = { op: "get_next_raw_material_item" }
    apiData.batch_num = props.processEntity.batch_num
    ApiService.getAPIRes(apiData, "POST", "batch").then(apiRes => {
      if (apiRes && apiRes.status && apiRes.response && apiRes.response.message) {
        console.log("show rack "+JSON.stringify(apiRes.response.message));
        PublishMqtt({ "topic": apiRes.response.message.element_id})
        setRackData(apiRes.response.message);
        setDialogTitle("SHOW RACK")
        setDialogMessage("Rack : " + apiRes.response.message.element_num)
        showDialog(true);
      }
      else if(apiRes && apiRes.response.message)
        setApiError(apiRes.response.message)
    });

  }
  const handleSubmit = async () => {
    let loginFormData = [...batchFormData]
    let validFormData = await util.validateFormData(loginFormData);
    let isError = validFormData.find(item => {
      if (item.error.length) return item;
    });

    let apiData = await util.filterFormData([...batchFormData]);
    apiData.op = "update_process",
      apiData.process_name = props.processEntity.process_name
    apiData.stage_name = await AsyncStorage.getItem("stage")


    setBatchFormData(validFormData);

    if (!isError) {

      setApiStatus(true);
      ApiService.getAPIRes(apiData, "POST", "process").then(apiRes => {
        setApiStatus(false);
        if (apiRes && apiRes.status) {
          if (apiRes.response.message) {
            
            Alert.alert("Work plan updated");
            props.setProcessEntity(apiRes.response.message)
            props.updateProcess()

            // setBatchDet(apiRes.response.message);
            //openDialog(apiRes.response.message);
            util.resetForm(batchFormData);
          }
        }
        else if (apiRes && apiRes.response.message)
          setApiError(apiRes.response.message)
      });

    }


  }

  const reloadPage = (response) => {
    props.updateProcess()
  }

  const errOKAction = () => {
    setApiError('')
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.mainContainer}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 2, backgroundColor: 'white', margin: 5, padding: 5 }}>
            <TouchableOpacity
              style={[AppStyles.warnButtonContainer, { flexDirection: 'row', marginBottom: 10 }]}
              onPress={(e) => showRack(e)} >
              <Text style={AppStyles.warnButtonTxt}>SHOW RACK</Text>
            </TouchableOpacity>
            <FormGen
              handleChange={handleChange}
              formData={batchFormData} labelDataInRow={false}
            />
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: 5, marginTop: 10 }}>
              <TouchableOpacity style={[AppStyles.successBtn, { flexDirection: 'row', }]}
                onPress={(e) => handleSubmit(e)} disabled={apiStatus} >
                <Text style={AppStyles.successText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 3, flexDirection: 'row', }}>
            <View style={{ flex: 1, backgroundColor: 'white', margin: 5, padding: 5 }}>
              <ProcessDetails
                title="Process Details"
                processEntity={props && props.processEntity ? props.processEntity : {}} />
            </View>
            <View style={{ flex: 1, backgroundColor: 'white', margin: 5, padding: 5 }}>
              <WeightDetails title="Weight Details"
                processEntity={props && props.processEntity ? props.processEntity : {}} />
            </View>
          </View>
        </View>
        {apiError && apiError.length ? (<ErrorModal msg={apiError} okAction={errOKAction} />) : false}

        {dialog ? <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          container={<ShowRack rackData={rackData} processEntity={props.processEntity}
            reloadPage={reloadPage}
            closeDialog={closeDialog}
          />} /> : false
        }
      </View>
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: "center",
    margin: 10,
  },
  container: {
    //flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    margin: 10,
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