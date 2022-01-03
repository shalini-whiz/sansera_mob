import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { util } from "../../commons";
import FormGen from "../../lib/FormGen"
import CustomHeader from "../../components/CustomHeader";
import { ApiService } from "../../httpservice";
import UserContext from "../UserContext";
import CustomModal from "../../components/CustomModal";
import { useIsFocused } from '@react-navigation/native';
import { appTheme } from "../../lib/Themes";
import { default as AppStyles } from "../../styles/AppStyles";
import EmptyBin from "./EmptyBin";



export default function TaskList(props) {
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const userState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();
  const [tab, setTab] = useState('emptyBin')

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
    return () => { }
  }, [isFocused])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData()
  }, []);

  const loadData = () => {

  }
  const tabChange = (value) => {
    setTab(value)
  }


  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setDialogType('')
  }
  const openDialog = (type) => {
    showDialog(true);
    let dialogTitle = "";
    let dialogMessage = "";
    setDialogType(type)
    if (type === "rejection") {
      dialogTitle = "Reject Weight";
      dialogMessage = "Are you sure you wish to Reject Weight (kg) of " + props.processEntity.process_name
    }
    if (type === "partial") {
      dialogTitle = "Partial Return"
      dialogMessage = "Are you sure you wish to partial return of " + props.processEntity.process_name
    }
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
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
          borderRadius: tab === "emptyBin" ? 15 : 0,
          backgroundColor: tab === "emptyBin" ? appTheme.colors.cardTitle : 'white'
        }}
          onPress={(e) => tabChange("emptyBin")} >
          <Text style={[styles.filterText, {
            fontFamily: tab === "emptyBin" ? appTheme.fonts.bold : appTheme.fonts.regular,
            color: tab === "emptyBin" ? 'white' : appTheme.colors.cardTitle,
          }]}>Empty Bin Request</Text>
        </TouchableOpacity>
        <Text style={{ padding: 5 }}> / </Text>
        <TouchableOpacity
          style={{
            flexDirection: 'row', padding: 8,
            borderRadius: tab === "filledBin" ? 15 : 0,
            backgroundColor: tab === "filledBin" ? appTheme.colors.cardTitle : 'white'
          }}
          onPress={(e) => tabChange("filledBin")} >
          <Text style={[styles.filterText, {
            fontFamily: tab === "filledBin" ? appTheme.fonts.bold : appTheme.fonts.regular,
            color: tab === "filledBin" ? 'white' : appTheme.colors.cardTitle,
          }]}>Filled Bin Request</Text>
        </TouchableOpacity>

      </View>
      <View style={styles.mainContainer}>
        {tab === "emptyBin" ? <EmptyBin processEntity={props.processEntity} reloadPage={reloadPage}/> : false}
    

     

      </View>


    </ScrollView>
  )
}
const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: "center",
    margin: 10,
  },

});