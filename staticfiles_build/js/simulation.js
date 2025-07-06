const INITIAL_GRID_SIZE = 40;

let amplitudeInput;
let graphAmplitude = 100;      // default amplitude
let graphFrequency = 0.01;


let gridSize = INITIAL_GRID_SIZE, cols, rows;
let offsetX = 0, offsetY = 0, gridDragging = false, prevX, prevY;
let showCircle = false, angle = 0, circleRadius;
let GripSimulation = false
let radiusInput, angleInput;
let ctrlDragging = false, startX, startY;

const trigStates = {
    radius: false,
    sin: false,
    cos: false,
    tan: false,
    cot: false,
    sec: false,
    csc: false
};
let graphEnabled = true;

let autoRotate = false;

let θA = radians(-angle);
let xA = R * cos(θA);
let yA = R * sin(θA);
// world‐coords of that tip:
let worldXA = xA;
let worldYA = -2 * R + yA;


function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('main');
    updateGrid();
    const css = getComputedStyle(document.documentElement);
    [gr, gg, gb] = css.getPropertyValue('--grid-color').split(',').map(Number);
    [mr, mg, mb] = css.getPropertyValue('--major-grid-color').split(',').map(Number);
    [ar, ag, ab] = css.getPropertyValue('--axis-color').split(',').map(Number);

    select('#toggle-btn').mousePressed(toggleSidebar);
    select('#reset-btn').mousePressed(resetView);
    initController();
    select('#yt-btn').mousePressed(() => {
        showCircle = true;
        GripSimulation = false;
        angle = 0;
        document.getElementById('controller').style.display = 'block';
        document.getElementById('btn-cot').style.display = 'block';
        document.getElementById('btn-sec').style.display = 'block';
        document.getElementById('btn-csc').style.display = 'block';
        document.getElementById('btn-sin').style.display = 'block';
        document.getElementById('btn-cos').style.display = 'block';
        document.getElementById('btn-tan').style.display = 'block';
        document.getElementById('btn-graph').style.display = 'block';
        document.getElementById('btn-radius').style.display = 'block';
    });
    resetView();
    // inside setup(), after your select('#yt-btn').mousePressed(...)
    select('#yt-btn-grip').mousePressed(() => {
        // stop drawing the circle/dot
        showCircle = false;
        GripSimulation = true;
        angle = 0;
        // hide the settings panel if you like
        // document.getElementById('controller').style.display = 'none';
        document.getElementById('controller').style.display = 'block';
        document.getElementById('btn-cot').style.display = 'none';
        document.getElementById('btn-sec').style.display = 'none';
        document.getElementById('btn-csc').style.display = 'none';
        document.getElementById('btn-sin').style.display = 'none';
        document.getElementById('btn-cos').style.display = 'none';
        document.getElementById('btn-tan').style.display = 'none';
        document.getElementById('btn-graph').style.display = 'none';
        document.getElementById('btn-radius').style.display = 'none';
        document.getElementById('radius-input').style.display = 'block';
    });
}

function draw() {
    background(255);
    if (autoRotate) {
        angle = (angle + 1) % 360;
    }
    drawGrid();
    if (showCircle) drawCircleDot();
    if (GripSimulation) GripSimulator();
    // drawCircleDot();
    // if (graphEnabled) drawGraphLines();
    updateInputs();
}


function drawGrid() {
    if (ctrlDragging) return;
    push();
    translate(width / 2 + offsetX, height / 2 + offsetY);
    const maxD = max(width, height) * 2;
    const pulse = 100 + 50 * sin(frameCount * 0.02);
    for (let i = -cols; i <= cols; i++) drawLine(i, true, pulse, maxD);
    for (let j = -rows; j <= rows; j++) drawLine(j, false, pulse, maxD);
    pop();
}

function drawLine(i, vertical, pulse, maxD) {
    if (i === 0) {
        stroke(ar, ag, ab, 255);
        strokeWeight(2);
    } else if (i % 5 === 0) {
        stroke(mr, mg, mb, pulse);
        strokeWeight(1);
    } else {
        stroke(gr, gg, gb, pulse * 0.8);
        strokeWeight(0.5);
    }
    if (vertical) {
        line(i * gridSize, -maxD, i * gridSize, maxD);
    } else {
        line(-maxD, i * gridSize, maxD, i * gridSize);
    }
}

function drawCircleDot() {
    push();
    translate(width / 2 + offsetX, height / 2 + offsetY);
    // big circle
    noFill();
    stroke(0);
    strokeWeight(2);
    ellipse(0, 0, circleRadius * 2, circleRadius * 2);

    // angle arc
    const arcR = circleRadius * 0.2;
    stroke(255, 0, 0);
    strokeWeight(4);
    noFill();
    arc(0, 0, arcR * 2, arcR * 2, radians(-angle), 0);

    // common coords
    const cx = circleRadius * cos(radians(-angle));
    const cy = circleRadius * sin(radians(-angle));
    strokeWeight(5);

    let radius_color = [0, 255, 0]
    let sin_color = [0, 0, 255]
    let cos_color = [255, 215, 0]
    let tan_color = [255, 20, 147]
    let cot_color = [0, 255, 255]
    let sec_color = [238, 130, 238]
    let csc_color = [255, 165, 0]

    if (trigStates.radius) {
        stroke(radius_color);
        line(0, 0, cx, cy);
    }
    if (trigStates.sin) {
        stroke(sin_color);
        line(cx, cy, cx, 0);
    }
    if (trigStates.cos) {
        stroke(cos_color);
        line(0, cy, cx, cy);
    }
    if (trigStates.tan) {
        stroke(tan_color);
        line(cx, cy, circleRadius * (1 / cos(radians(-angle))), 0);
    }
    if (trigStates.cot) {
        stroke(cot_color);
        line(cx, cy, 0, circleRadius * (1 / sin(radians(-angle))));
    }
    if (trigStates.sec) {
        stroke(sec_color);
        line(circleRadius * (1 / cos(radians(-angle))), 0, 0, 0);
    }
    if (trigStates.csc) {
        stroke(csc_color);
        line(0, circleRadius * (1 / sin(radians(-angle))), 0, 0);
    }

    if (!graphEnabled) {
        // Only draw sine‐wave when sin θ is active
        if (trigStates.sin) {
            let amplitude = graphAmplitude, freq = graphFrequency;
            stroke(sin_color);
            beginShape();
            for (let x = 0; x <= width / 2; x++) {
                let y = height / 3 + amplitude * sin(TWO_PI * freq * x + radians(angle));
                vertex(x, y);
            }
            endShape();
        }

        // Only draw cosine‐wave when cos θ is active
        if (trigStates.cos) {
            let amplitude = graphAmplitude, freq = graphFrequency;
            stroke(cos_color);
            beginShape();
            for (let x = 0; x <= width / 2; x++) {
                let y = height / 3 + amplitude * cos(TWO_PI * freq * x + radians(angle));
                vertex(-x, y);
            }
            endShape();
        }

        // Only draw tangent‐wave when tan θ is active
        if (trigStates.tan) {
            let amplitude = graphAmplitude, freq = graphFrequency;
            stroke(tan_color);
            beginShape();
            for (let x = 0; x <= width / 2; x++) {
                let y = height / 3 + amplitude * tan(TWO_PI * freq * x + radians(angle));
                vertex(x, y);
            }
            endShape();
        }

        // Only draw cotangent‐wave when cot θ is active
        if (trigStates.cot) {
            let amplitude = graphAmplitude, freq = graphFrequency;
            stroke(cot_color);
            beginShape();
            for (let x = 0; x <= width / 2; x++) {
                let y = height / 3 + amplitude * (1 / tan(TWO_PI * freq * x + radians(angle)));
                vertex(-x, y);
            }
            endShape();
        }

        // Only draw secant‐wave when sec θ is active
        if (trigStates.sec) {
            let amplitude = graphAmplitude, freq = graphFrequency;
            stroke(sec_color);
            beginShape();
            for (let x = 0; x <= width / 2; x++) {
                let y = height / 3 + amplitude * (1 / cos(TWO_PI * freq * x + radians(angle)));
                vertex(x, y);
            }
            endShape();
        }

        // Only draw cosecant‐wave when csc θ is active
        if (trigStates.csc) {
            let amplitude = graphAmplitude, freq = graphFrequency;
            stroke(csc_color);
            beginShape();
            for (let x = 0; x <= width / 2; x++) {
                let y = height / 3 + amplitude * (1 / sin(TWO_PI * freq * x + radians(angle)));
                vertex(-x, y);
            }
            endShape();
        }
    }

    fill(255, 0, 0);
    noStroke();
    ellipse(0, 0, 15, 15);
    ellipse(cx, cy, 15, 15);

    pop();
}

function GripSimulator() {
    push();
    translate(width / 2 + offsetX, height / 2 + offsetY);

    // angle arc
    // const arcR = circleRadius * 0.2;
    // stroke(255, 0, 0);
    // strokeWeight(4);
    // noFill();
    // arc(0, 0, arcR * 2, arcR * 2, radians(-angle), 0);

    // lever‐arm end
    let cx = (circleRadius * 0.7) * cos(radians(-angle));
    let cy = (circleRadius * 0.7) * sin(radians(-angle));
    strokeWeight(5);

    // colors
    let red = [255, 0, 0],
        green = [0, 255, 0],
        blue = [0, 0, 255],
        yelow = [255, 165, 0];

    noFill();
    stroke(0);
    strokeWeight(2);
    ellipse(0, -(circleRadius * 2), circleRadius * 2, circleRadius * 2);

    // drawing coil 
    let s = 25,
        c_a = 2;
    for (let i = 0; i <= 360; i += c_a * 2) {
        let ang1 = radians(-i);
        let ang2 = radians(-(i + c_a));
        let ang3 = radians(-(i + c_a * 2));

        let sign1 = +s;
        let sign2 = -s;

        let x1 = (circleRadius + sign1) * cos(ang1);
        let y1 = (circleRadius + sign1) * sin(ang1);
        let x2 = (circleRadius + sign2) * cos(ang2);
        let y2 = (circleRadius + sign2) * sin(ang2);
        let x3 = (circleRadius + sign1) * cos(ang3);
        let y3 = (circleRadius + sign1) * sin(ang3);

        if ((i >= 0 && i <= 60) || (i >= 180 && i <= 240)) {
            stroke(yelow);
        } else if ((i >= 60 && i <= 120) || (i >= 240 && i <= 300)) {
            stroke(green);
        } else if ((i >= 120 && i <= 180) || (i >= 300 && i <= 360)) {
            stroke(red);
        }

        line(x1, (circleRadius * -2) + y1, x2, (circleRadius * -2) + y2);
        line(x2, (circleRadius * -2) + y2, x3, (circleRadius * -2) + y3);
    }

    strokeWeight(5);
    // 1st phase (offset +60°)
    let amplitude = graphAmplitude,
        freq = graphFrequency;
    stroke(yelow);
    beginShape();
    for (let x = -width / 2; x <= width / 2; x++) {
        let y = amplitude * sin(TWO_PI * freq * x + radians(angle + 60));
        vertex(x, y);
    }
    endShape();

    // 2nd phase (offset 0°)
    amplitude = graphAmplitude;
    freq = graphFrequency;
    stroke(green);
    beginShape();
    for (let x = -width / 2; x <= width / 2; x++) {
        let y = amplitude * sin(TWO_PI * freq * x + radians(angle));
        vertex(x, y);
    }
    endShape();

    // 3rd phase (offset +120°)
    amplitude = graphAmplitude;
    freq = graphFrequency;
    stroke(red);
    beginShape();
    for (let x = -width / 2; x <= width / 2; x++) {
        let y = amplitude * sin(TWO_PI * freq * x + radians(angle + 120));
        vertex(x, y);
    }
    endShape();

    // ─────────────────────────────────────────────────────────────────────────────
    // Display instantaneous voltages (peak = 12 V) for each phase
    // ─────────────────────────────────────────────────────────────────────────────
    let maxVolts = 12;
    let offsets = [60, 0, 120]; // must match the waveform offsets above
    let voltA = maxVolts * sin(radians(angle + offsets[0]));
    let voltB = maxVolts * sin(radians(angle + offsets[1]));
    let voltC = maxVolts * sin(radians(angle + offsets[2]));

    // Position text above the horizontal 0 line:
    let textY = -amplitude - 20;
    let leftX = -width / 4;
    let midX = 0;
    let rightX = +width / 4;

    noStroke();
    textSize(24);
    textAlign(CENTER, CENTER);

    fill(yelow);
    i = voltA.toFixed(2) < 0 ? -1 : 1
    text(`A: ${(voltA.toFixed(2)) * i} V`, leftX, textY);
    fill(green);
    i = voltB.toFixed(2) < 0 ? -1 : 1
    text(`B: ${(voltB.toFixed(2)) * i} V`, midX, textY);
    fill(red);
    i = voltC.toFixed(2) < 0 ? -1 : 1
    text(`C: ${(voltC.toFixed(2)) * i} V`, rightX, textY);

    // ─────────────────────────────────────────────────────────────────────────────
    // Draw “voltage” lines from each phasor tip on the circle down to the waveform
    // ─────────────────────────────────────────────────────────────────────────────
    let R = circleRadius;
    let centerY = -2 * R;



    // ─────────────────────────────────────────────────────────────────────────────
    // Draw the lever‐arm lines (unchanged)
    // ─────────────────────────────────────────────────────────────────────────────
    stroke(red);
    strokeWeight(25);
    line(0, (circleRadius * -2), cx, (circleRadius * -2) + cy);
    stroke(blue);
    line(0, (circleRadius * -2), -cx, -1 * ((circleRadius * 2) + cy));
    stroke(0);
    line(0, (circleRadius * -2), 0, (circleRadius * -2));

    pop();
    prevAngle = angle;
}


function mousePressed() {
    gridDragging = !ctrlDragging;
    prevX = mouseX; prevY = mouseY;
}
function mouseDragged() {
    if (gridDragging) {
        offsetX += mouseX - prevX;
        offsetY += mouseY - prevY;
        prevX = mouseX; prevY = mouseY;
    }
}
function mouseReleased() {
    gridDragging = false;
}
function mouseWheel(e) {
    angle = (angle + e.deltaY * 0.1 + 360) % 360;
    radiusInput.dataset.userChanged = false;
    return false;
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    updateGrid();
    if (!radiusInput.dataset.userChanged) circleRadius = min(width, height) * 0.25;
    updateInputs();
}
function toggleSidebar() {
    const sb = select('#sidebar');
    window.matchMedia('(max-width:768px)').matches
        ? sb.toggleClass('open')
        : sb.toggleClass('collapsed');
}
function updateGrid() {
    cols = ceil((width / 2) / gridSize);
    rows = ceil((height / 2) / gridSize);
}
function resetView() {
    offsetX = 0; offsetY = 0; gridSize = INITIAL_GRID_SIZE;
    updateGrid(); circleRadius = min(width, height) * 0.22;
    radiusInput.dataset.userChanged = false;
}
function initController() {
    radiusInput = document.getElementById('radius-input');
    angleInput = document.getElementById('angle-input');
    amplitudeInput = document.getElementById('amplitude');
    frequencyInput = document.getElementById('frequency');
    amplitudeInput.value = graphAmplitude;
    frequencyInput.value = graphFrequency;

    amplitudeInput.addEventListener('input', () => {
        const v = parseFloat(amplitudeInput.value);
        if (!isNaN(v)) graphAmplitude = v;
    });
    frequencyInput.addEventListener('input', () => {
        const v = parseFloat(frequencyInput.value);
        if (!isNaN(v)) graphFrequency = v;
    });

    radiusInput.addEventListener('input', () => {
        const v = parseFloat(radiusInput.value);
        if (!isNaN(v)) { circleRadius = v; radiusInput.dataset.userChanged = true; }
    });
    angleInput.addEventListener('input', () => {
        const v = parseFloat(angleInput.value);
        if (!isNaN(v)) angle = (v % 360 + 360) % 360;
    });


    Object.keys(trigStates).forEach(fn => {
        select('#btn-' + fn).mousePressed(() => {
            trigStates[fn] = !trigStates[fn];
            document.getElementById('btn-' + fn).classList.toggle('active', trigStates[fn]);
        });
    });

    select('#btn-auto').mousePressed(() => {
        autoRotate = !autoRotate;
        document.getElementById('btn-auto').classList.toggle('active', autoRotate);
    });


    // now _after_ the loop:
    select('#btn-graph').mousePressed(() => {
        graphEnabled = !graphEnabled;
        document.getElementById('btn-graph').classList.toggle('active', graphEnabled);
    });

    const ctrl = document.getElementById('controller'),
        hdr = ctrl.querySelector('.header'),
        mb = document.getElementById('minimize-btn'),
        bodyEl = document.body;

    hdr.addEventListener('mousedown', e => {
        ctrlDragging = true;
        startX = e.clientX - ctrl.offsetLeft;
        startY = e.clientY - ctrl.offsetTop;
        bodyEl.style.cursor = 'move';
    });
    document.addEventListener('mousemove', e => {
        if (!ctrlDragging) return;
        ctrl.style.left = (e.clientX - startX) + 'px';
        ctrl.style.top = (e.clientY - startY) + 'px';
    });
    document.addEventListener('mouseup', () => {
        ctrlDragging = false;
        bodyEl.style.cursor = '';
    });
    mb.addEventListener('click', () => {
        ctrl.classList.toggle('minimized');

        if (ctrl.classList.contains('minimized')) {
            // Lock in whatever width it's at right now:
            ctrl.style.width = ctrl.getBoundingClientRect().width + 'px';
        } else {
            // Remove the inline width so it can go back to its normal 260px
            ctrl.style.width = '';
        }
    });

}
function updateInputs() {
    if (document.activeElement !== radiusInput)
        radiusInput.value = circleRadius.toFixed(0);
    if (document.activeElement !== angleInput)
        angleInput.value = angle.toFixed(0);
}


