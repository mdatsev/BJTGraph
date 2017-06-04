const SIDEBAR_WIDTH = 200;
let COLORS = {
    background: 0,
    point: 255,
    sidebar: 100,
    gridLines: "white"
};
let draw_width = 3;
let controlPoints = [];
let seed;
let nPoints = 180;
let nLabels = 5;
let running = false;
let multiplier = 0.5;
let angle = 0;
const SIDEBAR_SPACING = 22;
const LABEL_SPACING = 20;
const LABEL_PRESCISION = 10000;

let inputs = {
    rcsat: 100,
    h21e: 100,
    Ec: 10,
    Rc: 1000,
    IbMax: 0.0001,
    IbMin: 0,
    IcIb0: 0.0004
};

let UceRange = 2 * inputs.Ec;
let IcRange = 2 * inputs.Ec / inputs.Rc;
let LLLength;
let timeLength;

let xScale = 2;
let yScale = 2000;
let ibdeg = 0;

let minDimension;
function setup() {
    angleMode(DEGREES);
    minDimension = min(windowWidth, windowHeight);
    Object.keys(COLORS).map((col) => color(COLORS[col]));
    xScale = (minDimension - 2 * LABEL_SPACING) / (2 * UceRange) * 0.9;
    yScale = (minDimension - 2 * LABEL_SPACING) / (2 * IcRange) * 0.9;
    LLLength = sqrt(((inputs.Ec * xScale) ** 2) + ((inputs.Ec / inputs.Rc * yScale) ** 2));
    createCanvas(windowWidth, windowHeight);
    background(COLORS.background);
    createGUI();
    createLayout();
}

function clearDraw() {
    background(COLORS.background);
    createGUI();
    createLayout();
}

function draw() {
    if (running) {

        background(0);
        let Ec = inputs.Ec;
        let Rc = inputs.Rc;
        let Rce = inputs.rcsat;
        ibdeg += 1;
        if (ibdeg > 360) ibdeg = 0;
        let lastUcePoint;
        let lastIcPoint;
        let lastIbPoint;
        for (let i = 0; i < nPoints; i++) {
            let ib = inputs.IbMin + (1 + sin(ibdeg + 360 * i / nPoints)) * (inputs.IbMax - inputs.IbMin) / 2;
            let Ic = ib * inputs.h21e;

            if (Ic > Ec / Rc)
                Ic = Ec / Rc;

            let Uce = Ec - Ic * Rc;

            if (i == 0) {
                goToMainGraph();

                //loadline
                stroke("green");
                plotLine(Ec, 0, 0, Ec / Rc);

                //output characteristics
                let x2 = UceRange;
                let y1 = ib * inputs.h21e;
                let x1 = y1 * Rce;
                let y2 = y1 * 1.1;
                stroke("red");
                plotLine(0, 0, x1, y1);
                plotLine(x1, y1, x2, y2);

                //IcIb0
                stroke("brown");
                plotLine(0, inputs.IcIb0, UceRange, inputs.IcIb0);
            }

            if (Ic > Ec / (Rc + Rce))
                Ic = Ec / (Rc + Rce);

            if (Ic < inputs.IcIb0)
                Ic = inputs.IcIb0;

            Uce = Ec - Ic * Rc;

            if (i > 0) {
                goToUceGraph();
                stroke("blue");
                plotLine(lastUcePoint.x, lastUcePoint.y, Uce, i * IcRange / nPoints);
                goToIcGraph();
                stroke("yellow");
                plotLine(lastIcPoint.x, lastIcPoint.y, i * UceRange / nPoints, Ic);
                goToIbGraph();
                stroke("magenta");
                line(lastIbPoint.x, lastIbPoint.y, i * timeLength / nPoints, -ib * LLLength / inputs.IbMax)
            }
            lastUcePoint = { x: Uce, y: i * IcRange / nPoints };
            lastIcPoint = { x: i * UceRange / nPoints, y: Ic };
            lastIbPoint = { x: i * timeLength / nPoints, y: -ib * LLLength / inputs.IbMax }
        }
        createLayout();
    }
}

function plotPoint(x, y) {
    noStroke();
    ellipse(x * xScale, -y * yScale, draw_width, draw_width)
}

function plotLine(x1, y1, x2, y2) {
    strokeWeight(draw_width);
    line(x1 * xScale, -y1 * yScale, x2 * xScale, -y2 * yScale);
}

function createLayout() {
    goToMainGraph();
    fill(200);
    strokeWeight(1.5);

    stroke("white");
    line(0, 0, UceRange * xScale, 0);
    line(0, 0, 0, -IcRange * yScale);
    noStroke();
    push();
    textAlign(CENTER, BOTTOM);
    text("Ic(mA)", 0, -yScale * IcRange);
    textAlign(LEFT, CENTER);
    text("Uce", xScale * UceRange, 0);

    for (let i = 0; i < nLabels; i++) {
        text(
            humanize(i * UceRange / nLabels),
            xScale * i * UceRange / nLabels,
            LABEL_SPACING);
        text(
            humanize(i * IcRange / nLabels * 1000),
            -LABEL_SPACING,
            -yScale * i * IcRange / nLabels);
    }


    stroke("white");
    goToIcGraph();
    line(0, 0, UceRange * xScale, 0);
    line(0, 0, 0, -IcRange * yScale);
    noStroke();
    push();
    textAlign(CENTER, BOTTOM);
    text("Ic(mA)", 0, -yScale * IcRange);
    pop();
    for (let i = 0; i < nLabels; i++) {
        text(
            humanize(i * UceRange / nLabels),
            xScale * i * UceRange / nLabels,
            LABEL_SPACING);
        text(
            humanize(i * IcRange / nLabels * 1000),
            -LABEL_SPACING,
            -yScale * i * IcRange / nLabels);
    }

    stroke("white");
    goToUceGraph();
    line(0, 0, UceRange * xScale, 0);
    line(0, 0, 0, -IcRange * yScale);
    noStroke();
    push();
    textAlign(LEFT, CENTER);
    text("Uce", xScale * UceRange, 0);
    pop();
    for (let i = 0; i < nLabels; i++) {
        text(
            humanize(i * UceRange / nLabels),
            xScale * i * UceRange / nLabels,
            LABEL_SPACING);
        text(
            humanize(i * IcRange / nLabels * 1000),
            -LABEL_SPACING,
            -yScale * i * IcRange / nLabels);
    }

    stroke("white");
    goToIbGraph();
    line(0, 0, 0, -LLLength);
    timeLength = LLLength * 1.6;
    line(0, 0, timeLength, 0);
    noStroke();
    push();
    textAlign(CENTER, BOTTOM);
    text("ib(mA)", 0, -LLLength);
    textAlign(LEFT, CENTER);
    text("t", timeLength, 0);
    pop();
    textAlign(RIGHT);
    for (let i = 0; i < nLabels; i++) {
        text(
            humanize(i * inputs.IbMax / nLabels * 1000),
            -5,
            -i * LLLength / nLabels);
    }
}

function humanize(x) {
    return x.toFixed(6).replace(/\.?0*$/, '');
}

function createGUI() {
    fill(COLORS.sidebar);
    //rect(0, 0, SIDEBAR_WIDTH, windowHeight);
    var i = 0;
    Object.keys(inputs).forEach((inp) => {
        let input = createInput(inputs[inp]);
        let label = createElement('span', inp);
        label.position(5, i * SIDEBAR_SPACING);
        label.style("color:white");
        i++;
        $(input.elt).attr('placeholder', inp);
        input.position(0, i * SIDEBAR_SPACING);
        i++;
        input.changed(() => {
            inputs[inp] = parseFloat(input.value());
            LLLength = sqrt(((inputs.Ec * xScale) ** 2) + ((inputs.Ec / inputs.Rc * yScale) ** 2));
            $(input.elt).css('border', '');
        });
        input.input(() => {
            $(input.elt).css('border', 'solid red');
        });
    });
    startBtn = createButton('start');
    startBtn.position(SIDEBAR_SPACING / 2, i * SIDEBAR_SPACING + 5);
    startBtn.size(SIDEBAR_WIDTH / 1.6, SIDEBAR_WIDTH / 4);
    startBtn.mousePressed(() => {
        running = !running;
        $(startBtn.elt).text(running ? 'pause' : 'start');
    });
    i += 3;
    rescaleGraphs = createButton('rescale graphs');
    rescaleGraphs.position(SIDEBAR_SPACING / 2, i * SIDEBAR_SPACING + 5);
    rescaleGraphs.mousePressed(() => {
        UceRange = 2 * inputs.Ec;
        IcRange = 2 * inputs.Ec / inputs.Rc;
        xScale = (minDimension - 2 * LABEL_SPACING) / (2 * UceRange) * 0.9;
        yScale = (minDimension - 2 * LABEL_SPACING) / (2 * IcRange) * 0.9;
        LLLength = sqrt(((inputs.Ec * xScale) ** 2) + ((inputs.Ec / inputs.Rc * yScale) ** 2));
        //console.log(xScale, yScale, UceRange, IcRange)
        background(0);
        createLayout();
    });
    i++;
}

function goToMainGraph() {
    resetMatrix();
    translate(windowWidth / 2, windowHeight / 2 / 0.95);
}

function goToIcGraph() {
    goToMainGraph();
    translate(-UceRange * xScale, 0);
}

function goToUceGraph() {
    goToMainGraph();
    translate(0, IcRange * yScale);
}

function goToIbGraph() {
    goToMainGraph();
    translate(inputs.Ec * xScale, 0);
    rotate(atan2(1 / xScale, inputs.Rc / yScale) - 90);
    translate(160, 0);
}