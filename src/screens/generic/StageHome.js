import React, { useState, useEffect, useRef } from "react";

import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { appTheme } from '../../lib/Themes';
import ProcessFilter from '../process/ProcessFilter';
import WorkPlan from './WorkPlan';
import Rejection from "./Rejection";
import BinMqtt from "../mqtt/BinMqtt";
import TaskHome from "../tasks/TaskHome";
import AppContext from "../../context/AppContext";
import { Badge } from "react-native-paper"

const Tab = createMaterialTopTabNavigator();



export default function StageHome(props) {
  const processRef = useRef()
  const [processDet, setProcessDet] = React.useState({});
  let { emptyBinCount, filledBinCount, appProcess, processStage } = React.useContext(AppContext);

  let taskCount = emptyBinCount + filledBinCount;
  const setProcess = (data) => {
    setProcessDet(data)
  }

  const updateProcess = e => {
    console.log("call outside " + JSON.stringify(processDet))
    processRef.current.setFromOutside(processDet.process_name)
  }

  const TabNavigation = () => {

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

          listeners={({ navigation, route }) => ({
            tabPress: e => {
              if (route.state && route.state.routeNames.length > 0) {
                navigation.navigate('Edit Process')
              }
            },
          })} />
        {(processStage.toLowerCase() !== "oiling") ?

        <Tab.Screen name="Rejection"
          children={() => <Rejection
            processEntity={processDet}
            setProcessEntity={setProcess}
            updateProcess={updateProcess}

          />}

          listeners={({ navigation, route }) => ({
            tabPress: e => {
              if (route.state && route.state.routeNames.length > 0) {
                navigation.navigate('Rejection')
              }
            },
          })}
        /> : false}
        <Tab.Screen 
        name={"Tasks "+(taskCount ? " ("+taskCount+")" : '')}
          children={() => <TaskHome
            processEntity={processDet}
            setProcessEntity={setProcess}
            updateProcess={updateProcess}
            
          />}

          listeners={({ navigation, route }) => ({
            tabPress: e => {
              if (route.state && route.state.routeNames.length > 0) {
                navigation.navigate('Create Process')
              }
            },
          })}
        />


      </Tab.Navigator>
    </NavigationContainer>)
  }
  return (
    <View style={{ flex: 1, flexDirection: 'column' }}>
      <BinMqtt />
      <ProcessFilter processEntity={setProcess} ref={processRef} style={{ margin: 5 }} />
      <TabNavigation style={{ flex: 2 }} />

    </View>
  );
}
