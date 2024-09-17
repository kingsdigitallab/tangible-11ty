/*jshint esversion: 8 */


export default class Tangible {

    // todo Gather all the ids into selector consts here for hygiene
    constructor(topCodes, facingMode) {
        this.commands = {
            "LOOP": "Loop",
            "ENDLOOP": "End Loop",
            "PLAY": "Play",
        };
        // Set the sounds default url here
        this.libraryUrlPrefix = "/tangible-11ty/assets/sound/";
        // Sound libraries are loaded with the loadsoundlibrary command
        // todo populate select based on these libraries so they are in sync
        this.soundLibraries = {
            "DEFAULT": {
                "A": this.libraryUrlPrefix + "A.wav",
                "B": this.libraryUrlPrefix + "B.wav",
                "C": this.libraryUrlPrefix + "C.wav",
            },
            // Silly just to show an example
            "REVERSED": {
                "A": this.libraryUrlPrefix + "C.wav",
                "B": this.libraryUrlPrefix + "B.wav",
                "C": this.libraryUrlPrefix + "A.wav",
            }
        };
        // todo set loaded library with get variables to make preloading easier
        this.currentSoundLibrary = this.soundLibraries.DEFAULT;

        this.testCodes = [
            {"code": 55, x: 400, y: 200},
            {"code": 109, x: 300, y: 200},

            {"code": 31, x: 300, y: 250},
            {"code": 167, x: 200, y: 250},

            {"code": 55, x: 300, y: 300},
            {"code": 109, x: 200, y: 300},

            {"code": 31, x: 300, y: 350},
            {"code": 171, x: 250, y: 350},

            {"code": 59, x: 300, y: 400},
            {"code": 31, x: 400, y: 450},
            {"code": 173, x: 300, y: 450},
            {"code": 59, x: 400, y: 500},
        ];
        // Code library for translations
        // Will be made into its getter/setter
        this.codeLibrary = {
            31: this.commands.PLAY,
            47: "Delay",
            55: this.commands.LOOP,
            59: this.commands.ENDLOOP,
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
        this.topcodeHeight = 40;
        this.topcodeWidth = 100;
        this.variableIncrementer = 0;
        this.declarations = "";
        this.facingMode = "user";
        this.canvasId = "video-canvas";
        this.videoRunning = false;
        // Codes currently seen
        this.currentCodes = [];


    }

    // Load the current sound library into memory
    loadSounds() {
        this.sounds = {};
        for (const [key, value] of Object.entries(this.currentSoundLibrary)) {
            this.sounds[key] = new Audio(value);
        }
    }

    /** Loads assets and data for this set of tiles
     *
     *
     */
    preloads() {
        this.loadSounds();

    }

    playAudio(audio) {
        return new Promise(res => {
            audio.play();
            audio.onended = res;
        });
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
        let grid = this.sortTopCodesIntoGrid(topCodes);
        for (let i = 0; i < grid.length; i++) {
            for (let x = 0; x < grid[i].length; x++) {
                outputString += this.codeLibrary[grid[i][x].code] + ", X:" + grid[i][x];
            }
            outputString += "<br/>\n";
        }

        return outputString;
    }

    /** Sort topcodes into a grid using x,y coordinates
     *
     * @param topCodes to sort
     * @return multi-dimensional grid array
     */
    sortTopCodesIntoGrid(topCodes) {
        // Sort topcodes by y, then x
        topCodes.sort(this.sortTopCodeComparator.bind(this));
        //console.log(topCodes);
        let grid = [];
        let line = Array();
        let currentY = -1;
        // loop through, add lines as y changes
        for (let i = 0; i < topCodes.length; i++) {
            if (currentY >= 0 && topCodes[i].y - currentY >= this.topcodeHeight) {
                // New line
                grid.push(line);
                line = Array();
                currentY = topCodes[i].y;
            } else if (currentY < 0) {
                currentY = topCodes[i].y;
            }
            line.push(topCodes[i]);
        }
        // Add last line and return
        grid.push(line);
        return grid;
    }

    /**
     * Sort the top codes y ascending
     * X DESCENDING because the video is mirrorer
     * @param a
     * @param b
     * @return {number}
     */
    sortTopCodeComparator(a, b) {

        if (Math.abs(a.y - b.y) <= this.topcodeHeight) {
            // same line
            if (a.x == b.x) {
                return 0;
            }
            if (a.x < b.x) {
                return 1;
            }
            return -1;
        }
        // Different lines
        if (a.y < b.y) {
            return -1;
        }
        return 1;
    }

    /**
     Parse topcodes as javascript.  Each item in the array topCodes has:
     x,y coordinates found and code: the int of topcode
     @param topCodes Found codes
     @return text translations of code
     */
    parseCodesAsJavascript(topCodes) {

        let outputJS = "";
        let grid = this.sortTopCodesIntoGrid(topCodes);
        //console.log(grid);
        for (let i = 0; i < grid.length; i++) {
            outputJS += this.parseTopCodeLine(grid[i]);
        }

        return outputJS;
    }


    parseTopCodeLine(line) {
        //this.codeLibrary[grid[i][x].code]
        let lineJS = "\n";
        let i = 0;
        while (i < line.length) {
            let parsedCode = this.codeLibrary[line[i].code];
            //console.log(parsedCode);
            switch (parsedCode) {
                case this.commands.LOOP:
                    // See if we've got a number next
                    if (line.length > i + 1) {
                        let nextSymbol = this.codeLibrary[line[i + 1].code];
                        if (parseInt(nextSymbol)) {
                            lineJS += "for (let x" + this.variableIncrementer + "=0; x" + this.variableIncrementer + " < " + nextSymbol + "; x" + this.variableIncrementer + "++){";
                            this.variableIncrementer += 1;
                            i += 1;
                        }
                    } else {
                        //console.log("ERROR: No increment or bad increment for for loop!");
                    }
                    break;
                case this.commands.ENDLOOP:
                    lineJS += "} \n";
                    break;
                case this.commands.PLAY:
                    if (line.length > i + 1) {
                        let letter = this.codeLibrary[line[i + 1].code];
                        lineJS += "await context.playAudio(this.sounds." + letter + ");\n";
                        //lineJS += "await new Promise(r => setTimeout(resolve, this.sounds." + letter + ".duration * 100));";
                    }
                    lineJS += "";
                    break;

            }
            i += 1;
        }
        return lineJS;
    }

    // await new Promise(resolve => setTimeout(resolve, 1500));

    async evalTile(tileCode, context) {

        eval('(async (context) => {"use strict";' + tileCode + '})(context)');
        return true;
    }

    parseTopCodes() {
        this.currentCodes = this.testCodes;
        if (this.currentCodes.length > 0) {
            console.log('parsed');
            let codeText = this.parseCodesAsText(this.currentCodes)
            this.parsedJS = this.declarations + this.parseCodesAsJavascript(this.currentCodes);
            document.getElementById("codes").innerHTML = codeText;
            document.getElementById("result").innerHTML = this.parsedJS;

        }
    }

    async runCode() {
        console.log(this.currentCodes);
        if (this.parsedJS.length > 0) {
            //parsedJS = "await this.playAudio(this.sounds.A); await this.playAudio(this.sounds.B); return true";
            let parsedLines = [];
            parsedLines.push(this.evalTile(this.parsedJS, this));
            let done = await Promise.all(parsedLines);
        }
    }

    toggleSoundLibrary() {

        let soundLibraryToggle = document.getElementById('soundlibrary');
        if (soundLibraryToggle) {
            let selectedLibrary = soundLibraryToggle.value;
            //console.log(selectedLibrary);
            for (const [key, value] of Object.entries(this.soundLibraries)) {
                if (selectedLibrary == key){
                    console.log('sound library toggle to ' + key);
                    this.currentSoundLibrary = value;
                    this.loadSounds();
                    break;
                }
            }
        }

    }

    setupTangible() {
        this.setVideoCanvasHeight(this.canvasId);

        // register a callback function with the TopCode library
        TopCodes.setVideoFrameCallback(this.canvasId, function (jsonString) {
            // convert the JSON string to an object
            var json = JSON.parse(jsonString);
            // get the list of topcodes from the JSON object
            let codes = json.topcodes;
            // obtain a drawing context from the <canvas>
            let ctx = document.querySelector("#" + this.canvasId).getContext('2d');
            // draw a circle over the top of each TopCode

            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";   // very translucent red
            for (let i = 0; i < codes.length; i++) {
                ctx.beginPath();
                ctx.arc(codes[i].x, codes[i].y, codes[i].radius, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.font = "26px Arial";
                ctx.fillText(codes[i].code, codes[i].x, codes[i].y);
            }

            this.currentCodes = codes;
            this.once = true;
        }.bind(this), this);

        // Setup buttons

        // Run the code
        let runButton = document.getElementById('run');
        runButton.onclick = function () {
            this.runCode();
        }.bind(this);

        // Start/stop camera
        let startStopButton = document.getElementById('camera-button');
        startStopButton.onclick = function () {
            if (this.videoRunning) {
                TopCodes.stopVideoScan(this.canvasId)
                this.parseTopCodes();
                this.videoRunning = false;
            } else {
                TopCodes.startVideoScan(this.canvasId, this.facingMode);
                this.videoRunning = true;
            }


        }.bind(this);

        let soundLibraryToggle = document.getElementById('soundlibrary');
        soundLibraryToggle.onchange = this.toggleSoundLibrary.bind(this);

        //camera-switch
        let cameraSwitchButton = document.getElementById('camera-switch');
        cameraSwitchButton.onclick = function () {
            TopCodes.stopVideoScan(this.canvasId);
            // swap the facing mode
            if (this.facingMode == "user") {
                this.facingMode = "environment";
            } else {
                this.facingMode = "user";
            }
            TopCodes.startVideoScan(this.canvasId, this.facingMode);
        }.bind(this);

        // Run preloads
        this.preloads();
    }

}