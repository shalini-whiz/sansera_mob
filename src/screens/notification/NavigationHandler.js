import { CommonActions } from '@react-navigation/routers';
import * as React from 'react';

//reference for navigation
export const navigationRef = React.createRef();

export const handleNotificationNavig = (notification, openNotificationHandler) => {
    try {
        let currentPage = navigationRef && navigationRef.current &&
            navigationRef.current.getCurrentRoute().name;
        console.log("current Page " + currentPage)
        let notifyData = JSON.parse(notification.data.data);
        openNotificationHandler('Stages', () => {
            if (navigationRef && navigationRef.current) {
                console.log("navigate page ");
                navigationRef.current.navigate({ name: 'Stages', params: notifyData });
            }
        });

    } catch (e) {
        console.log(e);
    }
};