import React, { useState, useEffect } from 'react';
import QRCode from 'react-native-qrcode-generator';
import { SafeAreaView, View, StatusBar, FlatList, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { ActivityIndicator } from "react-native-paper"
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LogoutButton from './LogoutButton'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { Auth } from 'aws-amplify'
import { DataStore } from "@aws-amplify/datastore"
import { UserVoucher, UserProfile } from "../models"
import { useIsFocused } from "@react-navigation/native";
import { SearchBar } from "react-native-elements"

function UserVouchers({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userVouchers, setUserVouchers] = useState([]); 
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getAllUserVouchers();
    }
  }, [isFocused])

  async function getAllUserVouchers() {
    const user = await Auth.currentAuthenticatedUser();
    const username = user.signInUserSession.accessToken.payload.username;
    const userProfileQuery = await DataStore.query(UserProfile, 
        c => c.username('eq', username));
    const userProfile = userProfileQuery[0];
    const vouchers = await DataStore.query(UserVoucher,
      c => c.profileID('eq', userProfile.id).used('eq', false));
    setUserVouchers(vouchers)
    setIsLoading(false)
  }

  return ( 
    <>
      {isLoading
       ? <Loading />
       : <UserVoucherList userVouchers={userVouchers} navigation={navigation} />}
    </>
  );
}

function Loading() {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#003B70" />
    </View>
  );
}

function Header() {
  return(
    <View style={styles.header}>
      <Text style={styles.headerText}>
        My Vouchers
      </Text>
      <LogoutButton />
    </View>
  );
}

const Item = ({ logo, shop, title, timebought, daysvalid, voucherId, navigation }) => (
  <View style={[styles.container, styles.voucher, styles.shadowProp]}>
    <View style={styles.logo}>
      <Image
        style={styles.logo}
        source={{
          uri: logo,
        }}
      />
    </View>
    <View style={styles.content}>
      <Text style={styles.shop}>
        {shop}
      </Text>
      <Text style={styles.title}>
        {title}
      </Text>
      <Text style={styles.expiry}>
        {moment(timebought).add(daysvalid, 'd').diff(Date.now(), 'days')}D{' '}
        {moment(timebought).add(daysvalid, 'd').diff(Date.now(), 'hours')
          - (moment(timebought).add(daysvalid, 'd').diff(Date.now(), 'days') * 24)}H till expiry
      </Text>
    </View>
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate('Show QR Code', {
        voucherId: { voucherId }
      })}
    >
      <MaterialCommunityIcons
        name='qrcode'
        color='#003B70'
        size={65}
      />
    </TouchableOpacity>
  </View>
);

function UserVoucherList(props) {
  const { userVouchers } = props;
  const [filter, setFilter] = useState('')

  const filteredUserVouchers = userVouchers.filter(
    voucher => {
      const filterToLower = filter.toLowerCase()

      return (
        voucher.Voucher.shop.toLowerCase().includes(filterToLower)
        || voucher.Voucher.title.toLowerCase().includes(filterToLower)
      );
    }
  )

  const renderVoucher = ({ item }) => (
    <Item
      logo={item.Voucher.image}
      shop={item.Voucher.shop}
      title={item.Voucher.title}
      timebought={item.timebought}
      daysvalid={item.Voucher.daysvalid}
      voucherId={item.Voucher.id}
      navigation={props.navigation}
    />
  );

  return (
    <View style={styles.containerWithHeader}>
      <Header />
      <SearchBar
        value={filter}
        onChangeText={setFilter}
        containerStyle={searchBarStyles.container}
        inputContainerStyle={searchBarStyles.input}
        placeholder="Search..."
        lightTheme
      />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='dark-content' />
        <FlatList
          data={filteredUserVouchers}
          renderItem={renderVoucher}
          keyExtractor={voucher => voucher.id}
        />
      </SafeAreaView>
    </View>
  );
}

const searchBarStyles = StyleSheet.create({
  container: {
      flexDirection: "row",
      backgroundColor: "transparent",
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
  },
  input: {
      backgroundColor: "white",
      marginLeft: 10,
      marginRight: 10,
      paddingLeft: 10,
      borderRadius: 9999,
      color: 'black'
  }
})

function UserQRCode({ route, navigation }) {
  const { voucherId } = route.params;
  return (
    <View style={styles.qrContainer}>
      <QRCode size={250} value={voucherId.voucherId} />
    </View>
  )
}

const Stack = createNativeStackNavigator();



const UserVoucherListTab = () => {
  return (
    <Stack.Navigator
      initialRouteName='My Vouchers'
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFF',
        },
        headerTitleStyle: {
          color: '#000',
          fontSize: 18,
        },
        headerBackTitle: 'Back',
        headerTintColor: '#003B70',
      }}
    >
      <Stack.Screen
        name='My Vouchers'
        component={UserVouchers}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='Show QR Code'
        component={UserQRCode}
      />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 10,
    flexDirection: 'row',
    marginTop: 4,
  },
  containerWithHeader: {
    flex: 1,
    flexDirection: 'column'
  },
  header: {
    flexDirection: 'row',
    marginTop: 40,
    marginBottom: 10,
    marginLeft: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
  },
  voucher: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  shadowProp: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  logo: {
    width: 75,
    height: 75,
  },
  content: {
    marginLeft: 20,
  },
  shop: {
    fontSize: 18,
    fontWeight: '800',
  },
  title: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  expiry: {
    marginTop: 8,
    color: 'gray',
    fontSize: 14,
  },
  button: {
    marginLeft: 'auto',
    alignSelf: 'center',
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'white',
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default UserVoucherListTab;