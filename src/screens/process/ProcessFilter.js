import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { appTheme } from "../../lib/Themes";
import { ApiService } from "../../httpservice";
import UserContext from "../UserContext";
import { useIsFocused } from '@react-navigation/native';
import { RadioButton } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { forwardRef, useImperativeHandle } from 'react'
import AppStyles from "../../styles/AppStyles";

 function ProcessFilter(props,ref) {
  const userState = React.useContext(UserContext);
  const isFocused = useIsFocused();

  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false)
  const [process, setProcess] = useState([])
  const [processName, setProcessName] = useState({})

  useEffect(() => {
    if (isFocused) {
      setApiStatus(true);
      loadProcess();
    }
    return () => { }
  }, [isFocused])

  useImperativeHandle(ref, () => ({
    setFromOutside(msg) {
      reload()
    }
  }), [])

  const loadProcess = () => {
    let apiData = {
      "op": "get_process",
      "status":["RUNNING"]
    }
    
    setRefreshing(false);
    ApiService.getAPIRes(apiData, "POST", "process").then(apiRes => {
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length) {
          let currentProcess = apiRes.response.message[0];
         

          if(currentProcess) {
            if (processName.length > 0) {
              let currentProObj = apiRes.response.message.find(item => item.process_name === processName)
              props.processEntity(currentProObj)
              setProcessName(currentProObj.process_name)
            }
            else{
              props.processEntity(apiRes.response.message[0])
              setProcessName(apiRes.response.message[0].process_name)
            }
          }
         
          setProcess(apiRes.response.message)
         

        }
      }
      else {
        setProcess([])
      }
    });

  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProcess();
  }, []);


  const handleChange = (name) => (value) => {
    let index = process.findIndex(item => item.process_name === value)
    setProcessName(value)  
    if(index != -1){
      props.processEntity(process[index])
    }
  };

  const reload = () => {
    loadProcess();
  }

  return (
      <View style={[styles.container,{}]}>
      {apiStatus ? <ActivityIndicator size="large" animating={apiStatus} /> : false}
      <View style={{ flexDirection: 'row' ,margin:2,padding:5,backgroundColor:'white'}} >
          <Text style={[AppStyles.filterLabel,{margin:1}]}>Process</Text>
          <RadioButton.Group 
            onValueChange={handleChange("process") }
          value={processName}
            style={{ flexDirection: 'row',   }}>
      
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center'   }} >
              {process.map((item, index) => {
                return(
                <View style={{ flexDirection: 'row',justifyContent:'center',alignItems:'center',
                alignSelf:'center',margin:1,
               // backgroundColor:item.process_name === processName ? appTheme.colors.cardTitle : 'white',
                
                }} key={index}>
                  <RadioButton value={item.process_name} />
                    <Text style={[styles.radioText, {
                      marginRight: 10, 
                      color: item.process_name === processName ? appTheme.colors.cardTitle : appTheme.colors.warnAction,
                      fontFamily : appTheme.fonts.bold 
 }]}>{item.process_name}</Text>    
                </View>)
              })}
              </View>
          </RadioButton.Group>
          </View>
      </View>
  )
}
export default React.forwardRef(ProcessFilter)
const styles = StyleSheet.create({
  container: {
    //margin: 5,
   // height:100,
    //flex:1
  },
 
  radioText: {
    fontSize: 16,
  },
 
  filterLabel: {
    fontSize: 14,
    fontFamily: appTheme.fonts.regular,
    padding: 5
  },

});