import React from 'react';
import { View, StyleSheet, Text } from "react-native";
import LogoutButton from "./LogoutButton";

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

export default function Header({ title }) {
    return (
        <View style={headerStyles.header}>
            <Text style={headerStyles.headerText}>
                {title}
            </Text>
            <LogoutButton />
        </View>
    );
}