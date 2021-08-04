import React from 'react';
import { View, StyleSheet, Text } from "react-native";
import LogoutButton from "./LogoutButton";
import WalletButton from "./WalletButton";

const headerStyles = StyleSheet.create({
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
})

export default function Header(props) {
    return (
        <View style={headerStyles.header}>
            <Text style={headerStyles.headerText}>
                {props.title}
            </Text>
            <View style={{flexDirection: 'row', marginLeft: 'auto'}}>
                <WalletButton showWallet={props.showWallet} handleWallet={props.handleWallet} />
                <LogoutButton />
            </View>
        </View>
    );
}