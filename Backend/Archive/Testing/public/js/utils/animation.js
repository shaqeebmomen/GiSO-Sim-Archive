const canvas = document.getElementById("animation-window");
const ctx = canvas.getContext('2d')
ctx.globalCompositeOperation = 'source-over'


// Arm base location
const baseArm = {
    xPos: 2, // m
    yPos: 0, // m
    height: 1, // m
    width: 0.1 // m
}

const armState = {
    angle: 0,
    length: 2
}

const canvasView = {
    maxWidth: 4,
    maxHeight: 4,
    update: function (newW, newH) {
        this.maxWidth = newW
        this.maxHeight = newH
        mountPoint[0] = this.maxWidth * 0.05 + baseArm.xPos
        mountPoint[1] = this.maxHeight * 1.05 - (this.maxHeight * 0.05 + baseArm.yPos)
        pivotPoint[0] = mountPoint[0]
        pivotPoint[1] = mountPoint[1] - baseArm.height
    },
    armView: function () {
        baseArm.xPos = armState.length * 1.5
        this.update(armState.length * 3, armState.length * 3)
    }
}

const yPointTrans = (y) => {
    return canvasView.maxHeight * 1.05 - y
}

const mountPoint = [canvasView.maxWidth * 0.05 + baseArm.xPos, yPointTrans(canvasView.maxHeight * 0.05 + baseArm.yPos)]
const pivotPoint = [mountPoint[0], mountPoint[1] - baseArm.height]



const init = () => {
    ctx.resetTransform()
    // Clearing canvas and scaling to the view window of the whole flight
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
    ctx.scale(canvas.clientWidth / (canvasView.maxWidth * 1.05), canvas.clientHeight / (canvasView.maxHeight * 1.05))
    // ctx.setTransform(canvas.clientWidth / (canvasView.maxWidth * 1.05),0,0, canvas.clientHeight / (canvasView.maxHeight * 1.05),0,0)

    // Basic Scene

    // Drawing Bottom Grass
    ctx.fillStyle = 'lightgreen'
    ctx.fillRect(0, yPointTrans(canvasView.maxHeight * 0.05), canvasView.maxWidth * 1.05, canvasView.maxHeight * 0.05)

    // Drawing Sky
    ctx.fillStyle = 'lightblue'
    ctx.fillRect(0, 0, canvasView.maxWidth * 1.05, canvasView.maxHeight * 1)

    // Some clouds maybe?

    // Drawing Arm Base

    ctx.fillStyle = 'brown'

    ctx.beginPath()
    ctx.moveTo(mountPoint[0], mountPoint[1]);
    ctx.lineTo(pivotPoint[0], pivotPoint[1]);
    ctx.strokeStyle = 'brown'
    ctx.lineWidth = baseArm.width;
    ctx.stroke();



}
const drawArm = () => {

    // Translate to pivot point
    ctx.translate(pivotPoint[0], pivotPoint[1])
    ctx.rotate(Math.PI)
    ctx.rotate(armState.angle)
    // Draw arm
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(armState.length, 0);
    ctx.strokeStyle = 'brown'
    ctx.lineWidth = baseArm.width;
    ctx.stroke();
    // ctx.fillRect(0,0,0.1,0.1)
}



const launch = (endAngle, time) => {

    // Calc approx frame count
    const frames = time * 60
    const dTheta = endAngle / frames
    let frame = 0;

    drawArm()

    const rotateArm = () => {
        init()
        // // Translate to pivot point
        // ctx.translate(pivotPoint[0], pivotPoint[1])
        // ctx.rotate(Math.PI)
        armState.angle = dTheta * frame
        // ctx.rotate(armState.angle)
        drawArm()
        frame++
        if (frame < frames) {
            window.requestAnimationFrame(rotateArm)
        }

    }

    window.requestAnimationFrame(rotateArm)
}

const zoomOut = (endAngle, endX, endY, time) => {
    let isDone = false
    // Calc approx frame count
    const frames = time * 60
    const dX = endX / frames
    const dY = endY / frames
    const dTheta = endAngle / frames

    let frame = 0;

    const zoom = () => {
        canvasView.update(canvasView.maxWidth + dX, canvasView.maxHeight + dY)
        init() // Translate to pivot point
        // ctx.translate(pivotPoint[0], pivotPoint[1])
        // ctx.rotate(Math.PI)
        armState.angle = dTheta * frame
        // ctx.rotate(armState.angle)
        drawArm()
        frame++
        if (frame <= frames) {
            window.requestAnimationFrame(zoom)
        }
    }

    window.requestAnimationFrame(zoom)
}

const drawPath = (time, pointsFunc, ...pointsArgs) => {
    // Calc approx frame count
    const frames = time * 60
    let frame = 1;

    const points = pointsFunc(...pointsArgs, frames)

    init()
    // Translate to pivot point
    // ctx.translate(pivotPoint[0], pivotPoint[1])
    // ctx.rotate(Math.PI)
    // ctx.rotate(armState.angle)
    drawArm()
    // Move to arm tip
    ctx.translate(armState.length, 0)
    ctx.rotate(-armState.angle)
    ctx.rotate(-Math.PI)
    ctx.scale(1, -1)
    ctx.translate(0, -armState.length * Math.sin(armState.angle) - baseArm.height)

    const path = () => {

        ctx.beginPath()
        ctx.moveTo(points[frame - 1].x, points[frame - 1].y)
        ctx.lineTo(points[frame].x, points[frame].y)
        ctx.strokeStyle = 'red'
        ctx.lineWidth = 0.1
        ctx.stroke()
        frame++
        if (frame <= frames) {
            window.requestAnimationFrame(path)
        }

    }

    window.requestAnimationFrame(path)
}



export default {
    drawArm,
    armState,
    init,
    mountPoint,
    drawPath,
    baseArm,
    zoomOut,
    launch,
    canvasView
}