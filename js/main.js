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
    const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTceLTuUpr6ExiA6Bfu0g91LuYprw-qCyzCLReU-BCIy3gtj5SlLk49vXCmUQwbVsEm87V6TZzyVtEg/pub?output=csv');
    const showsCsv = await response.text();
    const [keys, ...data] = showsCsv.trim().split('\n').map(row => row.split(','));

    const showObjects = data.map(row => {
        const obj = {};
        keys.forEach((key, index) => {
            obj[key.trim()] = row[index].trim();
        })

        return obj;
    })


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
                        <p>${show.address}<br/>${show.city}, ${show.state} ${show.zip}</p>
                        <a href="${show.mapsUrl}">
                            <span class="material-icons map-link">pin_drop</span>
                        </a>
                    </div>
                    `)})

    document.getElementById('show-dates').innerHTML = showsHtml.length === 0 ? noShows : showsHtml.join('');
}
