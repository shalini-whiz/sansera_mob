import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Text, Alert } from 'react-native';
import { ApiService } from "../httpservice";
import { util } from '../commons';
import UserContext from "./UserContext";
import { useIsFocused } from "@react-navigation/native";
import { SvgCss } from 'react-native-svg';
import { HexaStageSingle } from "../svgs/HexaStage"
import { appTheme } from '../lib/Themes';
import ShearingHome from './shearing/ShearingHome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ForgingHome from './forging/ForgingHome';
import StageHome from './generic/StageHome';

const styles = StyleSheet.create({

  item: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: appTheme.fonts.semiBold,
    color: appTheme.colors.stageTitle
  },

  countTxt: {
    fontSize: 14,
    fontFamily: appTheme.fonts.semiBold,
    color: appTheme.colors.stageTitle
  },

  container: {
    margin: 10,
    justifyContent: 'center'
  },
  stageContainer: {

    //display: 'flex', 
    // flexDirection: 'column', 
    //marginLeft: 3,
    //paddingLeft:3
  },
  outStageContainer: {
    display: 'flex',
    flexDirection: 'column',
    //marginRight: 3,
    paddingRight: 3
  }
});


const ProcessStages = (props) => {
  const isFocusedHistory = useIsFocused();
  let [user, setUser] = React.useState({})
  const [stagingData, setStagingData] = React.useState([])
  const [refreshing, setRefreshing] = useState(false)
  const userState = React.useContext(UserContext);
  const [stage, setStage] = useState('')

  let interval;

  useEffect(() => {
    if (isFocusedHistory) {
      if (userState && userState.user)
        setUser(userState.user)
      getStagingProcess();
    }
    return () => {
    };
  }, [isFocusedHistory])


  const getStagingProcess = async () => {
    let apiData = {      
      "op": "get_stages",
      "type": "Steel"
    }
    let apiRes = await ApiService.getAPIRes(apiData, "POST", "process");

    if (apiRes) {
      if (apiRes.status) {
        let stages = [...apiRes.response.message.stages]
        console.log("stages here "+JSON.stringify(stages))
        if (apiRes.response.message.stages && apiRes.response.message.stages.length) {
          setStagingData(apiRes.response.message.stages)
        }
      }
    }
    else if (apiRes.response.message)
      Alert.alert(apiRes.response.message)
  }

  const stageNavigation = (stage) => {
    console.log(stage)
    let validStages = ["shearing", "forging", "shot blasting", "visual/mpi", "shot peening"];
    let validStages1 = ["shearing", "forging"];
    console.log(stage.toLowerCase())
    console.log(validStages.includes(stage.toLowerCase()))
    if (validStages.includes(stage.toLowerCase())) {
      setStage(stage.toLowerCase())
      AsyncStorage.setItem("stage", stage)
    }
    // if(stage.stage_name.toLowerCase() === "shearing" || stage.stage_name.toLowerCase() === "forging" ||
    //   stage.stage_name.toLowerCase() === "shot blasting" || stage.stage_name.toLowerCase() === "visual\mpi"
    // ){
    //   setStage(stage.stage_name.toLowerCase())
    //   AsyncStorage.setItem("stage", stage.stage_name)
    // }
    else {
      Alert.alert("Access Denied")
    }
  }

  return (
    <>
      {stage && stage.toLowerCase() === "shearing" ? <ShearingHome /> : false}
      {stage && stage.toLowerCase() === "forging" ? <ForgingHome /> : false}
      {console.log(stage)}
      {stage && (stage === "shot blasting" || stage === "visual/mpi" || stage === "shot peening") ? <StageHome /> : false}
      {console.log(stage)}

      {stage ? false :
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
              marginTop: 15
              // marginTop:50
            }}>
              {stagingData.map((item, index) => {
                return (
                  <TouchableOpacity style={styles.stageContainer} key={index}
                    onPress={() => stageNavigation(item)} style={{ margin: 20 }}>
                    <SvgCss
                      xml={HexaStageSingle(appTheme.colors.cardTitle, util.capitalizeWord(item))}
                      width={250}
                      height={150} />
                  </TouchableOpacity>
                )
              })}
            </View></View>
        </ScrollView>

      }
    </>

  );
}

export default ProcessStages;