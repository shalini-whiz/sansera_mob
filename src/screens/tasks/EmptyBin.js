import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { util } from "../../commons";
import FormGen from "../../lib/FormGen"
import CustomHeader from "../../components/CustomHeader";
import { ApiService } from "../../httpservice";
import UserContext from "../UserContext";
import CustomModal from "../../components/CustomModal";
import { useIsFocused } from '@react-navigation/native';
import { appTheme } from "../../lib/Themes";
import { default as AppStyles } from "../../styles/AppStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function EmptyBin(props) {
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const userState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();
  const [notifications,setNotifications] = useState([])
  const [stage,setStage] = useState('')
  const [bin,setBin] = useState({})
  useEffect(() => {
    if (isFocused) {
      loadData();
    }
    return () => { }
  }, [isFocused])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData()
  }, []);

  const loadData = () => {
   
    AsyncStorage.getItem("emptyBinReq").then(request => {
      setNotifications(JSON.parse(request))
      console.log("rq "+JSON.stringify(JSON.parse(request)))
    
    })
    AsyncStorage.getItem("stage").then(stage => {
      setStage(stage)
    })
    
  }
  
  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setDialogType('')
    setBin({})
  }
  const openDialog = (e,type,item) => {
    showDialog(true);
    let dialogTitle = "";
    let dialogMessage = "";
    setDialogType(type)
    if (type === "cancel") {
      dialogTitle = "Cancel Bin Request";
      dialogMessage = "Are you sure you wish to cancel empty bin request " + item.element_num
    }
    if (type === "accept") {
      dialogTitle = "Accept Bin Request"
      dialogMessage = "Are you sure you wish to accept empty bin request of " + item.element_num
    }
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
    setBin(item)
  }

  const updateRequest = () => {
    if(dialogType === "cancel"){
      //remove from list
      AsyncStorage.getItem("emptyBinReq").then(emptyBinReqList => {
        let binReq = JSON.parse(emptyBinReqList);
        let index = binReq.findIndex(item => item.element_num === bin.element_num);
        if (index !== undefined) {
          binReq.splice(index, 1);
          AsyncStorage.setItem("emptyBinReq",JSON.stringify(binReq));
          setNotifications(binReq);
          closeDialog()
        }
      })
    }
    if(dialogType === "accept"){
      let apiData = {"op":"push_element"}
      apiData.process_name = props.processEntity.process_name
      apiData.element_num = bin.element_num
      apiData.element_id = bin.element_id
      let currentStage = props.processEntity.process.find(item => item.stage_name === stage)
      let nextStage = props.processEntity.process.find(item => item.order === currentStage.order + 1);
      console.log(nextStage)
      apiData.stage_name = nextStage.stage_name
      console.log("apiData here " + JSON.stringify(apiData))

      setApiStatus(true);
      ApiService.getAPIRes(apiData, "POST", "process").then(apiRes => {
        setApiStatus(false);
        console.log("create process res: " + JSON.stringify(apiRes))
        if (apiRes && apiRes.status) {
          closeDialog()
          props.reloadPage();
        }
      });
      AsyncStorage.getItem("emptyBinReq").then(emptyBinReqList => {
        let binReq = JSON.parse(emptyBinReqList);
        let index = binReq.findIndex(item => item.element_num === bin.element_num);
        if (index !== undefined) {
          binReq.splice(index, 1);
          AsyncStorage.setItem("emptyBinReq", JSON.stringify(binReq));
          setNotifications(binReq);
          closeDialog()
        }
      })
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.mainContainer}>
        <Text>{console.log(notifications)}</Text>
        {notifications.length ? notifications.map((item,index) => {
          return(<View style={{flexDirection:'row',padding:5,backgroundColor:'white',margin:5}} key={index}>
            <Text style={[AppStyles.title,{flex:3,justifyContent:'flex-start',textAlign:'left'}]}>{"Confirm Bin request "+item.element_num}</Text>
            <TouchableOpacity style={[AppStyles.successBtn, { flex:1, }]} 
              onPress={(e) => openDialog(e, "accept", item)}

            >
              <Text style={AppStyles.successText}>CONFIRM</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[AppStyles.canButtonContainer, { flex: 1 }]}
            onPress={(e) => openDialog(e,"cancel",item)}
            >
              <Text style={AppStyles.canButtonTxt}>CANCEL</Text>
            </TouchableOpacity>
          </View>)
        }) : false}
        {dialog ? <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          
           okDialog={updateRequest}
           closeDialog={closeDialog}
          container={
            <View style={{flexDirection:'column',alignItems:'center',width:'50%'}}>
              <View style={{flexDirection:'row',alignItems:'center',width:'50%',padding:5}}>
                  <Text style={[AppStyles.subtitle,{flex:1,textAlign:'right',padding:5,color:'black'}]}>Stage : </Text>
                  <CustomHeader title={stage} style={{flex:2,padding:5,marginLeft:10}}/>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '50%', padding: 5 }}>
                <Text style={[AppStyles.subtitle, { flex: 1, textAlign: 'right', padding: 5, color: 'black' }]}>Process : </Text>
                <CustomHeader title={props.processEntity.process_name} style={{ flex: 2, padding: 5, marginLeft: 10 }} />
              </View>
            </View>
            }

        /> : false}




      </View>


    </ScrollView>
  )
}
const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: "center",
    margin: 10,
  },

});