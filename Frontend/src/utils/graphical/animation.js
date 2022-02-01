// Arm base location
const baseArm = {
    xPos: 2, // m
    yPos: 0, // m
    height: 1, // m
    width: 0.1 // m
}

const armState = {
    angle: 0,
    length: 1
}

const canvasView = {
    maxWidth: 3,
    maxHeight: 3,
    fps: 30,
    update: function (newW, newH) {
        // console.log('update');
        // console.log(this);
        this.maxWidth = newW
        this.maxHeight = newH
        mountPoint[0] = this.maxWidth * 0.05 + baseArm.xPos
        mountPoint[1] = this.maxHeight * 1.05 - (this.maxHeight * 0.05 + baseArm.yPos)
        pivotPoint[0] = mountPoint[0]
        pivotPoint[1] = mountPoint[1] - baseArm.height
    },
    armView: function () {
        baseArm.xPos = armState.length * 2
        this.update(armState.length * 2 + baseArm.height, armState.length * 2 + baseArm.height)
    }
}

const yPointTrans = (y) => {
    return canvasView.maxHeight * 1.05 - y
}

const mountPoint = [canvasView.maxWidth * 0.05 + baseArm.xPos, yPointTrans(canvasView.maxHeight * 0.05 + baseArm.yPos)]
const pivotPoint = [mountPoint[0], mountPoint[1] - baseArm.height]



const init = (ctx, canvas, renderArm = false) => {
    canvasView.armView();
    ctx.resetTransform();
    // Clearing canvas and scaling to the view window of the whole flight
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
    ctx.scale(canvas.clientWidth / (canvasView.maxWidth * 1.05), canvas.clientHeight / (canvasView.maxHeight * 1.05))
    // ctx.setTransform(canvas.clientWidth / (canvasView.maxWidth * 1.05),0,0, canvas.clientHeight / (canvasView.maxHeight * 1.05),0,0)

    // Basic Scene

    // Drawing Bottom Grass
    ctx.fillStyle = 'mediumseagreen'
    ctx.fillRect(0, yPointTrans(canvasView.maxHeight * 0.05), canvasView.maxWidth * 1.05, canvasView.maxHeight * 0.05)

    // Drawing Sky
    ctx.fillStyle = 'skyblue'
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

    armState.angle = 0;
    if (renderArm) {
        drawArm(ctx)
    }

}
const drawArm = (ctx) => {
    function debugLine() {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.strokeStyle = 'red'
        ctx.lineWidth = baseArm.width;
        ctx.lineTo(0, 2);
        ctx.stroke();
    }
    const drawCircle = (radius = 0.1, color = 'blue') => {
        ctx.beginPath();
        ctx.lineWidth = radius / 10;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.arc(0, 0, radius * 0.9, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
    }

    const drawLoad = (rad, offsetY) => {
        // const image = new Image(100, 100)
        const image = document.getElementById('load');
        ctx.drawImage(image, -rad, rad / 2 + offsetY, rad * 2, rad * 2)
    }
    const pinRad = 0.1;

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
    drawCircle(pinRad, 'white')
    // Draw cavity
    ctx.translate(armState.length, 0)
    ctx.save();



    [1, -1].forEach(index => {
        ctx.save();
        drawCircle(baseArm.width / 2, 'white')
        ctx.rotate(Math.PI / 3 * index)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.strokeStyle = 'white'
        ctx.lineWidth = baseArm.width;
        ctx.lineTo(0, 0.4)
        ctx.stroke();
        ctx.restore();
    });

    drawLoad(0.3, -0.1);


}

const updateArm = (length) => {
    armState.length = length;

}

const getDT = (counts) => {
    let startTime = 0;
    let endTime = 0;
    let count = 0;
    const runTest = (timeStamp) => {
        if (count == 1) {
            startTime = timeStamp;
        }
        if (count > counts) {
            endTime = timeStamp
            const dT = (endTime - startTime) / (counts) / 1000;
            canvasView.fps = Math.pow(dT, -1);
        }
        else {
            count++;
            window.requestAnimationFrame(runTest)
        }
    }
    runTest();


}

const launch = (ctx, canvas, endAngle, time) => {

    // Calc approx frame count
    const frames = Math.ceil(time * canvasView.fps);
    const dTheta = endAngle / frames

    let frame = 0;
    drawArm(ctx)

    const rotateArm = (timeStamp) => {
        init(ctx, canvas)
        armState.angle = dTheta * frame
        drawArm(ctx)
        frame++
        if (frame <= frames) {
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

const drawPath = (ctx, time, pointsFunc, ...pointsArgs) => {
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


const kirbyImgFlight = (elem, time, pointsFunc, ...pointsArgs) => {

    const frames = time * 60
    let frame = 1;

    const points = pointsFunc(...pointsArgs, frames).data;

    const path = () => {

        elem.style.left = `${points[frame].x - 12}%`
        elem.style.bottom = `${points[frame].y - 12}%`
        frame++
        if (frame <= frames) {
            window.requestAnimationFrame(path)

        } else {
            elem.style.left = `-12%`
            elem.style.bottom = `-12%`
            return true
        }
    }
    window.requestAnimationFrame(path)
}


export default {
    getDT,
    drawArm,
    armState,
    init,
    mountPoint,
    drawPath,
    zoomOut,
    launch,
    canvasView,
    kirbyImgFlight
}