import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { dateUtil } from "../../commons";
import { appTheme } from "../../lib/Themes";
import FormGen from "../../lib/FormGen"
import CustomHeader from "../../components/CustomHeader";
import UserContext from "../UserContext";
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormGrid from "../../lib/FormGrid";


let created_process_schema = [
  {
    "key": "hold_materials_weight", displayName: "Hold Weight", placeholder: "", value: "", error: "",
     "label": "Hold Weight", type: "number"
  },
  {
    "key": "reject_weight", displayName: "Rejected Weight", placeholder: "", value: "", error: "",
    required: true, "label": "batch created on", type: "number"
  },
  {
    "key": "end_billets_weight", displayName: "End Billet Weight", placeholder: "", value: "", error: "",
    required: true, type:"number"
  },
  {
    "key": "updated_on", displayName: "Last Updated", placeholder: "", value: "",
    error: "", required: true, label: "components", type: "string"
  }
]


export default function WeightDetails(props) {
  const [batchFormData, setBatchFormData] = useState([])
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const appState = React.useContext(UserContext);
  const [batchDet, setBatchDet] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();
 

  useEffect(() => {
    if (isFocused) {
      loadForm();
    }
    return () => { }
  }, [isFocused])

  


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);

  const loadForm = async() => {
    if (props && props.processEntity) {
      created_process_schema.map(item => {
        item["value"] = props.processEntity[item.key] ? props.processEntity[item.key] + "" : "";
        if (item.type === "date") {
          //convert date here
          item.value = dateUtil.toDateFormat(item.value, "DD MMM YYYY hh:mm");
        }
      });

      setBatchFormData(created_process_schema);
    }
    if (props.processEntity && props.processEntity.process && props.processEntity.process.length) {
      let value = await AsyncStorage.getItem("stage");
        let hold_weight_index = created_process_schema.findIndex(item => item.key === "hold_materials_weight")
        let end_billets_weight_index = created_process_schema.findIndex(item => item.key === "end_billets_weight");
        let stage_ok_comp_index = props.processEntity.process.findIndex(item => item.stage_name === value)
        console.log(props.processEntity.process[stage_ok_comp_index])
        created_process_schema[hold_weight_index].value = props.processEntity.process[stage_ok_comp_index].hold_materials_weight+""
        created_process_schema[end_billets_weight_index].value = props.processEntity.process[stage_ok_comp_index].end_billets_weight+""
        setBatchFormData(created_process_schema);
      
    }
    
  }
  const handleChange = (name) => value => {
    
  };
  

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
        
        {props && props.processEntity ? <FormGrid
          editMode={false}
          formData={batchFormData} 
          labelDataInRow={true}
          labelFlex={1}
          dataFlex={1}
          
          style={{ backgroundColor: 'blue' }}
        /> : false}

        <ActivityIndicator size="large" animating={apiStatus} />

        {apiError && apiError.length ? (<Text style={{ color: 'red', fontSize: 12, padding: 2, margin: 10 }}> {apiError} </Text>) : (false)}

       

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