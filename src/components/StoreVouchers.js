import React, { useState, useEffect } from "react"

import { DataStore } from "@aws-amplify/datastore"
import { StoreVoucher, UserVoucher } from "../models"
import { screenOptions } from "./LogoutButton"
import { FlatList, StyleSheet, SafeAreaView, Text, Image, View, TouchableOpacity } from "react-native"
import { ActivityIndicator } from "react-native-paper"
import { SearchBar } from "react-native-elements"
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function StoreVouchers() {

    const [isLoading, setIsLoading] = useState(true);
    const [storeVouchers, setStoreVouchers] = useState([]);

    useEffect(() => {
        getAllStoreVouchers()
    }, [])

    async function getAllStoreVouchers() {
        const vouchers = await DataStore.query(StoreVoucher);
        setStoreVouchers(vouchers)
        setIsLoading(false)
    }

    function renderStoreVoucherPage() {
        return <StoreVoucherList storeVouchers={storeVouchers} />
    }
    return <>
        {isLoading
            ? <Loading />
            : <Stack.Navigator
                initialRouteName='Store Vouchers'
                screenOptions={screenOptions}
            >
                <Stack.Screen
                    name='Store Vouchers'
                    component={renderStoreVoucherPage}
                />

            </Stack.Navigator>}
    </>


}


function Loading() {
    return <View ><ActivityIndicator size="large" /></View>
}

const searchBarStyles = StyleSheet.create({
    container: {
        backgroundColor: "transparent",
        borderBottomColor: "transparent",
    },
    input: {
        backgroundColor: "white",
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 20
    }
})
function StoreVoucherList(props) {
    const { storeVouchers } = props;
    const [filter, setFilter] = useState("")

    const filteredStoreVouchers = storeVouchers
        .filter(voucher => {
            const filterToLower = filter.toLowerCase()

            return voucher.shop.toLowerCase().includes(filterToLower)
                || voucher.title.toLowerCase().includes(filterToLower)
        })

    function renderVoucher({ item }) {
        return <VoucherCard voucher={item} />
    }

    return <SafeAreaView>
        <SearchBar
            value={filter}
            onChangeText={setFilter}
            containerStyle={searchBarStyles.container}
            inputContainerStyle={searchBarStyles.input}
            placeholder="Search..."
            lightTheme

        />
        <FlatList
            data={filteredStoreVouchers}
            renderItem={renderVoucher}
            keyExtractor={(item) => item.id}
        />
    </SafeAreaView>
}


function VoucherCard(props) {
    const { voucher } = props;

    async function purchaseVoucher() {
        try {
            const result = await DataStore.save(new UserVoucher({
                Voucher: voucher,
                timebought: new Date().toISOString(),
                used: false,

            }))
            console.log("saved", result)
        } catch (e) {
            console.log("Error creating user voucher", e)
        }

    }

    return <View style={[voucherStyles.container, voucherStyles.voucher, voucherStyles.shadowProp]}>
        <View style={voucherStyles.logo}>
            <Image
                style={voucherStyles.logo}
                source={{
                    uri: voucher.image,
                }}
            />
        </View>
        <View style={voucherStyles.content}>
            <Text style={voucherStyles.shop}>
                {voucher.shop}
            </Text>
            <Text style={voucherStyles.title}>
                {voucher.title}
            </Text>
            <Text style={voucherStyles.price}>
                ${(voucher.price / 100).toFixed(2)}
            </Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={voucherStyles.button} onPress={purchaseVoucher}>
            <Text style={voucherStyles.buttonLabel}>Buy</Text>
        </TouchableOpacity>
    </View>
}

const voucherStyles = StyleSheet.create({
    container: {
        display: "flex",
        flex: 1,
        flexDirection: 'row',
        marginTop: 4,
    },
    voucher: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        marginVertical: 4,
        marginHorizontal: 16,
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
        color: 'gray',
        fontSize: 14,
    },
    button: {
        backgroundColor: "#003B70",
        borderRadius: 10,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
        elevation: 5,
    },
    buttonLabel: {
        color: "white",
        fontSize: 16,
        fontWeight: '700',
    }
});