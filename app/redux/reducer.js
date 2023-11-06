const initialState = null; 

export const songReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_CURRENT_SONG':
            return action.data;
        default:
            return state;
    }
}
export const songRadioReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_SONG_RADIO':
            return action.data;
        default:
            return state;
    }
}

export const likeTriggerReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_LIKE_TRIGGER':
            return action.data;
        default:
            return state;
    }
}

export const lyricsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_LYRICS':
            return action.data;
        default:
            return state;
    }
}