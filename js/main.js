window.addEventListener('click', function(e) {
    if (e.target.id !== 'close-mobile-nav') return

    document.getElementById('mobile-nav').classList.add('hidden')

})

window.addEventListener('click', function(e) {
    if (!['burger', 'burger-close'].includes(e.target.id)) return
    document.getElementById('mobile-nav').classList.remove('hidden')

})

window.onload = async function() {{
    if(document.getElementById('show-dates').innerText) {
        await renderShows()
    }
}}

function sortByDate(shows) {
    shows.forEach(show => {
        show.d = new Date(`${show.month} ${show.date}, ${show.year}`);
    })
    shows.sort((a, b) => a.d - b.d)
    const today = new Date();
    today.setDate(today.getDate() - 1);

    return shows.filter(show => show.d >= today);
}

async function fetchShows() {
    console.log('fetching shows');
    const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTceLTuUpr6ExiA6Bfu0g91LuYprw-qCyzCLReU-BCIy3gtj5SlLk49vXCmUQwbVsEm87V6TZzyVtEg/pub?output=csv');
    const showsCsv = await response.text();
    console.log('showsCsv', showsCsv);
    const [keys, ...data] = showsCsv.trim().split('\n').map(row => row.split(','));

    const showObjects = data.map(row => {
        const obj = {};
        keys.forEach((key, index) => {
            obj[key.trim()] = row[index].trim();
        })

        return obj;
    })
    console.log('showObjects', showObjects);


    return sortByDate(showObjects);
}

async function renderShows() {
    const shows = await fetchShows();
    const noShows = (`
                    <div class="show-date">
                        <p style="text-align: center;">
                            No shows scheduled at this time.
                        </p>
                    </div>
                    `)
    const showsHtml = shows.map(show => {
        const time = (show.startTime && show.endTime) ? `${show.startTime} to ${show.endTime}` : 'Time TBD';

        return (`
                    <div class="show-date">
                        <p class="date">
                            <span>${show.day} ${show.month} ${show.date}</span>
                            <span>${time}</span>
                        </p>
                        <a href="${show.venueUrl}">${show.venueName}</a>
                        
                        ${show.additionalInfo === 'with Park Street Riot and Easy Sleeper' 
                            // Special case for Torch Club show on 9/5/2025 so we can include links to the other bands
                            ? (`<p style="margin: 0; padding: 0 0 0 2rem">
                                    <span>~ with </span>
                                    <a href="https://open.spotify.com/artist/0IKYbYMl6HzP1wQG4T8aUT" target="_blank" rel="noreferrer">Park Street Riot</a>
                                    <span> and </span>
                                    <a href="https://open.spotify.com/artist/4JlKf796rnWKhzbN1le14u" target="_blank" rel="noreferrer">Easy Sleeper</a>
                                </p>
                            `) 
                            : (`<p style="${show.additionalInfo ? 'margin: 0; padding: 0 0 0 2rem' : 'display: none'}">~ ${show.additionalInfo}</p>`)}
                        
                        <p>${show.address}<br/>${show.city}, ${show.state} ${show.zip}</p>
                        <a href="${show.mapsUrl}">
                            <span class="material-icons map-link">pin_drop</span>
                        </a>
                    </div>
                    `)})

    document.getElementById('show-dates').innerHTML = showsHtml.length === 0 ? noShows : showsHtml.join('');
}

// Fallback for video autoplay
document.addEventListener('DOMContentLoaded', function() {
    const video = document.querySelector('video');

    // Attempt to play video after page load
    video.play().catch(function(error) {
        console.log("Video autoplay failed:", error);
    });
});
