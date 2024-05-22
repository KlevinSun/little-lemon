import * as React from 'react';
import { TextInput, Text, StyleSheet, View, Image, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { CommonActions } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingView({ navigation }) {
    const [firstName, setFirstName] = React.useState('')
    const [email, setEmail] = React.useState('')

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    const isPressableEnable = firstName.trim() !== '' && isValidEmail(email)

    const login = (navigation) => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'Home' },
                ],
            })
        );
    };
      
    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}>

            <View style={styles.header}>
                <Image source={require('../img/Logo.png')} style={styles.image}/>
            </View>
            <View style={styles.bodyView}>
                <Text style={styles.message}>Let us get to know you</Text>
                <Text style={styles.title1}>First Name</Text>
                <TextInput 
                    style={styles.input1}
                    onChangeText={setFirstName}
                    value={firstName}/>
                <Text style={styles.title2}>Email</Text>
                <TextInput 
                    style={styles.input2}
                    keyboardType='email-address'
                    onChangeText={setEmail}
                    value={email}
                    autoCapitalize='none'/>
            </View>
            <Pressable 
                style={[styles.button, isPressableEnable ? {} : styles.buttonDisable]}
                onPress={() => {
                    (async ()=> {
                        try {
                            await AsyncStorage.setItem('@firstName', firstName)
                            await AsyncStorage.setItem('@email', email)
                            login(navigation)
                        } catch (e) {
                            Alert.alert(`An error occurred: ${e.message}`);
                        } 
                    })()
                }}
                disabled={!isPressableEnable}>
                <Text style={styles.buttonText}>Next</Text>
            </Pressable>
        </KeyboardAvoidingView>
    )
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
    },
    header: {
        flexDirection: 'row',  
        justifyContent: 'center', 
    },
    image: {
        width: 277.5,
        height: 60,
        marginVertical: 10,
    },
    bodyView: {
        flex: 0.6,
        alignItems: 'center', 
    },
    message: {
        fontSize: 22,
        color: '#495E57',
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 30,
    },
    title1: {
        fontSize: 26,
        color: '#495E57',
        textAlign: 'center',
        fontWeight: 'medium',
        marginTop: 120,
    },
    input1: {
        width: 280,
        height: 40,
        borderColor: '#495E57',
        borderWidth: 1.5,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginTop: 20,
    },
    title2: {
        fontSize: 26,
        color: '#495E57',
        textAlign: 'center',
        fontWeight: 'medium',
        marginTop: 20,
    },
    input2: {
        width: 280,
        height: 40,
        borderColor: '#495E57',
        borderWidth: 1.5,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginTop: 20,
    },
    button: {
        borderRadius: 10,
        position: 'absolute',
        bottom: 60,
        right: 30,
        backgroundColor: '#495E57',
        verticalAlign: 'bottom'
    },
    buttonDisable: {
        backgroundColor: 'gray'
    },
    buttonText: {
        fontSize: 22,
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        paddingHorizontal: 30,
        paddingVertical: 10,
    }
})