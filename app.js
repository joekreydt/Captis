

document.getElementById('selectMedia').addEventListener('click', recordClick, false);

//https://developer.chrome.com/extensions/desktopCapture
function recordClick() {
    chrome.desktopCapture.chooseDesktopMedia(["screen", "window", "tab", "audio"], accessToRecord);
}

// Supported audio constraints: https://addpipe.com/blog/audio-constraints-getusermedia/
function accessToRecord(id, audioState) {
    // if statement checks the canRequestAudioTrack object of the audioState argument given to accessToRecord()
    if (audioState.canRequestAudioTrack) {
        console.log("Audio is being recorded");
    } else {
        console.log("Audio is not being recorded.")
    }
    navigator.mediaDevices.getUserMedia({
        audio: {
            mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: id
            }
        },
        video: {
            mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: id,
//https://stackoverflow.com/questions/44353801/how-to-add-audio-in-desktop-capture-in-chrome-extension
            }
        }
    }).then(startStream).catch(failedStream);
}

function startStream(stream) {
    var video = document.getElementById('mainScreen');
    //video.src = URL.createObjectURL(stream); //converts video binary code into URL
    //^^^ above was deprecated (or soon will be)
    // https://www.chromestatus.com/features/5618491470118912
    console.log(stream);
    try {
        video.srcObject = stream;
    } catch (error) {
        video.src = URL.createObjectURL(stream);
    }
    
    var options = {mimeType: 'video/mp4'};
    mediaRecorder = new MediaRecorder(stream);
    var recordedChunks = [];
    
    mediaRecorder.ondataavailable = handleDataAvailable;
    
    function handleDataAvailable(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
            console.log("data is being handled properly")
        } else {
            console.log("handleDataAvailable function issue.")
        }
    }
    
    var interval;
    document.getElementById("startRecording").addEventListener("click", function(){
        mediaRecorder.start();
        
        var minutes = 00;
        var seconds = 00;
        var tens = 00;
        var appendMinutes = document.getElementById("minutes");
        var appendSeconds = document.getElementById("seconds");
        var appendTens = document.getElementById("tens");

        
        clearInterval(interval);
        interval = setInterval(startCounter, 10);
        
        function startCounter() {
            tens++;
            if (tens < 9){
                appendTens.innerHTML = "0" + tens;
            }
            if (tens > 9){
                appendTens.innerHTML = tens;
            }
            if (tens > 99){
                seconds++;
                appendSeconds.innerHTML = "0" + seconds;
                tens = 0;
                appendTens.innerHTML = "0" + 0;
            }
            if (seconds > 9){
                appendSeconds.innerHTML = seconds;
            }
            if (seconds > 60){
                minutes++;
                appendMinutes.innerHTML = "0" + minutes;
                seconds = 0;
                appendSeconds.innerHTML = "0" + 0;
                tens = 0;
                appendTens.innerHTML = "0" + 0;
            }
        }
        
        console.log("recording started successfully");
    });
    
    /*
    stream.getVideoTracks()[0].onended = function () {
    // doWhatYouNeedToDo();
    };
    */
    
    stream.getVideoTracks()[0].onended = function () {
        console.log("stream ended successfully");
        mediaRecorder.stop();
        clearInterval(interval);
    };
    
    document.getElementById("stopRecording").addEventListener("click", function(){
        mediaRecorder.stop();
        clearInterval(interval);
        console.log("recording stopped successfully");
    });
    
    const downloadButton = document.querySelector('button#downloadButton');
    downloadButton.addEventListener('click', function() {
        const blob = new Blob(recordedChunks, {type: 'video/webm'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'captis-video.webm';
        document.body.appendChild(a);
        a.click();
        console.log("download button click recognized");
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    });
    
}

function failedStream() {
    console.log("Stream failure.");
}



// https://developers.google.com/web/updates/2016/01/mediarecorder
// https://developers.google.com/web/updates/2016/10/capture-stream
// https://webrtc.github.io/samples/src/content/getusermedia/record/

// https://addpipe.com/blog/mediarecorder-api/
// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API
// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Recording_a_media_element
