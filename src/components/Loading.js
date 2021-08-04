import React from 'react'
import { View } from 'react-native'
import { ActivityIndicator } from "react-native-paper"

export default function Loading() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#003B70" />
        </View>
    );
}
