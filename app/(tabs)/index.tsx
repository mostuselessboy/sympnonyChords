import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableHighlight,Text, View, TextInput, Button, FlatList,ImageBackground, Image,ScrollView } from 'react-native';
import axios from 'axios';
import Feather from '@expo/vector-icons/Feather';
import {Ionicons, FontAwesome5} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setCurrentSong,setSongRadio, setLyrics } from '../redux/actions';

export default function HomeScreen() {
  
  const [query, setQuery] = useState('');
  const playerData = useSelector(( state : any) => state.songReducer);
  const lyricsData = useSelector(( state : any) => state.lyricsReducer);
  const songRadioData = useSelector(( state : any) => state.songRadioReducer);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [historyDATA, sethistoryDATA] = useState([]);
  const [chordData, setchordData] = useState([])
  useEffect(() => {
    AsyncStorage.getItem('playerHistory')
      .then(playerHistory => {
        const data = playerHistory ? JSON.parse(playerHistory) : [];
        const filteredData = data.filter(item => item !== null && Object.keys(item).length > 0);
        function shuffleArray(array:any) {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
        }
        
        shuffleArray(filteredData);
  
        // Get the top 5 items
        const top5Items = filteredData.slice(0, 5);
        
        sethistoryDATA(top5Items);
        // sethistoryDATA(filteredData);
      })
      .catch(error => {
        console.error('Error retrieving player history', error);
      });
  }, []);

  // useEffect(() => {
  //   lyricsData===null?console.log('NULL DATA'):
  //   console.log(lyricsData)

  // }, [lyricsData])

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

  const dispatch = useDispatch();
  const handleLivePlayer =(data:any, radio:boolean)=>{
    if(radio==false){
      dispatch(setCurrentSong(data));
    }
    if(radio==true){
      dispatch(setCurrentSong(data));
      getSongRadio(data.videoId);
    }
    // console.warn('dispath', data);
  }
  const retrieveChordData = async()=>{
    const response =  await axios.get(`https://symphony-youtube.mostuselessboy.repl.co/get_chords?query=${playerData.title.split('(')[0]}, ${playerData.artists[0].name}`)
    if(response.data){
      setchordData(response.data)
    }

    }
  useEffect(() => {
    if (playerData != null) {
      // Add the new playerData to the beginning of the list and keep only the last ten elements
      const updatedList = [playerData, ...recentlyPlayed];
      const latestTen = updatedList.slice(0, 5);
  
      setRecentlyPlayed(latestTen);
      console.log('UPDATED!', playerData.title);
      retrieveChordData();
    }
  }, [playerData]);
  


  return (
    <ScrollView style={styles.mainContainer}>
      <Text style={{...styles.title, alignSelf:'flex-start',marginLeft:"7%", marginTop:0, color:'rgb(250,250,250)', fontSize:20}}>{playerData === null ? 'Quick Picks💫' : 'Recently Played💤'}</Text>
      {historyDATA.length > 0 ? (<FlatList
      horizontal={false}
      data={historyDATA}
      nestedScrollEnabled={true}
      style={{backgroundColor:'transparent', width:'100%', borderRadius:25,display: playerData === null ? 'block' : 'none'}}
      renderItem={({item}) => (
        <TouchableHighlight onPress={() => handleLivePlayer(item,true)} activeOpacity={0.7}>
        <View style={{width:'80%', alignItems:'center',borderRadius:5,marginLeft:'7%',marginRight:'1%',marginBottom:10,flexDirection:'row',}}>
          {/* <Feather name='music' size={30} color={"rgb(120,120,120)"} style={{marginRight:5}}></Feather> */}
          <Image
            style={{width:50, height:50, marginRight:10,borderRadius:10, borderWidth:0.5, borderColor:'rgb(55,55,55)'}}
            source={{uri:historyDATA!=null?item.thumbnails[1]?.url:'noner'}}
          ></Image>
          <View style={{justifyContent:'space-around', height:50}}>
          <Text numberOfLines={1} ellipsizeMode='tail' style={{color:'white', fontFamily:'Monsterrat',fontSize:15}}>{historyDATA!=null?item.title:'none'}</Text>
          <View style={{flexDirection:'row',}}>
          <Text numberOfLines={1} ellipsizeMode='tail' style={{fontSize:12,color: 'grey',fontFamily:'Monsterrat', backgroundColor: 'rgba(255,255,255,0.1)',padding:2,paddingRight:5,paddingLeft:5,textAlign:'center',borderRadius:4, alignSelf:'flex-start', marginRight:5}}>{historyDATA!=null?item.artists[0].name:'none'}</Text>
          <Text numberOfLines={1} ellipsizeMode='tail' style={{fontSize:12,color: 'grey',fontFamily:'Monsterrat', backgroundColor: 'rgba(255,255,255,0.1)',padding:2,paddingRight:5,paddingLeft:5,textAlign:'center',borderRadius:4, alignSelf:'flex-start', marginRight:5}}>{item.isExplicit===true?'E':'UA'}</Text>

          </View>
          </View>
        </View>
        </TouchableHighlight>
      )}
      ></FlatList>):(<Text>Loading</Text>)}
      
      
      
      <FlatList
    horizontal
    data={recentlyPlayed}
    nestedScrollEnabled={true}
    style={{height:120,width:'92%',margin:'0%', backgroundColor:'rgba(25,25,35,0)', borderRadius:20, padding:'5%'}}
    renderItem={({ item }) => (
      <TouchableHighlight onPress={() => handleLivePlayer(item,true)} activeOpacity={0.7}>
      <View style={{backgroundColor:'grey',marginRight:10,flexDirection:'column-reverse', borderRadius:25, height:'100%',width:140, padding:0,borderWidth:0, borderColor:'red' }}>
        <ImageBackground
          source={{ uri:item.thumbnails[1]?.url.replace('=w120-h120','=w400-h400') }}
          style={styles.backgroundImage}
          >
          <View style={{backgroundColor:'rgba(0,0,0,0.4)',height:'100%',padding:'5%'}}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{...styles.title, padding:0, marginBottom:0, fontSize:12, color:'rgba(255,255,255,0.7)'}}>{item.artists[0].name}</Text>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{...styles.title, padding:0, marginBottom:0, fontSize:17}}>{item.title}</Text>
          </View>
          </ImageBackground>
      </View>
      </TouchableHighlight>
    )}>
    </FlatList>

    <View style={{height:200, backgroundColor:'rgba(20,20,20,1)',borderColor:'rgb(25,25,25)',borderWidth:1, borderRadius:15, width:'92%', margin:'4%',display: playerData === null ? 'none' : 'block'}}>
      <View style={{flexDirection:'row'}}>
      <Image style={{flex:1,borderRadius:40,margin:10,marginLeft:15,minWidth:40,minHeight:40,maxWidth:40, maxHeight:40}} source={{uri:playerData != null ? playerData.thumbnails[1]?.url:'none'}}></Image>
    <View style={{flex:3}}>
    <Text numberOfLines={1} ellipsizeMode='tail' style={{...styles.title, textAlign:'center',alignSelf:'flex-start', color:'rgba(255,255,255,0.8)',fontSize:15, margin:0,marginTop:10,marginLeft:0,marginRight:20,marginBottom:1}}>{playerData != null ?playerData.title:'None'}</Text>
    <Text numberOfLines={1} ellipsizeMode='tail' style={{...styles.title, textAlign:'center',alignSelf:'flex-start', backgroundColor:'rgba(255,255,255,0.1)',paddingLeft:5,paddingRight:5,borderRadius:5, fontSize:12,marginBottom:0,marginLeft:0,marginRight:20}}>{playerData != null ?playerData.artists[0].name:'none'}</Text>
    </View>
      </View>
    <Text style={{textAlign:'center',height:'50%',alignSelf:'center',justifyContent:'center',backgroundColor:'transparent',fontFamily:'Gogh',color:'rgba(205,205,205,0.8)',fontSize:22,margin:20}}>{lyricsData?lyricsData:'♬♬'}</Text>

    </View>

    <View style={{height:400, overflow:'hidden',backgroundColor:'rgba(20,20,20,1)',borderColor:'rgb(25,25,25)',borderWidth:1, borderRadius:15,width:'92%', margin:'4%',display: playerData === null ? 'none' : 'block'}}>
      <View style={{flexDirection:'row'}}>
      {/* <Image style={{flex:1,borderRadius:40,margin:10,marginLeft:15,minWidth:40,minHeight:40,maxWidth:40, maxHeight:40}} source={{uri:playerData != null ? playerData.thumbnails[1]?.url:'none'}}></Image> */}
      <FontAwesome5 name='guitar' size={30} color={'white'} style={{maxHeight:50,margin:15,marginLeft:15,marginRight:15}}></FontAwesome5>
    <View style={{flex:3}}>
    <Text numberOfLines={1} ellipsizeMode='tail' style={{...styles.title, textAlign:'center',alignSelf:'flex-start', color:'rgba(255,255,255,0.8)',fontSize:15, margin:0,marginTop:10,marginLeft:0,marginRight:20,marginBottom:1}}>{'Guitar Chords'}</Text>
    <Text numberOfLines={1} ellipsizeMode='tail' style={{...styles.title, textAlign:'center',alignSelf:'flex-start', backgroundColor:'rgba(255,255,255,0.1)',paddingLeft:5,paddingRight:5,borderRadius:5, fontSize:12,marginBottom:0,marginLeft:0,marginRight:20}}>{playerData != null ?playerData.title:'none'}</Text>
    </View>
      </View>

      <FlatList
    data={chordData}
    nestedScrollEnabled={true}
    style={{height:400,overflow: 'scroll',margin:'4%',display: songRadioData!=null?'block':'none',marginTop:10, backgroundColor:'rgba(20,20,20,1)',borderColor:'rgb(25,25,25)',borderWidth:1, borderRadius:15, padding:'5%'}}
    renderItem={({ item }) => (
      <Text style={{fontFamily:'DM_mono',color:item.includes('』')?'green':'rgba(205,205,205,0.8)',fontSize:item.includes('[')&&item.includes(']')?20:16,margin:5}}>{item}</Text>
    )}></FlatList>

    </View>
    <Text style={{...styles.title,display: songRadioData!=null?'block':'none',textAlign:'center',margin: '0',}}>Playing Next🎶</Text>

    <FlatList
    data={songRadioData}
    nestedScrollEnabled={true}
    style={{height:400,width:'92%',margin:'4%',display: songRadioData!=null?'block':'none',marginTop:10, backgroundColor:'rgba(20,20,20,1)',borderColor:'rgb(25,25,25)',borderWidth:1, borderRadius:15, padding:'5%'}}
    renderItem={({ item }) => (
      <TouchableHighlight onPress={() => handleLivePlayer(item,false)} activeOpacity={0.7}>

      <View style={{flexDirection:'row',flex:1, justifyContent: 'space-between', alignItems:'center', marginBottom:15,}}>
        <View style={{flexDirection:'row',alignItems:'center',flex:0.7}}>
          <Image style={{width:40, height:40, borderRadius:5}} source={{uri:item && item.thumbnail && item.thumbnail[1] && item.thumbnail[1].url?item.thumbnail[1]?.url:'none'}}></Image>
          <View style={{marginLeft:10, alignItems:'center',overflow:'hidden'}}>
          <Text numberOfLines={1} ellipsizeMode='tail' style={{alignSelf:'flex-start',fontFamily:'Monsterrat',fontSize:15, color:playerData.title!=item.title?'rgba(255,255,255,0.8)':'green'}}>{item?item.title:'none'}</Text>
          <Text numberOfLines={1} ellipsizeMode='tail' style={{alignSelf:'flex-start', fontFamily:'Monsterrat',color:playerData.title!=item.title?'rgba(255,255,255,0.2)':'green'}}>{item ?item.artists[0].name:'none'}</Text>
          </View>
        </View>
        <Ionicons style={{flex:0.1}} size={25} name={playerData.title!=item.title?'ios-play-skip-forward-outline':'radio'} color={playerData.title!=item.title?'rgba(255,255,255,0.4)':'green'}></Ionicons>
      </View>
      </TouchableHighlight>
    )}>

    </FlatList>

    
 
    {/* <Text style={{color:'white', fontSize:110}}>HAMZA</Text> */}
    </ScrollView>


  );
}

const styles = StyleSheet.create({
  mainContainer:{
    flex: 1,
    height:'100%',
    // minHeight:'100%',
    marginBottom:70
  },
  container: {
    flex: 1,
    fontFamily:'Monsterrat',
    // alignItems: 'top',
    overflow:'scroll',
    // justifyContent: 'space-',
    padding: 16,
    height:100,
    flexDirection:'row'
  },
  backgroundImage:{
    resizeMode: 'cover',
    flex: 1,
    overflow: 'hidden',
    borderRadius:25,
    justifyContent:'space-between',
    flexDirection:'column-reverse',
    borderWidth:0,
    borderColor:'rgb(45,45,45)',
    opacity:1,
  },
  title: {
    fontSize: 20,
    color:'rgba(255,255,255,1)',
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
    marginBottom: 10,
    color:'white',
    display:'flex',
    marginLeft:0,
    marginRight:10,
    // width:1000,
    justifyContent:'flex-start',
    flexDirection: 'row',
    alignItems:'center',
  },
  thumbnail: {
    width: 50,
    borderRadius:50,
    height: 50,
    marginRight: 10,
  },
});
