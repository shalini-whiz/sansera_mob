import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView,
   RefreshControl } from "react-native";
import { appTheme } from "../../lib/Themes";
import { ApiService } from "../../httpservice";
import { useIsFocused } from '@react-navigation/native';

let data = [
  {
    stage: 'SHEARING',
    count: 10
  },
  {
    stage: 'FORGING',
    count: 200
  },
  {
    stage: 'SHOT BLASTING',
    count: 300
  },
  {
    stage: "VISUAL MPI",
    count: 250
  },
  {
    stage: "SHOT PEENING",
    count: 400
  }
];

export default function RejectionData() {
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false)
  const [rejectionData,setRejectionData] = useState([])

  useEffect(() => {
    if (isFocused) {
      loadRejectionData();
    }
    return () => { }
  }, [isFocused])

  const loadRejectionData = () => {
    setRejectionData(data)
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadRejectionData();
  }, []);

  
  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
  }
  const openDialog = () => {
    showDialog(true);
    setDialogTitle('Confirm Clear Inventory');
    let batchDetails = { ...batchDet };
    let message = "The racks associated with batch number " + batchDetails.batch_num + " will be deleted"
    setDialogMessage(message);
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
        <View style={[styles.dataContainer,{}]}>
          <View style={{ flexDirection: 'row', width: '100%', flex: 1, 
          justifyContent:'center',
           }}>

          {rejectionData.map((item,index) => {
            return(
              <View style={{ flexDirection: 'column',borderWidth:0.5,borderColor:'grey',padding:5 }} key={index}>
                <Text style={[styles.tableHeader, { marginBottom:1,flex:1,
                padding:5,width:'100%',borderBottomColor:'grey',borderBottomWidth:0.5}]}>{item.stage}</Text>
                <Text style={[styles.tableCell, { marginTop:1,flex:1,padding:5,
                   }]}>{item.count}</Text>
</View>
            )
          })}
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
  dataContainer:{
    backgroundColor:'white',
    padding:10
  },
  tableHeader: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily:appTheme.fonts.bold,
  },
  tableCell:{
    textAlign:'center',
    fontSize:16,
    fontFamily: appTheme.fonts.regular,
  }

});