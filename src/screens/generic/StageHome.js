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
import { EmptyBinContext } from "../../context/EmptyBinContext";

const Tab = createMaterialTopTabNavigator();



export const StageHome =React.memo((props) =>
 {
  const isFocused = useIsFocused();
  const processRef = useRef()
  const [processDet, setProcessDet] = React.useState({});
  let {  appProcess, processStage } = React.useContext(AppContext);

  useEffect(() => {
    if (isFocused) {
    }
    return () => { }
  }, [isFocused])

 
  const setProcess = (data) => {
    setProcessDet(data)
  }

  const updateProcess = e => {
    processRef.current.setFromOutside(processDet.process_name)
  }

  const TabNavigation = memo(() => {
    const { unReadTask } = React.useContext(EmptyBinContext)
    console.log("stage home unReadTask here "+unReadTask)

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
          // name={"Tasks" + (unReadTask && unReadTask.length && unReadTask !="0" ? (" ("+unReadTask+")") : '')}
          name="Tasks"
          options={unReadTask && unReadTask.length && unReadTask != "0" ? {tabBarBadge:unReadTask} : {}}
          children={() => <TaskHome
            processEntity={processDet}
            setProcessEntity={setProcess}
            updateProcess={updateProcess}
            
          />}
        />


      </Tab.Navigator>
    </NavigationContainer>)
  })

  return (
    <View style={{ flex: 1, flexDirection: 'column' }}>
      <BinMqtt />
      <ProcessFilter processEntity={setProcess} ref={processRef} style={{ margin: 5 }} />
      <TabNavigation style={{ flex: 2 }} />
    </View>
  );
})
