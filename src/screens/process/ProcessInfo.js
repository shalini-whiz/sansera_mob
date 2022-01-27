import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { dateUtil, util } from "../../commons";
import { appTheme } from "../../lib/Themes";
import CustomHeader from "../../components/CustomHeader";
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormGrid from "../../lib/FormGrid";
import { stageType } from "../../constants/appConstants";

let created_process_schema = [
  {
    "key": "batch_num", displayName: "Batch", placeholder: "", value: "", error: "",
    lowerCase: true, "label": "batch",
  },
  {
    "key": "created_on", displayName: "Batch Created On", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "batch created on", type: "date"
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
    error: "", required: true, label: "component id", tyoe: 'string'
  },
  {
    "key": "created_by", displayName: "Created By", placeholder: "", value: "",
    error: "", required: true, label: "created by", type: 'string'
  }
]


let ok_component_schema = {
  "key": "ok_component", displayName: "OK Component", placeholder: "", value: "", defaultValue: 0,
  error: "", required: true, label: "ok component", type: 'number'
}

let rejection_schema = {
  "key": "total_rejections", displayName: "Rejected Component", placeholder: "", value: "",
  error: "", required: true, label: "rejected component", type: "number", nonZero: true
}

let forge_schema = {
  "key": "forge_machine_id", displayName: "Forge Machine", placeholder: "", value: "",
  error: "", required: true, label: "Forge Machine", type: "number", nonZero: true
}
let one_punch_billet_schema = {
  "key": "one punch billet", displayName: "One Punch Billet", placeholder: "", value: 0,
    error: "", required: true, label: "One Punch Billet", type: "number", defaultValue: 0
};

let two_punch_billet_schema = {
  "key": "two punch billet", displayName: "Two Punch Billet", placeholder: "", value: 0,
    error: "", required: true, label: "Two Punch Billet", type: "number", defaultValue: 0
}
let three_punch_billet_schema = {
  "key": "three punch billet", displayName: "Three Punch Billet", placeholder: "", value: 0,
    error: "", required: true, label: "Three Punch Billet", type: "number", defaultValue: 0
}
let billet_schema = []
export default function ProcessInfo(props) {
  const [batchFormData, setBatchFormData] = useState([])
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
    if (props && props.processEntity && props.processEntity.process) {
     
      
      let currentStage = await AsyncStorage.getItem("stage");
      let processSchema = []
      
      if(currentStage && currentStage.toLowerCase() === stageType.billetpunching){
        processSchema = [...created_process_schema]
        processSchema.push(rejection_schema)
        processSchema.push(one_punch_billet_schema)
        processSchema.push(two_punch_billet_schema)
        processSchema.push(three_punch_billet_schema)
      }
      if ( currentStage && (currentStage.toLowerCase() === stageType.shotblasting || currentStage.toLowerCase() === stageType.visual || 
      currentStage.toLowerCase() === stageType.shotpeening || currentStage.toLowerCase() === stageType.oiling)) {
        processSchema = [...created_process_schema]
        processSchema.push(ok_component_schema);
        processSchema.push(rejection_schema)
       
      }
      processSchema.map(item => {
        item["value"] = props.processEntity[item.key] ? props.processEntity[item.key] + "" : "";

        if (item.type === "date") {
          //convert date here
          item.value = dateUtil.toDateFormat(item.value, "DD MMM YYYY hh:mm");
        }
        if (item.key === "created_by") {
          item.value = props.processEntity["created_by_emp_name"] + " (" + props.processEntity[item.key] + ")"
        }
       

      });

      if (props.fields && props.fields.length) {
        let rej_comp_index = processSchema.findIndex(item => item.key === "total_rejections")
        let ok_comp_index = processSchema.findIndex(item => item.key === "ok_component")
        let stage_ok_comp_index = props.processEntity.process.findIndex(item => item.stage_name === currentStage)
        if (stage_ok_comp_index > -1 && props.fields.indexOf("total_rejections") > -1) {
          if (props.processEntity.process[stage_ok_comp_index] && props.processEntity.process[stage_ok_comp_index].total_rejections)
            processSchema[rej_comp_index].value = props.processEntity.process[stage_ok_comp_index].total_rejections + ""
        }
        if (currentStage && currentStage.toLowerCase() != "shearing" && stage_ok_comp_index > -1 && ok_comp_index > -1) {
          processSchema[ok_comp_index].value = props.processEntity.process[stage_ok_comp_index].ok_component + ""
        }
        else if (ok_comp_index > -1) {
          processSchema[ok_comp_index].value = "0"
        }
      }
      if (currentStage && currentStage.toLowerCase() === stageType.billetpunching) {
        let stage_ok_comp_index = props.processEntity.process.findIndex(item => item.stage_name === currentStage)
        
        if(stage_ok_comp_index > -1){
          let properties = props.processEntity.process[stage_ok_comp_index].properties;
          let punchKeys = ["one punch billet", "two punch billet", "three punch billet"];
          punchKeys.map(punchItem => {
            let punchIndex = processSchema.findIndex(item => item.key === punchItem)
            if (punchIndex > -1) {
              let item_index = properties.findIndex(item => Object.keys(item)[0] === punchItem)
              processSchema[punchIndex].value = properties[item_index][punchItem] + ""
            }
          })
        }
      }
      setBatchFormData(processSchema)
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
          : <CustomHeader title={props.title ? props.title : ""} align={"center"} style={{ marginBottom: 20 }} />}
        
        <FormGrid
          editMode={false}
          formData={batchFormData} labelDataInRow={true}
          style={{ marginTop: 20 }}
        /> 
      </View>
    </ScrollView>
  )
}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    // backgroundColor: "#fff",
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