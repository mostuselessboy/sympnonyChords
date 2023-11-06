import Feather from '@expo/vector-icons/Feather';
import {AntDesign, MaterialCommunityIcons, Ionicons,FontAwesome5 }  from '@expo/vector-icons/';
import { Link, Tabs } from 'expo-router';
import { Pressable, TouchableHighlight, useColorScheme, Animated, StyleSheet, Text, View, TextInput, Button, FlatList, Image,PanResponder,Easing  } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Audio, InterruptionModeAndroid,InterruptionModeIOS, Video} from 'expo-av';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSelector, useDispatch } from 'react-redux';
import {setLyrics,setCurrentSong, setLikeTrigger} from '../redux/actions'
// import * as Notifications from 'expo-notifications';
import Colors from '../../constants/Colors';
import { songRadioReducer, lyricsReducer } from '../redux/reducer';
import { parse } from '@babel/core';
/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
}) {
  return <Feather size={25} style={{marginBottom: 0 }} {...props} />;
}

export default function TabLayout() {
const colorScheme = useColorScheme();
const lyricsData = useSelector(( state : any) => state.lyricsReducer);
const likeTrigger = useSelector(( state : any) => state.likeTriggerReducer);
const dispatch = useDispatch();
const playerData = useSelector(( state : any) => state.songReducer);
const songRadioData = useSelector(( state : any) => state.songRadioReducer);
const [liveplayerdata, setLiveplayerdata] = useState(Object);
const [YouTubevideoId, setYouTubevideoId] = useState('none')
const [sound, setSound] = useState<Audio.Sound | null>(null);
const [playingState, setplayingState] = useState('play')
const [isPlayerFullscreen, setisPlayerFullscreen] = useState(false)
const [lyricsrawData, setlyricsrawData] = useState(null)
const [progressBar, setprogressBar] = useState(0)
const [playIndex, setplayIndex] = useState(0)
const [videoUrl, setvideoUrl] = useState('')
const [VideoDuration, setVideoDuration] = useState(1)
const [repeat, setrepeat] = useState(false)
const [likedSongs, setLikedSongs] = useState([]);
const [videoMode, setvideoMode] = useState(false)

const videoRef = useRef(null);
// if(videoRef.current){
//   videoRef.current.setProgressUpdateIntervalAsync(2000)}


Audio.setAudioModeAsync({
  // allowsRecordingIOS: false,
  // playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  staysActiveInBackground: true,
  // interruptionModeIOS: InterruptionModeIOS.MixWithOthers, // iOS allows mixing audio with others by default
  interruptionModeAndroid: InterruptionModeAndroid.DuckOthers, // Android ducks audio on interruption
});

const handleLyrics =(data:any)=>{
  dispatch(setLyrics(data));
  // console.warn('dispath', data);
}
const startServer = async() =>{
  const Response = await axios.get('https://apispotifylyrics.mostuselessboy.repl.co/')
}

const getLyrics = async() =>{
  try {
      dispatch(setLyrics('♬♬'));
      const Response = await axios.get(`https://apispotifylyrics.mostuselessboy.repl.co/get_lyrics?query=${playerData.title}%20${playerData.artists[0].name}`)
      if (Response.data) {
        const data =Response.data;
          dispatch(setLyrics('♬♬'));
        if (data['error']!=true){
          setlyricsrawData(data);
        }else{
          setlyricsrawData(null);
        }
      }else{
        dispatch(setLyrics('Lyrics Not Available for this One ;)'));
      }
    
  } catch (error) {
    dispatch(setLyrics('♬♬'));    
  }

}

useEffect(()=>{
  startServer();
},[])

// useEffect(()=>{
//   if (songRadioData!=null){

//       if(playIndex>songRadioData.length){
//         setplayIndex(0)
//       }else{
//         console.warn(`PLAY INDEX Changed${playIndex}`);
//         console.warn(songRadioData[playIndex]);
//         dispatch(setLyrics(songRadioData[playIndex]));
//       }
//   }
// }, [playIndex])

useEffect(() => {
  if (songRadioData) {
    if (playIndex >= songRadioData.length) {
      setplayIndex(0);
    } else if (songRadioData[playIndex]) {
      const data = songRadioData[playIndex];
      dispatch(setCurrentSong(data)); 
    } else {
      console.log('SONGRADIO DATA IS UNDEFINED!');
    }
  } else {
    console.log('SONGRADIO NOT ACTIVATED!');
  }
}, [playIndex]);




useEffect(() => {
  if (lyricsrawData!=null){

    const lines = lyricsrawData['lines'];
    const currentTimeMs = progressBar;
    
    // Find the appropriate lyrics line based on the currentTimeMs
    let currentLyrics = null;
    for (const line of lines) {
      if (line.startTimeMs <= currentTimeMs) {
        currentLyrics = line.words;
      } else {
        break; // Stop searching once you find the appropriate lyrics
      }
    }
    
    if (currentLyrics !== null) {
      dispatch(setLyrics(currentLyrics));
      // console.log('Lyrics:', currentLyrics);
    }
  }else{
    dispatch(setLyrics('♬♬'));

  }
  }, [progressBar, lyricsrawData]);


  const handleGetVideo = async (videoId: string, playerData:any) => {
    try {
      const response = await axios.get(
      `https://symphony-youtube.mostuselessboy.repl.co/getVideo?url=https://www.youtube.com/watch?v=${videoId}`
    );

    if (response.data) {
      getLyrics()
      const data = response.data;
      
      // playAudio(data.audio,playerData);
      playVideo(data.url)
      setLiveplayerdata(playerData);

    }
  } catch (error) {
    console.error('Error searching:', error);
  }
};




useEffect(() => {
  try {
    if (playerData != null) {
      if(playerData['playpos']!=null){
        setplayIndex(playerData['playpos']);
      }
      setLiveplayerdata({
        url: 's',
        title: playerData.title,
        album:{name: playerData.title},
        thumbnails: [{},
          
          { url: 'https://i.gifer.com/yy3.gif' }
        ],
        artists: [
          { name: 'Loading..' }
        ]
      });
      handleGetVideo(playerData.videoId, playerData);
    }
    AsyncStorage.getItem('playerHistory')
    .then(playerHistory => {
      let history = playerHistory ? JSON.parse(playerHistory) : [];
    if (playerData!=null){
      history.push(playerData)
    }

      AsyncStorage.setItem('playerHistory', JSON.stringify(history))
        .then(() => {
          console.log('Data saved to playerHistory');
        })
        .catch(error => {
          console.error('Error saving data to playerHistory', error);
        });

      setLiveplayerdata(playerData);
    })
    .catch(error => {
      console.error('Error retrieving data from playerHistory', error);
    });

  } catch (error) {
    console.log(error);
  }
  
}, [playerData]);
useEffect(() => {
  try{
    playingState=='play'?videoRef.current?.pauseAsync():videoRef.current?.playAsync();
  }catch{
  }
}, [playingState])

useEffect(() => {
  AsyncStorage.getItem('favMusic')
    .then(songs => {
      const parsedSongs = songs ? JSON.parse(songs) : [];
      setLikedSongs(parsedSongs);
    })
    .catch(error => {
      console.error('Error while retrieving liked songs:', error);
    });
}, [playerData]);
const likeSong = () => {
  if (playerData != null) {
    const newData = Object.assign({}, playerData);
    delete newData.playpos;
    
    // Check if the song is already liked by comparing videoId
    const isAlreadyLiked = likedSongs.some(likedSong => likedSong.videoId === newData.videoId);
    
    if (!isAlreadyLiked) {
      // Song is not already liked, so add it to the list
      const updatedLikedSongs = [...likedSongs, newData];
      AsyncStorage.setItem('favMusic', JSON.stringify(updatedLikedSongs))
        .then(() => {
          setLikedSongs(updatedLikedSongs);
          dispatch(setLikeTrigger(playerData))

        })
        .catch(error => {
          console.error('Error while liking song:', error);
        });
    } else {
      // Song is already liked, so you may want to remove it from the list
      const updatedLikedSongs = likedSongs.filter(likedSong => likedSong.videoId !== newData.videoId);
      AsyncStorage.setItem('favMusic', JSON.stringify(updatedLikedSongs))
      .then(() => {
        setLikedSongs(updatedLikedSongs);
        dispatch(setLikeTrigger(playerData))
      })
      .catch(error => {
        console.error('Error while unliking song:', error);
        });
    }
  }
};

useEffect(() => {
  const interval = setInterval(() => {
    if (playingState === 'pause') {
      checkPlaybackStatus();
    }
  }, 800); // Check every 800 milliseconds

  // Return a cleanup function to clear the interval when the component is unmounted
  return () => clearInterval(interval);
}, [playingState]);


const checkPlaybackStatus = async () => {
  const status = await videoRef.current.getStatusAsync();
  setprogressBar(status.positionMillis+600)
};

function videoStatus (status:any){
  if(status.isLoaded){
  setVideoDuration(status.durationMillis);
  }
  if (status.didJustFinish) {
    if (repeat==true){
      setplayIndex(playIndex);
    }else{
      setplayIndex(playIndex+1);
    }
  }
  
}

  const onSliderValueChange = (value) => {
    if (videoRef.current) {
      const newPosition = value;
      
      videoRef.current.setPositionAsync(newPosition);
    }
  };

  

useEffect(() => {
  const setup = async () => {
    if (videoRef.current) {
      videoRef.current.playAsync();
      setplayingState('pause');
    }
  }
  setup();

}, [videoUrl])


const playVideo = async(url:string)=>{
  setvideoUrl(url);
}
const translateY = new Animated.Value(0);

const handlePanResponderMove = (_, gestureState) => {
  if (gestureState.dy > 4000) {
    setisPlayerFullscreen(false);
  } else {
    translateY.setValue(gestureState.dy);
  }
};

const handleCloseAnimation = () => {
  Animated.timing(translateY, {
    toValue: 4000,
    duration: 1000,
    easing: Easing.inOut(Easing.ease), 
    useNativeDriver: true, // Use the native driver for smoother performance
  }).start(() => setisPlayerFullscreen(false));
};

const panResponder = PanResponder.create({
  onStartShouldSetPanResponder: () => true,
  onMoveShouldSetPanResponder: () => true,
  onPanResponderMove: handlePanResponderMove,
  onPanResponderRelease: handleCloseAnimation,
});
  return (
    <>
    <Tabs
      screenOptions={{
        tabBarStyle: { height: 60 , backgroundColor: 'rgba(255,255,255,0.03)'},
        tabBarActiveTintColor: 'green',
        headerTitleStyle:{color:'rgba(255,255,255,0.5)',padding:3,paddingRight:10,paddingLeft:10,borderRadius:50,fontSize:20,fontFamily:'Monsterrat'},
        headerStyle:{backgroundColor:"black"},
        tabBarActiveBackgroundColor:'red',
        tabBarLabelStyle: {
          fontSize: 13,
          color: 'rgba(255,255,255,0.3)',
          fontFamily:'Monsterrat',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          tabBarItemStyle:{backgroundColor:'transparent', borderColor:'green', borderTopWidth:0},
          tabBarStyle:{backgroundColor:'black', borderRadius:20, height:'8%', borderWidth:0},
          headerRight: () => (
            <View style={{flexDirection:'row'}}>
            {/* <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Feather
                    name="info"
                    size={25}
                    color={'grey'}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link> */}
            <Feather
                    name="home"
                    size={25}
                    color={'grey'}
                    style={{ marginRight: 15 }}
                  />
            </View>
          ),
        }}
        />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          // headerShown: false,
          tabBarItemStyle:{backgroundColor:'transparent', borderColor:'green', borderTopWidth:3},
          tabBarStyle:{backgroundColor:'black', borderRadius:20, height:'8%', borderWidth:0},
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Feather
                    name="music"
                    size={25}
                    color={'grey'}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
        
        />
      <Tabs.Screen
        name="three"
        options={{
          title: 'Liked Songs',
          // headerShown: false, 
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} />,
          tabBarItemStyle:{backgroundColor:'transparent', borderColor:'green', borderTopWidth:0},
          tabBarStyle:{backgroundColor:'black', borderRadius:20, height:'8%', borderWidth:0},
        }}
        />
    </Tabs>
    <Animated.View style={{transform: [{ translateY }],display:isPlayerFullscreen?'block':'none',position:'absolute',height:'65%',borderRadius:10,justifyContent:'space-around',alignItems:'center',bottom:'17%',zIndex:2, margin:'2%',width:'96%',padding:'4%',backgroundColor:'rgba(20,20,20,1)',borderWidth:0.5, borderColor:'rgba(255,255,255,0.06)'}}>
    <TouchableHighlight onPress={()=>handleCloseAnimation}>
      <View style={{height:8,width:'30%',opacity:0.2,borderRadius:50,backgroundColor:'white'}} {...panResponder.panHandlers}><Text>_____________________________</Text></View>
    </TouchableHighlight>
    
       <Image 
          style={{ display:videoMode?'none':'flex', width: 270, height:270,margin:10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}
          source={{ uri: liveplayerdata && liveplayerdata.title ? liveplayerdata.thumbnails[1]?.url.replace('=w120-h120','=w300-h300') : 'https://i.gifer.com/yy3.gif' }}
          resizeMode="cover"/>
        <Video
        ref={videoRef}
        onPlaybackStatusUpdate={videoStatus}
        source={{uri:videoUrl}}
        style={{height:280, width:'90%',maxHeight:280, display:!videoMode?'none':'flex',maxWidth:'90%',borderRadius:20,backgroundColor:'rgb(25,25,25)'}}
        useNativeControls={false}
        resizeMode="cover"/>

        <Slider
        thumbTintColor={isPlayerFullscreen?'green':'black'}
        maximumTrackTintColor = 'white'
        minimumTrackTintColor = {isPlayerFullscreen?'green':'black'}
        style={{ width: '100%' }}
        minimumValue={0}
        maximumValue={VideoDuration}
        value={progressBar}
        onValueChange={onSliderValueChange}/>
    <View style={{width:'90%' }}>
            <Text style={{ color: 'white', fontFamily: 'Gogh', alignSelf:'flex-start', fontSize: 20 }}
                numberOfLines={1}
                ellipsizeMode="tail">
                {liveplayerdata && liveplayerdata.title ? liveplayerdata.title : 'Nothing is Playing!'}
            </Text>
            {/* <Text style={{ color: 'grey', fontFamily: 'Monsterrat',alignSelf:'center', fontSize: 15 }}
                numberOfLines={1}
                ellipsizeMode="tail">
                {liveplayerdata && liveplayerdata.album ? liveplayerdata.album.name : liveplayerdata.title}
            </Text> */}
            <Text style={{ backgroundColor: 'rgb(50,50,50)',color:'white',borderRadius:4, margin:7,marginLeft:0,paddingRight:5, paddingLeft:5,fontFamily: 'Monsterrat',alignSelf:'flex-start', fontSize: 15 }}
                numberOfLines={1}
                ellipsizeMode="tail">
                {liveplayerdata && liveplayerdata.title ? liveplayerdata.artists[0].name : 'Playing'}
            </Text>

        </View>
        <View style={{ height:50, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',width:'100%', width:'100%'}}>
        <MaterialCommunityIcons  size={30} onPress={()=>setvideoMode(!videoMode)} name={videoMode?'movie-open-play':'music-circle'} color={'white'} />
        <Pressable
        onPress={() => setplayIndex(playIndex - 1)}
        style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
        padding: 10,
        })}
        >
        {({ pressed }) => (
        <Feather
        size={pressed ? 30 : 30}
        title="playButton"
        name={!pressed?"skip-back":'chevrons-left'}
        color={'rgba(255,255,255,0.9)'}
        />
        )}
        </Pressable>

            <AntDesign  title="playButton" size={50} onPress={()=> setplayingState(playingState=='pause'?'play':'pause')} name={playingState=='pause'?'pausecircle':'play'} color={'rgba(255,255,255,1)'} />
            <Pressable
        onPress={() => setplayIndex(playIndex + 1)}
        style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
        padding: 10,
        })}
        >
        {({ pressed }) => (
        <Feather
        size={pressed ? 30 : 30}
        title="playButton"
        name={!pressed?"skip-forward":'chevrons-right'}
        color={'rgba(255,255,255,0.9)'}
        />
        )}
        </Pressable>
            <Feather  title="playButton" size={25} name='repeat' onPress={()=>setrepeat(!repeat)} color={repeat?'green':'rgba(255,255,255,0.9)'} />
        </View>
    </Animated.View>
    <View  style={{flexDirection:'row',justifyContent:'space-around',alignItems:'center',bottom:65,zIndex:3, width:'96%',margin:"2%",padding:'2%',backgroundColor:'rgba(20,20,20,1)', height:'8%',position:'absolute',borderRadius:8,borderWidth:0.5, borderColor:'rgba(255,255,255,0.06)'}}>
        <View style={{ flex: 2 }}>
          <TouchableHighlight onPress={()=>setisPlayerFullscreen(!isPlayerFullscreen)}>
            <Image 
                style={{ width: 40, height: 40, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}
                source={{ uri: liveplayerdata && liveplayerdata.title ? liveplayerdata.thumbnails[1]?.url : 'https://i.gifer.com/yy3.gif' }}
                resizeMode="cover"/>
                </TouchableHighlight>
        </View>
        <View style={{ flex: 5 }}>
            <Text style={{ color: 'white', fontFamily: 'Monsterrat', textAlign: 'left', fontSize: 15 }}
                numberOfLines={1}
                ellipsizeMode="tail">
                {liveplayerdata && liveplayerdata.title ? liveplayerdata.title : 'Pick a Song'}
            </Text>
            <Text style={{ color: 'grey', fontFamily: 'Monsterrat', textAlign: 'left', fontSize: 12 }}
                numberOfLines={1}
                ellipsizeMode="tail">
                {liveplayerdata && liveplayerdata.title ? liveplayerdata.artists[0].name : 'to start listening  '}
            </Text>
        </View>
        <View style={{ flex: 4, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>


            <MaterialCommunityIcons  title="playButton" size={25} onPress={()=>likeSong()} name={likedSongs.some(likedSong => likedSong.videoId === playerData?.videoId)?'cards-heart':'heart-plus-outline'} color={'green'} />
            <Feather  title="playButton" size={20} name='repeat' onPress={()=>setrepeat(!repeat)} color={repeat?'green':'rgba(255,255,255,0.7)'}  />
            <Ionicons  title="playButton" size={25} onPress={()=> setplayingState(playingState=='pause'?'play':'pause')} name={playingState=='pause'?'pause':'play'} color={'rgba(255,255,255,0.7)'} />
        </View>
  </View>

  </>
  );
}
