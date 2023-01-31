/*jshint esversion: 8 */


export default class Tangible {

    constructor() {
        // Code library for translations
        // Will be made into its getter/setter
        this.codeLibrary = {
            31: "ROW",
            47: "YOUR BOAT",
            55: "GENTLY",
            59: "DOWN",
            61: "THE STREAM",
            79: "MERRILY",
            87: "LIFE",
            91: "IS BUT",
            93: "A DREAM"
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