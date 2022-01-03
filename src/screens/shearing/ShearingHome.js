import React, { useState, useEffect,useRef } from "react";

import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import TopBar from '../TopBar';
import ProcessDetails from '../process/ProcessDetails';
import { appTheme } from '../../lib/Themes';
import ProcessFilter from './ProcessFilter';
import WorkPlan from './WorkPlan';
import RawMaterial from './RawMaterial';
import TaskList from '../tasks/TaskList';

const Tab = createMaterialTopTabNavigator();



export default function ShearingHome() {
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
        <Tab.Screen name="Raw Material" 
          children={() => <RawMaterial 
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
    <View style={{flex:1,flexDirection:'column'}}>
      <ProcessFilter processEntity={setProcess} ref={processRef}/>
      <TabNavigation style={{flex:2}}/>
      
    </View>
  );
}
