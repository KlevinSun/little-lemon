import * as React from 'react';
import {
    View,
    Text, 
    StyleSheet, 
    ActivityIndicator, 
    Pressable, 
    Image, 
    Alert,
    TextInput, 
    FlatList,
    TouchableOpacity} from 'react-native';
import PlaceholderImage from '../components/PlaceholderImage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { withSafeAreaInsets } from 'react-native-safe-area-context';

const db = SQLite.openDatabase('little-lemon')

const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}

export default function Home({ navigation }) {
    const [avatar, setAvatar] = React.useState(null)
    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')

    const [itemData, setItemData] = React.useState([])
    const [loading, setLoading] = React.useState(true)

    const [searchKey, setSearchKey] = React.useState('')
    const [categories, setCategories] = React.useState([])

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.labelContainer}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemDescription} 
                    numberOfLines={2} 
                    ellipsizeMode='tail'>
                        {item.description}
                </Text>
                <Text style={styles.price}>{`$${item.price}`}</Text>
            </View>
            <View style={styles.picContainer}>
                <Image style={styles.itemPic} source={{uri: `https://github.com/Meta-Mobile-Developer-PC/Working-With-Data-API/blob/main/images/${item.image}?raw=true`}} />
            </View>
        </View>
    )

    const renderSeparator = () => (
        <View style={styles.separator} />
    );

    const categoryItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleCategory(item.id)} style={item.isSelected ? styles.categoryItemSelected : styles.categoryItemUnselected}>
            <Text style={item.isSelected ? styles.categoryItemTextSelected : styles.categoryItemTextUnselected}>{item.category}</Text>
        </TouchableOpacity>
    )
    
    const categoryItemSpace = () => (
        <View style={styles.categoryInteritemSpace} />
    )

    const handleCategory = (id) => {
        var changed = false
        const newCategory = categories.map(c => {
            if (c.id === id) {
                changed = true
                return {...c, isSelected: !c.isSelected}
            }
            return c
        })
        if (changed === true) {
            setCategories(newCategory)
            const selected = newCategory.filter(c => {
                return c.isSelected === true
            })
            const s = selected.map(c => {
                return c.category
            })
            fetchMenuOfCategories(s, searchKey)
            changed = false
        } 
    }

    const fetchMenuOfCategories = (selectedCategory, query) => {
        db.transaction(tx => {
            var sql = 'SELECT name, description, price, category, image FROM menus'
            var params = []
            if (selectedCategory.length > 0 || query.length > 0) {
                sql = sql + ' where'
                if (selectedCategory.length > 0) {
                    const placeholders = selectedCategory.map(() => '?').join(',')
                    sql = sql + ` category IN (${placeholders})`
                    params = [...params, ...selectedCategory]
                    if (query.length > 0) {
                        sql = sql + ` and name like ?`
                        params = [...params, `%${query}%`]
                    }
                } else {
                    sql = sql + ` name like ?`
                    params = [...params, `%${query}%`]
                }
            } 
            
            tx.executeSql(sql, [...params], (_, { rows: { _array } }) => {
                setItemData(_array);
            }, (tx, error) => {
                Alert.alert(`Category error: ${error.message}`);
            });
        })
    }

    const handleTextSearch = debounce((text) => {
        const selected = categories.filter(c => {
            return c.isSelected === true
        })
        const s = selected.map(c => {
            return c.category
        })
        fetchMenuOfCategories(s, text)
    }, 500)

    React.useEffect(() => {
        const fetchAsyncStorageData = async () => {
            try {
                const avatar = await AsyncStorage.getItem('@avatar');
                const lastName = await AsyncStorage.getItem('@lastName');
                const firstName = await AsyncStorage.getItem('@firstName');
                setAvatar(avatar);
                setLastName(lastName);
                setFirstName(firstName);
            } catch (e) {
                Alert.alert(`An error occurred: ${e.message}`);
            }
        };

        const fetchDataFromApi = async () => {
            try {
                const response = await fetch('https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json');
                const data = await response.json();
                setItemData(data.menu);
                // setLoading(false);
                saveDataToDatabase(data.menu);
            } catch (e) {
                Alert.alert(`An error occurred: ${e.message}`);
                setLoading(false);
            }
        };

        const saveDataToDatabase = (data) => {
            db.transaction(tx => {
                data.forEach(item => {
                    tx.executeSql('INSERT INTO menus (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)', [item.name, item.description, item.price, item.category, item.image]);
                });
                fetchCategoryFromData()
            });
        };

        const fetchDataFromDatabase = () => {
            db.transaction(tx => {
                tx.executeSql(
                    'CREATE TABLE IF NOT EXISTS menus (id INTEGER PRIMARY KEY NOT NULL, name TEXT, description TEXT, price REAL, category TEXT, image TEXT);'
                );
                tx.executeSql('SELECT name, description, price, category, image FROM menus', [], (_, { rows: { _array } }) => {
                    if (_array.length > 0) {
                        setItemData(_array);
                        fetchCategoryFromData()
                    } else {
                        fetchDataFromApi();
                    }
                }, (tx, error) => {
                    Alert.alert(`Database error: ${error.message}`);
                    setLoading(false);
                });
            });
        };

        const fetchCategoryFromData = () => {
            db.transaction(tx => {
                tx.executeSql('SELECT Distinct category FROM menus', [], (_, { rows: { _array } }) => {
                    const c = _array.map(( item, index ) => (
                        {'category': item.category, 'isSelected': false, 'id': index}
                    ))
                    setCategories( c )
                    setLoading(false)
                }, (tx, error) => {
                    Alert.alert(`Database error: ${error.message}`);
                    setLoading(false);
                })
            })
        }

        fetchAsyncStorageData();
        fetchDataFromDatabase();
    }, [])

    return (
        <View style={styles.container}>
            <View style={styles.headerView}>
                <View style={styles.logo}>
                    <Image source={require('../img/Logo.png')} style={styles.logoImage}/>
                </View>
                <Pressable style={styles.profile}
                    onPress={() => {
                        navigation.navigate("Profile")
                    }}>
                    <View style={styles.profileAvatar}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.profileAvatar} />
                        ) : (
                            <PlaceholderImage firstName={firstName} lastName={lastName} />
                        )}
                    </View>
                </Pressable>
            </View>
            <View style={styles.banner}>
                <Text style={styles.bannerTitle}>Little Lemon</Text>
                <View style={styles.bannerSubContainer}>
                    <View style={styles.leftContainer}>
                        <Text style={styles.bannerSubTitle}>Chicago</Text>
                        <Text style={styles.bannerDescription}>We are a family owned Mediterranean restaurant, focused on traditional recipes served with a modern twist.</Text>
                    </View>
                    <View style={styles.rightContainer}>
                        <Image source={require('../img/Restaurant.png')} style={styles.bannerImage} />
                    </View>
                </View>
                <View style={styles.searchView}>
                    <Image source={require('../img/magnify.png')} style={styles.magnifyIcon} />
                    <TextInput style={styles.searchText} onChangeText={(text) => {
                        setSearchKey(text)
                        handleTextSearch(text)
                    }} value={searchKey}/>
                </View>
            </View>
            <View style={styles.flatList}>
                {loading ? (
                    <ActivityIndicator style={styles.loadingContainer} size="large" color="#495E57" />
                ) : (
                    <>
                        <View>
                            <Text style={styles.categoryTitle}>Order For Delivery</Text>
                            <FlatList
                                style={styles.categoryList} 
                                data={categories}
                                renderItem={categoryItem}
                                horizontal={true}
                                ItemSeparatorComponent={categoryItemSpace} />
                            <View style={styles.categorySeperator}></View>
                        </View>
                        <FlatList 
                            data={itemData}
                            renderItem={renderItem}
                            keyExtractor={ (_, index) => index.toString() }
                            ItemSeparatorComponent={renderSeparator} />
                    </>
                )}
            </View>
            
        </View>
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
    logo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    logoImage: {
        width: 185,
        height: 40,
    },
    profile: {
        flex: 0,
        justifyContent: 'flex-end',
    },
    profileAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
    },
    banner: {
        width: '100%',
        paddingHorizontal: 16,
        paddingBottom: 20,
        backgroundColor: '#495E57',
    },
    bannerSubContainer: {
        flexDirection: 'row',
    },
    leftContainer: {
        flex: 1,
    },
    rightContainer: {
        flex: 0,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    bannerTitle: {
        marginTop: 10,
        fontFamily: 'MarkaziText-Medium',
        fontSize: 40,
        color: '#F4CE14',
    },
    bannerSubTitle: {
        marginTop: -10,
        fontFamily: 'MarkaziText-Regular',
        fontSize: 28,
        color: 'white',
    },
    bannerDescription: {
        marginTop: 10,
        fontFamily: 'Karla-Medium',
        fontSize: 15,
        color: 'white',
    },
    bannerImage: {
        width: 126,
        height: 116,
    },
    searchView: {
        marginTop: 30,
        marginHorizontal: 4,
        marginBottom: 4,
        borderRadius: 8,
        overflow: 'hidden',
        height: 42,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center'
    },
    magnifyIcon: {
        width: 24,
        height: 24,
        marginLeft: 10,
    },
    searchText: {
        marginLeft: 10,
        flex: 1,
        height: '100%',
    },
    categoryTitle: {
        marginTop: 20,
        marginLeft: 16,
        fontFamily: 'Karla-ExtraBold',
        fontSize: 20,
        color: 'black',
    },
    categoryList: {
        marginVertical: 6,
        width: '100%',
        padding: 10,
    },
    categoryItemSelected: {
        backgroundColor: '#495E57',
        borderRadius: 16,
    },
    categoryItemUnselected: {
        backgroundColor: 'lightgray',
        borderRadius: 16,
    },
    categoryItemTextSelected: {
        fontFamily: 'Karla-ExtraBold',
        fontSize: 16,
        color: 'white',
        margin: 10,
    },
    categoryItemTextUnselected: {
        fontFamily: 'Karla-ExtraBold',
        fontSize: 16,
        color: '#495E57',
        margin: 10
    },
    categoryInteritemSpace: {
        height: '100%',
        width: 10,
    },
    categorySeperator: {
        height: 2,
        width: '100%',
        backgroundColor: '#495E57',
        opacity: 0.4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatList: {
        flex: 1,
        width: '100%',
    },
    separator: {
        height: 1,
        width: '100%',
        backgroundColor: '#EDEFEE',
        marginHorizontal: 16,
    },
    itemContainer: {
        width: '100%',
        paddingHorizontal: 16,
        flexDirection: 'row',
        height: 123,
    },
    labelContainer: {
        flex: 0.75,
    },
    itemTitle: {
        marginTop: 16,
        height: 21,
        fontFamily: 'Karla-Bold',
        fontSize: 18,
        color: 'black',
    },
    itemDescription: {
        marginTop: 8,
        width: '95%',
        fontFamily: 'Karla-Regular',
        fontSize: 16,
        color: '#495E57',
    },
    price: {
        marginTop: 8,
        marginBottom: 8,
        fontFamily: 'Karla-Medium',
        fontSize: 18,
        color: '#495E57',
    },
    picContainer: {
        flex: 0.25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemPic: {
        width: '100%',
        aspectRatio: 1.0,
        resizeMode: 'cover'
    }
})