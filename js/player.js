var Player = function(term) {
  this.xhr = new XMLHttpRequest({mozSystem: true});
  this.audio = new Audio();
  this.apiBase = 'https://itunes.apple.com/search?';
  this.playQueue = [];
  this.played = [];
  this.playing = null;
  this.isPlaying = false;
  this._events = {};

  // init
  this.init(term);
  this.initAudio();
};

Player.prototype = {
  init: function(term) {
    if (this.isPlaying) {
      this.audio.pause();
    }
    this.playQueue = [];
    this.played = [];
    this.playing = null;
    this.isPlaying = false;
    this.fetch(term)
      .then(this.expandResult.bind(this))
      .then(this.play.bind(this));
  },
  fetch: function(term) {
    var xhr = this.xhr;
    var endpoint = this.formatEndpointWithTerm(term);
    var promise = new Promise(function(resolve, reject) {
      xhr.addEventListener('load', function(e) {
        if (e.target.status === 200) {
          resolve(JSON.parse(e.target.responseText));
        } else {
          reject(e.target.status);
        }
      });
    });
    xhr.open('GET', endpoint);
    xhr.send();
    return promise;
  },
  expandResult: function(json) {
    var songs = [];
    json.results.forEach(function(song) {
      songs.push({
        title: song.trackName,
        album: song.collectionName,
        artist: song.artistName,
        trackUrl: song.trackViewUrl,
        m4aUrl: song.previewUrl,
        artworkUrl: song.artworkUrl100.replace(/100x100-75\.jpg$/, "400x400-75.jpg"),
        cached: false
      });
    });

    // shuffle
    while (songs.length > 0) {
      this.playQueue.push(songs.splice(Math.floor(Math.random() * songs.length), 1)[0]);
    }
  },
  formatEndpointWithTerm: function(term) {
    var data = {
      term: term,
      country: 'JP',
      media: 'music',
      limit: '200'
    };
    return this.apiBase + Object.keys(data).map(function(key) {
      return key + '=' + encodeURIComponent(data[key]);
    }).join('&');
  },

  initAudio: function() {
    var audio = this.audio;
    audio.type = 'audio/aac';
    audio.addEventListener('loadstart', function() {
      if (this.isPlaying) {
        audio.play();
      }
    }.bind(this));
    audio.addEventListener('ended', function() {
      this.next();
    }.bind(this));
  },
  play: function() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.playing = this.playQueue.shift();
      this.playing.cached = true;
      this.audio.src = this.playing.m4aUrl;
      this.fireEvent('songchange');
    }
  },
  next: function() {
    if (this.playQueue.length > 0) {
      this.played.push(this.playing);
      this.playing = this.playQueue.shift();
      this.audio.src = this.playing.m4aUrl;
      this.fireEvent('songchange');
    }
  },
  prev: function() {
    if (this.audio.currentTime > 2) {
      this.audio.pause();
      this.audio.currentTime = 0;
      setTimeout(function(){this.audio.play();}.bind(this), 500);
    } else if (this.played.length > 0) {
      this.playQueue.unshift(this.playing);
      this.playing = this.played.pop();
      this.audio.src = this.playing.m4aUrl;
      this.fireEvent('songchange');
    }
  },
  pause: function() {
    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    }
  },
  resume: function() {
    if (!this.isPlaying) {
      this.audio.play();
      this.isPlaying = true;
    }
  },

  // events
  addEventListener: function(event, callback) {
    if (this._events[String(event)] === undefined) {
      this._events[String(event)] = [];
    }
    this._events[String(event)].push(callback);
  },
  removeEventListener: function(event, callback) {
    var eventArray = this._events[String(event)];
    if (eventArray) {
      return eventArray.splice(eventArray.indexOf(callback), 1);
    }
  },
  fireEvent: function(event, args) {
    var eventArray = this._events[event];
    if (eventArray) {
      eventArray.forEach(function(eventFunction) {
        eventFunction.apply(null, args);
      });
    }
  }
};
