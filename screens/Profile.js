import * as React from 'react';
import {
    View,
    Text, 
    StyleSheet, 
    KeyboardAvoidingView, 
    Pressable, 
    Platform, 
    Image, 
    TextInput, 
    Alert, 
    ScrollView } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { MaskedTextInput, mask } from "react-native-mask-text";
import { CommonActions } from '@react-navigation/native'
import CheckBoxItem from '../components/CheckBoxItem'
import PlaceholderImage from '../components/PlaceholderImage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profile({ navigation }) {
    const [avatar, setAvatar] = React.useState(null)
    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [phone, setPhone] = React.useState('')

    const [orderStatus, setOrderStatues] = React.useState(true)
    const [passwordChange, setPasswordChange] = React.useState(true)
    const [specialOffer, setSpecialOffer] = React.useState(true)
    const [newsletter, setNewsletter] = React.useState(true)

    const logout = (navigation) => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'OnboardingView' },
                ],
            })
        );
    };

    React.useEffect(() => {
        (async ()=>{
          try {
            const avatar = await AsyncStorage.getItem('@avatar')
            const email = await AsyncStorage.getItem('@email')
            const lastName = await AsyncStorage.getItem('@lastName')
            const firstName = await AsyncStorage.getItem('@firstName')
            const phone = await AsyncStorage.getItem('@phone')
            const orderStatus = await AsyncStorage.getItem('@orderStatus')
            const passwordChange = await AsyncStorage.getItem('@passwordChange')
            const specialOffer = await AsyncStorage.getItem('@specialOffer')
            const newsletter = await AsyncStorage.getItem('@newsletter')
            
            setAvatar(avatar)
            setEmail(email)
            setLastName(lastName)
            setFirstName(firstName)
            setPhone(phone)
            {orderStatus !== null ? (setOrderStatues(orderStatus === "true")) : (setOrderStatues(true))}
            {passwordChange !== null ? (setPasswordChange(passwordChange === "true")) : (setPasswordChange(true))}
            {specialOffer !== null ? (setSpecialOffer(specialOffer === "true")) : (setSpecialOffer(true))}
            {newsletter !== null ? (setNewsletter(newsletter === "true")) : (setNewsletter(true))}
            console.log('name:', firstName, "email:", email, "phone:", phone)
          } catch (e) {
            Alert.alert(`An error occurred: ${e.message}`);
          }
        })();
      }, [])

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert("We need the image library permission granted");
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        })
        setAvatar(result.assets[0].uri)
    }   

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <View style={styles.headerView}>
                    <Pressable style={styles.backButton}
                        onPress={() => {
                            navigation.goBack()
                        }}>
                        <Image source={require('../img/back.png')} style={styles.backButton} />
                    </Pressable>
                    <Image source={require('../img/Logo.png')} style={styles.logo}/>
                    <View style={styles.profileAvatar}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.profileAvatar} />
                        ) : (
                            <PlaceholderImage firstName={firstName} lastName={lastName} />
                        )}
                    </View>
                </View>
                <ScrollView 
                    style={styles.body}
                    keyboardShouldPersistTaps='handled'
                    contentContainerStyle={styles.contentContainer}>
                    <Text style={styles.mainTitle}>Personal information</Text>
                    <Text style={styles.prompt}>Avatar</Text>
                    <View style={styles.avatarSetter}>
                        <View style={styles.avatar}>
                            {avatar ? (
                                <Image source={{ uri: avatar }} style={styles.avatar} />
                            ) : (
                                <PlaceholderImage firstName={firstName} lastName={lastName} />
                            )}
                        </View>
                        
                        <Pressable style={styles.changeButton} onPress={pickImage}>
                            <Text style={styles.changeText}>Change</Text>
                        </Pressable>
                        <Pressable style={styles.removeButton} onPress={()=>{ setAvatar(null) }}>
                            <Text style={styles.removeText}>Remove</Text>
                        </Pressable>
                    </View>
                    <Text style={styles.prompt}>First name</Text>
                    <TextInput style={styles.defaultInput} onChangeText={setFirstName} value={firstName}/>
                    <Text style={styles.prompt}>Last name</Text>
                    <TextInput style={styles.defaultInput} onChangeText={setLastName} value={lastName}/>
                    <Text style={styles.prompt}>Email</Text>
                    <TextInput 
                        style={styles.defaultInput}
                        keyboardType='email-address'
                        onChangeText={setEmail}
                        value={email}
                        autoCapitalize='none'/>
                    <Text style={styles.prompt}>Phone number</Text>
                    <MaskedTextInput 
                        mask="(999) 999-9999" 
                        style={[styles.defaultInput, styles.maskedInput]} 
                        onChangeText={(_, rawText) => {
                            setPhone(rawText)
                        }} 
                        value={mask(phone, "(999) 999-9999")}/>
                    <Text style={styles.mainTitle}>Email notifications</Text>
                    <View style={styles.lineContainer}>
                        <View style={styles.row}>
                            <CheckBoxItem checked={orderStatus} setChecked={setOrderStatues} text='Order statuses' />
                            <CheckBoxItem checked={passwordChange} setChecked={setPasswordChange} text='Password changes' />
                        </View>
                        <View style={styles.row}>
                            <CheckBoxItem checked={specialOffer} setChecked={setSpecialOffer} text='Special offers' />
                            <CheckBoxItem checked={newsletter} setChecked={setNewsletter} text='Newsletter' />
                        </View>
                    </View>
                    <Pressable style={styles.logoutButton} onPress={() => {
                        (async ()=> {
                            try {
                                await AsyncStorage.removeItem('@avatar')
                                await AsyncStorage.removeItem('@email')
                                await AsyncStorage.removeItem('@lastName')
                                await AsyncStorage.removeItem('@firstName')
                                await AsyncStorage.removeItem('@phone')
                                await AsyncStorage.removeItem('@orderStatus')
                                await AsyncStorage.removeItem('@passwordChange')
                                await AsyncStorage.removeItem('@specialOffer')
                                await AsyncStorage.removeItem('@newsletter')

                                setAvatar(null)
                                setAvatar('')
                                setLastName('')
                                setFirstName('')
                                setPhone('')
                                setOrderStatues(true)
                                setPasswordChange(true)
                                setSpecialOffer(true)
                                setNewsletter(true)

                                logout(navigation)
                            } catch (e) {
                                Alert.alert(`An error occurred: ${e.message}`);
                            } 
                        })()
                    }}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </Pressable>
                    <Pressable style={styles.saveButton} onPress={() => {
                        (async ()=> {
                            try {
                                if (avatar !== null) {
                                    await AsyncStorage.setItem('@avatar', avatar)
                                } else {
                                    await AsyncStorage.removeItem('@avatar')
                                }
                                if (email !== null) {
                                    await AsyncStorage.setItem('@email', email)
                                }
                                if (lastName !== null) {
                                    await AsyncStorage.setItem('@lastName', lastName)
                                }
                                if (firstName !== null) {
                                    await AsyncStorage.setItem('@firstName', firstName)
                                }
                                if (phone !== null) {
                                    await AsyncStorage.setItem('@phone', phone)
                                }
                                await AsyncStorage.setItem('@orderStatus', String(orderStatus))
                                await AsyncStorage.setItem('@passwordChange', String(passwordChange))
                                await AsyncStorage.setItem('@specialOffer', String(specialOffer))
                                await AsyncStorage.setItem('@newsletter', String(newsletter))

                                navigation.goBack()
                            } catch (e) {
                                Alert.alert(`An error occurred: ${e.message}`);
                            } 
                        })()
                    }}>
                        <Text style={styles.saveText}>Save Changes</Text>
                    </Pressable>
                </ ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    headerView: {
        marginTop: 44,
        width: '100%',
        height: 64,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
    },
    logo: {
        width: 185,
        height: 40,
    },
    profileAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
    },

    body: {
        width: '100%',
        flex: 1,
        verticalAlign: 'bottom',
        paddingHorizontal: 14,
    },
    contentContainer: {
        paddingBottom: 100,
    },
    mainTitle: {
        marginTop: 20,
        fontWeight: 'bold',
        fontSize: 20,
    },
    prompt: {
        marginTop: 16,
        fontWeight:'bold',
        color: 'gray',
        fontSize: 10,
    },
    avatarSetter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        width: '100%',
        height: 80,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        overflow: 'hidden',
    },
    changeButton: {
        marginLeft: 18,
        borderRadius: 10,
        backgroundColor: '#495E57',
    },
    changeText: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    removeButton: {
        marginLeft: 18,
        borderRadius: 10,
        borderColor: '#495E57',
        borderWidth: 1,
    },
    removeText: {
        fontSize: 16,
        color: '#495E57',
        textAlign: 'center',
        fontWeight: 'bold',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },

    defaultInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginTop: 5,
        marginBottom: 10,
    },
    maskedInput: {
        marginBottom: 0,
    },
    lineContainer: {
        marginTop:10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    line: {
        paddingVertical: 10
    },
    logoutButton: {
        marginTop: 20,
        borderRadius: 10,
        backgroundColor: '#F4CE14',
    },
    logoutText: {
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
        fontWeight: 'bold',
        paddingVertical: 10,
    },
    saveButton: {
        marginTop: 12,
        borderRadius: 10,
        backgroundColor: '#495E57',
        marginBottom: 30,
    },
    saveText: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        paddingVertical: 10,
    },
})