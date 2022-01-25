import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl,
   ActivityIndicator } from "react-native";
import {Badge} from"react-native-paper"
import UserContext from "../UserContext";
import { useIsFocused } from '@react-navigation/native';
import { appTheme } from "../../lib/Themes";
import EmptyBin from "./EmptyBin";
import BinTask from "./BinTask";
import AppContext from "../../context/AppContext";
import AsyncStorage from '@react-native-async-storage/async-storage';



export default  TaskHome = React.memo((props) => {
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const userState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();
  const [tab, setTab] = useState('')
  let {appProcess,processStage} = React.useContext(AppContext);
  let [unReadEmptyBin,setUnReadEmptyBin] = useState('')
  let [unReadFilledBin,setUnReadFilledBin] = useState('')
  useEffect(() => {
    if (isFocused) {
      if(tab === "") setTab('emptyBin')
      loadData()
      
    }
    return () => { }
  }, [isFocused])

  const loadData = async() => {
    let count = await AsyncStorage.getItem("unReadEmptyBin");
    setUnReadEmptyBin(count)
    console.log(appProcess + "_" + processStage)
    let unReadFilledBinCount = await AsyncStorage.getItem(appProcess+"_"+processStage);
    if(unReadFilledBinCount)
      setUnReadFilledBin(unReadFilledBinCount)
  }
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);

  
  const tabChange = (value) => {
    setTab(value)
  }
  const reloadPage = (response) => {
    props.updateProcess()
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={{ flexDirection: 'row', backgroundColor: 'white', padding: 10 }}>
        <TouchableOpacity style={{
          flexDirection: 'row', padding: 8,
          borderRadius:  15 ,
          backgroundColor: tab === "emptyBin" ? appTheme.colors.cardTitle : appTheme.colors.inactiveTab
        }}
          onPress={(e) => tabChange("emptyBin")} >
            <Text style={[styles.filterText, {
              fontFamily:appTheme.fonts.bold ,
              color: tab === "emptyBin" ? 'white' : appTheme.colors.cardTitle,
            }]}>Empty Bin Request
             
            </Text>
          {props.emptyBinCount && props.emptyBinCount != "0" ?               
            <Badge style={{ color: 'white',position:'absolute',top:-10,left:150 }}
              containerStyle={{ top: -25, left: 40 }}>{props.emptyBinCount}</Badge>  : false}

          
        </TouchableOpacity>
        <Text style={{ padding: 8 }}> / </Text>
        <TouchableOpacity
          style={{
            flexDirection: 'row', padding: 8,
            borderRadius:  15,
            backgroundColor: tab === "filledBin" ? appTheme.colors.cardTitle : appTheme.colors.inactiveTab
          }}
          onPress={(e) => tabChange("filledBin")} >
          <Text style={[styles.filterText, {
            fontFamily:  appTheme.fonts.bold ,
            color: tab === "filledBin" ? 'white' : appTheme.colors.cardTitle,
          }]}>Filled Bin Request  
                     </Text>
          {props.filledBinCount && props.filledBinCount != "0" ?
            <Badge style={{ color: 'white', position: 'absolute', top: -8, left: 140 }}
              containerStyle={{ top: -25, left: 40 }}>{props.filledBinCount}</Badge> : false}
        </TouchableOpacity>

      </View>
      <View style={styles.mainContainer}>
        {tab === "emptyBin" ? <EmptyBin processEntity={props.processEntity} reloadPage={reloadPage} 
          setEmptyBinCount={props.setEmptyBinCount} setFilledBinCount={props.setFilledBinCount}

          emptyBinCount={props.emptyBinCount}
          filledBinCount={props.filledBinCount}

/> : false}
        {tab === "filledBin" ? <BinTask processEntity={props.processEntity} reloadPage={reloadPage} 
          setEmptyBinCount={props.setEmptyBinCount} setFilledBinCount={props.setFilledBinCount}
          emptyBinCount={props.emptyBinCount}
          filledBinCount={props.filledBinCount}

/> : false}
      </View>
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: "center",
    margin: 10,
  },

});