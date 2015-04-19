(function() {
  var term = window.prompt();
  player = new Player(term);

  var app = new Vue({
    el: '#app',
    data: {
      term: term,
      trackName: 'Loading...',
      artistName: 'Loading...',
      albumName: 'Loading...',
      artwork: '',
      playState: 'Pause'
    },
    ready: function() {
      player.addEventListener('songchange', function() {
        this.setView(
          player.playing.title,
          player.playing.artist,
          player.playing.album,
          player.playing.artworkUrl
        );
      }.bind(this));

      this.setView('Loading...', 'Loading...', 'Loading...', '/images/nopict.png');
    },
    methods: {
      prev: function() {
        player.prev();
      },
      pause: function() {
        if (player.isPlaying) {
          player.pause();
          this.$set('playState', 'Play');
        } else {
          player.resume();
          this.$set('playState', 'Pause');
        }
      },
      next: function() {
        player.next();
      },
      openiTunes: function() {
        window.open(player.playing.trackUrl);
      },
      changeTerm: function() {
        var term = window.prompt() || this.$get('term');
        this.$set('term', term);
        player.init(term);
        this.setView('Loading...', 'Loading...', 'Loading...', '/images/nopict.png');
      },
      setView: function(title, artist, album, artworkUrl) {
        this.$set('trackName', title);
        this.$set('artistName', artist);
        this.$set('albumName', album);
        this.$set('artwork', artworkUrl);
        var image = document.querySelector('.artwork');
        image.onload = function() {
          image.style.marginTop = (-image.height / 2) + 'px';
        };
      }
    }
  });
})();
