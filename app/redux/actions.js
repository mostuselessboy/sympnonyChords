export function setCurrentSong(data) {
    return {
        type: 'SET_CURRENT_SONG',
        data: data
    };
}

export function setSongRadio(data) {
    return {
        type: 'SET_SONG_RADIO',
        data: data
    };
}

export function setLikeTrigger(data) {
    return {
        type: 'SET_LIKE_TRIGGER',
        data: data
    };
}


export function setLyrics(data) {
    return {
        type: 'SET_LYRICS',
        data: data
    };
}
