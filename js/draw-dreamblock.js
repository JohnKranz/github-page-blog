function drawDreamBlock(gl, programInfo, buffers, time, xScroll, yScroll) {
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const projectionMatrix = mat4.create();
    mat4.ortho(projectionMatrix, 0, 320, 180, 0, 0, 100);

    setPositionAttribute(gl, buffers, programInfo);

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix,
    );

    gl.uniform2fv(
        programInfo.uniformLocations.resolution,
        [320.0,
            172.0]
    );

    gl.uniform2fv(
        programInfo.uniformLocations.mouse,
        [xScroll,
            yScroll]
    );

    gl.uniform1f(
        programInfo.uniformLocations.time,
        time
    );

    {
        const offset = 0;
        const vertexCount = 4;
        // gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
}

function setPositionAttribute(gl, buffers, programInfo) {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.position,
        numComponents,
        type,
        normalize,
        stride,
        offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

export {drawDreamBlock};