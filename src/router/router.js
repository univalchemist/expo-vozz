import React, { Component } from 'react';
import { createAppContainer, createSwitchNavigator, createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import Nav from '../components/nav';

import Search from '../screens/Search';
import Messages from '../screens/Message';
import Profile from '../screens/Profile';
import Home from '../screens/Home';
import Login from '../screens/Auth/Login'
import Register from '../screens/Auth/Register'
import AudioTest from '../screens/AudioTest';
import Auth from '../auth/auth';
import Experiencia from '../screens/Experiencia';
import Step1 from '../screens/Welcome/Step1';
import Step2 from '../screens/Welcome/Step2';
import Step3 from '../screens/Welcome/Step3';
import Routes from '../screens/Routes';
import Chat from '../screens/Message/Chat';
import AddDetails from '../screens/Routes/AddDetails';
import AddPlace from '../screens/Routes/AddPlace';
import LastPage from '../screens/Routes/LastPage';
import Experience from '../screens/Experience';
import AddDetailExperience from '../screens/Experience/AddDetailExperience';
import LastPageExperience from '../screens/Experience/LastPageExperience';
import UserProfile from '../screens/UserProfile';
import ViewRoute from '../screens/ViewRoute';
import ViewExperience from '../screens/ViewExperience';
import Settings from '../screens/Settings';
import AudioLibrary from '../screens/AudioLibrary';
import EditProfile from '../screens/EditProfile';
import ViewCategory from '../screens/ViewCategory';
import Comment from '../screens/Comment';

const StackAuth = createStackNavigator(
  {
    Auth: Auth
  }, { headerMode: 'none' })


//Login stack navigator
const StackLogin = createStackNavigator(
  {
    Login: Login,
    Register: Register,
    Step1: Step1,
    Step2: Step2,
    Step3: Step3
  }, { headerMode: 'none' })
//Home stack navigator
const StackHome = createStackNavigator(
  {
    Home: Home,
    AudioTest: AudioTest,
    Experiencia: Experiencia,
    Chat: Chat,
    ViewRoute: ViewRoute,
    ViewExperience: ViewExperience,
    UserProfile: UserProfile,
    ViewCategory: ViewCategory,
    Comment: Comment
  }, { headerMode: 'none' })
StackHome.navigationOptions = ({ navigation }) => {
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
    navigation.state.routes.map(route => {
      if (route.routeName == "Home" || route.routeName == "UserProfile") {
        tabBarVisible = true;
      } else {
        tabBarVisible = false;
      }
    });
  }

  return {
    tabBarVisible
  };
};

const StackSearch = createStackNavigator({
  SearchHome: Search,
  UserProfile: UserProfile,
  Chat: Chat,
  ViewRoute: ViewRoute,
  ViewExperience: ViewExperience,
  Comment: Comment
}, { headerMode: 'none' })
StackSearch.navigationOptions = ({ navigation }) => {
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
    navigation.state.routes.map(route => {
      if (route.routeName == "SearchHome" || route.routeName == "UserProfile") {
        tabBarVisible = true;
      } else {
        tabBarVisible = false;
      }
    });
  }

  return {
    tabBarVisible
  };
};

//Message stack navigator
const StackMessages = createStackNavigator({
  Messages: Messages,
  Chat: Chat

}, { headerMode: 'none' })

StackMessages.navigationOptions = ({ navigation }) => {
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
    navigation.state.routes.map(route => {
      if (route.routeName !== "Messages") {
        tabBarVisible = false;
      } else {
        tabBarVisible = true;
      }
    });
  }

  return {
    tabBarVisible
  };
};
//Profile stack navigator
const StackProfile = createStackNavigator({
  Profile: Profile,
  newRoute: Routes,
  AddDetails: AddDetails,
  AddPlace: AddPlace,
  LastPage: LastPage,
  newExperience: Experience,
  AddDetailExperience: AddDetailExperience,
  LastPageExperience: LastPageExperience,
  Route: ViewRoute,
  Experience: ViewExperience,
  Settings: Settings,
  AudioLibrary: AudioLibrary,
  EditProfile: EditProfile
}, { headerMode: 'none' })
StackProfile.navigationOptions = ({ navigation }) => {
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
    navigation.state.routes.map(route => {
      if (route.routeName !== "Profile") {
        tabBarVisible = false;
      } else {
        tabBarVisible = true;
      }
    });
  }

  return {
    tabBarVisible
  };
};



const TabHome = createBottomTabNavigator(

  {
    Home: {
      screen: StackHome,

    },
    Search: {
      screen: StackSearch,

    },
    Messages: {
      screen: StackMessages,

    },
    Profile: {
      screen: StackProfile,

    },
  },
  {
    tabBarComponent: ({ navigation }) => <Nav navigation={navigation} />,
    tabBarOptions: {
      removeClippedSubviews: true,
    },
  });


export default AppContainer = createAppContainer(createSwitchNavigator(
  {
    Login: StackLogin,
    App: TabHome,
    Auth: StackAuth
  },
  {
    initialRouteName: 'Auth'
  }
))
