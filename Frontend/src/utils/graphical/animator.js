export class Animator {

    baseArm = {
        xPos: 2.5, // m
        yPos: 0, // m
        height: 1, // m
        width: 0.1 // m
    }

    armState = {
        angle: 0,
        length: 0.5
    }

    maxWidth = 5
    maxHeight = 5
    fps = 30

    mountPoint = [this.maxWidth * 0.05 + this.baseArm.xPos, this.yPointTrans(this.maxHeight * 0.05 + this.baseArm.yPos)]
    pivotPoint = [this.mountPoint[0], this.mountPoint[1] - this.baseArm.height]

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.globalCompositeOperation = "source-over";
    }

    setArmLength(length) {
        this.armState.length = length
        this.init(true, true);
    }

    updateSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
    update(newW, newH) {
        // console.log('newW', newW);
        // console.log('newH', newH);
        this.maxWidth = newW
        this.maxHeight = newH
        this.mountPoint[0] = this.maxWidth * 0.05 + this.baseArm.xPos
        this.mountPoint[1] = this.maxHeight * 1.05 - (this.maxHeight * 0.05 + this.baseArm.yPos)
        this.pivotPoint[0] = this.mountPoint[0]
        this.pivotPoint[1] = this.mountPoint[1] - this.baseArm.height
    }


    yPointTrans(y) {
        return this.maxHeight * 1.05 - y
    }

    init(renderArm = false, reset = true) {
        this.ctx.resetTransform();
        // Clearing canvas and scaling to the view window of the whole flight
        this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight)
        this.ctx.scale(this.canvas.clientWidth / (this.maxWidth * 1.05), this.canvas.clientHeight / (this.maxHeight * 1.05))
        // ctx.setTransform(canvas.clientWidth / (this.maxWidth * 1.05),0,0, canvas.clientHeight / (this.maxHeight * 1.05),0,0)

        // Basic Scene

        // Drawing Bottom Grass
        this.ctx.fillStyle = 'mediumseagreen'
        this.ctx.fillRect(0, this.yPointTrans(this.maxHeight * 0.05), this.maxWidth * 1.05, this.maxHeight * 0.05)

        // Drawing Sky
        this.ctx.fillStyle = 'skyblue'
        this.ctx.fillRect(0, 0, this.maxWidth * 1.05, this.maxHeight * 1)

        // Some clouds maybe?

        // Drawing Arm Base
        this.ctx.fillStyle = 'brown'

        this.ctx.beginPath()
        this.ctx.moveTo(this.mountPoint[0], this.mountPoint[1]);
        this.ctx.lineTo(this.pivotPoint[0], this.pivotPoint[1]);
        this.ctx.strokeStyle = 'brown'
        this.ctx.lineWidth = this.baseArm.width;
        this.ctx.stroke();

        if (reset) {
            this.armState.angle = 0;
        }
        if (renderArm) {
            this.drawArm(true);
        }
    }

    debugLine = () => {
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.strokeStyle = 'blue'
        this.ctx.lineWidth = this.baseArm.width;
        this.ctx.lineTo(0, 1);
        this.ctx.stroke();
    }

    drawLoad = (rad) => {
        // const image = new Image(100, 100)
        const image = document.getElementById('load');
        this.ctx.drawImage(image, -rad, -rad, rad * 2, rad * 2)
    }

    drawTarget = (rad) => {
        // const image = new Image(100, 100)
        const image = document.getElementById('coin');
        this.ctx.drawImage(image, -rad, -rad, rad * 2, rad * 2)
    }

    drawArm(load = false) {
        const drawCircle = (radius = 0.1, color = 'blue') => {
            this.ctx.beginPath();
            this.ctx.lineWidth = radius / 10;
            this.ctx.strokeStyle = color;
            this.ctx.fillStyle = color;
            this.ctx.arc(0, 0, radius * 0.9, 0, 2 * Math.PI, false);
            this.ctx.fill();
            this.ctx.stroke();
        }

        const pinRad = 0.1;

        // Translate to pivot point
        this.ctx.translate(this.pivotPoint[0], this.pivotPoint[1])

        this.ctx.rotate(Math.PI)
        this.ctx.rotate(this.armState.angle)
        // Draw arm
        this.ctx.beginPath()
        this.ctx.moveTo(0, 0)
        this.ctx.lineTo(this.armState.length, 0);
        this.ctx.strokeStyle = 'brown'
        this.ctx.lineWidth = this.baseArm.width;
        this.ctx.stroke();
        drawCircle(pinRad, 'white')
        // Draw cavity
        this.ctx.translate(this.armState.length, 0)
        this.ctx.save();

        [1, -1].forEach(index => {
            this.ctx.save();
            drawCircle(this.baseArm.width / 2, 'white')
            this.ctx.rotate(Math.PI / 3 * index)
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.strokeStyle = 'white'
            this.ctx.lineWidth = this.baseArm.width;
            this.ctx.lineTo(0, 0.4)
            this.ctx.stroke();
            this.ctx.restore();
        });
        if (load) {
            this.ctx.save();
            this.ctx.translate(0, 0.3)
            this.ctx.scale(1, -1)
            this.ctx.rotate(this.armState.angle)
            this.drawLoad(0.3);
            this.ctx.restore();
        }

    }

    getDT(counts) {
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
                this.fps = Math.pow(dT, -1);
            }
            else {
                count++;
                window.requestAnimationFrame(runTest)
            }
        }
        runTest();
    }

    launch(endAngle, time) {

        // Calc approx frame count
        const frames = Math.ceil(time * this.fps);
        const dTheta = endAngle / frames

        let frame = 0;
        this.drawArm()

        const rotateArm = (timeStamp) => {
            this.init()
            this.armState.angle = dTheta * frame
            this.drawArm()
            frame++
            if (frame <= frames) {
                window.requestAnimationFrame(rotateArm)
            }
        }
        window.requestAnimationFrame(rotateArm)
    }



    zoomOut = (endX, endY, time) => {
        // Calc approx frame count
        const frames = time * 60
        const dX = endX / frames
        const dY = endY / frames
        let frame = 0;

        const zoom = () => {
            this.update(this.maxWidth + dX, this.maxHeight + dY)
            this.init(true, false) // Translate to pivot point

            frame++
            if (frame <= frames) {
                window.requestAnimationFrame(zoom)
            }
        }

        window.requestAnimationFrame(zoom)
    }


    launchKirby = (endX, endY, airTime, targetPoint, pointsFunc, pointsArgs) => {


        // Calc approx frame count
        const frames = airTime * 60
        const dX = endX / frames
        const dY = endY / frames
        const { data, targetHit } = pointsFunc(pointsArgs, frames, targetPoint)
        let frame = 0;
        let hit = false;

        const fly = () => {
            this.update(this.maxWidth + dX, this.maxHeight + dY)
            this.init(false, false) // Translate to pivot point
            this.drawArm(false)
            // this.ctx.translate(-this.armState.length, 0)

            this.ctx.rotate(-this.armState.angle)
            this.ctx.rotate(-Math.PI)
            this.ctx.scale(1, -1)
            this.ctx.translate(0, -this.armState.length * Math.sin(this.armState.angle) - this.baseArm.height)
            this.ctx.beginPath()

            for (let i = 0; i < frame; i++) {
                this.ctx.moveTo(data[i].x, data[i].y)
                this.ctx.lineTo(data[i + 1].x, data[i + 1].y)
                this.ctx.strokeStyle = 'red'
                this.ctx.lineWidth = 0.1
            }
            this.ctx.stroke();
            this.ctx.moveTo(0, 0)
            this.ctx.save();
            this.ctx.translate(data[frame].x, data[frame].y)
            this.ctx.scale(-1, -1)
            // this.ctx.rotate(this.armState.angle)
            this.drawLoad(0.3);
            this.ctx.restore();
            if (targetHit !== null) {
                if (Math.abs(targetHit.x - data[frame].x) < 0.01) {
                    hit = true;
                }
            }
            if (!hit) {
                this.ctx.save()
                this.ctx.translate(targetPoint.x, targetPoint.y)
                this.drawTarget(0.3);
                this.ctx.restore();
            }
            frame++
            if (frame <= frames) {
                window.requestAnimationFrame(fly)
            }
        }
        window.requestAnimationFrame(fly)
    }


    launchProjectile(endAngle, launchTime, endX, endY, airTime, targetPoint, pointsFunc, ...pointsArgs) {
        // Rotating the arm
        // Calc approx frame count for launch
        let frames = Math.ceil(launchTime * this.fps);
        const dTheta = endAngle / frames

        let frame = 0;
        this.drawArm()

        const rotateArm = (timeStamp) => {
            this.armState.angle = dTheta * frame
            this.init(false, false)
            this.drawArm(true);
            frame++
            if (frame <= frames) {
                window.requestAnimationFrame(rotateArm)
            }
            else {
                const pass = this
                setTimeout(() => {
                    // pass.debugLine();
                    // pass.ctx.translate(this.mountPoint[0], this.mountPoint[1])
                    pass.launchKirby(endX, endY, airTime, targetPoint, pointsFunc, ...pointsArgs)
                }, 50)
            }
        }
        window.requestAnimationFrame(rotateArm)
    }

    static kirbyImgFlight = (elem, time, pointsFunc, ...pointsArgs) => {

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
}