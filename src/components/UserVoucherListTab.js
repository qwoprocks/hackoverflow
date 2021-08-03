import React from 'react';
import QRCode from 'react-native-qrcode-generator';
import { SafeAreaView, View, StatusBar, FlatList, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LogoutButton from './LogoutButton'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';

const DATA = [
  {
    id: 'id_1',
    timebought: '2021-08-02T17:30:30Z',
    timeused: null,
    used: false,
    title: '50% off',
    shop: 'McDonalds',
    image: 'https://1000logos.net/wp-content/uploads/2017/03/McDonalds-logo-800x450.png',
    daysvalid: 14
  },
  {
    id: 'id_2',
    timebought: '2021-08-02T17:30:30Z',
    timeused: null,
    used: false,
    title: '$50 off',
    shop: 'Burger King',
    image: 'https://1000logos.net/wp-content/uploads/2016/10/Burger-King_Logo.png',
    daysvalid: 14
  }
];

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

function UserVoucherList({ navigation }) {
  const renderVoucher = ({ item }) => (
    <Item
      logo={item.image}
      shop={item.shop}
      title={item.title}
      timebought={item.timebought}
      daysvalid={item.daysvalid}
      voucherId={item.id}
      navigation={navigation}
    />
  );

  return (
    <View style={styles.containerWithHeader}>
      <Header />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='dark-content' />
        <FlatList
          data={DATA}
          renderItem={renderVoucher}
          keyExtractor={voucher => voucher.id}
        />
      </SafeAreaView>
    </View>
  );
}

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
        component={UserVoucherList}
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