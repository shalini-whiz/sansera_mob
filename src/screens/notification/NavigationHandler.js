import { stageType } from '../../constants/appConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmptyBinContext } from '../../context/EmptyBinContext';
import React from "react";

//reference for navigation
export const navigationRef = React.createRef();
const { setUnReadFilledBinData } = React.useContext(EmptyBinContext)

export const handleNotificationNavig = async (notification, openNotificationHandler) => {
    try {
        let currentPage = navigationRef && navigationRef.current &&
            navigationRef.current.getCurrentRoute().name;
        let notifyData = JSON.parse(notification.data.data);

        let navigationPage = '';
        let currentStage = await AsyncStorage.getItem("stage");


        if (notifyData.process_name && notifyData.stage && notifyData.task_id) {
            let storageName = notifyData.process_name + "_" + notifyData.stage
            AsyncStorage.getItem(storageName).then(count => {
                let newFilledBinCount = 1;
                if (count && count.length)
                    newFilledBinCount = parseInt(count) + 1;
                AsyncStorage.setItem(storageName, newFilledBinCount.toString());
                setUnReadFilledBinData(newFilledBinCount.toString())
            })
        }

        if (currentStage && currentStage.toLowerCase() === notifyData.stage.toLowerCase()) {
            let processStage = notifyData.stage.toLowerCase();
            if (processStage.toLowerCase() === stageType.shotblasting ||
                processStage.toLowerCase() === stageType.visual ||
                processStage.toLowerCase() === stageType.mpi ||
                processStage.toLowerCase() === stageType.shotpeening ||
                processStage.toLowerCase() === stageType.oiling)
                navigationPage = 'StageHome';
            if (processStage.toLowerCase() === stageType.forging)
                navigationPage = 'ForgingHome'
            if (processStage.toLowerCase() === stageType.shearing)
                navigationPage = 'ShearingHome'
        }
        else {

        }

        openNotificationHandler(navigationPage, () => {
            if (navigationRef && navigationRef.current) {
                navigationRef.current.navigate({ name: navigationPage, params: notifyData });
            }
        });
    } catch (e) {
        console.log(e);
    }
};