import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Collapsible from 'react-native-collapsible';

function AccountBalance(props) {
    const money = props.accountBalance
  
    return (
      <Collapsible collapsed={!props.showWallet}>
        <View style={accountStyles.container}>
          <Text style={accountStyles.header}>My Wallet </Text>
          <View style={{flexDirection: 'row'}}>
            <Text style={{marginTop: 4}}>$</Text>
            <Text style={accountStyles.money}>
              {(money / 100).toFixed(2)}
            </Text>
          </View>
        </View>
      </Collapsible>
    )
}

const accountStyles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D9261C',
    marginBottom: 4,
  },
  money: {
    fontSize: 28,
    fontWeight: '700',
    marginLeft: 4,
  }
})

export default AccountBalance;