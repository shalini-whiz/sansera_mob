import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { appTheme } from "../../lib/Themes";
import UserContext from "../UserContext";
import { useIsFocused } from '@react-navigation/native';
import { default as AppStyles } from "../../styles/AppStyles";
import { TextInput } from "react-native-gesture-handler";
import { ApiService } from "../../httpservice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PubBatterySleep from "../mqtt/PubBatterySleep";



export default function ShowRack(props) {
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const appState = React.useContext(UserContext);
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();
  const [bundleWeight, setBundleWeight] = useState(0)
  const [bundleWeigtErr, setBundleWeightErr] = useState('')

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);


  const closeDialog = () => {
    props.closeDialog();
  }

  const handleSubmit = () => {
    if (bundleWeight && bundleWeight > 0) {
      setApiStatus(true);
      let apiData = {};
      apiData.batch_num = props.processEntity.batch_num
      apiData.bundle_weight = bundleWeight
      apiData.op = "pop_material"

      ApiService.getAPIRes(apiData, "POST", "batch").then(apiRes => {
        setApiStatus(false);
        if (apiRes && apiRes.status) {
          props.closeDialog()
          props.reloadPage();

          AsyncStorage.getItem("deviceDet").then(async devices => {
            console.log("devices here 123 " + JSON.parse(devices))
            let devicesDet = JSON.parse(devices);
            let device = devicesDet.find(device => device.element_num === props.rackData.element_num);
            console.log("device rack " + JSON.stringify(device))
            if (device) {
              console.log(device.device_id)
              PubBatterySleep({ topic: device.device_id })
            }
          })
          //here do goto_sleep
        }
      });
    }
    else {
      setBundleWeightErr('Please enter valid bundle weight')
    }
  }


  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={[styles.container, { alignItems: 'center', flexDirection: 'column' }]}>
        <View style={{ flexDirection: 'row', width: '60%', flex: 2 }}>
          <Text style={[AppStyles.filterLabel, { flex: 1 }]}>Bundle Weight (Kg)</Text>
          <TextInput
            style={[AppStyles.filterText, { flex: 2 }]}
            onChangeText={value => setBundleWeight(value)}
          >{bundleWeight}</TextInput>
        </View>
        <View style={{ flexDirection: 'row', width: '60%', flex: 1, marginTop: 100 }}>
          <TouchableOpacity style={[AppStyles.successBtn, { flex: 1 }]}
            onPress={(e) => handleSubmit(e)}
            disabled={apiStatus}
          >
            <Text style={AppStyles.successText}>SAVE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[AppStyles.canButtonContainer, { flex: 1, marginLeft: 10 }]}
            onPress={(e) => closeDialog(e)}
          >
            <Text style={AppStyles.canButtonTxt}>CANCEL</Text>
          </TouchableOpacity>
        </View>
        {bundleWeigtErr && bundleWeigtErr.length ? (<Text style={{ color: 'red', fontSize: 12, padding: 2, margin: 10 }}> {bundleWeigtErr} </Text>) : (false)}
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
});