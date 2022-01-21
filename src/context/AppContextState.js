import React from 'react';
import AppContext from './AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class AppContextState extends React.Component {
  state = {
    userEntity:{},
    tasks: [],
    processStage:'',
    appProcess:'',
    taskCount: 0,
    emptyBinCount: 0,
    filledBinCount: 0
  }

  setUserEntity =( user) =>{
    this.setState({userEntity:user})
  }
  setProcessStage = (stage) => {
    console.log("changed stage "+stage);
    this.setState({ processStage:stage})
  }

  setAppProcess = (process) => {
    console.log("changed process " + process);
    this.setState({ appProcess: process })
  }

  setTaskCount = (count) => {
    this.setState({taskCount:count})
  }

  setEmptyBinCount = (count) => {
    this.setState({ emptyBinCount: count })
  }
  setFilledBinCount = (count) => {
    this.setState({ filledBinCount: count })

  }
  addNewTask = (task) => {
    const list = [...this.state.tasks, task];
    this.setState({ tasks: list });
  };

  deleteTask = (taskId) => {
    this.setState(this.state.tasks.splice(taskId, 1));
  };
  render() {
    return (
      <AppContext.Provider
        value={{
          userEntity:this.state.userEntity,
          setUserEntity: this.setUserEntity,
          tasks: this.state.tasks,
          addNewTask: this.addNewTask,
          deleteTask: this.deleteTask,
          processStage:this.state.processStage,
          setProcessStage:this.setProcessStage,
          appProcess:this.state.appProcess,
          setAppProcess:this.setAppProcess,
          taskCount:this.state.taskCount,
          setTaskCount:this.setTaskCount,
          emptyBinCount:this.state.emptyBinCount,
          setEmptyBinCount:this.setEmptyBinCount,
          filledBinCount:this.state.filledBinCount,
          setFilledBinCount:this.setFilledBinCount
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}