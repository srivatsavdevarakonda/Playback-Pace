// --- CORE HELPER FUNCTIONS ---

// Parses time strings like "223:45:10" into total seconds.
const parseTimeToSeconds = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const parts = timeStr.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
    return isNaN(seconds) ? 0 : seconds;
};

// Formats seconds into a readable string, correctly handling days for very long videos.
const formatSecondsToTime = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";

    const days = Math.floor(totalSeconds / 86400);
    const remainingSecondsAfterDays = totalSeconds % 86400;
    const hours = Math.floor(remainingSecondsAfterDays / 3600);
    const remainingSecondsAfterHours = remainingSecondsAfterDays % 3600;
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    const seconds = Math.floor(remainingSecondsAfterHours % 60);

    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}, ${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }
    if (totalSeconds >= 3600) {
         return `${hours}:${paddedMinutes}:${paddedSeconds}`;
    }
    return `${minutes}:${paddedSeconds}`;
};

// --- LOGIC FOR STANDARD VIDEO PAGE ---
const initStandardVideoPlayer = () => {
    const videoPlayer = document.querySelector('.html5-main-video');
    const durationElement = document.querySelector('.ytp-time-duration');
    if (!videoPlayer || !durationElement || durationElement.hasAttribute('data-pace-initialized')) return;
    
    durationElement.setAttribute('data-pace-initialized', 'true');

    const updateDisplay = () => {
        const originalTotalSeconds = parseTimeToSeconds(durationElement.textContent);
        if (originalTotalSeconds === 0) return;

        const currentSpeed = videoPlayer.playbackRate;
        const newTotalSeconds = originalTotalSeconds / currentSpeed;
        const savedSeconds = originalTotalSeconds - newTotalSeconds;

        let paceElement = document.getElementById('playback-pace-display');
        if (!paceElement) {
            paceElement = document.createElement('span');
            paceElement.id = 'playback-pace-display';
            paceElement.style.cssText = 'color: #f1f1f1 !important; font-weight: bold !important; margin-left: 8px !important;';
            durationElement.parentElement.appendChild(paceElement);
        }

        paceElement.textContent = currentSpeed === 1 ? '' : `(${formatSecondsToTime(newTotalSeconds)} | Saved: ${formatSecondsToTime(savedSeconds)})`;
    };

    videoPlayer.addEventListener('ratechange', updateDisplay);
    videoPlayer.addEventListener('loadedmetadata', updateDisplay);
    updateDisplay();
};

// --- LOGIC FOR YOUTUBE SHORTS PAGE ---
const initShortsPlayer = () => {
    const shortsContainer = document.querySelector('#shorts-player');
    if (!shortsContainer || shortsContainer.hasAttribute('data-pace-initialized')) return;

    const videoPlayer = shortsContainer.querySelector('video[src]');
    if (!videoPlayer) return;

    shortsContainer.setAttribute('data-pace-initialized', 'true');

    let paceElement;
    const createPaceElement = () => {
        if (document.getElementById('playback-pace-shorts-display')) return;
        
        paceElement = document.createElement('div');
        paceElement.id = 'playback-pace-shorts-display';
        paceElement.style.cssText = `
            position: absolute; bottom: 120px; left: 10px; z-index: 9999; 
            background-color: rgba(0, 0, 0, 0.75); color: white; padding: 5px 10px; 
            border-radius: 6px; font-size: 14px; font-family: 'Roboto', 'Arial', sans-serif;
            pointer-events: none; text-align: left;
        `;
        const playerContainer = document.querySelector('#player-container.ytd-shorts');
        if(playerContainer) playerContainer.appendChild(paceElement);
    };

    const updateShortsDisplay = () => {
        if (!paceElement) createPaceElement();
        if (!paceElement) return;

        const originalTotalSeconds = videoPlayer.duration;
        if (isNaN(originalTotalSeconds) || originalTotalSeconds === 0) return;
        
        const currentSpeed = videoPlayer.playbackRate;
        const newTotalSeconds = originalTotalSeconds / currentSpeed;
        const savedSeconds = originalTotalSeconds - newTotalSeconds;

        if (currentSpeed === 1) {
            paceElement.style.display = 'none';
        } else {
            paceElement.style.display = 'block';
            paceElement.innerHTML = `<strong>Pace:</strong> ${formatSecondsToTime(newTotalSeconds)}<br><strong>Saved:</strong> ${formatSecondsToTime(savedSeconds)}`;
        }
    };
    
    videoPlayer.addEventListener('ratechange', updateShortsDisplay);
    videoPlayer.addEventListener('loadedmetadata', updateShortsDisplay);
    updateShortsDisplay();
};

// --- INITIALIZATION OBSERVER ---
const initialize = () => {
    if (window.location.href.includes('/shorts/')) {
        initShortsPlayer();
    } else if (window.location.href.includes('/watch')) {
        initStandardVideoPlayer();
    }
};

const observer = new MutationObserver(initialize);
observer.observe(document.body, { childList: true, subtree: true });
initialize();