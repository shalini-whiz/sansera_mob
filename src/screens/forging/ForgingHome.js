import React, { useState, useEffect, useRef } from "react";

import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { appTheme } from '../../lib/Themes';
import ProcessFilter from '../process/ProcessFilter';
import WorkPlan from './WorkPlan';
import RawMaterial from './Rejection';
import TaskList from '../tasks/TaskList';
import Rejection from "./Rejection";

const Tab = createMaterialTopTabNavigator();



export default function ForgingHome() {
  const processRef = useRef()

  const [processDet, setProcessDet] = React.useState({});

  const setProcess = (data) => {
    console.log("while setting process .. " + JSON.stringify(data))
    setProcessDet(data)
  }

  const updateProcess = e => {
    console.log(processRef)
    console.log(processRef.current)

    processRef.current.setFromOutside('HELLO from Parent')
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
        <Tab.Screen name="Rejection"
          children={() => <Rejection
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
        <Tab.Screen name="Tasks"
          children={() => <TaskList
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
    <View style={{ flex: 1 }}>
      <ProcessFilter processEntity={setProcess} ref={processRef} />
      <TabNavigation style={{ flex: 1 }} />

    </View>
  );
}
