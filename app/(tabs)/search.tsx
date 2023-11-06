import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Image, Keyboard } from 'react-native';
import axios from 'axios';
import Feather from '@expo/vector-icons/Feather';
import { TouchableHighlight } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCurrentSong,setSongRadio, setLyrics } from '../redux/actions';
import { UseSelector, useSelector } from 'react-redux/es/hooks/useSelector';
interface SearchResult {
  videoId: string;
  title: string;
  category:string;
  artist: string;
  isExplicit: boolean;
  thumbnails: Array<{ url: string }>;
  artists:Array<{ name: string }>;
  duration:string;
  album:Array<{ name: string }>;
}


export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [searchload, setsearchload] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchMode, setsearchMode]= useState('songs')
  const dispatch = useDispatch();
  const handleLivePlayer =(data:any)=>{
    dispatch(setCurrentSong(data));
    getSongRadio(data.videoId);
    // console.warn('dispath', data);
  }


  function transformVideoData(videoDataList) {
    return videoDataList.map((videoData) => {
      return {
        album: {
          id: 'noID',  // You may need to provide appropriate values for these fields
          name: 'No Album',
        },
        artists: videoData.artists,
        category: "Videos",  // Assuming you want to change the category to "Songs"
        duration: videoData.duration,
        duration_seconds: videoData.duration_seconds,
        feedbackTokens: {
          add: null,
          remove: null,
        },
        inLibrary: false,  // You may want to set this value appropriately
        isExplicit: false,  // You may want to set this value appropriately
        resultType: "video",
        thumbnails:[videoData.thumbnails[0],videoData.thumbnails[0]],
        title: videoData.title,
        videoId: videoData.videoId,
        videoType: "MUSIC_VIDEO_TYPE_ATV",  // Assuming you want to set it to this value
        year: videoData.year,  // You may want to set this value appropriately
      };
    });
  }
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
  const handleSearch = async () => {
    try {
      // Make a request to your custom API for searching
      setsearchload(true);
      Keyboard.dismiss();
      const response = await axios.get(
        `https://symphony-youtube.mostuselessboy.repl.co/search?query=${query}&filter=${searchMode}`
      );
      console.log(response.data)
      if (response.data) {
        if (response.data[0].category=='Videos'){
          const newdata = transformVideoData(response.data);
          setSearchResults(newdata);
          setsearchload(false);
        }else{
          setSearchResults(response.data);
          setsearchload(false);
        }
        // const data = response.data.slice(1); // Create a new array excluding the first element
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.input}>
      <TextInput
      style={{width:'86%', height:40, color:'white', fontSize:15,fontFamily:'Monsterrat'}}
        placeholder="Search Music, Artists & More"
        placeholderTextColor="grey" 
        onChangeText={(text) => setQuery(text)}
        value={query}
        onSubmitEditing={handleSearch}
      />
      <TouchableHighlight onPress={handleSearch}>
        {searchload ? (
          <Image style={{height:25, width: 25,}}  source={{ uri: 'https://raw.githubusercontent.com/Codelessly/FlutterLoadingGIFs/master/packages/cupertino_activity_indicator.gif' }} />
          ) : (
          <Feather
            title="Search"
            size={25}
            style={{ marginBottom: 0 }}
            name="search"
            color="grey"
            />
            )}
      </TouchableHighlight>

      </View>
            <Text onPress={()=>setsearchMode(searchMode=='songs'?'videos':'songs')} style={{width:'98%',alignSelf:'center',borderColor: 'green',margin:3,padding:5,borderWidth: 1,borderRadius:5, backgroundColor:'rgb(20,20,20)', textAlign:'center',color:'green', textTransform:'uppercase',fontSize:18,fontFamily:'Monsterrat'}}>Searching {searchMode}</Text>

      <FlatList
        data={searchResults}
        keyExtractor={(item) => String(item.videoId)}
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
  videothumbnail: {
    width: 80,
    borderRadius:8,
    height: 50,
    marginRight: 10,
  },
});
