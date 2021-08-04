import React, { useState, useEffect } from "react"

import { DataStore } from "@aws-amplify/datastore"
import { StoreVoucher, UserVoucher, UserProfile } from "../models"
import { FlatList, StyleSheet, SafeAreaView, StatusBar, Text, Image, View, TouchableOpacity, Modal } from "react-native"
import { SearchBar } from "react-native-elements"
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Auth } from 'aws-amplify'
import Loading from "./Loading"
import Header from "./Header"


export default function StoreVouchers({ navigation }) {

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

    return <>
        {isLoading
            ? <Loading />
            : <StoreVoucherList storeVouchers={storeVouchers} navigation={navigation} />}
    </>


}

const searchBarStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: "transparent",
        borderTopColor: "transparent",
        borderBottomColor: "transparent",
    },
    input: {
        backgroundColor: "white",
        marginLeft: 10,
        marginRight: 10,
        paddingLeft: 10,
        borderRadius: 9999,
        color: 'black'
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
        return <VoucherCard voucher={item} navigation={props.navigation} />
    }

    return (
        <View style={voucherStyles.containerWithHeader}>
            <Header title="Store Vouchers" />
            <SearchBar
                value={filter}
                onChangeText={setFilter}
                containerStyle={searchBarStyles.container}
                inputContainerStyle={searchBarStyles.input}
                placeholder="Search..."
                lightTheme
            />
            <SafeAreaView style={voucherStyles.container}>
                <StatusBar barStyle='dark-content' />
                <FlatList
                    data={filteredStoreVouchers}
                    renderItem={renderVoucher}
                    keyExtractor={(item) => item.id}
                />
            </SafeAreaView>
        </View>
    );
}

function TransactionCompleted(props) {
    return (
        <Modal
            animationType='fade'
            visible={props.modalVisible}
        >
            <View style={voucherStyles.modalView}>
                <Text style={voucherStyles.modalHeader}>
                    Transaction Complete
                </Text>
                <Image
                    style={voucherStyles.modalLogo}
                    source={require('../../assets/handshake.png')}
                />
                <Text style={{ marginBottom: 40 }}>
                    Thank you for shopping with {props.shop}
                </Text>
                <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                    <Text style={{ flex: 1, textAlign: 'right', fontWeight: '600' }}>
                        Initial balance:
                    </Text>
                    <Text style={{ flex: 1, textAlign: 'left', paddingLeft: 20 }}>
                        ${(props.initialBalance / 100).toFixed(2)}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                    <Text style={{ flex: 1, textAlign: 'right', fontWeight: '600' }}>
                        Voucher price:
                    </Text>
                    <Text style={{ flex: 1, textAlign: 'left', paddingLeft: 20 }}>
                        -${(props.price / 100).toFixed(2)}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 40 }}>
                    <Text style={{ flex: 1, textAlign: 'right', fontWeight: '600' }}>
                        Current balance:
                    </Text>
                    <Text style={{ flex: 1, textAlign: 'left', paddingLeft: 20 }}>
                        ${(props.currentBalance / 100).toFixed(2)}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => props.handleDismiss(false)}
                    style={voucherStyles.modalButton}
                >
                    <Text style={voucherStyles.modalButtonText}>
                        Continue Shopping
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        props.navigation.navigate('UserVoucherListTab')
                        props.handleDismiss(false)
                    }}
                >
                    <Text>
                        Go to My Vouchers
                    </Text>
                </TouchableOpacity>
            </View>
        </Modal>
    )
}


function VoucherCard(props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [initialBalance, setInitialBalance] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(0);
    const { voucher } = props;
    async function purchaseVoucher() {
        try {
            const user = await Auth.currentAuthenticatedUser();
            const username = user.signInUserSession.accessToken.payload.username;
            const userProfileQuery = await DataStore.query(UserProfile,
                c => c.username('eq', username));
            const userProfile = userProfileQuery[0];
            setInitialBalance(userProfile.money)
            setCurrentBalance(userProfile.money - voucher.price)
            await DataStore.save(
                UserProfile.copyOf(userProfile, updated => {
                    updated.money = userProfile.money - voucher.price;
                })
            );
            const result = await DataStore.save(new UserVoucher({
                Voucher: voucher,
                timebought: new Date().toISOString(),
                used: false,
                profileID: userProfile.id
            }));
            setModalVisible(true);
            console.log("saved", result);
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
                ${(voucher.price / 100).toFixed(2)} ({voucher.daysvalid}D)
            </Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
            style={voucherStyles.button}
            onPress={purchaseVoucher}
        >
            <MaterialCommunityIcons
                name='cart-arrow-down'
                color='#003B70'
                size={50}
            />
        </TouchableOpacity>
        <TransactionCompleted
            modalVisible={modalVisible}
            handleDismiss={setModalVisible}
            shop={voucher.shop}
            price={voucher.price}
            initialBalance={initialBalance}
            currentBalance={currentBalance}
            navigation={props.navigation}
        />
    </View>
}

const voucherStyles = StyleSheet.create({
    container: {
        display: "flex",
        flex: 1,
        flexDirection: 'row',
        marginTop: 4,
    },
    containerWithHeader: {
        flex: 1,
        flexDirection: 'column'
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
        marginLeft: 'auto',
        alignSelf: 'center',
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'white',
        width: 70,
        height: 70,
        borderRadius: 10,
    },
    modalView: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
    },
    modalHeader: {
        marginTop: 120,
        marginBottom: 40,
        fontSize: 24,
        fontWeight: '600',
    },
    modalLogo: {
        width: 200,
        height: 200,
    },
    modalButton: {
        backgroundColor: '#003B70',
        width: 240,
        height: 40,
        borderRadius: 9999,
        marginBottom: 20,
    },
    modalButtonText: {
        color: '#FFF',
        textAlign: 'center',
        lineHeight: 40,
    }
});