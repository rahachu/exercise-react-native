import * as React from 'react';

import { View, StyleSheet, Text, Image, TouchableOpacity, Alert, Dimensions } from "react-native";
import { paket } from "../types";
import { Ionicons } from '@expo/vector-icons';

export function Learning(props: {content: paket, onPress: () => void}) {
    let styles = StyleSheet.create({
        container: {
            borderRadius: 20,
            backgroundColor: 'rgba(37,144,191,0.07)',
            padding: 15,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
            marginTop: 10,
        },
        image: {
            width: Dimensions.get("window").width / 6,
            height: Dimensions.get("window").width / 6,
            opacity: 1,
        }
    })
    return <View style={styles.container}>
        <Image style={styles.image} source={{uri: props.content.thumbnail}} resizeMode='contain' />
        <View style={{flexBasis: 140}}>
            <Text style={{color: '#305F72', fontWeight: 'bold'}}>{props.content.name + "\n"}</Text>
            <Text style={{color: '#2590BF'}}>{props.content.desc}</Text>
        </View>
        <Text>100%</Text>
        <TouchableOpacity style={{backgroundColor: '#FFFFFF', width: 30, height: 30, borderRadius: 15 }} onPress={()=> props.onPress()}>
            <Ionicons name="play" style={{textAlign: 'center', lineHeight: 30}} />
        </TouchableOpacity>
    </View>
}