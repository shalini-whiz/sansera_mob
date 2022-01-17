import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import UserContext from "../UserContext";
import { useIsFocused } from '@react-navigation/native';
import { appTheme } from "../../lib/Themes";
import { default as AppStyles } from "../../styles/AppStyles";
import EmptyBin from "./EmptyBin";
import BinTask from "./BinTask";



export default function TaskHome(props) {
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
    }
    return () => { }
  }, [isFocused])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);

  
  const tabChange = (value) => {
    setTab(value)
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
        {tab === "filledBin" ? <BinTask processEntity={props.processEntity} reloadPage={reloadPage} /> : false}
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