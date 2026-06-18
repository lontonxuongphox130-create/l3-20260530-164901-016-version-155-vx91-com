(function () {
    var currentScript = document.currentScript;
    var scriptBase = currentScript ? new URL('.', currentScript.src).href : 'assets/js/';

    function loadNative(video, source) {
        if (!video.getAttribute('src')) {
            video.src = source;
        }
        return video.play();
    }

    async function loadWithHls(video, source) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            return loadNative(video, source);
        }
        try {
            var mod = await import(scriptBase + 'hls.js');
            var Hls = mod.H || mod.default || window.Hls;
            if (Hls && Hls.isSupported && Hls.isSupported()) {
                var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hlsInstance = hls;
                return new Promise(function (resolve) {
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        resolve(video.play());
                    });
                });
            }
        } catch (error) {
            video.dataset.hlsError = 'fallback';
        }
        return loadNative(video, source);
    }

    function initPlayer(player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('[data-play-button]');
        var source = player.getAttribute('data-src');
        if (!video || !source) {
            return;
        }

        async function play() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            try {
                await loadWithHls(video, source);
            } catch (error) {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        player.addEventListener('click', function (event) {
            if (event.target === video || event.target === player) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 && overlay) {
                overlay.classList.remove('is-hidden');
            }
        });
        var pagePlay = document.querySelector('[data-page-play]');
        if (pagePlay) {
            pagePlay.addEventListener('click', play);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
    });
})();
