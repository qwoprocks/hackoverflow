import { DataStore } from '@aws-amplify/datastore';
import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, SafeAreaView, StatusBar, Image, FlatList, TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Input } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { Auth } from 'aws-amplify';
import moment from 'moment';
import Header from './Header';
import Loading from './Loading';
import { StoreVoucher, UserVoucher, StoreProfile } from '../models';

const Stack = createNativeStackNavigator();

export default function StoreManagement({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [storeProfile, setStoreProfile] = useState();
  const [storeVouchers, setStoreVouchers] = useState([]);
  const [userVouchers, setUserVouchers] = useState([]);

  useEffect(() => {
    getAllVouchers();
  }, []);

  async function getAllVouchers() {
    const user = await Auth.currentAuthenticatedUser();
    const { username } = user.signInUserSession.accessToken.payload;
    const storeProfileQuery = await DataStore.query(StoreProfile,
      (c) => c.username('eq', username));
    const storeProfile = storeProfileQuery[0];
    setStoreProfile(storeProfile);

    const storeVouchers = await DataStore.query(StoreVoucher,
      (v) => v.shop('eq', storeProfile.shopname));
    setStoreVouchers(storeVouchers);

    const userVouchers = (await DataStore.query(UserVoucher))
      .filter((v) => v.Voucher && v.Voucher.shop === storeProfile.shopname);
    setUserVouchers(userVouchers);

    setIsLoading(false);
  }

  function Profile() {
    return <Store openCreatePage={() => navigation.navigate('Create Voucher')} profile={storeProfile} storeVouchers={storeVouchers} userVouchers={userVouchers} update={getAllVouchers} />;
  }

  function Create(props) {
    return <CreateVoucher {...props} update={getAllVouchers} storeProfile={storeProfile} />;
  }

  return (
    <>
      {isLoading
        ? <Loading />
        : (
          <Stack.Navigator
            style={{ flex: 1 }}
            initialRouteName="Profile"
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
              name="Profile"
              component={Profile}
              options={{
                contentStyle: { flex: 1 },
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Create Voucher"
              component={Create}
            />

          </Stack.Navigator>
        )}
    </>
  );
}

const createStyles = StyleSheet.create({
  container: {
    display: 'flex',
    marginHorizontal: 20,
    marginVertical: 20,

  },
  label: {
    fontSize: 20,
    color: '#003B70',
    fontWeight: 'bold',
    marginVertical: 5,
    marginLeft: 12,
  },
  button: {
    height: 40,
    backgroundColor: '#003B70',
    borderRadius: 20,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

function CreateVoucher({ update, storeProfile, navigation }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [daysvalid, setValid] = useState('');
  const [expiry, setExpiry] = useState('');
  const [image, setImage] = useState('');

  const [error, setError] = useState('');

  async function createStoreVoucher() {
    if (!title || !price || !daysvalid || !expiry) {
      setError('Missing fields');
      return;
    }

    if (Number.isNaN(parseInt(price, 10))) {
      setError('Price must be a number');
      return;
    }

    if (Number.isNaN(parseInt(daysvalid, 10))) {
      setError('Days Valid must be a number');
      return;
    }

    if (Number.isNaN(parseInt(expiry, 10))) {
      setError('Expiry must be a number');
      return;
    }

    const date = new Date();
    date.setDate(date.getDate() + parseInt(expiry, 10));

    const voucher = new StoreVoucher({
      title,
      price: parseInt(price, 10),
      daysvalid: parseInt(daysvalid, 10),
      image: image || 'https://i.stack.imgur.com/y9DpT.jpg',
      shop: storeProfile.shopname,
      storeprofileID: storeProfile.id,
      expiry: date.toISOString(),

    });

    await DataStore.save(voucher);

    await update();
    navigation.pop();
  }

  function renderPreview() {
    try {
      const voucher = {
        title: title || 'Your Title Here',
        price: price ? parseInt(price, 10) : 1000,
        daysvalid: daysvalid ? parseInt(daysvalid, 10) : 14,
        image: image || 'https://i.stack.imgur.com/y9DpT.jpg',
        shop: storeProfile.shopname,
        storeprofileID: storeProfile.id,
        expiry: expiry
          ? new Date().setDate(new Date().getDate() + parseInt(expiry, 10))
          : new Date().toISOString(),

      };

      return <VoucherCard voucher={voucher} />;
    } catch (error) {
      return <Text>Invalid fields</Text>;
    }
  }

  return (
    <ScrollView style={createStyles.container}>
      <Text style={createStyles.label}>Title</Text>
      <Input
        style={createStyles.input}
        value={title}
        onChangeText={setTitle}
      />
      <Text style={createStyles.label}>Price (in cents)</Text>
      <Input
        style={createStyles.input}
        value={price}
        onChangeText={setPrice}
      />
      <Text style={createStyles.label}>Days valid after purchase</Text>
      <Input
        style={createStyles.input}
        value={daysvalid}
        onChangeText={setValid}
      />
      <Text style={createStyles.label}>Days to expiry</Text>
      <Input
        style={createStyles.input}
        value={expiry}
        onChangeText={setExpiry}
      />
      <Text style={createStyles.label}>Image URL</Text>
      <Input
        style={createStyles.input}
        value={image}
        onChangeText={setImage}
      />
      {renderPreview()}
      <TouchableOpacity onPress={createStoreVoucher} style={createStyles.button}>
        <Text style={createStyles.buttonText}>Create</Text>
      </TouchableOpacity>
      <View style={createStyles.errorContainer}>
        <Text style={createStyles.error}>{error}</Text>
      </View>

    </ScrollView>
  );
}

const storeStyles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
});

function Store(props) {
  return (
    <View style={storeStyles.container}>
      <Header title="" isStore />
      <StoreStats {...props} />
      <StatusBar barStyle="dark-content" />
      <StoreHeader update={props.update} openCreatePage={props.openCreatePage} />
      <SafeAreaView style={{ flex: 1 }}>
        <StoreVoucherList update={props.update} vouchers={props.storeVouchers} />
      </SafeAreaView>
    </View>
  );
}

const statsStyle = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'transparent',
    height: 220,
  },
  profile: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHolder: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 90,
    width: 90,
    borderRadius: 100,
    borderColor: 'black',
    borderWidth: 2,
  },
  avatar: {
    height: 75,
    width: 75,
    resizeMode: 'contain',

  },
  shopName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
  },
  username: {
    fontSize: 18,
  },
  statsRow: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

function StoreStats({ profile, userVouchers, storeVouchers }) {
  const moneyEarned = userVouchers.reduce((acc, curr) => acc + curr.Voucher.price, 0);
  const vouchers = storeVouchers.length;
  const voucherWithImage = storeVouchers.find((v) => v.image) || {};
  const { image } = voucherWithImage;

  return (
    <View style={statsStyle.container}>
      <View style={statsStyle.profile}>
        <View style={statsStyle.avatarHolder}>
          <Image
            style={statsStyle.avatar}
            source={{
              uri: image,
            }}
          />
        </View>
        <Text style={statsStyle.shopName}>{profile.shopname}</Text>
        <Text style={statsStyle.username}>
          @
          {profile.username}
        </Text>
      </View>
      <View style={statsStyle.statsRow}>
        <Stat value={`$${(moneyEarned / 100).toFixed(2)}`} desc="Revenue" />
        <Stat value={vouchers} desc={vouchers === 1 ? 'Voucher' : 'Vouchers'} />
      </View>
    </View>
  );
}

const singleStatStyle = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  desc: {
    fontSize: 18,
  },
});

function Stat({ desc, value }) {
  return (
    <View style={singleStatStyle.container}>
      <Text style={singleStatStyle.value}>{value}</Text>
      <Text style={singleStatStyle.desc}>{desc}</Text>
    </View>
  );
}

function StoreHeader({ openCreatePage }) {
  return (
    <View style={voucherStyles.headingRow}>
      <View style={{ display: 'flex', paddingHorizontal: 25, visibility: 'hidden' }} />
      <Text style={voucherStyles.heading}>Vouchers</Text>
      <TouchableOpacity style={voucherStyles.addButton} onPress={openCreatePage}>
        <MaterialCommunityIcons
          name="plus-thick"
          size={20}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
}

function StoreVoucherList({ vouchers, update }) {
  function deleteVoucher(id) {
    return async () => {
      await DataStore.delete(StoreVoucher, id);
      update();
    };
  }
  function renderVoucher({ item }) {
    return <VoucherCard voucher={item} deleteVoucher={deleteVoucher(item.id)} />;
  }

  return (
    <FlatList
      data={vouchers}
      renderItem={renderVoucher}
      keyExtractor={(item) => item.id}
    />
  );
}

function VoucherCard(props) {
  const { voucher, deleteVoucher } = props;

  return (
    <View style={[voucherStyles.container, voucherStyles.voucher, voucherStyles.shadowProp]}>

      <Image
        style={voucherStyles.logo}
        source={{
          uri: voucher.image,
        }}
      />

      <View style={voucherStyles.content}>
        <Text style={voucherStyles.shop}>
          {voucher.shop}
        </Text>
        <Text style={voucherStyles.title}>
          {voucher.title}
        </Text>
        <Text style={voucherStyles.price}>
          $
          {(voucher.price / 100).toFixed(2)}
          {' '}
          Valid for
          {' '}
          {voucher.daysvalid}
          {' '}
          days
        </Text>
        <Text style={voucherStyles.expiry}>
          Expires:
          {' '}
          {moment(new Date(voucher.expiry)).format('D/M/YY')}
        </Text>
      </View>
      <View style={{ flex: 1 }} />

      {deleteVoucher && (
      <TouchableOpacity onPress={deleteVoucher}>
        <MaterialCommunityIcons
          name="delete"
          size={40}
          color="#003B70"
        />
      </TouchableOpacity>
      )}
    </View>
  );
}

const voucherStyles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 15,
    marginHorizontal: 20,
  },
  heading: {
    display: 'flex',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    display: 'flex',
    backgroundColor: '#003B70',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucher: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginVertical: 4,
    marginHorizontal: 20,
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
    resizeMode: 'contain',
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
  price: {
    marginTop: 8,
    marginBottom: 4,
    color: 'gray',
    fontSize: 14,
  },
  expiry: {
    color: 'gray',
    fontSize: 14,
  },
  button: {
    marginLeft: 'auto',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: 70,
    height: 70,
    borderRadius: 10,
  },

});
