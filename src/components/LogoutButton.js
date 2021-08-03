import React from 'react';
import { Auth } from 'aws-amplify'
import { TouchableOpacity, StyleSheet, Text } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function LogoutButton() {
    return <TouchableOpacity
        style={headerStyles.logoutButton}
        onPress={async () => await Auth.signOut({ global: true })}
    >
        <MaterialCommunityIcons
            name='logout'
            color='#003B70'
            size={30}
      />
    </TouchableOpacity>
}

const headerStyles = StyleSheet.create({
    logoutButton: {
        backgroundColor: 'transparent',
        marginLeft: 'auto',
        marginRight: 20,
        justifyContent: 'center',
        alignItems: 'center',
        width: 30,
        height: 30,
    },
})

export default LogoutButton;
