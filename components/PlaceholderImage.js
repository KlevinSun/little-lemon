import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlaceholderImage = ({ firstName, lastName }) => {
  const firstLetter = firstName ? firstName[0].toUpperCase() : '';
  const secondLetter = lastName ? lastName[0].toUpperCase() : '';

  return (
    <View style={styles.container}>
      <Text style={styles.initials}>{`${firstLetter}${secondLetter}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dedede',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontSize: 35,
  }
});

export default PlaceholderImage;
