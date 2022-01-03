import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { ApiService } from "../httpservice";
import { util } from '../commons';
import UserContext from "./UserContext";
import StagingTopBar from './StagingTopBar';
import { useIsFocused } from "@react-navigation/native";
import { SvgCss } from 'react-native-svg';
import { BinInIcon, BinOutIcon, BinIndicator} from "../svgs/BinIcon"
import { HexaStageSingle, HexaStageDouble } from "../svgs/HexaStage"
import { appTheme } from '../lib/Themes';
import { createAppContainer } from "react-navigation"
import ShearingHome from './shearing/ShearingHome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ForgingHome from './forging/ForgingHome';

const styles = StyleSheet.create({
 
  item: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily:appTheme.fonts.semiBold,
    color:appTheme.colors.stageTitle
  },

  countTxt: {
    fontSize: 14,
    fontFamily: appTheme.fonts.semiBold,
    color: appTheme.colors.stageTitle
  },
 
  container:{
    margin: 10,
    justifyContent: 'center'
  },
  stageContainer:{
   
    //display: 'flex', 
   // flexDirection: 'column', 
    //marginLeft: 3,
    //paddingLeft:3
  },
  outStageContainer:{
    display: 'flex',
     flexDirection: 'column', 
    //marginRight: 3,
    paddingRight:3
  }
});


const ProcessStages = (props) => {
  const isFocusedHistory = useIsFocused();
  let [user, setUser] = React.useState({})
  const [stagingData, setStagingData] = React.useState([])
  const [refreshing, setRefreshing] = useState(false)
  const userState = React.useContext(UserContext);
  const [stage,setStage] = useState('')

  let interval;
 
  useEffect(() => {
    if (isFocusedHistory) {
      setUser(userState.user)
      getStagingProcess();
    }
    return () => {
      clearInterval(interval);
    };
  }, [isFocusedHistory])

  const _onRefresh = () => {
    setRefreshing(true);
    getStagingProcess();
  };
  const getStagingProcess = async () => {
    let apiData = {
      "op": "get_process_master"
        }
    let apiRes = await ApiService.getAPIRes(apiData, "POST", "process-master");
    console.log("api response "+JSON.stringify(apiRes))

    setRefreshing(false);
    if (apiRes.status) {
      let stages = [...apiRes.response.message]
      if (apiRes.response.message && apiRes.response.message.length) {
        setStagingData(stages[0].process_stages)  
        let stage_nav;
       console.log("props here "+JSON.stringify(props))
      }
    }
  }

  const stageNavigation = (stage) => {
    setStage(stage.stage_name.toLowerCase())
    console.log("stage " + stage.stage_name.toLowerCase())
    AsyncStorage.setItem("stage",stage.stage_name)
  }

  return (
    <>
      {stage && stage.toLowerCase() === "shearing" ? <ShearingHome/> : false }
      {stage && stage.toLowerCase() === "forging" ? <ForgingHome /> : false}

      {stage ? false: 
  <ScrollView>

    <View style={[styles.container, {
      flex: 1,
      justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center',
    }]}>
      <View style={{
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignContent: 'center',
        justifyContent: 'center',
        marginTop:175
       // marginTop:50
      }}>
        {stagingData.map((item, index) => {
          return (
            <TouchableOpacity style={styles.stageContainer} key={index}
              onPress={(e) => stageNavigation(item)}>
              <SvgCss
                xml={HexaStageSingle(appTheme.colors.cardTitle, util.capitalizeWord(item.stage_name))} width={300}
                height={150} />
            </TouchableOpacity>
          )
        })}
      </View></View></ScrollView>}
      </>
     
  );
}

export default ProcessStages;