import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function WalletButton(props) {
  return (
    <TouchableOpacity
      style={headerStyles.walletButton}
      onPress={() => { props.handleWallet(!props.showWallet); }}
    >
      <MaterialCommunityIcons
        name={props.showWallet ? 'wallet' : 'wallet-outline'}
        color="#003B70"
        size={30}
      />
    </TouchableOpacity>
  );
}

const headerStyles = StyleSheet.create({
  walletButton: {
    backgroundColor: 'transparent',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
  },
});

export default WalletButton;
