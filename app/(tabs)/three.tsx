import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableHighlight } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setCurrentSong,setSongRadio, setLyrics } from '../redux/actions';
import axios from 'axios';

export default function TabTwoScreen() {
  const [LikedSongs, setLikedSongs] = useState([]);
  const likeTrigger = useSelector(( state : any) => state.likeTriggerReducer);

  const dispatch = useDispatch();
  const handleLivePlayer =(data:any)=>{
    dispatch(setCurrentSong(data));
    getSongRadio(data.videoId);
    // console.warn('dispath', data);
  }
  useEffect(() => {
    AsyncStorage.getItem('favMusic')
      .then(songs => {
        const parsedSongs = songs ? JSON.parse(songs) : [];
        setLikedSongs(parsedSongs);
      })
      .catch(error => {
        console.error('Error while retrieving liked songs:', error);
      });
  }, [likeTrigger]);

  const getSongRadio =async (songID:string) => {
    const response = await axios.get(
      `https://symphony-youtube.mostuselessboy.repl.co/songradio/${songID}`
    )
    if (response.data) {
      const modifiedData = response.data.map((item:any, index:number) => ({
        ...item, 
        playpos: index, 
      }));
      dispatch(setSongRadio(modifiedData));
    }else{
      dispatch(setSongRadio(null))
    }
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={LikedSongs}
        renderItem={({ item }) => (
          <TouchableHighlight onPress={() => handleLivePlayer(item)} activeOpacity={0.7}>
        <View style={styles.item}>
          {/* <Feather title="playButton" size={20} style={{marginBottom: 0, marginRight:10,textAlign:'right'}} name='play-circle' color={'rgba(255,255,255,0.2)'}></Feather> */}
            <Image
              source={{ uri: item.thumbnails[1]?.url }} // Display the first image from thumbnails
              style={item.category==='Videos'?styles.thumbnail:styles.thumbnail}
            />
            <View style={{overflow:'hidden'}}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: 'white',fontFamily:'Monsterrat', marginBottom:5 }}>{item.title}</Text>
            <View style={{flexDirection:'row'}}> 
            <Text numberOfLines={1} ellipsizeMode="tail" style={{ fontSize:12,borderWidth:0.5, borderColor:'rgba(255,255,255,0.06)', color: 'grey',fontFamily:'Monsterrat', backgroundColor: 'rgba(255,255,255,0.1)',padding:2,paddingRight:5,paddingLeft:5,textAlign:'center',borderRadius:4, alignSelf:'flex-start', maxWidth:'50%'}}>{item.artists[0].name}</Text>
            <Text style={{ fontSize:12, color: 'grey',fontFamily:'Monsterrat',marginRight:10,padding:2,paddingRight:5,paddingLeft:5,textAlign:'left',borderRadius:4, alignSelf:'flex-start'}}> • {item.duration} </Text>
            <Text style={{ fontSize:12,borderWidth:0.5, borderColor:'rgba(255,255,255,0.06)', color: 'grey',fontFamily:'Monsterrat', backgroundColor: 'rgba(255,255,255,0.1)',padding:2,paddingRight:5,paddingLeft:5,textAlign:'center',borderRadius:4, alignSelf:'flex-start', marginRight:5}}>{item.isExplicit===true?'E':'UA'}</Text>
            </View>

            </View>
          </View>
          </TouchableHighlight>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily:'Monsterrat',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingBottom:69
  },
  title: {
    fontSize: 24,
    color:'white',
    fontFamily:'Monsterrat',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    flexDirection:'row',
    alignItems:'center',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    fontFamily:'Monsterrat',
    paddingLeft: 20,
    marginBottom: 10,
    fontWeight:'bold',
    borderRadius:10,
    color:'white',
    fontSize:16,
    backgroundColor:'rgba(255,255,255,0.06)',
  },
  item: {
    marginTop: 15,
    color:'white',
    display:'flex',
    marginLeft:0,
    marginRight:10,
    maxWidth: '90%',
    minWidth: '90%',
    overflow: 'hidden',
    // width:1000,
    justifyContent:'flex-start',
    flexDirection: 'row',
    alignItems:'center',
  },
  thumbnail: {
    width: 50,
    borderRadius:8,
    height: 50,
    marginRight: 10,
  }, 
});
