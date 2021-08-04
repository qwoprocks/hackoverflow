import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, TouchableOpacity, Platform } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import QrReader from 'react-qr-reader'


export default function QRScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  

  const handleBarCodeScanned = (data) => {
    if (!data) return
    alert(`Bar code with data ${data} has been scanned!`)
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
            delay={10}
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
