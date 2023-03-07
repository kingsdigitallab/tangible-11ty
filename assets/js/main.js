/*jshint esversion: 8 */
import Tangible from "./tangible.js";

/* Load the main Tangible class and setup */
let tangible = new Tangible();
tangible.setupTangible();

let testCodes= [
    {"code":31, x:100,y:200},
    {"code":31, x:150,y:200},
    {"code":31, x:200,y:200}
];
console.log(tangible.parseCodesAsText(testCodes));
