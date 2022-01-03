import React, { useState, useEffect, useDebugValue } from "react";
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView,
  RefreshControl,
  Alert
} from "react-native";
import { appTheme } from "../../lib/Themes";
import { ApiService } from "../../httpservice";
import { useIsFocused } from '@react-navigation/native';
import CustomHeader from "../../components/CustomHeader";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'



export default function ProcessFifo(props) {
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false)
  const [proStageData, setProStageData] = useState([])
  const [stage,setStage] = useState({})
  const [nextStage,setNextStage] = useState({})
  const [editBin, setEditBin] = useState(false);
  const [delBin, setDelBin] = useState([]);
  const [isConfirm,setConfirm] = useState(false)

  useEffect(() => {
    if (isFocused) {
      loadRejectionData();
    }
    return () => { }
  }, [isFocused])

  const loadRejectionData = () => {
    setProStageData(props.processDet.process)
    setStage(props.processDet.process[0])
    setNextStage(props.processDet.process[1])
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadRejectionData();
  }, []);

  const switchStage = (e,stage) => {
    setStage(stage);
    let index = proStageData.findIndex(item => item.order === stage.order+1 )
    setNextStage(proStageData[index]);
    setEditBin(false)
    setDelBin([])
  }

  const closeDialog = () => {
    setEditBin(false)
    setDelBin([])
    props.closeDialog();
  }
  
  const handleEditBin = () => {
    setEditBin(prevState => !prevState)
    setDelBin([]);
  }

  const addToDelBin = (e, fifoItem) => {
      let bin_to_del = [...delBin]
      let element_num = fifoItem.element_num;
      const selectedIndex = bin_to_del.indexOf(element_num);
      if (selectedIndex === -1 && bin_to_del.length === 0) {
        bin_to_del.push(element_num);
      } else if (selectedIndex !== -1) {
        bin_to_del.splice(selectedIndex, 1);
      }
      setDelBin(bin_to_del);
  }

  const computeBin = () => {
    if (delBin.length) {
      let message = "Please confirm to delete the selected bin"
      setConfirm(true);
    }
  }
  const updateBin = () => {
    let elementIndex = nextStage.fifo.findIndex(item => item.element_num === delBin[0]);
    if(elementIndex > 0 && delBin.length){
      let apiData = {};
      apiData.op = "remove_element"
      apiData.process_name = props.processDet.process_name
      apiData.stage_name = nextStage.stage_name
      apiData.element_id = nextStage.fifo[elementIndex].element_id 
     
      ApiService.getAPIRes(apiData,"POST","fifo").then(apiRes => {
        if(apiRes){
          if(apiRes.status){
          }
          else{
            Alert.alert("Could not update. try again!")
          }
        }
      })
    }
   

  
    // ApiService.getAPIRes(apiData, "POST", "process").then(apiRes => {
    //   setApiStatus(false);
    //   if (apiRes && apiRes.status) {
    //     if (apiRes.response.message && apiRes.response.message.length) {
    //       setProcess(apiRes.response.message)
    //     }
    //   }
    //   else {
    //     setProcess([])
    //   }
    // }); 
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
      <View style={[styles.container]}>

        {/* <ActivityIndicator size="large" animating={apiStatus} /> */}
        <View style={[styles.dataContainer, {}]}>
          
          <View style={{
            flexDirection: 'column', margin: 10, marginTop: 20,
           padding: 10, borderRadius: 10
          }}>
           
            <View style={{flexDirection:'row'}}>
              {proStageData.map((item,index) => {
                return (
                   <TouchableOpacity style={{}} key={index}
                    onPress={(e) => switchStage(e, item)} >  
                <Text key={index} style={[styles.tableHeader, {
                  marginBottom: 1, flex: 1,
                  padding: 10, width: '100%', borderColor: 'grey', borderWidth: 0.5,
                  color: stage.stage_name === item.stage_name ? appTheme.colors.cardTitle : 'grey'}

                ]}
                
                >{item.stage_name}
                </Text></TouchableOpacity>)
              })}
            </View>
              <CustomHeader title={"Bins"} size={18} align="left" />
              

              <View style={{flexDirection:'row',margin:10}}>
                {nextStage && nextStage.fifo && nextStage.fifo.map((fifoItem, fifoIndex) => {
                return (
                  <TouchableOpacity style={{}} key={fifoIndex}
                    onPress={(e) => addToDelBin(e, fifoItem)} >  
                <Text style={[{
                  padding: 5, fontSize:18,
                  color: delBin.indexOf(fifoItem.element_num) > -1 ? 'red' : 'black' 
                }

                    ]}>{fifoItem.element_num}
                </Text></TouchableOpacity>)
              })}
              </View>
            {delBin.length ? <Text style={{color:'red',fontSize:14,padding:10}}>Only one bin can be removed at a time</Text>:false}
            {delBin.length ?
            <View style={{ display: 'flex', flexDirection: 'row', alignSelf: 'center',width:"50%" }}>
              <TouchableOpacity style={[styles.sucButtonContainer, { 
                flex: 1,padding:5,paddingLeft:10,paddingRight:10 }]}
                onPress={(e) => isConfirm ? updateBin(e) : computeBin(e)}
                >
                <Text style={styles.sucButtonText}>{isConfirm ? 'CONFIRM' : 'REMOVE'}</Text>
              </TouchableOpacity>
                <TouchableOpacity style={[styles.canButtonContainer, {
                  flex: 1, padding: 5, paddingLeft: 10, paddingRight: 10
                }]}
                onPress={(e) => closeDialog(e)} 
                >
                  <Text style={styles.canButtonTxt}>CANCEL</Text>
                </TouchableOpacity>
            </View> 
            : false}
            {!delBin.length ? 
            <View style={{ display: 'flex', flexDirection: 'row', alignSelf: 'center', width: "20%" }}>
                <TouchableOpacity style={[styles.canButtonContainer, {
                  flex: 1, padding: 5, paddingLeft: 10, paddingRight: 10
                }]}
                  onPress={(e) => closeDialog(e)}
                >
                  <Text style={styles.canButtonTxt}>CLOSE</Text>
                </TouchableOpacity>
            </View>: false}
           
          </View>
        </View>









      </View>


    </ScrollView>
  )
}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    margin: 5
  },
  dataContainer: {
    backgroundColor: 'white',
    padding: 10
  },
  tableHeader: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: appTheme.fonts.bold,
    color:'grey'
  },
  tableCell: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: appTheme.fonts.regular,
  },
  canButtonContainer: {
    //flex: 1,
    margin: 5,
    borderRadius: 15,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: appTheme.colors.cancelAction,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 3,
  },
  canButtonTxt: {
    color: appTheme.colors.cancelActionTxt,
    fontSize: 16,
    margin: 5,
    fontFamily: appTheme.fonts.bold
  },
  sucButtonContainer: {
    margin: 5,
    borderRadius: 15,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: appTheme.colors.successAction,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 3,
  },
  sucButtonText: {
    color: appTheme.colors.successActionTxt,
    fontSize: 14,
    margin: 5,
    fontFamily: appTheme.fonts.bold
  },

});