import React from 'react';
import QRCode from 'react-native-qrcode-generator';
import { SafeAreaView, View, FlatList, StyleSheet, Text, Image, Pressable } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import moment from 'moment';

const qrIcon = require('../../assets/qr-code.png');

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
    <Pressable
      style={[styles.button, styles.shadowProp]}
      borderRadius={10}
      onPress={() => navigation.navigate('Show QR Code', {
        voucherId: { voucherId }
      })}
    >
      <Image source={qrIcon} style={styles.icon} />
    </Pressable>
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
    <SafeAreaView style={styles.container}>
      <FlatList
        data={DATA}
        renderItem={renderVoucher}
        keyExtractor={voucher => voucher.id}
      />
    </SafeAreaView>
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

function UserVoucherListTab() {
  return (
    <Stack.Navigator
      initialRouteName='My Vouchers'
      screenOptions={{
        headerBackTitle: 'Back',
        headerTintColor: '#FFF',
        headerStyle: {
          backgroundColor: '#003B70',
        },
        headerTitleStyle: {
          color: '#FFF',
        },
      }}
    >
      <Stack.Screen
        name='My Vouchers'
        component={UserVoucherList}
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
    flex: 1,
    flexDirection: 'row',
    marginTop: 4,
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
  icon: {
    width: 45,
    height: 45,
  },
  button: {
    marginLeft: 'auto',
    alignSelf: 'center',
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'white',
    width: 70,
    height: 70,
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default UserVoucherListTab;