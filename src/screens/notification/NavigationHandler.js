import { CommonActions } from '@react-navigation/routers';
import * as React from 'react';
import { stageType } from '../../constants/appConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';

//reference for navigation
export const navigationRef = React.createRef();

export const handleNotificationNavig = (notification, openNotificationHandler) => {
    try {
        let currentPage = navigationRef && navigationRef.current &&
            navigationRef.current.getCurrentRoute().name;
        console.log("current Page " + currentPage)
        let notifyData = JSON.parse(notification.data.data);
        console.log("notifyData here "+JSON.stringify(notifyData))
        // { "sender": "61c4171c4bae1e001dcb9e88", "process_name": "P-1-C-124", 
        // "forge_machine_id": "61c44f3ae9bdcd001d8cb2c8", "stage": "Shot blasting",
        //  "status": "REQUESTED", "receiver": "61c4171c4bae1e001dcb9e88", "task_id": "61ef9a00a2de49002cddd5a0" }
        let navigationPage = '';
        AsyncStorage.getItem('stage').then(currentStage => {
            if(currentStage.toLowerCase() === notifyData.stage.toLowerCase()){
                let processStage = notifyData.stage.toLowerCase();
                if(processStage.toLowerCase() === stageType.shotblasting ||
                    processStage.toLowerCase() === stageType.visual || 
                    processStage.toLowerCase() === stageType.shotpeening ||
                    processStage.toLowerCase() === stageType.oiling)
                    navigationPage = 'StageHome';
                    
            }
            else
            {

            }

            openNotificationHandler(navigationPage, () => {
                if (navigationRef && navigationRef.current) {
                    console.log("navigate page ");
                    navigationRef.current.navigate({ name: navigationPage, params: notifyData });
                }
            });
        })

            
       

    } catch (e) {
        console.log(e);
    }
};