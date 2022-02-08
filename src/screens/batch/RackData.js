import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl,
   Alert, FlatList, SectionList } from "react-native";
import { ApiService } from "../../httpservice";
import { useIsFocused } from '@react-navigation/native';
import ErrorModal from "../../components/ErrorModal";
import AppStyles from "../../styles/AppStyles";
import CustomModal from "../../components/CustomModal";
import { RackDetails } from "./RackDetails";

export const RackData = React.memo((props) => {
  const isFocused = useIsFocused();
  const [batches,setBatches] = useState([])
  const [secBatches,setSecBatches] = useState([])
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false)
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [rackNo,setRackNo] = useState('')
  const [batch,setBatch] = useState({})

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
      "status": ["NEW","APPROVED", "REJECTED"]
    }
    setRefreshing(false);
    ApiService.getAPIRes(apiData, "POST", "list_raw_material_by_status").then(async apiRes => {
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length) {
         
          let batchSection = await apiRes.response.message.reduce(async function (accumulator, item) {
            const accum = await accumulator;
            item.data = item.fifo
            await (accum.push(item));
            return accum;
          }, []);
          setSecBatches(batchSection);
          setBatches(apiRes.response.message);
        
        }
        else {
        
        }
      }
      else if (apiRes && apiRes.response.message)
        setApiError(apiRes.response.message)
    });

  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadBatches();
  });


  const errOKAction = () => {
    setApiError('')
  }
 
  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setRackNo('')
    setBatch({})
  }
  const openDialog = (e, batch,rackNo) => {
    showDialog(true);
    let dialogTitle = "";
    let dialogMessage = "";
    dialogTitle = "Rack Number "+rackNo
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
    setBatch(batch)
  }
  
  const Item = ({ fifo, title,section }) => {
    return (
    <TouchableOpacity style={{
         width:200, flexDirection: 'row', backgroundColor: 'white', margin: 15,
      flexWrap: 'wrap',

    }}  onPress={(e) => openDialog(e, section, fifo.element_num)}>
      <Text style={[AppStyles.titleWithBold, { backgroundColor: 'white', padding: 10 }]}>{fifo.element_num}</Text>
      <Text style={[AppStyles.subtitle, { backgroundColor: 'yellow', padding: 10 }]}>{"Batch : " + section.batch_num}</Text>
    </TouchableOpacity>
    )
  };
  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.container}>
        <SectionList
          horizontal={true}
          sections={secBatches}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item, section }) =><Item fifo={item} title={""} section={section}/>}
        />
        {dialog ? <CustomModal
          modalVisible={dialog} dialogTitle={dialogTitle}
          dialogMessage={dialogMessage} closeDialog={closeDialog}
          container={<RackDetails content={batch}/>
        } /> : false}
        
        {apiError && apiError.length ? (<ErrorModal msg={apiError} okAction={errOKAction} />) : false}
      </View>
    </ScrollView>
  )
})
const styles = StyleSheet.create({

  container: {
    flex: 1,
    margin: 5
  },
  sectionContainer: {
    backgroundColor: 'white',
    margin: 5,
    padding: 5
  }

});