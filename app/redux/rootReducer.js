import { combineReducers } from "redux";
import { songReducer,lyricsReducer ,songRadioReducer,likeTriggerReducer } from "./reducer";
export default combineReducers({
    songReducer,lyricsReducer, songRadioReducer,likeTriggerReducer
})