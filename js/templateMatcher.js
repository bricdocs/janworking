/*=========================================*
 * templateMatcher.js
 * Version 1.0
 *=========================================*/

let matchDebugSaved = false;

const Templates = {

    ranks: {},

    suits: {}

};

async function loadTemplates() {

    console.log("Templates yükleniyor...");

    Templates.ranks["AH"] =
        await loadImageMat("templates/ranks/AH.png");

// if (window.DEBUG_CAPTURE)
// {
//     saveMat(
//         Templates.ranks["AH"],
//         "08_loaded_template.png"
//     );
// }

    
    Templates.suits["H"] =
        await loadImageMat("templates/suits/H.png");

    console.log(
        "Rank templates:",
        Object.keys(Templates.ranks)
    );

    console.log(
        "Suit templates:",
        Object.keys(Templates.suits)
    );

    console.log("Templates hazır.");
}

console.log("templateMatcher.js hazır.");


//--------------------------------------------------
// PNG dosyasını Mat olarak yükle
//--------------------------------------------------

function loadImageMat(path)
{
    return new Promise(resolve =>
    {
        const img = new Image();

        img.onload = function()
        {
            const canvas =
                document.createElement("canvas");

            canvas.width = img.width;
            canvas.height = img.height;

            const ctx =
                canvas.getContext("2d");

            ctx.drawImage(img,0,0);

const rgba = cv.imread(canvas);

const gray = new cv.Mat();

cv.cvtColor(
    rgba,
    gray,
    cv.COLOR_RGBA2GRAY
);

rgba.delete();

resolve(gray);
            
        };

        img.src = path;
    });
}

//----------------------------------
// İki binary resmi karşılaştır
//----------------------------------

function compareBinary(img1, img2)
{
    if (
        img1.cols != img2.cols ||
        img1.rows != img2.rows
    )
        return 0;

    let equal = 0;
    const total = img1.cols * img1.rows;

    for (let y = 0; y < img1.rows; y++)
    {
        for (let x = 0; x < img1.cols; x++)
        {
            if (
                img1.ucharPtr(y,x)[0] ==
                img2.ucharPtr(y,x)[0]
            )
            {
                equal++;
            }
        }
    }

    return equal / total;
}

function recognizeRank(rank)
{
console.log("XXXXXXXX templateMatcher.js >> recognizeRank XXXXXXXX");
    
    let bestName = "";
    let bestScore = 0;

    for(const name in Templates.ranks)
    {
        const score =
            compareBinary(
                rank,
                Templates.ranks[name]
            );

        if(score > bestScore)
        {
            bestScore = score;
            bestName = name;
        }
    }

console.log(
    "[F" + window.frameId + "]",
    "Rank:",
    bestName,
    bestScore
);

    return bestName;
}

function recognizeSuit(suit)
{
    let bestName = "";
    let bestScore = 0;

    for(const name in Templates.suits)
    {
        const score =
            compareBinary(
                suit,
                Templates.suits[name]
            );

        if(score > bestScore)
        {
            bestScore = score;
            bestName = name;
        }
    }

    console.log(
        "Suit:",
        bestName,
        bestScore
    );

    return bestName;
}

//--------------------------------------------------
// Template Match
//--------------------------------------------------

function matchTemplate(img, templates)
{
    let bestName = "";
    let bestScore = -1;

    for (const name in templates)
    {
        const tpl = templates[name];

console.log(
    "Template White:",
    name,
    cv.countNonZero(tpl)
);
        
        console.log(
            "Template:",
            name,
            tpl.cols,
            tpl.rows
        );

        console.log(
            "Image:",
            img.cols,
            img.rows
        );

        const input = new cv.Mat();

        if (
            img.cols != tpl.cols ||
            img.rows != tpl.rows
        )
        {
            console.log(
                "Resize:",
                img.cols, "x", img.rows,
                "->",
                tpl.cols, "x", tpl.rows
            );

            cv.resize(
                img,
                input,
                new cv.Size(tpl.cols, tpl.rows),
                0,
                0,
                cv.INTER_NEAREST
            );
        }
        else
        {
            img.copyTo(input);
        }

if (window.DEBUG_CAPTURE)
{
    saveMat(input, "06_runtime_match.png");
    saveMat(tpl, "07_template_match.png");
}
        
        const result = new cv.Mat();

console.log(
    "Input:",
    input.cols,
    input.rows,
    input.type()
);

console.log(
    "Template:",
    tpl.cols,
    tpl.rows,
    tpl.type()
);

       
        cv.matchTemplate(
            input,
            tpl,
            result,
            cv.TM_CCOEFF_NORMED
        );

        const mm = cv.minMaxLoc(result);

console.log(
    "[F" + window.frameId + "]",
    "[" + img.cols + "x" + img.rows + "]",
    "Score:",
    name,
    mm.maxVal.toFixed(3)
);

        if (mm.maxVal > bestScore)
        {
            bestScore = mm.maxVal;
            bestName = name;
        }

        result.delete();
        input.delete();
    }

    return {
        name: bestName,
        score: bestScore
    };
}
