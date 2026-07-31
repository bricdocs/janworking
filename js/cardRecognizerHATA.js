/*=========================================
cardRecognizer.js
Version 1.0
=========================================*/

let cropDebugSaved = false;

function preprocessCorner(card)
{
// Kart boyutuna göre ROI
const x = Math.round(card.cols * 0.02);
const y = Math.round(card.rows * 0.02);

const w = Math.round(card.cols * 0.24);
const h = Math.round(card.rows * 0.24);

    // 1- Önce ROI kutusunu çiz
    cv.rectangle(
        card,
        new cv.Point(x, y),
        new cv.Point(x + w, y + h),
        new cv.Scalar(0, 255, 0, 255),
        2
    );

    // 2- Sonra warpCanvas'ı güncelle
    cv.imshow("warpCanvas", card);

    // 3- Daha sonra ROI'yi al
    const roi = card.roi(
        new cv.Rect(x, y, w, h)
    );

    // 4- Gray
    const gray = new cv.Mat();
    cv.cvtColor(roi, gray, cv.COLOR_RGBA2GRAY);
cv.imshow("binaryCanvas", gray);

DebugImages.gray =
    document.getElementById("binaryCanvas");    
    
    // 5- Binary
const binary = new cv.Mat();

cv.threshold(
    gray,
    binary,
    120,
    255,
    cv.THRESH_BINARY_INV
);

let min = 255;
let max = 0;

for (let y = 0; y < gray.rows; y++)
{
    for (let x = 0; x < gray.cols; x++)
    {
        const p = gray.ucharPtr(y, x)[0];

        if (p < min) min = p;
        if (p > max) max = p;
    }
}

console.log("Gray range:", min, max);
    
console.log(
    "Binary corner pixels:",
    binary.ucharPtr(0,0)[0],
    binary.ucharPtr(0,binary.cols-1)[0],
    binary.ucharPtr(binary.rows-1,0)[0],
    binary.ucharPtr(binary.rows-1,binary.cols-1)[0]
);
    

    // 6- Sonucu göster
    cv.imshow("binaryCanvas", binary);

//----------------------------------
// Rank ROI
//----------------------------------

const rankRect = new cv.Rect(
    0,
    0,
    binary.cols,
    Math.floor(binary.rows * 0.45)
);

const rank = binary.roi(rankRect);

cv.imshow("rankCanvas", rank);

let black = 0;
let white = 0;

for (let y = 0; y < rank.rows; y++)
{
    for (let x = 0; x < rank.cols; x++)
    {
        if (rank.ucharPtr(y, x)[0] == 0)
            black++;
        else
            white++;
    }
}

console.log(
    "Rank pixels:",
    "Black =", black,
    "White =", white
);
    
DebugImages.rankBefore =
    document.getElementById("rankCanvas");    

//saveMat(rank, "runtime_rank.png");
    
//----------------------------------
// Suit ROI
//----------------------------------

const suitRect = new cv.Rect(
    0,
    Math.floor(binary.rows * 0.45),
    binary.cols,
    binary.rows - Math.floor(binary.rows * 0.45)
);

const suit = binary.roi(suitRect);

cv.imshow("suitCanvas", suit);

DebugImages.suit =
    document.getElementById("suitCanvas");    

// Artık binary silinmeyecek.
// rank ve suit de silinmeyecek.
// Bunları çağıran fonksiyon kullanacak.

roi.delete();
gray.delete();

return {
    binary,
    rank,
    suit
};
    
}

function cropBinary(src)
{
console.log(
    "Channels:", src.channels(),
    "Type:", src.type(),
    "Depth:", src.depth()
);

console.log(
    "Continuous:", src.isContinuous()
);

const debug = src.clone();

cv.imshow("rankCanvas", debug);

if (!cropDebugSaved)
{
    saveMat(debug, "crop_input.png");
    cropDebugSaved = true;
}

debug.delete();    
    
    
    console.log(
        "cropBinary INPUT:",
        src.cols,
        src.rows
    );

const test = src.clone();
cv.imshow("binaryCanvas", test);
test.delete();
    
cv.imshow("rankCanvas", src);
    
    let minX = src.cols;
    let minY = src.rows;

    let maxX = 0;
    let maxY = 0;

//----------------------------------
// Köşe piksellerini kontrol et
//----------------------------------

console.log(
    "Top-left =",
    src.ucharPtr(0,0)[0]
);

console.log(
    "Top-right =",
    src.ucharPtr(0,src.cols-1)[0]
);

console.log(
    "Bottom-left =",
    src.ucharPtr(src.rows-1,0)[0]
);

console.log(
    "Bottom-right =",
    src.ucharPtr(src.rows-1,src.cols-1)[0]
);

//----------------------------------
// Beyaz piksel arama
//----------------------------------

for (let y = 0; y < src.rows; y++)
{
    let row = "";

    for (let x = 0; x < src.cols; x++)
    {
        row += (src.ucharPtr(y,x)[0] == 255) ? "." : "#";
    }

    console.log(row);
}
    
    
    for(let y=0; y<src.rows; y++)
    {
        for(let x=0; x<src.cols; x++)
        {
            const value = src.ucharPtr(y,x)[0];

            if(x==10 && y==10)
                console.log("Pixel =", value);

            if(value==255)
            {
                if(x<minX) minX=x;
                if(y<minY) minY=y;

                if(x>maxX) maxX=x;
                if(y>maxY) maxY=y;
            }
        }
    }

    if(maxX<=minX || maxY<=minY)
        return src.clone();

console.log(
    "Bounds:",
    minX,
    minY,
    maxX,
    maxY
);
    
    const rect = new cv.Rect(
        minX,
        minY,
        maxX-minX+1,
        maxY-minY+1
    );

    const crop = src.roi(rect).clone();

cv.imshow("rankCanvas", crop);

DebugImages.rankAfter =
    document.getElementById("rankCanvas");    
    
    console.log(
        "cropBinary OUTPUT:",
        crop.cols,
        crop.rows
    );

    return crop;
}

function saveMat(mat, fileName)
{
    const canvas = document.createElement("canvas");

    cv.imshow(canvas, mat);

    const link = document.createElement("a");

    link.download = fileName;
    link.href = canvas.toDataURL("image/png");

    link.click();
}
