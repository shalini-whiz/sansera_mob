import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { ApiService } from "../httpservice";
import { util } from '../commons';
import UserContext from "./UserContext";
import StagingTopBar from './StagingTopBar';
import { useIsFocused } from "@react-navigation/native";
import { SvgCss } from 'react-native-svg';
import { BinInIcon, BinOutIcon, BinIndicator} from "../svgs/BinIcon"
import { HexaStageSingle, HexaStageDouble } from "../svgs/HexaStage"
import { appTheme } from '../lib/Themes';

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
  stageContainer: {
   // display: 'flex', 
    flexDirection: 'row', 
    padding: 2, 
    borderWidth: 1,
    marginBottom:5,
    marginTop:5,
    marginLeft:1,
    marginRight:1,
    borderRadius: 20, backgroundColor: 'white',
    borderColor: "#F5F5F5"
  },
  inStageContainer:{
    margin:10,
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


const ProcessStages = ({ navigation, route }) => {
  const isFocusedHistory = useIsFocused();
  let [user, setUser] = React.useState({})
  const [stagingData, setStagingData] = React.useState([])
  const [inBlink, setInBlink] = useState(false);
  const [outBlink, setOutBlink] = useState(false);
  const [refreshing, setRefreshing] = useState(false)
  const userState = React.useContext(UserContext);

  let flatListRef = null;

  let interval;
  let inStageRequested = false;
  let outStageRequested = false;
  const startTimer = () => {
    interval = setInterval(() => {
      if (userState && userState.user && userState.user.role != "manager" && inStageRequested)
        setInBlink((blink) => !blink);
      if (userState && userState.user && userState.user.role != "manager" && outStageRequested)
        setOutBlink((blink) => !blink);
    }, 1000);
  };


  useEffect(() => {
    if (isFocusedHistory) {
      setUser(userState.user)
      getStagingProcess();
    }
    if (route && route.params) {
      if (Object.keys(route.params).length) {
        getStagingProcess();
      }
    }


    return () => {
      //cleanup the interval on complete
      clearInterval(interval);
    };
  }, [isFocusedHistory, route.params])

  const _onRefresh = () => {
    setRefreshing(true);
    getStagingProcess();
  };
  const getStagingProcess = async () => {
    let apiData = {
      "op": "get_process",
      "forge_machine_id": "AD9739879053"
    }
    let apiRes = await ApiService.getAPIRes(apiData, "POST", "getProcess");
    //console.log("api response "+JSON.stringify(apiRes))

    setRefreshing(false);
    if (apiRes.status) {
      let stages = [...apiRes.response.message]
      if (apiRes.response.message && apiRes.response.message.length) {
        setStagingData(stages)
       // goIndex = () => {
         if(flatListRef != null)
            flatListRef.scrollToIndex({ animated: true, index: 5 });
        //};
      }
      if (user.role !== "manager") {
        inStageRequested = stages.find(item => {
          return ((item.inStatus && item.inStatus.task_state && item.inStatus.task_state.toLowerCase() === "requested"))
        })

        outStageRequested = stages.find(item => {
          return ((item.outStatus && item.outStatus.task_state && item.outStatus.task_state.toLowerCase() === "requested"))
        })
        if (inStageRequested || outStageRequested) {

          if (userState && userState.user && userState.user.role !== "manager") {
            // setIsRequested(true)
            if (inStageRequested) setInBlink(true);
            if (outStageRequested) setOutBlink(true);
            setSeconds(5);

            startTimer();
            //clearInterval(interval)
          }
          else
            clearInterval(interval)
        }
      }
    }
  }

  let clearDialogs = () => {
    setReqRMDialog(false);
    setReqDisDialog(false);
    setStageItem({})
    setAcceptDisDialog(false)
    setAcceptRMDialog(false)
    setConfirmINDialog(false)
    setConfirmDispatchDialog(false)
  }
  let inAction = (stage) => {
    setStageItem({})
    clearDialogs();

    if (user.role === "manager") {
      if ((stage.inStatus && !stage.inStatus.task_state)) {
        setStageItem(stage);
        setReqRMDialog(true);
      }
      else if (stage.inStatus && stage.inStatus.task_state && stage.inStatus.task_state.toLowerCase() === "accepted") {
        setStageItem(stage)
        setConfirmINDialog(true);
      }
    }

    else if (stage.inStatus && stage.inStatus.task_state &&
      stage.inStatus.task_state.toLowerCase() === "requested"
      && user.role === "non-privilege" && user.id === stage.inStatus.fork_operator_id) {
      setStageItem(stage);
      setAcceptRMDialog(true);
    }
  }


  let outAction = (stage) => {
    if (user && user.role === "manager") {

      if ((stage.outStatus && !stage.outStatus.task_state)) {
        setStageItem(stage);
        setReqDisDialog(true);
      }
      else if (stage.outStatus && stage.outStatus.task_state && stage.outStatus.task_state.toLowerCase() === "accepted") {
        setStageItem(stage)
        setConfirmDispatchDialog(true);
      }
    }

    else if (stage.outStatus && stage.outStatus.task_state &&
      stage.outStatus.task_state.toLowerCase() === "requested"
      && user.role === "non-privilege" && user.id === stage.outStatus.fork_operator_id) {
      setStageItem(stage);
      setAcceptDisDialog(true);
    }
  }


  let getItemLayout = (data, index) => {
    return { length: 50, offset: 50 * index, index };
  }
  return (
    <>
      <StagingTopBar />

      <View style={{
        margin: 2,
        padding: 5,
        backgroundColor:appTheme.colors.screenBackground,
        flex:1,
        flexDirection:'row',
        flexWrap: 'wrap',
        justifyContent:'center'
      }}>
        {stagingData.map((item,index) => {
          let inCount = 0;
          let outCount = 0;
          // let inCount = item.fifo && item.fifo[item.color + "_in"] ? item.fifo[item.color + "_in"].length : 0;
          // let outCount = item.fifo && item.fifo[item.color + "_out"] ? item.fifo[item.color + "_out"].length : 0;
          item.count = inCount;
          // let outColorCode = (Object.keys(stagingData[index].fifo)[1]);
          let outColor = 'grey';
          // if (outColorCode)
          //   outColor = outColorCode.split("_out")[0]
          let inColor = stagingData[index].color ? stagingData[index].color : "grey";

          let inActionColor = '';
          let outActionColor = '';
          if (stagingData[index].inStatus) {
            let taskState = stagingData[index].inStatus.task_state;
            if (!taskState) inActionColor = 'grey';
            if (taskState && taskState.toLowerCase() === "requested") inActionColor = appTheme.stageColors.red
            if (taskState && taskState.toLowerCase() === "accepted") inActionColor = appTheme.stageColors.yellow
            if (taskState && taskState.toLowerCase() === "fulfilled") inActionColor = appTheme.stageColors.green;
          }

          if (stagingData[index].outStatus) {
            let taskState = stagingData[index].outStatus.task_state;
            if (!taskState) outActionColor = 'grey';
            if (taskState && taskState.toLowerCase() === "requested") outActionColor = appTheme.stageColors.red
            if (taskState && taskState.toLowerCase() === "accepted") outActionColor = appTheme.stageColors.yellow
            if (taskState && taskState.toLowerCase() === "fulfilled") outActionColor = appTheme.stageColors.green;
          }
          return (<View style={styles.inStageContainer} key={index}>
            <SvgCss xml={HexaStageSingle(inColor,util.capitalizeWord(item.stage_name))} width={250} height={150} />


            </View>
            )


          
        })}
      </View>
    </>
  );
}

export default ProcessStages;