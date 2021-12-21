import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl,Alert, ActivityIndicator } from "react-native";
import { util } from "../../commons";
import { appTheme } from "../../lib/Themes";
import FormGen from "../../lib/FormGen"
import CustomHeader from "../../components/CustomHeader";
import { Picker } from '@react-native-picker/picker';
import CustomCard from "../../components/CustomCard";
import { ApiService } from "../../httpservice";
import BatchDetails from "./BatchDetails";
import { useIsFocused } from '@react-navigation/native';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import CustomModal from "../../components/CustomModal";
import { mqttOptions } from "../../constants";
import MQTT from 'sp-react-native-mqtt';


export default function LoadRM() {
  const isFocused = useIsFocused();
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false)
  const [batchNum,setBatchNum] = useState('')
  const [batchDet,setBatchDet] = useState({})
  const [editRack,setEditRack] = useState(false);
  const [delRacks,setDelRacks] = useState([]);
  const [addRacks,setAddRacks] = useState([]);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [listeningEvent,setListeningEvent] = useState(false);
  const [connectionStatus,setConnectionStatus] = useState(0);
  const [client,setClient] = useState(undefined);


  const [batchOptions, setBatchOptions] = useState({ keyName: "_id", valueName: "batch_num", options: [], })
  useEffect(() => {
    if(isFocused){
      console.log("load raw materials")
      setApiStatus(true);
      loadBatches();
    }
    return () => { }
  }, [isFocused])

  const loadBatches = () => {
    let apiData = {
      "op": "list_raw_material_by_status",
      "status": ["NEW"]
    }
    setRefreshing(false)
    ApiService.getAPIRes(apiData, "POST", "list_raw_material_by_status").then(apiRes => {
      console.log("apiRes : "+JSON.stringify(apiRes))
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length) {
          let bOptions = {...batchOptions}
          bOptions.options = apiRes.response.message;
          setBatchOptions(bOptions)
          setBatchNum(apiRes.response.message[0]._id);
          setBatchDet(apiRes.response.message[0]);
        }
      }
    });
   
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadBatches();
  }, []);

  const handleEditRack = () =>{
    setEditRack(prevState => !prevState)
    setDelRacks([]);
  }

  const handleChange = (name) => (value,index) => {
    if(name === "batchNum") {
      setBatchNum(value)
      console.log(value)
      let bOptions = [...batchOptions.options]
      let bDet = bOptions[index];
      console.log(bDet.batch_num)
      if(bDet.batch_num === "select") setBatchDet(undefined)
      else setBatchDet(bDet);
    }
  };
  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
  }
  
  const removeRacks = () => {
    
  }
  const addToDelRacks = (e,fifoItem) => {
    console.log("entered add to del racks "+fifoItem);
    let racks_to_del = [...delRacks]
    let element_num = fifoItem.element_num;
    const selectedIndex = racks_to_del.indexOf(element_num);
    console.log(selectedIndex)
    if (selectedIndex === -1) {
      racks_to_del.push(element_num);
    } else if (selectedIndex !== -1) {
      racks_to_del.splice(selectedIndex, 1);
    }
    setDelRacks(racks_to_del);
    console.log("racks_to_del : "+racks_to_del)

  }

  const startListening = () => {
    let options = {...mqttOptions};
    console.log("options here " + JSON.stringify(options))

    MQTT.createClient(options).then((client) => {
      setClient(client)
      client.connect();

      client.on('closed', () => {
        console.log('mqtt.event.closed');
        setConnectionStatus(2);
      });

      client.on('error', (msg) => {
        console.log('mqtt.event.error', msg);
        setConnectionStatus(3);
      });

      client.on('message', (msg) => {
        console.log('mqtt.event.message', msg);
        //this.setState({ message: JSON.stringify(msg) });
      });

      client.on('connect', () => {
        console.log('connected');
        setConnectionStatus(1)
        setListeningEvent(true);
        let batchDetails = {...batchDet};
        console.log("Batch details "+JSON.stringify(batchDetails))
        let rackDevices = Object.keys(batchDetails.device_map);
        rackDevices.map(item => {
          let topic = 'MWPI1/' + item + "/set/led1";
          console.log(topic)
          client.subscribe(topic,2)
        })
      });
      this.state = ({ "client": client })

    }).catch((err) => {
      console.log(err);
      setConnectionStatus(3);
    });
  }

  const stopLoading = () => {
    let { client } = this.state
    
    client.disconnect();
    setConnectionStatus(0)
    setClient(undefined)

  }

  const saveRacks = () => {
    let racks_to_del = [...delRacks];
    let racks_to_add = [...addRacks];
    if(racks_to_add.length && racks_to_del.length){
      stopLoading();
    }
    else if(racks_to_add.length){
      stopLoading();
    }
    else if(racks_to_del.length){

      console.log("racks to be deleted "+JSON.stringify(racks_to_del))
      let updatedFifo = batchDet.fifo.filter(ar => !racks_to_del.find(rm => (rm === ar.element_num)))
      console.log("updatedFifo : " + JSON.stringify(updatedFifo));
      let apiData = {
        "op":"update_material_fifo",
        "batch_num":batchDet.batch_num,
        "fifo":updatedFifo
      }
      console.log("apiData here "+JSON.stringify(apiData))
      setApiStatus(true);
      ApiService.getAPIRes(apiData, "POST", "batch").then(apiRes => {
        console.log("apiRes : " + JSON.stringify(apiRes))
        setApiStatus(false);
        if(apiRes && !apiRes.status){
          Alert.alert('Could not update racks')
          setDelRacks([]);
          setAddRacks([]);
          showDialog(false)
          setDialogMessage("");
          setDialogTitle("");

        }
        if (apiRes && apiRes.status) {
          Alert.alert("Racks updated !")
          setDelRacks([]);
          setAddRacks([]);
          showDialog(false)
          setDialogMessage("");
          setDialogTitle("");
          let bOptions = { ...batchOptions }
          let batchIndex = bOptions.options.findIndex(batchItem => batchItem.batch_num === batchDet.batch_num)
          bOptions.options[batchIndex].fifo = apiRes.response.message.fifo;
          setBatchOptions(bOptions)
        }
      })

    }
  }

  const computeRacks = () => {
    let racks_to_del = [...delRacks];
    console.log(racks_to_del)
    console.log(racks_to_del.length)
    if(racks_to_del.length && addRacks.length){
      console.log("add & del racks");
      showDialog(true);
      setDialogTitle('Add To Racks');
      let message = "Please confirm to delete the selected racks and add new racks"
      setDialogMessage(message);
    }
    else if (racks_to_del.length) {
      console.log("del racks")
      showDialog(true);
      setDialogTitle('Delete Racks');
      let message = "Please confirm to delete the selected racks"
      setDialogMessage(message);
    }
    else if(addRacks.length){
      console.log("add racks")
      showDialog(true);
      setDialogTitle('Add To Racks');
      let message = "Please confirm newly added racks"
      setDialogMessage(message);
    }
    else{
      setListeningEvent(false);
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
        <View style={{flexDirection:'row'}}>
          <View style={{flex:2,flexDirection:'row',alignItems:'center',margin:5}}>
            <Text style={[styles.filterLabel,{flex:1}]}>Select Batch</Text>

            <Picker
              selectedValue={batchNum}
              onValueChange={handleChange("batchNum")}
              mode="dialog"
              style={{ backgroundColor: "#ECF0FA",flex:2,padding:0 }}
              itemStyle={{padding:0}}
              dropdownIconColor={appTheme.colors.cardTitle}
            >
              {batchOptions.options.map((pickerItem, pickerIndex) => {
                let labelV = (batchOptions.keyName && pickerItem[batchOptions.keyName]) ? pickerItem[batchOptions.keyName] : (pickerItem.key ? pickerItem.key : "");
                let label = (batchOptions.valueName && pickerItem[batchOptions.valueName]) ? pickerItem[batchOptions.valueName] : (pickerItem.value ? pickerItem.value : "");
                return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={label} value={labelV} key={pickerIndex} />)
              })}
            </Picker>
          </View>
          <View style={{ flex: 3 }}></View>

        </View>
        <ActivityIndicator size="large" animating={apiStatus} />

          {batchDet && batchDet._id ? 
          <View style={{ flexDirection: 'row',margin:5,padding:5}}>
             
            <View style={{flex:2}}>
              <View style={{
                flexDirection: 'column', margin: 10, marginTop: 20,
                borderColor: 'grey', borderWidth: 0.5, padding: 10, borderRadius: 10
              }}>
                <View style={{flexDirection:'row',justifyContent:'center'}}>
                  <CustomHeader title={"Rack Numbers"} size={18}  style={{}}/>
                  <TouchableOpacity style={{}}
                    onPress={(e) => handleEditRack(e)  } >
                    <MaterialIcons name="edit" size={25} style={{ marginLeft: 10 }}></MaterialIcons>
                  </TouchableOpacity>
                  

                </View>
                {console.log(JSON.stringify(batchDet.fifo))}
                <View style={{ flexDirection: 'row', }}>
                  {batchDet.fifo.map((fifoItem, fifoIndex) => {
                   
                    let fifoRack = (fifoIndex === 0) ? fifoItem.element_num : "  |   " + fifoItem.element_num
                    return (
                      <TouchableOpacity style={{}} key={fifoIndex} onPress={(e) => addToDelRacks(e, fifoItem)} >  
                        <Text style={{  fontSize: 14,
                        color:delRacks.indexOf(fifoItem.element_num) > -1 ? 'red' : 'black' 
                          
                          }} key={fifoIndex} >{fifoRack}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>

                {/* {editRack && batchDet ? 
                <TouchableOpacity style={[ {color:'red', flexDirection: 'row',width:'20%',
                alignSelf:'flex-end',marginTop:20 }]} onPress={(e) => removeRacks(e)} >
                  <Text style={[styles.successText,{color:appTheme.colors.cancelAction}]}>REMOVE</Text>
                </TouchableOpacity> : false} */}
              </View>
              
              {batchNum && batchNum.length &&
                delRacks.length && listeningEvent ?
                  <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity style={[styles.successBtn, { flexDirection: 'row' }]}
                    onPress={(e) => computeRacks(e)} >
                      <Text style={styles.successText}>SAVE</Text>
                    </TouchableOpacity>
                    </View> : false}

              {batchNum && batchNum.length && delRacks.length === 0 && listeningEvent ?
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                      <TouchableOpacity style={[styles.successBtn, { flexDirection: 'row' }]}
                    onPress={(e) => computeRacks(e)} >
                    <Text>Save</Text>
                    </TouchableOpacity>
                    </View> : false}

              {batchNum && batchNum.length && delRacks.length === 0 && listeningEvent === false ? 
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity style={[styles.successBtn, { flexDirection: 'row' }]}
                    onPress={(e) => startListening(e)} >
                    <Text>Add To Rack</Text>
                  </TouchableOpacity>
                 
                </View> :false }
              
              {batchNum && batchNum.length && delRacks.length  && listeningEvent === false ?
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity style={[styles.successBtn, { flexDirection: 'row' }]}
                    onPress={(e) => startListening(e)} >
                  <Text>Add To Rack</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.successBtn, { flexDirection: 'row' }]}
                    onPress={(e) => computeRacks(e)} >
                  <Text>Save</Text></TouchableOpacity>
                </View> : false}

              </View>
            <View style={{ flex: 2 }}>
              <CustomCard title={"BATCH DETAILS"} cardContent={
                <BatchDetails
                  content={batchDet}
                  editMode={false}
                  _id={batchDet._id}
                  noTitle={true}
                />
              }></CustomCard>
            </View> 
              </View>
              : false}
              
        {dialog ? <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          closeDialog={closeDialog}
          okDialog={saveRacks}
        /> : <View></View>}
        


       

        {apiError && apiError.length ? (<Text style={{ color: 'red', fontSize: 12, padding: 2, margin: 10 }}> {apiError} </Text>) : (false)}
       
      </View>


    </ScrollView>
  )
}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    //justifyContent: "center",
    margin: 5
  },
  successBtn: {
    width: "40%",
    borderRadius: 25,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    //marginTop: 40,
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
  filterLabel: {
    fontSize: 14,
    fontFamily: appTheme.fonts.regular,
    padding: 5
  },
});