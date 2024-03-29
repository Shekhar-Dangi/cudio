console.log("Welcome to Cudio!");

// DOM Elements
const control_song = document.getElementById("controlsong");
const bar = document.getElementById("bar");
const nav_links = document.querySelector(".links");
const prev_song = document.getElementById("prevsong");
const next_song = document.getElementById("nextsong");
const progress_bar = document.getElementById("progressbar");
const song_name_container = document.getElementById("songname");
const duration = document.querySelector(".duration");
const current_duration = document.querySelector(".current-duration");

// Initials
let audio_element = new Audio();
let is_playing = false;
let songs_list = [];
let lyrics_list = [];
let song_index = 0;
let lyrics_index = -1;
let lyrics_lines_index = 0;
let active_lyrics_lines = [];
let is_time_update_attached = false;
let is_dragging_progressBar = false;
let lyrics_lines = [];

const attachTimeUpdate = (action) => {
  if (!is_time_update_attached) {
    audio_element.addEventListener("timeupdate", action);
    is_time_update_attached = true;
  }
};

const updateSeekBarAndLyrics = () => {
  if (!is_dragging_progressBar) {
    let progress = (audio_element.currentTime / audio_element.duration) * 100;
    progress_bar.value = progress;
    current_duration.innerText = convertTime(audio_element.currentTime);

    for (let i = 0; i < lyrics_lines.length; i++) {
      if (
        audio_element.currentTime > lyrics_lines[i].time &&
        i + 1 < lyrics_lines.length &&
        audio_element.currentTime < lyrics_lines[i + 1].time
      ) {
        lyrics_lines_index = i;
        break;
      }
    }
    const lyricsElement = document.getElementById(
      "lyrics" + lyrics_lines_index
    );
    deactivateLyricsLine();
    lyricsElement.classList.add("col-green");
    if (!active_lyrics_lines.includes(lyrics_lines_index)) {
      active_lyrics_lines.push(lyrics_lines_index);
    }
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
  deactivateLyricsLine();
  processLyrics();
  audio_element.addEventListener("loadedmetadata", function () {
    duration.innerText = convertTime(audio_element.duration);
  });
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
  deactivateLyricsLine();
  processLyrics();
  audio_element.addEventListener("loadedmetadata", function () {
    duration.innerText = convertTime(audio_element.duration);
  });
};

const playPause = () => {
  if (!is_time_update_attached) {
    attachTimeUpdate(updateSeekBarAndLyrics);
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
  lyrics_list = [...lyrics_list, ...lyrics.files];

  if (songs_list.length > 0) {
    const parent = document.querySelector(".songs-list");
    parent.innerText = "";
    song_index = 0;
    audio_element = new Audio("songs/" + songs_list[0].name);

    song_name_container.innerText = songs_list[0].name;
    audio_element.addEventListener("loadedmetadata", function () {
      duration.innerText = convertTime(audio_element.duration);
    });
    current_duration.innerText = "0:00";
  }
  for (let i = 0; i < songs_list.length; i++) {
    const song = songs_list[i];
    addSongToList(i, song.name);
  }
  processLyrics();
};

// Lyrics Functions

function convertTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remaining_seconds = Math.floor(seconds % 60);
  return `${minutes}:${remaining_seconds < 10 ? "0" : ""}${remaining_seconds}`;
}

const deactivateLyricsLine = () => {
  active_lyrics_lines.forEach((i) => {
    const lyrics_element = document.getElementById("lyrics" + i);
    lyrics_element.classList.remove("col-green");
  });
  active_lyrics_lines = [];
};

const processLyrics = async () => {
  findLyrics();
  if (lyrics_index != -1) {
    lyrics_lines = lyricsTextToObject(
      await readLyrics(lyrics_list[lyrics_index])
    );
    writeLyrics(lyrics_lines);
  } else {
    writeLyrics([{ text: "No lyrics found!" }]);
  }
};

const findLyrics = () => {
  lyrics_index = -1;
  for (let i = 0; i < lyrics_list.length; i++) {
    let lyrics_name = lyrics_list[i].name.split(".")[0];
    let song_name = songs_list[song_index].name.split(".")[0];
    if (lyrics_name == song_name) {
      lyrics_index = i;
      break;
    }
  }
};

const readLyrics = (file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function () {
      resolve(reader.result);
    };
    reader.onerror = function () {
      reject(reader.error);
    };
  });
};

const writeLyrics = (lines) => {
  const lyricsElement = document.querySelector(".lyrics-text");
  lyricsElement.innerText = "";
  let index = 0;

  lines.forEach((line) => {
    const paragraph = document.createElement("p");
    paragraph.id = "lyrics" + index;
    index++;
    paragraph.innerText = line.text;
    lyricsElement.appendChild(paragraph);
  });
};

const parseTime = (time) => {
  const minsec = time.split(":");
  const min = parseInt(minsec[0]) * 60;
  const sec = parseFloat(minsec[1]);
  return min + sec;
};

const lyricsTextToObject = (lyrics) => {
  const regex = /^\[(?<time>\d{2}:\d{2}(\.\d{2})?)\](?<text>.*)/;
  const lines = lyrics.split("\n");
  const output = [];
  lines.forEach((line) => {
    const match = line.match(regex);

    if (match == null) return;

    const { time, text } = match.groups;
    output.push({
      time: parseTime(time),
      text: text.trim(),
    });
  });
  return output;
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

bar.addEventListener("click", () => {
  if (nav_links.style.display == "none") {
    nav_links.style.display = "flex";
  } else {
    nav_links.style.display = "none";
  }
});
