import React from 'react'
import {
    View, Text, Image
} from 'react-native'

const LoginHeader = () => {
    return (
        <View style={{ height: 180, marginTop: 80 }}>
            <Image
                source={require('../../assets/qr-code-scan.png')}
                style={{ width: 100, height: 100, alignSelf: 'center' }}
            />
            <Text
                style={{ textAlign: 'center', marginTop: 20, fontSize: 24, fontWeight: '600' }}
            >
                QRPay
            </Text>
        </View>
    );
}

export default LoginHeader