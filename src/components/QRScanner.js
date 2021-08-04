import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, TouchableOpacity, Platform } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import QrReader from 'react-qr-reader'
import { Auth } from 'aws-amplify'
import { DataStore } from "@aws-amplify/datastore"
import { StoreProfile, GiftVoucher, UserVoucher, UserProfile } from '../models';

export default function QRScanner({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [isStore, setIsStore] = useState(false)

  useEffect(() => {
    (async () => {
      const user = await Auth.currentAuthenticatedUser();
      const username = user.signInUserSession.accessToken.payload.username.toLowerCase();
      const storeProfileQuery = await DataStore.query(StoreProfile, c => c.username('eq', username));
      if (storeProfileQuery.length > 0) {
        setIsStore(true)
      } else {
        setIsStore(false)
      }
    })();
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, [])
  

  const handleBarCodeScanned = async (data) => {
    if (!data) return
    if (isStore) {
      alert(`Bar code with data ${data} has been scanned!`)
      const userVouchers = await DataStore.query(UserVoucher, v => v.id('eq', data))
      if (userVouchers.length > 0) {
        try {
          const originalUserVoucher = userVouchers[0]
          if (originalUserVoucher.used) {
            alert('User voucher has already been used!')
          } else {
            await DataStore.save(
              UserVoucher.copyOf(originalUserVoucher, updated => {
                updated.used = true
              })
            )
            alert('Voucher has been used successfully')
          }
        } catch (error) {
          console.error(error);
          alert('An error occurred, please try again')
        }
      }
    } else {
      const giftVouchers = await DataStore.query(GiftVoucher, v => v.id('eq', data))
      if (giftVouchers.length > 0) {
        try {
          const moneyToAdd = giftVouchers[0].money
          const user = await Auth.currentAuthenticatedUser();
          const username = user.signInUserSession.accessToken.payload.username.toLowerCase();
          const users = await DataStore.query(UserProfile, c => c.username('eq', username))
          const originalUserProfile = users[0]
          await DataStore.save(
            UserProfile.copyOf(originalUserProfile, updated => {
              updated.money = originalUserProfile.money + moneyToAdd
            })
          )
          alert(`You have claimed a gift voucher of $${(Math.round(moneyToAdd / 100 * 100) / 100).toFixed(2)}`)
          navigation.navigate('UserVoucherListTab')
        } catch (error) {
          console.error(error)
          alert('An error occured, please try again')
        }
      }
    }
  };

  const handleBarCodeError = () => {
    alert('Error occurred')
  }

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      {
        Platform.OS === 'web' ? (
          <QrReader
            delay={100}
            onError={handleBarCodeError}
            onScan={handleBarCodeScanned}
            style={{ display: 'flex', alignSelf: 'center', width: 'min(100vw, 100vh)', height: 'min(100vw, 100vh)' }}
          />
        ) : (  
          <Camera
            style={styles.camera}
            type={type}
            onBarCodeScanned={(res) => handleBarCodeScanned(res.data)}
            barCodeScannerSettings={{
              barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
            }}
          >
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setType(
                    type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back
                  );
                }}>
                <Text style={styles.text}> Flip </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center'
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});
