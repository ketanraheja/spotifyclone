let currentSong = new Audio()
let currentFolder
let songs = []

function secondsToMinutes(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return "0:00 ";
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function getSongs(folder) {
    currentFolder = folder;
    // let response = await fetch(`http://127.0.0.1:3000/songs/${folder}/`);
    // let text = await response.text();
    // let div = document.createElement('div');
    // div.innerHTML = text;
    // let as = div.getElementsByTagName('a');
    // let songs = [];
    // for (let index = 0; index < as.length; index++) {
    //     const element = as[index];
    //     if (element.href.endsWith(".mp3")) {
    //         songs.push(element.href.split(`http://127.0.0.1:3000/songs/${folder}/`)[1].replaceAll("%20", " "));
    //     }
    // }
    let response = await fetch(`songs/${folder}/songs.json`);
    let songs = await response.json();
    let songList = document.getElementsByClassName("songUL")[0];
    songList.innerHTML = "";
    for (const song of songs) {
        songList.innerHTML += `<li>
                        <img src="svg/music.svg" alt="">
                        <div class="song">${song}</div>
                        <div>Play now</div>
                        <img src="svg/playnow.svg" alt="">
                        </li>`
    }

    // Add an event listener to SongList 
    Array.from(songList.getElementsByTagName("li")).forEach(element => {
        element.addEventListener("click", () => {
            playMusic(element.querySelector(".song").innerHTML.trim())
        })
    });
    return songs;
}

async function displayAlbums() {
    // let response = await fetch(`http://127.0.0.1:3000/songs/`);
    // let info = await response.text();
    // let div = document.createElement("div");
    // div.innerHTML = info;
    // let anchors = Array.from(div.getElementsByTagName("a"));
    // for (let index = 0; index < anchors.length; index++) {
    //     const e = anchors[index];
    //     if (e.href.includes("songs")) {
    //         folder = e.href.split("/").slice(0,)[4];
    //         currentFolder = folder;
            // let response = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            // let info = await response.json();
            // document.querySelector(".cardContainer").innerHTML += `<div data-folder="${folder}" class="card">
            //             <div class="play">
            //                 <img src="svg/cardplay.svg" alt="">
            //             </div>
            //             <img src="songs/${folder}/cover.jpg" alt="">
            //             <h2>${info.title}</h2>
            //             <p>${info.description}</p>
            //         </div>`
    //     }
    // }
    
    let response = await fetch(`songs/folders.json`);
    let folders = await response.json();

    for (let folder of folders) {
        let response = await fetch(`songs/${folder}/info.json`);
        let info = await response.json();
        document.querySelector(".cardContainer").innerHTML += `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="svg/cardplay.svg" alt="">
                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="">
                        <h2>${info.title}</h2>
                        <p>${info.description}</p>
                    </div>`
    }

    // Add an event listener to cards
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(item.currentTarget.dataset.folder);
            playMusic(songs[0]);
        })
    });
}


async function main() {
    let songs = await getSongs("diljit");
    playMusic(songs[0], true);

    // Display all the albums
    displayAlbums();

    // Add an event listener to play 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "svg/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "svg/play.svg"
        }
    })

    // Add an event listener to currentSong 
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songDuration").innerHTML = `${secondsToMinutes(currentSong.currentTime)} / ${secondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = currentSong.currentTime / currentSong.duration * 100 + "%"
    })

    // Add an event listener to seekbar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (percent * currentSong.duration) / 100;
    })

    // Add an event listener to hamburger 
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-3%";
    })

    // Add an event listener to cross 
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-125%";
    })

    // Add an event listener to previous 
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`${currentFolder}/`)[1].replaceAll("%20", " "));
        if ((index - 1) >= 0) {
            if (currentSong.paused) {
                playMusic(songs[index - 1], true);
            }
            else {
                playMusic(songs[index - 1], false);
            }
        }
    })

    // Add an event listener to next 
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`${currentFolder}/`)[1].replaceAll("%20", " "));
        if ((index + 1) < songs.length) {
            if (currentSong.paused) {
                playMusic(songs[index + 1], true);
            }
            else {
                playMusic(songs[index + 1], false);
            }
        }
    })

    // Add an event listener to volume
    vol.addEventListener("change", e => {
        currentSong.volume = e.target.value / 100;
    })

    // Add an event listener to mute
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            vol.value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.2;
            vol.value = 20;
        }
    })

}

function playMusic(track, pause = false) {
    currentSong.src = `songs/${currentFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "svg/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = track;
    document.querySelector(".songDuration").innerHTML = "0:00 / 0:00";
}

main()