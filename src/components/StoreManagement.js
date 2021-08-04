import { DataStore } from "@aws-amplify/datastore"
import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Text, SafeAreaView, StatusBar, Image, FlatList } from "react-native";
import { StoreVoucher, UserVoucher, StoreProfile } from '../models';
import Loading from './Loading';
import Header from "./Header";

const USERNAME = "grab"

export default function StoreManagement() {
    const [isLoading, setIsLoading] = useState(true);
    const [storeProfile, setStoreProfile] = useState();
    const [storeVouchers, setStoreVouchers] = useState([]);
    const [userVouchers, setUserVouchers] = useState([]);

    useEffect(() => {
        getAllVouchers()
    }, [])

    async function getAllVouchers() {
        // const user = await Auth.currentAuthenticatedUser();
        // const username = user.signInUserSession.accessToken.payload.username;
        const storeProfileQuery = await DataStore.query(StoreProfile,
            c => c.username('eq', USERNAME));
        const storeProfile = storeProfileQuery[0]
        setStoreProfile(storeProfile)

        const storeVouchers = await DataStore.query(StoreVoucher,
            v => v.shop('eq', storeProfile.shopname));
        setStoreVouchers(storeVouchers)

        const userVouchers = (await DataStore.query(UserVoucher))
            .filter(v => v.Voucher.shop === storeProfile.shopname)
        setUserVouchers(userVouchers)

        setIsLoading(false)
    }

    return <>
        {isLoading
            ? <Loading />
            : <Store profile={storeProfile} storeVouchers={storeVouchers} userVouchers={userVouchers} />}
    </>
}

const storeStyles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column'
    }
})

function Store(props) {

    return <View style={storeStyles.container}>
        <Header title="" />
        <SafeAreaView >
            <StoreStats {...props} />
            <StatusBar barStyle='dark-content' />
            <StoreVoucherList vouchers={props.storeVouchers} />
        </SafeAreaView>
    </View>

}

const statsStyle = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: "transparent",
        height: 240,
    },
    profile: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatar: {
        height: 90,
        width: 90,
        borderRadius: 100,
        borderColor: 'black',
        borderWidth: 2,
        borderStyle: 'solid'
    },
    shopName: {
        fontSize: 32,
        fontWeight: 'bold'
    },
    username: {
        fontSize: 18,
    },
    statsRow: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: "space-around",
    }
})

function StoreStats({ profile, userVouchers, storeVouchers }) {
    const moneyEarned = userVouchers.reduce((acc, curr) => acc + curr.Voucher.price, 0)
    const vouchers = storeVouchers.length
    const voucherWithImage = storeVouchers.find(v => v.image) || {}
    const image = voucherWithImage.image

    return <View style={statsStyle.container}>
        <View style={statsStyle.profile}>
            <Image
                style={statsStyle.avatar}
                source={{
                    uri: image
                }} />
            <Text style={statsStyle.shopName}>{profile.shopname}</Text>
            <Text style={statsStyle.username}>@{profile.username}</Text>
        </View>
        <View style={statsStyle.statsRow}>
            <Stat value={`$${(moneyEarned / 100).toFixed(2)}`} desc="Revenue" />
            <Stat value={vouchers} desc="Vouchers" />
        </View>
    </View>
}

const singleStatStyle = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    value: {
        fontWeight: 'bold',
        fontSize: 24
    },
    desc: {
        fontSize: 18,
    }
})

function Stat({ desc, value }) {
    return <View style={singleStatStyle.container}>
        <Text style={singleStatStyle.value}>{value}</Text>
        <Text style={singleStatStyle.desc}>{desc}</Text>
    </View>
}

function StoreVoucherList({ vouchers }) {

    function renderVoucher({ item }) {
        return <VoucherCard voucher={item} />
    }

    return <View>
        <Text style={voucherStyles.heading}>Vouchers</Text>
        <FlatList
            data={vouchers}
            renderItem={renderVoucher}
            keyExtractor={(item) => item.id}
        />
    </View>
}


function VoucherCard(props) {
    const { voucher } = props;
    return <View style={[voucherStyles.container, voucherStyles.voucher, voucherStyles.shadowProp]}>

        <Image
            style={voucherStyles.logo}
            source={{
                uri: voucher.image,
            }}
        />

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
            <Text style={voucherStyles.expiry}>
                Expires: {new Date(voucher.expiry).toLocaleDateString()}
            </Text>
        </View>
        <View style={{ flex: 1 }} />
    </View>
}

const voucherStyles = StyleSheet.create({
    container: {
        display: "flex",
        flex: 1,
        flexDirection: 'row',
        marginTop: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 14,
        marginHorizontal: 16,
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
    expiry: {
        color: 'gray',
        fontSize: 14
    }

});