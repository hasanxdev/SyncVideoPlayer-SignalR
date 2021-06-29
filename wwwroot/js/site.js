// TODO: Voice Call https://medium.com/@bryanjenningz/how-to-record-and-play-audio-in-javascript-faa1b2b3e49b
let publisher = false;
let $videoHolder = $('#video_holder')[0];
let $videoSource = $('#video_source')[0];
let $videoSubtitle = $('#video_sub')[0];

function stringTimeToSecond(time) {
    let seconds = 0;
    time.split(':').reverse().forEach((p, i) => {
        let timeType = Math.pow(60, i);
        seconds += Number(p) * (timeType ? timeType : 1)
    });
    return seconds;
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});


$(document).on("change", "input[name=video]", function (evt) {
    $videoSource.src = URL.createObjectURL(this.files[0]);
    $videoHolder.load();
});

$(document).on("change", "input[name=sub]", async function (evt) {
    if (this.files[0].name.includes('.vtt')) {
        var subtitle = await toBase64(this.files[0]);
        $($videoSubtitle).attr("src", subtitle);
    } else
        alert("subtitle invalid! please convert subtitle to 'vtt' subtitle, you can use online converter.");
});


let connection = new signalR.HubConnectionBuilder().withUrl('/video-hub').build();
connection.start().then(function () {
    console.log('connection start');
}).catch(function (err) {
    console.error(err.toString());
});

connection.on("VideoPlay", function () {
    if (!publisher) {
        $videoHolder.play()
        console.log("video play/pause toggle");
    }
    publisher = false;
});

connection.on("VideoPause", function () {
    if (!publisher) {
        $videoHolder.pause()
        console.log("video play/pause toggle");
    }
    publisher = false;
});

connection.on("ChangeVideoTime", function (time) {
    if (!publisher) {
        $videoHolder.currentTime = stringTimeToSecond(time);
        console.log("video time to: " + time);
    }
    publisher = false;
});

function videoPlay() {
    publisher = true;
    connection.invoke("VideoPlay")
        .catch(function (err) {
            console.error(err.toString());
        });
}
function videoPause() {
    publisher = true;
    connection.invoke("VideoPause")
        .catch(function (err) {
            console.error(err.toString());
        });
}

$videoHolder.addEventListener('timeupdate', ({ target }) => {
    var dt = new Date(1970, 0, 1);
    dt.setSeconds(target.currentTime);
    let time = dt.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }).replace('24:', '00:');

    if (document.querySelector('#video_time:not(:focus)'))
        document.querySelector('#video_time:not(:focus)').value = time;
});

function changeVideoTime(time) {
    time = time;
    connection.invoke("ChangeVideoTime", time)
        .catch(function (err) {
            console.error(err.toString());
        });
    $videoHolder.currentTime = stringTimeToSecond(time);
}

function changeVideoTimeFromSecond(seconds) {
    var dt = new Date(1970, 0, 1);
    dt.setSeconds($videoHolder.currentTime + seconds);
    let time = dt.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }).replace('24:', '00:');

    connection.invoke("ChangeVideoTime", time)
        .catch(function (err) {
            console.error(err.toString());
        });
    $videoHolder.currentTime = stringTimeToSecond(time);
}
