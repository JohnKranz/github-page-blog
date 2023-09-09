const vertBackground = `
attribute vec4 a_position;
attribute vec2 a_texCoords;

uniform mat4 u_projTrans;

varying vec2 v_texCoords;

void main() {
    v_texCoords = a_texCoords;
    gl_Position = u_projTrans * a_position;
}
    `;

const fragBackground = `
precision mediump float;

varying vec2 v_texCoords;
uniform sampler2D u_texture;

void main(){
   gl_FragColor = texture2D(u_texture, v_texCoords);
}
    `

const vertDreamBlock = `
attribute vec4 a_position;

uniform mat4 u_projTrans;

void main() {
    gl_Position = u_projTrans * a_position;
}
    `;

const fragDreamBlock = `
precision mediump float;

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_time;

// hash function from "Hash without sine" by Dave_Hoskins - https://www.shadertoy.com/view/4djSRW
float hash(float p)
{
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

float blinkLevel(int type, float frameNum){
    if(type == 1){
        return floor(mod(frameNum, 2.));
    }else if(type == 2){
        float num = ceil(mod(frameNum, 4.));
        if(num > 2.){
            return 4. - num;
        }else{
            return num;
        }
    }else{
        return 0.;
    }
}

vec3 blinkColor(int id){
    if(id == 0){
        return vec3(0.8,0.0,0.0);
    }else if(id == 1){
        return vec3(1.0,0.2,0.8);
    }else if(id == 2){
        return vec3(0.0,0.8,0.0);
    }else if(id == 3){
        return vec3(0.4,1.0,0.4);
    }else if(id == 4){
        return vec3(0.0,0.0,1.0);
    }else if(id == 5){
        return vec3(0.0,0.8,1.0);
    }else if(id == 6){
        return vec3(1.0,1.0,0.0);
    }
    return vec3(0.0);
}

vec4 blink(vec2 p){
    vec4 l = vec4(0.0);
    vec2 pixelUnit = vec2(1.) / u_resolution;
    vec2 whRatio = vec2(u_resolution.x / u_resolution.y,1.);
    float whAvg = (u_resolution.x + u_resolution.y) / u_resolution.y * 80.;
    for (float i = 0.; i < 320.; i += 1.) {
        float z = hash(i*0.1);
        l.rgb = blinkColor(int(hash(i*0.4) * 7.));
        float offset = hash(float(i)*0.4) * 3.;
        int size = int(3.*z*z);
        int depth = (3 - size) * 100;
        float level = blinkLevel(size, u_time / 0.2 + offset) + 1.;
        float invDepth = 1./float(depth);
        vec2 pos = fract(vec2(hash(i*.2), hash(i*.3)) + 10.*u_mouse/u_resolution*invDepth);
        pos -= mod(pos,pixelUnit) + pixelUnit / 2.;
        vec2 delta = (p - pos) * whRatio;
        float range = abs(delta.x) + abs(delta.y);

        float inRange = (level - 2.) / whAvg;
        float outRange = level / whAvg;

        l.a = step(inRange, range) * step(range, outRange);

        if(l.a > 0.0){
            return l;
        }
    }
    return vec4(0.,0.,0.,1.);
}

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 p = fragCoord/u_resolution;

    gl_FragColor = blink(p);
    // gl_FragColor = vec4(0.6);
}
    `;




main();

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
        );
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                shaderProgram,
            )}`,
        );
        return null;
    }

    return shaderProgram;
}

import {initBackgroundBuffers} from "./buffer-background.js";
import {drawScene} from "./draw-bg.js";
import {initDreamBlockBuffers} from "./buffer-dreamblock.js";
import {drawDreamBlock} from "./draw-dreamblock.js";

function main() {
    const canvas = document.querySelector("#glCanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // canvas.width = document.body.clientWidth;
    // canvas.height = document.body.clientHeight;
    // canvas.height = 1160;
    // canvas.height = window.innerHeight;

    // Initialize the GL context
    const gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert(
            "Unable to initialize WebGL. Your browser or machine may not support it.",
        );
        return;
    }

    /*const bufferResolution = {
        width: ,
        height: ,
    }*/

    const shaderBackground = initShaderProgram(gl, vertBackground, fragBackground);
    const shaderBackgroundInfo = {
        program: shaderBackground,
        attribLocations: {
            position: gl.getAttribLocation(shaderBackground, "a_position"),
            texCoords: gl.getAttribLocation(shaderBackground, "a_texCoords"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderBackground, "u_projTrans"),

            texture: gl.getUniformLocation(shaderBackground, "u_texture"),
        },
    };

    const shaderDreamBlock = initShaderProgram(gl, vertDreamBlock, fragDreamBlock);
    const shaderDreamBlockInfo = {
        program: shaderDreamBlock,
        attribLocations: {
            position: gl.getAttribLocation(shaderDreamBlock, "a_position"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderDreamBlock, "u_projTrans"),

            time: gl.getUniformLocation(shaderDreamBlock, "u_time"),
            resolution: gl.getUniformLocation(shaderDreamBlock, "u_resolution"),
            mouse: gl.getUniformLocation(shaderDreamBlock, "u_mouse"),
        },
    };

    const renderTexture = createFloatTexture(gl, 320, 172);
    const fbo = gl.createFramebuffer()

    const mainLoop = function(time) {
        render(gl, fbo, renderTexture, shaderDreamBlockInfo, shaderBackgroundInfo, time / 1000.0)
        window.requestAnimationFrame(mainLoop)
    }

    window.requestAnimationFrame(mainLoop)
}

let xScroll = 0.0;
let yScroll = 0.0;
function render(gl, fbo, renderTexture, shaderDreamBlockInfo, shaderBackgroundInfo, time) {
    // yScroll += 8.0;
    yScroll -= 8.0;

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        renderTexture,
        0
    );
    {
        const buffers = initDreamBlockBuffers(gl);

        drawDreamBlock(gl, shaderDreamBlockInfo, buffers, time, xScroll, yScroll);

        gl.flush();
    }
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        null,
        0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);


    {
        const buffers = initBackgroundBuffers(gl);

        drawScene(gl, shaderBackgroundInfo, buffers, renderTexture);

        gl.flush();
    }
}

function createFloatTexture(gl, width, height) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}
