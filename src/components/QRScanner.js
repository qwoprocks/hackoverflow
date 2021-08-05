import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, TouchableOpacity, Platform } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import CameraFullScreen from './CameraFullScreen';
import QrReader from 'react-qr-reader'
import { Auth } from 'aws-amplify'
import { DataStore } from "@aws-amplify/datastore"
import { StoreProfile, GiftVoucher, UserVoucher, UserProfile } from '../models';
import { useIsFocused } from "@react-navigation/native";

export default function QRScanner({ navigation }) {
  const [aspectRatio, setAspectRatio] = useState('4:3')
  const [isStore, setIsStore] = useState(false)
  const [hasScanned, setHasScanned] = useState(false)
  const isFocused = useIsFocused()
  const [prevQR, setPrevQR] = useState('')

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
  }, [])

  const handleBarCodeScanned = async (data) => {
    if (!data || hasScanned || data === prevQR) return
    setPrevQR(data)
    setHasScanned(true)
    if (isStore) {
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
    setHasScanned(false)
  };

  const handleBarCodeError = () => {
    alert('Error occurred')
  }

  return (
    <>
      {
        Platform.OS === 'web' ? (
          <View style={styles.webcontainer}>
            {
              isFocused && <QrReader
                delay={100}
                onError={handleBarCodeError}
                onScan={handleBarCodeScanned}
                style={{ display: 'flex', alignSelf: 'center', width: 'min(100vw, 100vh)', height: 'min(100vw, 100vh)' }}
              />
            }
          </View>
        ) : (
          <View style={styles.appcontainer}>
            {
              isFocused && <CameraFullScreen
                onBarCodeScanned={(res) => (hasScanned || res.data === prevQR) ? undefined : handleBarCodeScanned(res.data)}
                barCodeScannerSettings={{
                  barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
                }}
              >
              </CameraFullScreen>
            }
          </View>
        )
      }
    </>
  );
}

const styles = StyleSheet.create({
  webcontainer: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center'
  },
  appcontainer: {
    flex: 1
  },
});
