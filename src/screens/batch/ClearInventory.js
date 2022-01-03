import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import { util } from "../../commons";
import { appTheme } from "../../lib/Themes";
import FormGen from "../../lib/FormGen"
import CustomHeader from "../../components/CustomHeader";
import { Picker } from '@react-native-picker/picker';
import CustomCard from "../../components/CustomCard";
import { ApiService } from "../../httpservice";
import BatchDetails from "./BatchDetails";
import CustomModal from "../../components/CustomModal";
import { useIsFocused } from '@react-navigation/native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons"


export default function ClearInventory() {
  const isFocused = useIsFocused();

  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false)
  const [batchNum, setBatchNum] = useState('')
  const [batchDet, setBatchDet] = useState({})
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('')
  const [editRack, setEditRack] = useState(false);
  const [delRacks, setDelRacks] = useState([]);

  const [batchOptions, setBatchOptions] = useState({
    keyName: "_id", valueName: "batch_num",
    options: [],
  })

  useEffect(() => {
    if (isFocused) {
      setApiStatus(true);
      loadBatches();
    }
    return () => { }
  }, [isFocused])

  const loadBatches = () => {
    let apiData = {
      "op": "list_raw_material_by_status",
      "status": ["APPROVED", "REJECTED"]
    }
    setRefreshing(false);
    ApiService.getAPIRes(apiData, "POST", "list_raw_material_by_status").then(apiRes => {
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length) {
          let bOptions = { ...batchOptions }
          bOptions.options = apiRes.response.message;
          setBatchOptions(bOptions)
          if (bOptions.options[0]) {
            setBatchNum(bOptions.options[0]._id)
            setBatchDet(bOptions.options[0])
          }
        }
        else {
          let bOptions = { ...batchOptions }
          bOptions.options = []
          setBatchOptions(bOptions)
          setBatchNum('')
          setBatchDet({})
        }
      }
    });

  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadBatches();
  }, []);
  const handleChange = (name) => (value, index) => {
    if (name === "batchNum") {
      setBatchNum(value)
      let bOptions = [...batchOptions.options]
      let bDet = bOptions[index];
      if (bDet && bDet.batch_num === "select") setBatchDet(undefined)
      else setBatchDet(bDet);
      setDelRacks([])
      setEditRack(false)
    }

  };

  const handleEditRack = () => {
    setEditRack(prevState => !prevState)
    setDelRacks([]);
  }

  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
  }
  const openDialog = (e, type) => {
    showDialog(true);
    let dialogTitle = "";
    let dialogMessage = "";
    let batchDetails = { ...batchDet };
    setDialogType(type)

    if (type === "inventory") {
      dialogTitle = "Confirm Clear Inventory"
      dialogMessage = "The racks associated with batch number " + batchDetails.batch_num + " will be deleted"
    }
    if (type === "racks") {
      dialogTitle = "Delete Racks"
      dialogMessage = "Please confirm to delete the selected racks"
    }
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);

  }

  const removeBatch = async () => {
    let apiData = {}
    let batchDetails = { ...batchDet };
    apiData.batch_num = batchDetails.batch_num;
    apiData.status = "REMOVED"
    apiData.op = "update_material_fifo";
    apiData.fifo = [];
    setApiStatus(true);
    ApiService.getAPIRes(apiData, "POST", "batch").then(apiRes => {
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message) {
          closeDialog();
          loadBatches();
          setBatchDet({})
        }
      }
    });

  }

  const addToDelRacks = (e, fifoItem) => {
    let racks_to_del = [...delRacks]
    let element_num = fifoItem.element_num;
    const selectedIndex = racks_to_del.indexOf(element_num);
    if (selectedIndex === -1) {
      racks_to_del.push(element_num);
    } else if (selectedIndex !== -1) {
      racks_to_del.splice(selectedIndex, 1);
    }
    setDelRacks(racks_to_del);
  }

  const saveRacks = () => {
    let racks_to_del = [...delRacks];
    let apiData = {
      "op": "update_material_fifo",
      "batch_num": batchDet.batch_num,
    }
    let updatedFifo = batchDet.fifo.filter(ar => !racks_to_del.find(rm => (rm === ar.element_num)))
    apiData.fifo = updatedFifo

    setApiStatus(true);
    ApiService.getAPIRes(apiData, "POST", "batch").then(apiRes => {
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        Alert.alert("Racks updated !")
        setDelRacks([]);
        showDialog(false)
        setDialogMessage("");
        setDialogTitle("");


        let bOptions = { ...batchOptions }
        let batchIndex = bOptions.options.findIndex(batchItem => batchItem.batch_num === batchDet.batch_num)
        bOptions.options[batchIndex].fifo = apiRes.response.message.fifo;
        setBatchOptions(bOptions)
        setBatchDet(apiRes.response.message)
      }
    })

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
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 2, margin: 2, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ padding: 5, fontSize: 14 }}>Select Batch</Text>
            <Picker
              selectedValue={batchNum}
              onValueChange={handleChange("batchNum")}
              mode="dialog"
              style={{ backgroundColor: "#ECF0FA", flex: 1 }}
              itemStyle={{}}
              dropdownIconColor={appTheme.colors.cardTitle}
            >
              {batchOptions.options.map((pickerItem, pickerIndex) => {
                let labelV = (batchOptions.keyName && pickerItem[batchOptions.keyName]) ? pickerItem[batchOptions.keyName] : (pickerItem.key ? pickerItem.key : "");
                let label = (batchOptions.valueName && pickerItem[batchOptions.valueName]) ? pickerItem[batchOptions.valueName] : (pickerItem.value ? pickerItem.value : "");
                return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={label} value={labelV}
                  key={pickerIndex} />)
              })}
            </Picker>
          </View>
          <View style={{ flex: 3, margin: 2 }}>

          </View>


        </View>
        <ActivityIndicator size="large" animating={apiStatus} />

        {batchDet && batchDet._id ?
          <View style={{ flexDirection: 'row', margin: 5, padding: 5 }}>

            <View style={{ flex: 2, flexDirection: 'column', }}>
              <View style={{ flexDirection: 'column', border: 'grey', borderWidth: 0.5 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 10 }}>
                  <CustomHeader title={"Rack Numbers"} size={18} style={{}} />
                  {batchDet.status.toLowerCase() != "rejected" ? <TouchableOpacity style={{}}
                    onPress={(e) => handleEditRack(e)} >
                    <MaterialIcons name="edit" size={25} style={{ marginLeft: 10 }}
                      color={editRack ? 'red' : 'green'}

                    ></MaterialIcons>
                  </TouchableOpacity> : false}
                </View>


                <View style={{ flexDirection: 'row', flex: 1, padding: 10 }}>
                  <View style={{ flexDirection: 'column', flex: 2 }}>
                    <View style={{ flexDirection: 'row', }}>
                      {batchDet.fifo.map((fifoItem, fifoIndex) => {
                        let fifoRack = (fifoIndex === 0) ? fifoItem.element_num : "  |   " + fifoItem.element_num
                        return (
                          <TouchableOpacity style={{}} key={fifoIndex}
                            onPress={(e) => addToDelRacks(e, fifoItem)} >
                            <Text style={{
                              fontSize: 14,
                              color: delRacks.indexOf(fifoItem.element_num) > -1 ? 'red' : 'black'

                            }} key={fifoIndex} >{fifoRack}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                    {delRacks.length ?
                      <TouchableOpacity style={[{ flexDirection: 'row', marginRight: 50, marginTop: 10, justifyContent: 'flex-end' }]} onPress={(e) => openDialog(e, "racks")} >
                        <Text style={[styles.successText, { color: 'red', fontFamily: appTheme.fonts.bold }]}>REMOVE</Text>
                      </TouchableOpacity>
                      : false}
                  </View>
                </View>
              </View>

              <View style={{ flex: 1, marginTop: 50 }}>
                {batchNum && batchNum.length && batchDet.status.toLowerCase() === "rejected" ? <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity style={[styles.successBtn, { flexDirection: 'row' }]} onPress={(e) => openDialog(e, "inventory")} >
                    <Text style={styles.successText}>CLEAR INVENTORY</Text>
                  </TouchableOpacity>
                </View> : false}
              </View>
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
            {dialog && dialogType === "inventory" ? <CustomModal
              modalVisible={dialog}
              dialogTitle={dialogTitle}
              dialogMessage={dialogMessage}
              closeDialog={closeDialog}
              okDialog={removeBatch}
            /> : false}


            {dialog && dialogType === "racks" ? <CustomModal
              modalVisible={dialog}
              dialogTitle={dialogTitle}
              dialogMessage={dialogMessage}
              closeDialog={closeDialog}
              okDialog={saveRacks}
            /> : false}
          </View>
          : false}






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

});