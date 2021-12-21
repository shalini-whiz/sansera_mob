
import React, { useEffect } from "react";
import UserAccount from "./UserAccount";
// import ProcessStages from "./StagingList";
import UserContext from "./UserContext";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
const Tab = createBottomTabNavigator();

const Home = ({ navigation, route }) => {
  const userState = React.useContext(UserContext);
  //let [user, setUser] = React.useState({})
  let params = {}
  if (route && route.params) {
    params = route.params
  }

  useEffect(() => {
    let isMounted = true;
    //setUser(userState.user);
    return () => {
      isMounted = false;
    }
  }, [])


  return (

    <>
      
     

    </>
  )
}

export default Home;
