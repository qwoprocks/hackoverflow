import React, { useState, useEffect } from "react"

import { DataStore } from "@aws-amplify/datastore"
import { StoreVoucher, UserVoucher, UserProfile, StoreProfile } from "../models"
import { FlatList, StyleSheet, SafeAreaView, StatusBar, Text, Image, View, TouchableOpacity, Modal, Platform } from "react-native"
import { SearchBar } from "react-native-elements"
import { Auth } from 'aws-amplify'
import Loading from "./Loading"
import Header from "./Header"
import AccountBalance from "./AccountBalance";
import { useIsFocused } from "@react-navigation/native";
import AwesomeAlert from 'react-native-awesome-alerts';
import Dialog from "react-native-dialog";


export default function StoreVouchers(props) {

    const [isLoading, setIsLoading] = useState(true);
    const [storeVouchers, setStoreVouchers] = useState([]);
    const [isStore, setIsStore] = useState(false)
    const [accountBalance, setAccountBalance] = useState(0)
    const isFocused = useIsFocused();

    const [alertOptions, setAlertOptions] = useState({
        visible: false,
        shop: '',
        title: '',
        price: 0,
        handlePurchase: () => undefined,
        setShowDialog: () => undefined
    })

    async function getAccountBalance() {
        const user = await Auth.currentAuthenticatedUser();
        const username = user.signInUserSession.accessToken.payload.username.toLowerCase();
        const userProfileQuery = await DataStore.query(UserProfile, 
            c => c.username('eq', username));
        const userProfile = userProfileQuery[0];
        const userMoney = userProfile.money;
        setAccountBalance(userMoney);
    }

    useEffect(() => {
        if (isFocused) {
            getAccountBalance()
            getAllStoreVouchers()
        }
    }, [isFocused]);

    useEffect(() => {
      const getProfile = async () => {
        const user = await Auth.currentAuthenticatedUser();
        const username = user.username.toLowerCase();
        const storeProfileQuery = await DataStore.query(StoreProfile, c => c.username('eq', username))
        if (storeProfileQuery.length > 0) {
          setIsStore(true)
        } else {
          setIsStore(false)
        }
      }
      getProfile()
    }, [])

    async function getAllStoreVouchers() {
        const vouchers = await DataStore.query(StoreVoucher);
        setStoreVouchers(vouchers)
        setIsLoading(false)
    }

    return <>
        {isLoading
            ? <Loading />
            :
            <View style={{ flex: 1 }}>
                <StoreVoucherList 
                    storeVouchers={storeVouchers} 
                    navigation={props.navigation} 
                    isStore={isStore}
                    accountBalance={accountBalance}
                    handleBalance={setAccountBalance}
                    setAlertOptions={setAlertOptions}
                />
                <ConfirmationDialog 
                    alertOptions={alertOptions}
                />
            </View>
        }
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
    const [showWallet, setShowWallet] = useState(false)

    const filteredStoreVouchers = storeVouchers
        .filter(voucher => {
            const filterToLower = filter.toLowerCase()

            return voucher.shop.toLowerCase().includes(filterToLower)
                || voucher.title.toLowerCase().includes(filterToLower)
        })

    function renderVoucher({ item }) {
        return (
            <VoucherCard 
                voucher={item} 
                navigation={props.navigation}
                accountBalance={props.accountBalance}
                handleBalance={props.handleBalance}
                isStore={props.isStore}
                setAlertOptions={props.setAlertOptions}
            />
        )
    }

    return (
        <View style={voucherStyles.containerWithHeader}>
            <Header title="Store Vouchers" showWallet={showWallet} handleWallet={setShowWallet} isStore={props.isStore} />
            {!props.isStore && <AccountBalance
                accountBalance={props.accountBalance}
                showWallet={showWallet}
            />}
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

function ConfirmationDialog(props) {
    const [purchase, setPurchase] = useState(false)
    return (
        Platform.OS === 'web' ? (
            <AwesomeAlert
                show={props.alertOptions.visible}
                showProgress={false}
                animatedValue={0}
                useNativeDriver={true}
                title={props.alertOptions.shop + ' ' + props.alertOptions.title}
                message={`Do you want to purchase this item? \n You will be charged $${(props.alertOptions.price / 100).toFixed(2)}.`}
                messageStyle={{textAlign: 'center'}}
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={true}
                showCancelButton={true}
                showConfirmButton={true}
                cancelText="Cancel"
                confirmText="Purchase"
                confirmButtonColor="#DD6B55"
                contentContainerStyle={{ borderWidth: '1px', borderColor: 'black' }}
                overlayStyle={{ backgroundColor: 'transparent' }}
                onCancelPressed={() => {
                    props.alertOptions.setShowDialog(false)
                }}
                onConfirmPressed={() => {
                    props.alertOptions.setShowDialog(false)
                    setTimeout(() => props.alertOptions.handlePurchase(), 700);
                }}
            />
        ) : (
            <Dialog.Container 
                visible={props.alertOptions.visible} 
                onHide={() => {
                    if (purchase) {
                        props.alertOptions.handlePurchase()
                        setPurchase(false)
                    }
                }}
            >
                <Dialog.Title>{props.alertOptions.shop + ' ' + props.alertOptions.title}</Dialog.Title>
                <Dialog.Description>
                  Do you want to purchase this item? You will be charged $${(props.alertOptions.price / 100).toFixed(2)}.
                </Dialog.Description>
                <Dialog.Button label="Cancel" onPress={() => {props.alertOptions.setShowDialog(false)}} />
                <Dialog.Button 
                    label="Purchase" 
                    onPress={() => {
                        setPurchase(true)
                        props.alertOptions.setShowDialog(false)
                    }}
                />
            </Dialog.Container>
        )
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
    const [disabled, setDisabled] = useState(false);
    const { voucher } = props;

    useEffect(() => {
        if (props.accountBalance < voucher.price) {
            setDisabled(true)
        } else {
            setDisabled(false)
        }
    }, [props.accountBalance])

    async function purchaseVoucher() {
        try {
            const user = await Auth.currentAuthenticatedUser();
            const username = user.signInUserSession.accessToken.payload.username.toLowerCase();
            const userProfileQuery = await DataStore.query(UserProfile,
                c => c.username('eq', username));
            const userProfile = userProfileQuery[0];
            setInitialBalance(userProfile.money)
            props.handleBalance(userProfile.money - voucher.price)
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
            console.error("Error creating user voucher", e)
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
                ${(voucher.price / 100).toFixed(2)} Valid for {voucher.daysvalid} days
            </Text>
        </View>
        <View style={{ flex: 1 }} />
        {!props.isStore &&
            <TouchableOpacity
                style={voucherStyles.button}
                onPress={() => {
                    props.setAlertOptions({
                        visible: true,
                        shop: voucher.shop,
                        title: voucher.title,
                        price: voucher.price,
                        handlePurchase: purchaseVoucher,
                        setShowDialog: (visible) => {
                            props.setAlertOptions({
                                visible: visible,
                                shop: voucher.shop,
                                title: voucher.title,
                                price: voucher.price,
                                handlePurchase: purchaseVoucher,
                                setShowDialog: () => undefined,
                            })
                        }
                    })
                }}
                disabled={disabled}
            >
                <Image 
                    style={{
                        width: 50, 
                        height: 50,
                    }}
                    source={
                        disabled
                        ? require('../../assets/top-up.png')
                        : require('../../assets/buy.png')
                    }
                />
                
            </TouchableOpacity>
        }
        <TransactionCompleted
            modalVisible={modalVisible}
            handleDismiss={setModalVisible}
            shop={voucher.shop}
            price={voucher.price}
            initialBalance={initialBalance}
            currentBalance={props.accountBalance}
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
        resizeMode: 'contain',
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