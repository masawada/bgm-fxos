var Player = function(term) {
  this.xhr = new XMLHttpRequest({mozSystem: true});
  this.audio = new Audio();
  this.apiBase = 'https://itunes.apple.com/search?';
  this.playQueue = [];
  this.played = [];
  this.playing = null;

  // init
  this.init(term);
};

Player.prototype = {
  init: function(term) {
    this.playQueue = [];
    this.played = [];
    this.playing = null;
    this.fetch(term)
      .then(this.expandResult.bind(this));
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

  play: function() {
  },
  next: function() {
  },
  prev: function() {
  },
  pause: function() {
  },
  resume: function() {
  }
};
