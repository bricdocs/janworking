/*=====================================================*
 camera.js
 Version 1.0
=====================================================*/

const Camera = {

    video: null,
    stream: null,
    ready: false

};

async function startCamera() {

    Camera.video = document.getElementById("video");

    if (!Camera.video) {

        throw new Error("index.html içinde id='video' bulunamadı.");

    }

    try {

        Camera.stream = await navigator.mediaDevices.getUserMedia({

            video: {

                facingMode: {
                    ideal: "environment"
                },

                width: {
                    ideal: 1920
                },

                height: {
                    ideal: 1080
                }

            },

            audio: false

        });

        Camera.video.srcObject = Camera.stream;

        await new Promise(resolve => {

            Camera.video.onloadedmetadata = () => {

                resolve();

            };

        });

        await Camera.video.play();

        Camera.ready = true;

        console.log(
            "Camera started",
            Camera.video.videoWidth,
            Camera.video.videoHeight
        );

    }
    catch (err) {

        console.error("Camera Error:", err);

        throw err;

    }

}

function cameraReady() {

    return Camera.ready;

}

function getVideo() {

    return Camera.video;

}

function stopCamera() {

    if (Camera.stream) {

        Camera.stream.getTracks().forEach(track => {

            track.stop();

        });

    }

    Camera.ready = false;

}
