      // Track playlist
      let playlists = {};
      let currentPlaylist = null;
      let currentTrackIndex = 0;
      let isShuffleOn = false;
      let audioCtx, analyser, source, dataArray, bufferLength;

      // Get elements
      const audio = document.getElementById("audioPlayer");
      const playPauseBtn = document.getElementById("playPauseBtn");
      const prevBtn = document.getElementById("prevBtn");
      const nextBtn = document.getElementById("nextBtn");
      const shuffleBtn = document.getElementById("shuffleBtn");
      const timeDisplay = document.getElementById("timeDisplay");
      const progressBar = document.getElementById("progress");
      const trackNameDisplay = document.getElementById("trackName");
      const playlistSelector = document.getElementById("playlistSelector");
      const newPlaylistInput = document.getElementById("newPlaylistInput");
      const createPlaylistBtn = document.getElementById("createPlaylistBtn");
      const deletePlaylistBtn = document.getElementById("deletePlaylistBtn");
      const newTrackInput = document.getElementById("newTrackInput");
      const canvas = document.getElementById("visualizer");
      const canvasCtx = canvas.getContext("2d");

      console.log(playlists);
      //Load playlists from localeStorage
      function loadPlaylists() {
        const savedPlaylists = JSON.parse(localStorage.getItem("playlists"));
        if (savedPlaylists) {
          playlists = savedPlaylists;
          populatePlaylistSelector();
        }
      }

      // Save playlists to localStorage
      function savePlaylists() {
        localStorage.setItem("playlists", JSON.stringify(playlists));
      }

      // Populate playlist dropdown
      function populatePlaylistSelector() {
        playlistSelector.innerHTML = "";
        for (const playlistName in playlists) {
          const option = document.createElement("option");
          option.value = playlistName;
          option.textContent = playlistName;
          playlistSelector.appendChild(option);
        }
        currentPlaylist = playlistSelector.value;
        loadTrack(0);
      }

      // Helper function to format time
      function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
      }

      // Load a track from the current playlist
      function loadTrack(trackIndex) {
        if (!currentPlaylist || playlists[currentPlaylist].length === 0) return;
        currentTrackIndex = trackIndex;
        const track = playlists[currentPlaylist][currentTrackIndex];
        audio.src = track;
        trackNameDisplay.textContent = `Track: ${track}`;
        audio.load();
      }

      // Play/Pause button toggle
      playPauseBtn.addEventListener("click", () => {
        if (audio.paused) {
          audio.play();
          playPauseBtn.textContent = "Pause";
          if (!audioCtx) {
            initializeAudioVisualizer();
          }
        } else {
          audio.pause();
          playPauseBtn.textContent = "Play";
        }
      });

      // Update time display and progress bar
      audio.addEventListener("timeupdate", () => {
        const currentTime = audio.currentTime;
        const duration = audio.duration;

        // Update time display
        timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(
          duration
        )}`;

        // Update progress bar width
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
      });

      // Set total duration once audio is loaded
      audio.addEventListener("loadedmetadata", () => {
        timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
      });

      // Format time for display
      function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
      }

      // Click progress bar to seek
      document.getElementById("progressBar").addEventListener("click", (e) => {
        const width = e.target.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;

        audio.currentTime = (clickX / width) * duration;
      });

      // Load and play next track
      function nextTrack() {
        if (isShuffleOn) {
          currentTrackIndex = Math.floor(
            Math.random() * playlists[currentPlaylist].length
          );
        } else {
          currentTrackIndex =
            (currentTrackIndex + 1) % playlists[currentPlaylist].length;
        }
        loadTrack(currentTrackIndex);
        audio.play();
        playPauseBtn.textContent = "Pause";
      }

      // Load and play previous track
      function prevTrack() {
        if (isShuffleOn) {
          currentTrackIndex = Math.floor(
            Math.random() * playlists[currentPlaylist].length
          );
        } else {
          currentTrackIndex =
            (currentTrackIndex - 1 + playlists[currentPlaylist].length) %
            playlists[currentPlaylist].length;
        }
        loadTrack(currentTrackIndex);
        audio.play();
        playPauseBtn.textContent = "Pause";
      }

      // Next and Previous buttons
      nextBtn.addEventListener("click", nextTrack);
      prevBtn.addEventListener("click", prevTrack);

      // Shuffle button toggle
      shuffleBtn.addEventListener("click", () => {
        isShuffleOn = !isShuffleOn;
        shuffleBtn.textContent = `Shuffle: ${isShuffleOn ? "On" : "Off"}`;
      });

      //Add track to playlist
      addTrackBtn.addEventListener("click", () => {
        const newTrack = newTrackInput.value;
        if (newTrack && currentPlaylist) {
          playlists[currentPlaylist].push(newTrack);
          savePlaylists();
          newTrackInput.value = "";
          loadTrack(playlists[currentPlaylist].length - 1);
          audio.play();
          playPauseBtn.textContent = "Pause";
        }
      });

      // Create new playlist
      createPlaylistBtn.addEventListener("click", () => {
        const newPlaylist = newPlaylistInput.value;
        if (newPlaylist && !playlists[newPlaylist]) {
          playlists[newPlaylist] = [];
          savePlaylists();
          populatePlaylistSelector();
          newPlaylistInput.value = "";
          console.log(playlists[currentPlaylist]);
        }
      });

      // Load selected playlist
      playlistSelector.addEventListener("change", () => {
        currentPlaylist = playlistSelector.value;
        loadTrack(0);
        audio.play();
        playPauseBtn.textContent = "Pause";
        console.log(playlists);
      });

      loadPlaylists();

      // Delete playlist function
      function deletePlaylist() {
        if (currentPlaylist && playlists[currentPlaylist]) {
          delete playlists[currentPlaylist];
          savePlaylists();
          populatePlaylistSelector();

          // Set currentPlaylist to null or the first playlist if available
          currentPlaylist = playlistSelector.value || null;
          if (currentPlaylist) {
            loadTrack(0);
          } else {
            audio.src = "";
            trackNameDisplay.textContent = "";
            timeDisplay.textContent = "0:00 / 0:00";
            progressBar.style.width = "0%";
          }
        }
        console.log(playlists);
      }

      // Event listener for delete playlist button
      deletePlaylistBtn.addEventListener("click", () => {
        deletePlaylist();
      });

      // Play next track when the current track ends
      audio.addEventListener("ended", nextTrack);

      // Load the first track initially
      loadTrack(currentTrackIndex);
      console.log(playlists[currentPlaylist]);

      // Initialize Audio Visualizer
      function initializeAudioVisualizer() {
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        drawVisualizer();
      }

      // Draw visualizer on canvas
      function drawVisualizer() {
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        requestAnimationFrame(drawVisualizer);

        analyser.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];

          canvasCtx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
          canvasCtx.fillRect(
            x,
            HEIGHT - barHeight / 2,
            barWidth,
            barHeight / 2
          );

          x += barWidth + 1;
        }
      }