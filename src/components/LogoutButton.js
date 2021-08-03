import React from 'react';
import { Auth } from 'aws-amplify'
import { TouchableOpacity, StyleSheet, Text } from 'react-native'


const headerStyles = StyleSheet.create({
    logoutButton: {
        borderRadius: 10,
        borderColor: 'white',
        borderWidth: 2,
        borderStyle: 'solid',
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 30,
        marginRight: 16,
    },
    logoutButtonText: {
        color: 'white',
    }
})

function LogoutButton() {
    return <TouchableOpacity
        style={headerStyles.logoutButton}
        onPress={async () => await Auth.signOut({ global: true })}
    >
        <Text style={headerStyles.logoutButtonText}>Logout</Text>
    </TouchableOpacity>
}

export const screenOptions = {
    headerRight: () => <LogoutButton />,
    headerBackTitle: 'Back',
    headerTintColor: '#FFF',
    headerStyle: {
        backgroundColor: '#003B70',
    },
    headerTitleStyle: {
        color: '#FFF',
    },
}
