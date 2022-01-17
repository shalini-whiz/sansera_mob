import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import FontAwesome from "react-native-vector-icons/FontAwesome";
import CustomModal from '../components/CustomModal';
import RequestRMDialog from './RequestRM';
import AcceptRMDialog from './AcceptRMDialog';
import RequestDispatch from './RequestDispatch';
import AcceptDispatch from './AcceptDispatch';
import ConfirmIN from './ConfirmIN';
import ConfirmDispatch from './ConfirmDispatch';
import { ApiService } from "../httpservice";
import { util } from '../commons';
import UserContext from "./UserContext";
import StagingTopBar from './StagingTopBar';
import { useIsFocused } from "@react-navigation/native";
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    padding: 20,
    fontSize: 16,
    flex: 2,
    textAlign: 'center',
    color: '#454545'
  },
  staginActionTxt: {
    fontSize: 16
  },
  countTxt: {
    marginBottom: 5,
    padding: 5,
    fontSize: 14,
    color: '#454545'
  },
  stageContainer: {
    display: 'flex', flexDirection: 'row', padding: 5, borderWidth: 1,
    margin: 1, borderRadius: 10, backgroundColor: 'white',
    //  borderColor:'grey'
    borderColor: "#F5F5F5"
  }
});


const ProcessStages = ({ navigation, route }) => {
  const isFocusedHistory = useIsFocused();
  let [user, setUser] = React.useState({})
  const [stagingData, setStagingData] = React.useState([])
  const [reqRMDialog, setReqRMDialog] = useState(false);
  const [reqDisDialog, setReqDisDialog] = useState(false);
  const [stageItem, setStageItem] = useState({})
  const [acceptRMDialog, setAcceptRMDialog] = useState(false);
  const [acceptDisDialog, setAcceptDisDialog] = useState(false);
  const [confirmINDialog, setConfirmINDialog] = useState(false);
  const [confirmDispatchDialog, setConfirmDispatchDialog] = useState(false)
  const [inBlink, setInBlink] = useState(false);
  const [outBlink, setOutBlink] = useState(false);
  const [refreshing, setRefreshing] = useState(false)
  const [seconds, setSeconds] = useState(0);
  const [modalLoader, setModalLoader] = useState(false)
  const userState = React.useContext(UserContext);
  let interval;
  let inStageRequested = false;
  let outStageRequested = false;




  //start timer
  // const startTimer1 = () => {
  //   interval = setInterval(() => {
  //     setSeconds((lastTimerCount) => {
  //       lastTimerCount <= 0 && clearInterval(interval);
  //       lastTimerCount <= 0 && clearInterval(interval)
  //       if(user.role !== "manager" && isRequested){
  //         setBlink(previousState => !previousState);
  //       }
  //       return lastTimerCount - 1;
  //     });
  //   }, 1000);
  // };
  const startTimer = () => {
    // 
    //     setSeconds((secondCount) => {
    //       secondCount <= 1 && clearInterval(interval);
    //       if(secondCount <= 0) clearInterval(interval);
    //         return secondCount - 1;
    //     });
    // }, 1000);

    interval = setInterval(() => {
      if (userState && userState.user && userState.user.role != "manager" && inStageRequested)
        setInBlink((blink) => !blink);
      if (userState && userState.user && userState.user.role != "manager" && outStageRequested)
        setOutBlink((blink) => !blink);
    }, 1000);
  };


  useEffect(() => {
    if (isFocusedHistory) {
      if(userState && userState.user)
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
    
    setRefreshing(false);
    if (apiRes.status) {
      let stages = [...apiRes.response.message]
      if (apiRes.response.message && apiRes.response.message.length) {
        setStagingData(stages)
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

  //confirm request for material by machine operator 
  //create request 
  // in return fork operator would receive notification
  const confirmRM = () => {
    if (user) {
      //just color change
      if (user.role === "manager") {
        let stageItemData = Object.assign({}, stageItem)
        let params =
        {
          "op": "create",
          "fork_operator_id": "",
          "task_state": "REQUESTED",
          "requester_id": user.id,
          "forge_machine_id": stageItemData.forge_machine_id,
          "stage": stageItemData.stage_name,
          "type": "in-request"
        }
        setModalLoader(true);
        ApiService.getAPIRes(params, "POST", "create_request").then(apiRes => {
          setModalLoader(false);
          if (apiRes.status) {
            setReqRMDialog(false)
            getStagingProcess();
          }

        });
      }
      //if fork operator try to blink
    }

  }

  //confirm request for dispatch by machine operator 
  //create request 
  //in return fork operator would receive notification
  const confirmRD = () => {
    if (user) {
      //just color change
      if (user.role === "manager") {
        let stageItemData = Object.assign({}, stageItem)
        let params =
        {
          "op": "create",
          "fork_operator_id": "",
          "task_state": "REQUESTED",
          "requester_id": user.id,
          "forge_machine_id": stageItemData.forge_machine_id,
          "stage": stageItemData.stage_name,
          "type": "out-request"
        }
        setModalLoader(true)
        ApiService.getAPIRes(params, "POST", "create_request").then(apiRes => {
          setModalLoader(false);
          if (apiRes.status) {
            setReqDisDialog(false)
            getStagingProcess();
          }

        });
      }
      //if fork operator try to blink
    }

  }
  //cancel request for dispatch dialog
  const cancelRD = () => {
    setReqDisDialog(false)
  }
  
  //cancel request raw material dialog
  const cancelRM = () => {
    setReqRMDialog(false)
  }

  //cancel/reject request raised for raw material  by fork operator
  const cancelAcceptRM = () => {
    setAcceptRMDialog(false)
  }
  //cancel/reject request dispatch by fork operator
  const cancelAcceptDis = () => {
    setAcceptDisDialog(false)
  }
  //cancel confirmation received on input 
  const cancelConfirmIN = () => {
    setConfirmINDialog(false)
  }
  //cancel confirmation of dispatch
  const cancelDispatchConfirmation = () => {
    setConfirmDispatchDialog(false);
  }

  //initate confirm by machine operator - once fork operator accepts request
  //right now only for IN
  //update request with status fulfilled

  const confirmReceived = () => {
    if (user) {
      //just color change
      if (user.role === "manager") {
        let stageItemData = Object.assign({}, stageItem)
        let params =
        {
          "op": "update",
          "_id": stageItemData.inStatus._id,
          "task_state": "FULFILLED",
          "requester_id": user.id,
          "forge_machine_id": stageItemData.forge_machine_id,
          "stage": stageItemData.stage_name,
        }
        setModalLoader(true);
        ApiService.getAPIRes(params, "POST", "update_request").then(apiRes => {
          setModalLoader(false);
          if (apiRes.status) {
            setConfirmINDialog(false)
            getStagingProcess();
          }

        });
      }
    }
  }

  const acceptDispatchConfirmation = () => {
    if (user && user.role === "manager") {
      let stageItemData = Object.assign({}, stageItem)
      let params =
      {
        "op": "update",
        "_id": stageItemData.outStatus._id,
        "task_state": "FULFILLED",
        "requester_id": user.id,
        "forge_machine_id": stageItemData.forge_machine_id,
        "stage": stageItemData.stage_name,
      }
      setModalLoader(true)
      ApiService.getAPIRes(params, "POST", "update_request").then(apiRes => {
        setModalLoader(false);
        if (apiRes.status) {
          setConfirmDispatchDialog(false)
          getStagingProcess();
        }

      });
    }
  }
  const confirmMoveOut = () => {
    if (user) {
      if (user.role !== "manager") {
        let stageItemData = Object.assign({}, stageItem)
        let params =
        {
          "op": "update",
          "_id": stageItemData.outStatus._id,
          "task_state": "ACCEPTED",
          "requester_id": user.id,
          "forge_machine_id": stageItemData.forge_machine_id,
          "stage": stageItemData.stage_name,
        }
        setModalLoader(true)
        ApiService.getAPIRes(params, "POST", "update_request").then(apiRes => {
          setModalLoader(false)
          if (apiRes.status) {
            setAcceptDisDialog(false)

            getStagingProcess();
          }

        });
      }
    }
  }
  //confirm pick up of material - by fork operator
  //update request
  //machine operator receives notification
  const confirmPickUp = () => {
    if (user) {
      //just color change
      if (user.role !== "machine operator") {
        let stageItemData = Object.assign({}, stageItem)
        let params =
        {
          "op": "update",
          "_id": stageItemData.inStatus._id,
          "task_state": "ACCEPTED",
          "requester_id": user.id,
          "forge_machine_id": stageItemData.forge_machine_id,
          "stage": stageItemData.stage_name,
        }
        setModalLoader(true);
        ApiService.getAPIRes(params, "POST", "update_request").then(apiRes => {
          setModalLoader(false)
          if (apiRes.status) {
            setAcceptRMDialog(false)
            setReqDisDialog(false)
            getStagingProcess();
          }

        });
      }
    }
  }
  return (
    <>
      <StagingTopBar />

      <View style={{
        margin: 2,
        padding: 5
      }}>


        <FlatList
          style={{ marginTop: 5 }}
          onRefresh={_onRefresh}
          refreshing={refreshing}
          data={stagingData}
          renderItem={({ item, index }) => {
            let inCount = item.fifo[item.color + "_in"] ? item.fifo[item.color + "_in"].length : 0;
            let outCount = item.fifo[item.color + "_out"] ? item.fifo[item.color + "_out"].length : 0;
            item.count = inCount;
            let outColorCode = (Object.keys(stagingData[index].fifo)[1]);
            let outColor = outColorCode.split("_out")[0]

            let inColor = stagingData[index].color ? stagingData[index].color : "grey";
            let outColor1 = (stagingData[index + 1] && stagingData[index + 1].color) ? stagingData[index + 1].color : stagingData[index].color;

            let inActionColor = '';
            let outActionColor = '';

            if (stagingData[index].inStatus) {
              let taskState = stagingData[index].inStatus.task_state;
              if (!taskState) inActionColor = 'grey';
              if (taskState && taskState.toLowerCase() === "requested") inActionColor = 'red'
              if (taskState && taskState.toLowerCase() === "accepted") inActionColor = 'yellow'
              if (taskState && taskState.toLowerCase() === "fulfilled") inActionColor = 'green';
            }

            if (stagingData[index].outStatus) {
              let taskState = stagingData[index].outStatus.task_state;
              if (!taskState) outActionColor = 'grey';
              if (taskState && taskState.toLowerCase() === "requested") outActionColor = 'red'
              if (taskState && taskState.toLowerCase() === "accepted") outActionColor = 'yellow'
              if (taskState && taskState.toLowerCase() === "fulfilled") outActionColor = 'green';
            }

          
            return (<View style={styles.stageContainer}>

              {(item.inStatus && item.order != 1 && (!item.inStatus.task_state ||
                item.inStatus.task_state.toLowerCase() === "requested" ||
                item.inStatus.task_state.toLowerCase() === "accepted"
              )) ?
                (<View style={{ display: 'flex', flexDirection: 'column', marginLeft: 5 }}>
                  <TouchableOpacity onPress={(e) => inAction(item)}>
                    <FontAwesome5 name="long-arrow-alt-right" size={30} color={inColor} ></FontAwesome5>
                    <Text style={[styles.staginActionTxt, { color: inColor }]}>IN</Text>
                  </TouchableOpacity></View>) :
                (item.order === 1 ? (<View style={{ display: 'flex', flexDirection: 'column' }}>
                  <FontAwesome5 name="long-arrow-alt-right" size={30} color="white" ></FontAwesome5>
                  <Text style={[styles.staginActionTxt, { color: inColor }]} color={inColor}></Text>
                </View>) : (
                  <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <FontAwesome5 name="long-arrow-alt-right" size={30} color={inColor} ></FontAwesome5>
                    <Text style={[styles.staginActionTxt, { color: inColor }]} color={inColor}>IN</Text>
                  </View>
                ))

              }



              <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 10, alignItems: 'center' }}>
                <Text style={[styles.countTxt]}>{item.order != 1 ? item.count : ''}</Text>
                {item.order !== 1 ? ((item.inStatus && item.inStatus.task_state) ?
                  <FontAwesome name="circle" size={15}
                    style={{
                      color: (user.role === "manager" ? inActionColor :
                        (item.inStatus.task_state.toLowerCase() != "requested" ? inActionColor :
                          (inBlink && item.inStatus.task_state.toLowerCase() === "requested" && 
                          user.role !== "manager") ? inActionColor : 'white')),
                    }} />
                  : <FontAwesome name="circle" size={15} style={{ opacity: 0 }}></FontAwesome>) : 
                  (<FontAwesome name="circle" size={15} style={{ opacity: 0 }}></FontAwesome>)}
              
              </View>
              <Text style={[styles.item, { flex: 2 }]}>{util.capitalize(item.stage_name)}</Text>
              <View style={{
                display: 'flex', flexDirection: 'column', marginRight: 10,
                alignItems: 'center'
              }}>
                <Text style={[styles.countTxt]}></Text>
                {item.order !== 1 ? (item.outStatus && item.outStatus.task_state) ?
                  <FontAwesome name="circle" size={15}
                    style={{
                      color: (user.role === "manager" ? outActionColor :
                        (item.outStatus.task_state.toLowerCase() !== "requested" ? outActionColor :
                          (outBlink && item.outStatus.task_state.toLowerCase() === "requested" &&
                            user.role !== "manager") ? outActionColor : 'white')),
                    }}
                  />
                  :
                  <FontAwesome name="circle" size={15} style={{ opacity: 0 }}></FontAwesome> :
                  (<FontAwesome name="circle" size={15} style={{ opacity: 0 }}></FontAwesome>)}
                { }
              </View>

              {(item.outStatus && item.order != 1 && (!item.outStatus.task_state ||
                item.outStatus.task_state.toLowerCase() === "requested" ||
                item.outStatus.task_state.toLowerCase() === "accepted"
              )) ?
                (<View style={{ display: 'flex', flexDirection: 'column', marginRight: 5 }}>
                  <TouchableOpacity onPress={(e) => outAction(item)}>
                    <FontAwesome5 name="long-arrow-alt-right" size={30} color={outColor} ></FontAwesome5>
                    <Text style={[styles.staginActionTxt, { color: outColor }]} >OUT</Text>
                  </TouchableOpacity></View>) :
                (item.order === 1 ? (
                  <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <FontAwesome5 name="long-arrow-alt-right" size={30} color={"white"} ></FontAwesome5>
                    <Text style={[styles.staginActionTxt, { color: outColor }]}></Text>
                  </View>
                ) : (<View style={{ display: 'flex', flexDirection: 'column' }}>
                  <FontAwesome5 name="long-arrow-alt-right" size={30} color={outColor} ></FontAwesome5>
                  <Text style={[styles.staginActionTxt, { color: outColor }]}>OUT</Text>
                </View>))
              }

            </View>)
          }
          }
        />
        {reqRMDialog ? <CustomModal modalVisible={reqRMDialog} 
          container={<RequestRMDialog stageItem={stageItem} cancelRM={cancelRM} confirmRM={confirmRM} 
            modalLoader={modalLoader}/>} /> : <View></View>}

        {acceptRMDialog ? <CustomModal modalVisible={acceptRMDialog} 
          container={<AcceptRMDialog cancelRM={cancelAcceptRM} pickupRM={confirmPickUp} stageItem={stageItem} 
            modalLoader={modalLoader}/>} /> : <View></View>}

        {reqDisDialog ? <CustomModal modalVisible={reqDisDialog} 
          container={<RequestDispatch cancelRM={cancelRD} stageItem={stageItem} confirmRM={confirmRD}
            modalLoader={modalLoader} />} /> : <View></View>}

        {acceptDisDialog ? <CustomModal modalVisible={acceptDisDialog} 
          container={<AcceptDispatch cancelRD={cancelAcceptDis} stageItem={stageItem}
            confirmRD={confirmMoveOut} modalLoader={modalLoader} />} /> : <View></View>}

        {confirmINDialog ? <CustomModal modalVisible={confirmINDialog} 
          container={<ConfirmIN onCancel={cancelConfirmIN} stageItem={stageItem} onAccept={confirmReceived}
            modalLoader={modalLoader} />} /> : <View></View>}

        {confirmDispatchDialog ? <CustomModal modalVisible={confirmDispatchDialog} 
          container={<ConfirmDispatch onCancel={cancelDispatchConfirmation} stageItem={stageItem}
            onAccept={acceptDispatchConfirmation} modalLoader={modalLoader} />} /> : <View></View>}

      </View>
    </>
  );
}

export default ProcessStages;