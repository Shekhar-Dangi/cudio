console.log("Welcome to Cudio!");

// DOM Elements
const control_song = document.getElementById("controlsong");
const prev_song = document.getElementById("prevsong");
const next_song = document.getElementById("nextsong");
const progress_bar = document.getElementById("progressbar");
const song_name_container = document.getElementById("songname");

// Initials
let audio_element = new Audio();
let is_playing = false;
let songs_list = [];
let lyrics_list = [];
let song_index = 0;
let lyrics_index = 0;
const active_lyrics_lines = [];
let is_time_update_attached = false;
let is_dragging_progressBar = false;

const attachTimeUpdate = (action) => {
  if (!is_time_update_attached) {
    audio_element.addEventListener("timeupdate", action);
    is_time_update_attached = true;
  }
};

const updateSeekBar = () => {
  if (!is_dragging_progressBar) {
    let progress = (audio_element.currentTime / audio_element.duration) * 100;
    progress_bar.value = progress;
  }
};

const playNext = () => {
  audio_element.pause();
  is_time_update_attached = false;
  if (song_index + 1 < songs_list.length) {
    song_index++;
  } else {
    song_index = 0;
  }
  song_name_container.innerText = songs_list[song_index].name;
  audio_element = new Audio("songs/" + songs_list[song_index].name);
  progress_bar.value = 0;
  playPause();
};

const playPrevious = () => {
  audio_element.pause();
  is_time_update_attached = false;
  if (song_index - 1 >= 0) {
    song_index--;
  } else {
    song_index = songs_list.length - 1;
  }
  song_name_container.innerText = songs_list[song_index].name;
  audio_element = new Audio("songs/" + songs_list[song_index].name);
  progress_bar.value = 0;
  playPause();
};

const playPause = () => {
  if (!is_time_update_attached) {
    attachTimeUpdate(updateSeekBar);
    audio_element.addEventListener("ended", () => {
      playNext();
    });
  }
  if (audio_element.paused || audio_element.currentTime <= 0) {
    audio_element.play();
    is_playing = true;
    control_song.classList.remove("fa-circle-play");
    control_song.classList.add("fa-pause");
  } else {
    audio_element.pause();
    is_playing = false;
    control_song.classList.remove("fa-circle-play");
    control_song.classList.remove("fa-pause");
    control_song.classList.add("fa-circle-play");
  }
};

const addSongToList = (index, name) => {
  const song_item = document.createElement("div");
  song_item.classList.add("song-item");

  const image = document.createElement("img");
  image.src = "logo.jpeg";
  song_item.appendChild(image);

  const song_name = document.createElement("span");
  song_name.textContent = name;
  song_item.appendChild(song_name);

  const song_list_play = document.createElement("span");
  song_list_play.classList.add("song-list-play");
  song_item.appendChild(song_list_play);

  const play_icon = document.createElement("i");
  play_icon.classList.add("fa-solid", "fa-circle-play");
  song_list_play.appendChild(play_icon);

  const parent = document.querySelector(".songs-list");
  parent.appendChild(song_item);
};

const addSongs = async () => {
  const songs = document.getElementById("uploaded-songs");
  songs_list = [...songs_list, ...songs.files];
  const lyrics = document.getElementById("uploaded-lyrics");
  lyrics_list = [...lyrics_list, lyrics.files];

  if (songs_list.length > 0) {
    const parent = document.querySelector(".songs-list");
    parent.innerText = "";
    song_index = 0;
    audio_element = new Audio("songs/" + songs_list[0].name);

    song_name_container.innerText = songs_list[0].name;
  }
  for (let i = 0; i < songs_list.length; i++) {
    const song = songs_list[i];
    addSongToList(i, song.name);
  }
};

// Event listeners

progress_bar.addEventListener("mousedown", () => {
  is_dragging_progressBar = true;
});

progress_bar.addEventListener("mouseup", () => {
  is_dragging_progressBar = false;
});

progress_bar.addEventListener("change", () => {
  audio_element.currentTime =
    (progress_bar.value / 100) * audio_element.duration;
});
