/*=====================================================*
 app.js
 Version 1.0
=====================================================*/

let debugCapture = false;
let runtimeSaved = false;

window.GOOD_SCORE = 70;
window.BAD_SCORE  = 40;
window.scoreTag = 0;

window.frameId = 0;

let DebugImages = {
    source: null,
    warp: null,
    gray: null,
    rankBefore: null,
    rankAfter: null,
    suit: null
};

window.onload = async function () {

    await waitForOpenCV();
    await loadTemplates();
    await startCamera();

    const video = getVideo();

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    function loop() {

        if (!cameraReady()) {
            requestAnimationFrame(loop);
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        //----------------------------------
        // Kamera görüntüsü
        //----------------------------------

        ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

DebugImages.source = canvas;
     
        //----------------------------------
        // Kart Algılama
        //----------------------------------

        const src = cv.imread(canvas);

window.DEBUG_CAPTURE = debugCapture;
     
        const quad = detectCard(src);

if (quad) {

    drawCard(canvas, quad);
    
const warped = warpCard(src, quad);

if (warped) {

const corner = preprocessCorner(warped);

const rankCrop = cropBinary(corner.rank);

console.log(
    "Rank Crop:",
    rankCrop.cols,
    "x",
    rankCrop.rows
);

if (!runtimeSaved)
{
    saveMat(rankCrop, "runtime.png");
    runtimeSaved = true;
}
 
console.log(
    "Runtime White:",
    cv.countNonZero(rankCrop)
);
 
const rankResult =
matchTemplate(rankCrop, Templates.ranks);

rankCrop.delete();

console.log(
    "[F" + window.frameId + "]",
    "Rank Match:",
    rankResult.name,
    rankResult.score
);

window.scoreTag = Math.round(rankResult.score * 100);
 
// Şimdilik sadece test
console.log(
    "Rank:",
    corner.rank.cols,
    "x",
    corner.rank.rows
);

console.log(
    "Suit:",
    corner.suit.cols,
    "x",
    corner.suit.rows
);

corner.binary.delete();
corner.rank.delete();
corner.suit.delete();

warped.delete();

}

}

        src.delete();

debugCapture = false;
     
        requestAnimationFrame(loop);
    }

document
    .getElementById("debugBtn")
    .onclick = function ()
{
    debugCapture = true;

    console.log("DEBUG BUTTON");
};

 
    loop();

    console.log("CARD DETECTOR MODE");

};


function saveCanvas(canvas, fileName)
{
    if (!canvas)
        return;

    const link = document.createElement("a");

    link.download = fileName;
    link.href = canvas.toDataURL("image/png");

    link.click();
}

function saveDebugImages()
{
    saveCanvas(DebugImages.source, "source.png");
    saveCanvas(DebugImages.warp, "warp.png");
    saveCanvas(DebugImages.gray, "gray.png");
    saveCanvas(DebugImages.rankBefore, "rank_before_crop.png");
    saveCanvas(DebugImages.rankAfter, "rank_after_crop.png");
    saveCanvas(DebugImages.suit, "suit.png");

    console.log("Debug PNG saved.");
}
