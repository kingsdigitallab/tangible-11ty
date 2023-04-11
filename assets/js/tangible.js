/*jshint esversion: 8 */

/*
Play = 31
Delay = 47
Loop = 55
End Loop = 59
0 = 103
1 = 107
2 = 109
3 = 115
4 = 117
5 = 121
6 = 143
7 = 151
8 = 155
9 = 157
A = 167
B = 171
C = 173
D = 179
E = 181
F = 185
G = 199
H = 203
I = 205
J = 211
K = 213
L = 217
M = 227
N = 229
O = 233
P = 241
Q = 271
R = 279
S = 283
T = 285
U = 295
V = 299
X = 301
Y = 307
Z = 309

 */
export default class Tangible {

    constructor() {
        // Code library for translations
        // Will be made into its getter/setter
        this.codeLibrary = {
            31:"Play",
            47: "Delay",
            55: "Loop",
            59: "End Loop",
            103: "0",
            107: "1",
            109: "2",
            115: "3",
            117: "4",
            121: "5",
            143: "6",
            151: "7",
            155: "8",
            157: "9",
            167: "A",
            171: "B",
            173: "C",
            179: "D",
            181: "E",
            185: "F",
            199: "G",
            203: "H",
            205: "I",
            211: "J",
            213: "K",
            217: "L",
            227: "M",
            229: "N",
            233: "O",
            241: "P",
            271: "Q",
            279: "R",
            282: "S",
            285: "T",
            295: "U",
            299: "V",
            301: "W",
            307: "X",
            309: "Y",
            313: "Z",
        };

    }

    /**
     Set the video canvas to the right aspect ratio
     */
    setVideoCanvasHeight(canvasId) {
        let canvas = document.getElementById(canvasId);
        let heightRatio = 1.5;
        canvas.height = canvas.width * heightRatio;
    }



    /**
     Parse the topcodes that are found.  Each item in the array topCodes has:
     x,y coordinates found and code: the int of topcode
     @param topCodes Found codes
     @return text translations of code
     */
    parseCodesAsText(topCodes) {
        let outputString = "";
        for (let i = 0; i < topCodes.length; i++) {
            if (topCodes[i].code in this.codeLibrary){
                outputString += this.codeLibrary[topCodes[i].code] + " ";
            }
        }
        return outputString;
    }


    setupTangible() {
        this.setVideoCanvasHeight('video-canvas');
        let tangible = this;

        // register a callback function with the TopCode library
        TopCodes.setVideoFrameCallback("video-canvas", function (jsonString) {
            // convert the JSON string to an object
            var json = JSON.parse(jsonString);
            // get the list of topcodes from the JSON object
            var topcodes = json.topcodes;
            // obtain a drawing context from the <canvas>
            var ctx = document.querySelector("#video-canvas").getContext('2d');
            // draw a circle over the top of each TopCode
            document.querySelector("#codes").innerHTML = '';
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";   // very translucent red
            for (let i = 0; i < topcodes.length; i++) {
                ctx.beginPath();
                ctx.arc(topcodes[i].x, topcodes[i].y, topcodes[i].radius, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.font = "26px Arial";
                ctx.fillText(topcodes[i].code, topcodes[i].x, topcodes[i].y);
                //console.log(topcodes[i].code +', x:'+topcodes[i].x, topcodes[i].y)
                //document.querySelector("#result").innerHTML += '<br/>' + topcodes[i].code + ', x:' + topcodes[i].x + ', y:' + topcodes[i].y;
            }

                document.querySelector("#result").innerHTML = tangible.parseCodesAsText(topcodes);
                tangible.once = true;


        }, this);
    }

}