import React, { useState, useEffect, useRef, memo } from "react";

import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { appTheme } from '../../lib/Themes';
import ProcessFilter from '../process/ProcessFilter';
import BinMqtt from "../mqtt/BinMqtt";
import AppContext from "../../context/AppContext";
import { Badge } from "react-native-paper"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parse } from "path/posix";
import { useIsFocused } from '@react-navigation/native';
import {Rejection } from "./Rejection"
import { WorkPlan } from "./WorkPlan"
import TaskHome from "../tasks/TaskHome";

const Tab = createMaterialTopTabNavigator();



export const StageHome =React.memo((props) => {
  const isFocused = useIsFocused();
  const processRef = useRef()
  const [processDet, setProcessDet] = React.useState({});
  let {  appProcess, processStage } = React.useContext(AppContext);
  const [unReadEmptyBin,setUnReadEmptyBin] = React.useState('0');
  const [unReadFilledBin, setUnReadFilledBin] = React.useState('0');
  const [taskCount,setTaskCount] = React.useState('')
  useEffect(() => {
    if (isFocused) {
      loadData();
    }
    return () => { }
  }, [isFocused])

  const loadData = async() => {
    let unReadEmptyBinCount = await AsyncStorage.getItem("unReadEmptyBin");
    if (unReadEmptyBinCount) setUnReadEmptyBin(unReadEmptyBinCount)
    let unReadFilledBinCount = null;
    if(appProcess){
      let unReadFilledBinCount = await AsyncStorage.setItem(appProcess + "_" + processStage);
      if (unReadFilledBinCount) setUnReadFilledBin(unReadFilledBinCount);
    }
   
    if (unReadFilledBinCount && unReadEmptyBinCount)
      setTaskCount(parseInt(unReadFilledBinCount)+parseInt(unReadEmptyBinCount))
    else if(unReadFilledBinCount)
      setTaskCount(parseInt(unReadFilledBinCount))
    else if(unReadEmptyBinCount)
      setTaskCount(parseInt(unReadEmptyBinCount))

  }

  const setEmptyBinCount = (count) => {
    console.log("received count "+count);
    console.log(typeof count)
    console.log("received count " + count);

    AsyncStorage.setItem("unReadEmptyBin", count);
    setUnReadEmptyBin(count);
    if(unReadFilledBin)
      setTaskCount(parseInt(unReadFilledBin) + parseInt(count))
    if (unReadFilledBin && count)
      setTaskCount(parseInt(unReadFilledBin) + parseInt(count))
    else if (unReadFilledBin)
      setTaskCount(parseInt(unReadFilledBin))
    else if (count)
      setTaskCount(parseInt(count))
  }

  const setFilledBinCount = (count) => {
    AsyncStorage.setItem(appProcess + "_" + processStage, count);
    setUnReadFilledBin(count);
    if (unReadEmptyBin && count)
      setTaskCount(parseInt(unReadEmptyBin) + parseInt(count))
    else if (unReadEmptyBin)
      setTaskCount(parseInt(unReadEmptyBin))
    else if (count)
      setTaskCount(parseInt(count))
  }

  const setProcess = (data) => {
    setProcessDet(data)
  }

  const updateProcess = e => {
    processRef.current.setFromOutside(processDet.process_name)
  }

  const TabNavigation = memo(() => {

    return (<NavigationContainer independent={true}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: appTheme.colors.cardTitle,
          tabBarInactiveTintColor: 'gray',
          lazy: true
        })}
      >

        <Tab.Screen name="Work Plan"
          children={() => <WorkPlan
            processEntity={processDet}
            setProcessEntity={setProcess}
            updateProcess={updateProcess}
          />}
         />
        {(processStage.toLowerCase() !== "oiling") ?

        <Tab.Screen name="Rejection"
          children={() => <Rejection
            processEntity={processDet}
            setProcessEntity={setProcess}
            updateProcess={updateProcess}

          />}

        /> : false}
        <Tab.Screen 
        name={"Tasks"}
          children={() => <TaskHome
           
            updateProcess={updateProcess}
            setEmptyBinCount={setEmptyBinCount}
            setFilledBinCount={setFilledBinCount}
            
            emptyBinCount={unReadEmptyBin}
            filledBinCount={unReadFilledBin}
            
          />}
        />


      </Tab.Navigator>
    </NavigationContainer>)
  })

  return (
    <View style={{ flex: 1, flexDirection: 'column' }}>
      <BinMqtt setEmptyBinCount={setEmptyBinCount} />
      <ProcessFilter processEntity={setProcess} ref={processRef} style={{ margin: 5 }} />
      <TabNavigation style={{ flex: 2 }} />
    </View>
  );
})
