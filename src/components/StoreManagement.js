import { DataStore } from "@aws-amplify/datastore"
import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Text, SafeAreaView, StatusBar, Image, FlatList, TouchableOpacity } from "react-native";
import { StoreVoucher, UserVoucher, StoreProfile } from '../models';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Loading from './Loading';
import Header from "./Header";
import { NavigationContainer } from "@react-navigation/native";
import { TextInput } from "react-native-paper";

const USERNAME = "grab"

const Stack = createNativeStackNavigator();

export default function StoreManagement({ navigation }) {
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
            .filter(v => v.Voucher && v.Voucher.shop === storeProfile.shopname
            )
        setUserVouchers(userVouchers)

        setIsLoading(false)
    }

    function Profile() {
        return <Store openCreatePage={() => navigation.navigate("CreateVoucher")} profile={storeProfile} storeVouchers={storeVouchers} userVouchers={userVouchers} update={getAllVouchers} />
    }

    function Create() {
        return <CreateVoucher update={getAllVouchers} storeProfile={storeProfile} />
    }

    return <>
        {isLoading
            ? <Loading />
            :

            <Stack.Navigator
                style={{ flex: 1 }}
                initialRouteName='Profile'
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#FFF',
                    },
                    headerTitleStyle: {
                        color: '#000',
                        fontSize: 18,
                    },
                    headerBackTitle: 'Back',
                    headerTintColor: '#003B70',
                }}
            >
                <Stack.Screen
                    name='Profile'
                    component={Profile}
                    options={{
                        contentStyle: { flex: 1 },
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='CreateVoucher'
                    component={Create}
                />

            </Stack.Navigator>}
    </>
}

const createStyles = StyleSheet.create({
    container: {
        display: 'flex',
        marginHorizontal: 20,
        marginVertical: 20,
    },
    label: {
        fontSize: 20,
        color: "#003B70",
    },
    input: {
        borderRadius: 20,
    }
})

function CreateVoucher({ update, storeProfile }) {
    const [title, setTitle] = useState("")
    const [price, setPrice] = useState("")
    const [daysvalid, setValid] = useState("")
    const [expiry, setExpiry] = useState("")
    const [image, setImage] = useState("")

    async function createStoreVoucher() {
        const mock = new StoreVoucher({
            "daysvalid": 14,
            "expiry": "2021-08-14T23:59Z",
            "image": "https://i.pinimg.com/originals/8c/bf/a8/8cbfa8b08311fccc62a5558f4cc86ffe.png",
            "price": 900,
            "shop": "Grab",
            "storeprofileID": "ca73fab2-bf1d-4583-8c0f-eeaaa5ec7f4d",
            "title": "$10 Grab Voucher",
        })

        await DataStore.save(mock)

        await update()
    }

    function renderPreview() {
        try {

            const voucher = {
                title: title || "Your Title Here",
                price: price ? parseInt(price) : 1000,
                daysvalid: daysvalid ? parseInt(daysvalid) : 14,
                image: image || "https://i.stack.imgur.com/y9DpT.jpg",
                shop: storeProfile.shopname,
                storeprofileID: storeProfile.id,
                expiry: expiry ? new Date().setDate(new Date().getDate() + parseInt(expiry)) : new Date().toISOString()

            }

            return <VoucherCard voucher={voucher} />
        } catch (error) {
            <Text>Invalid fields</Text>
        }

    }

    return <View style={createStyles.container}>
        <Text style={createStyles.label}>Title</Text>
        <TextInput
            style={createStyles.input}
            value={title}
            onChangeText={setTitle} />
        <Text style={createStyles.label}>Price (in cents)</Text>
        <TextInput
            style={createStyles.input}
            value={price}
            onChangeText={setPrice} />
        <Text style={createStyles.label}>Days valid after purchase</Text>
        <TextInput
            style={createStyles.input}
            value={daysvalid}
            onChangeText={setValid} />
        <Text style={createStyles.label}>Days to expiry</Text>
        <TextInput
            style={createStyles.input}
            value={expiry}
            onChangeText={setExpiry} />
        <Text style={createStyles.label}>Image URL</Text>
        <TextInput
            style={createStyles.input}
            value={image}
            onChangeText={setImage} />
        {renderPreview()}
    </View>
}

const storeStyles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column'
    }
})

function Store(props) {

    return <View style={storeStyles.container}>
        <Header title="" />
        <StoreStats {...props} />
        <StatusBar barStyle='dark-content' />
        <StoreHeader update={props.update} openCreatePage={props.openCreatePage} />
        <SafeAreaView style={{ flex: 1 }}>
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

function StoreHeader({ openCreatePage }) {


    return <View style={voucherStyles.headingRow}>
        <Text style={voucherStyles.heading}>Vouchers</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={voucherStyles.addButton} onPress={openCreatePage}>
            <Text style={voucherStyles.addButtonText}>CREATE</Text>
            <MaterialCommunityIcons
                name='plus-thick'
                size={20}
                color="white"
            />
        </TouchableOpacity>
    </View>

}

function StoreVoucherList({ vouchers, update }) {

    function deleteVoucher(id) {
        return async () => {
            await DataStore.delete(StoreVoucher, id)
            update()
        }
    }
    function renderVoucher({ item }) {
        return <VoucherCard voucher={item} deleteVoucher={deleteVoucher(item.id)} />
    }

    return <FlatList
        data={vouchers}
        renderItem={renderVoucher}
        keyExtractor={(item) => item.id}
    />


}


function VoucherCard(props) {
    const { voucher, deleteVoucher } = props;

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

        {deleteVoucher && <TouchableOpacity onPress={deleteVoucher}>
            <MaterialCommunityIcons
                name='delete'
                size={40}
                color="#003B70"
            />
        </TouchableOpacity>}
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
    headingRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 14,
        marginHorizontal: 16,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',

    },
    addButton: {
        flexDirection: 'row',
        backgroundColor: '#003B70',
        borderRadius: 20,
        paddingHorizontal: 20,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 8
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

});