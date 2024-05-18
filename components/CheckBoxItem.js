import * as React from 'react';
import {View, Text, StyleSheet, Pressable, Image} from 'react-native'

export default function CheckBoxItem(props) {
    return (
        <View style={styles.container}>
            <Pressable 
                style={props.checked ? styles.checkBoxSelected : styles.checkBoxUnselected}
                onPress={()=>{
                    props.setChecked(!props.checked)
                }}>
                {props.checked && (
                    <Image source={require('../img/check_mark.png')} style={styles.checkMark}/>
                )}
            </Pressable>
            <Text style={styles.itemLabel}>{props.text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 5,
        flexDirection: 'row',
        alignItems: 'center'
    },
    checkBoxSelected: {
        width: 20, 
        height: 20,
        borderRadius: 3,
        backgroundColor: '#495E57'
    },
    checkBoxUnselected: {
        width: 20, 
        height: 20,
        borderRadius: 3,
        borderColor: '#495E57',
        borderWidth: 1,
    },
    checkMark: {
        width: 20, 
        height: 20,
        alignSelf: 'center',
    },
    itemLabel: {
        fontWeight:'bold',
        color: 'gray',
        fontSize: 12,
        paddingLeft: 20,
    }
})