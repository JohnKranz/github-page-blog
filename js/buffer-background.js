function initBackgroundBuffers(gl) {
    const positionBuffer = initPositionBuffer(gl);
    const texCoordsBuffer = initTexCoordsBuffer(gl);

    return {
        position: positionBuffer,
        texCoords: texCoordsBuffer,
    };
}

function initTexCoordsBuffer(gl){
    const texCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);

    const texCoords = [
         1.0, 0.0,
         0.0, 0.0,
         1.0, 1.0,
         0.0, 1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    return texCoordsBuffer;
}

function initPositionBuffer(gl) {
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
        320.0, 180.0,
        0.0  , 180.0,
        320.0, 0.0  ,
        0.0  , 0.0  ,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return positionBuffer;
}

export { initBackgroundBuffers };