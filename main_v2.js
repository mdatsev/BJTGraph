let sidebar_width = 100;
let colors = {
    background: 0,
    point: 255,
    sidebar: 100,
    gridLines: "white",
    loadline: "green",
    OC: "red",
    Uce: "blue",
    Ic: "yellow",
    Ib: "magenta",
    IcIb0: "brown"
};

let controlPoints = [];
let seed;
let nLabels = 5;
let running = false;
let multiplier = 0.5;
let angle = 0;
let sidebar_spacing = 22;
let graphs_spacing = 40;
const LABEL_PRESCISION = 10000;
const LABEL_TICK_LENGTH = 10;
const LABEL_MARGIN = 5;

let inputs = {
    rcsat: 100,
    h21e: 100,
    Ec: 10,
    Rc: 1000,
    IbMax: 0.0001,
    IbMin: 0,
    Icb0: 0.0004,
    nPoints: 150,
    speed: 1,
    frequency: 1,
    line_width: 3
};

let fakeSlope = 1.1;
let IbGraphOffset;
let OCxLength = 0.5;

let UceRange = 2 * inputs.Ec;
let IcRange = 2 * inputs.Ec / inputs.Rc;
let LLLength;
let timeLength;

let fitScale = 0.85;
let xScale = 2;
let yScale = 2000;
let ibdeg = 0;

let minDimension;
function setup() {
    angleMode(DEGREES);
    createCanvas(windowWidth, windowHeight);
    background(colors.background);
    calculateScalings();
    createGUI();
    createLayout();
}

function clearDraw() {
    background(colors.background);
    createGUI();
    createLayout();
}

function draw() {
    if (running) {
        background(colors.background);
        createLayout();
        let Ec = inputs.Ec;
        let Rc = inputs.Rc;
        let Rce = inputs.rcsat;
        ibdeg -= inputs.speed;
        if (ibdeg > 360) ibdeg = 0;
        let lastUcePoint;
        let lastIcPoint;
        let lastIbPoint;
        for (let i = 0; i < inputs.nPoints; i++) {
            let ib = inputs.IbMin + (1 + sin(ibdeg + inputs.frequency * 360 * i / inputs.nPoints)) * (inputs.IbMax - inputs.IbMin) / 2;
            let Ic = ib * inputs.h21e;

            if (Ic > Ec / Rc)
                Ic = Ec / Rc;

            let Uce = Ec - Ic * Rc;

            if (i == 0) {
                goToMainGraph();

                //loadline
                stroke(colors.loadline);
                plotLine(Ec, 0, 0, Ec / Rc);

                //output characteristics
                let x2 = UceRange * OCxLength;
                let y1 = ib * inputs.h21e;
                let x1 = min(UceRange * OCxLength, y1 * Rce);
                let y2 = y1 * fakeSlope;
                stroke(colors.OC);
                plotLine(0, 0, x1, y1);
                plotLine(x1, y1, x2, y2);

                //IcIb0
                stroke(colors.IcIb0);
                plotLine(0, inputs.Icb0, UceRange, inputs.Icb0);
            }

            if (Ic > Ec / (Rc + Rce))
                Ic = Ec / (Rc + Rce);

            if (Ic < inputs.Icb0)
                Ic = inputs.Icb0;

            Uce = Ec - Ic * Rc;

            if (i > 0) {
                goToUceGraph();
                stroke(colors.Ic);
                plotLine(lastUcePoint.x, lastUcePoint.y, Uce, i * IcRange / inputs.nPoints);
                goToIcGraph();
                stroke(colors.Uce);
                plotLine(lastIcPoint.x, lastIcPoint.y, i * UceRange / inputs.nPoints, Ic);
                goToIbGraph();
                stroke(colors.Ib);
                line(lastIbPoint.x, lastIbPoint.y, i * timeLength / inputs.nPoints, -ib * LLLength / inputs.IbMax)
            }
            lastUcePoint = { x: Uce, y: i * IcRange / inputs.nPoints };
            lastIcPoint = { x: i * UceRange / inputs.nPoints, y: Ic };
            lastIbPoint = { x: i * timeLength / inputs.nPoints, y: -ib * LLLength / inputs.IbMax }
        }
        createGUI();
    }
}

function plotPoint(x, y) {
    noStroke();
    ellipse(x * xScale, -y * yScale, inputs.line_width, inputs.line_width)
}

function plotLine(x1, y1, x2, y2) {
    strokeWeight(inputs.line_width);
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
    text("Uce", xScale * UceRange, graphs_spacing / 2);
    textAlign(CENTER, TOP);
    text("t", 0, IcRange * yScale + graphs_spacing);
    pop();

    for (let i = 0; i < nLabels; i++) {
        textAlign(CENTER, CENTER);
        text(
            humanize(i * UceRange / nLabels),
            xScale * i * UceRange / nLabels,
            graphs_spacing / 2);
        textAlign(RIGHT, CENTER);
        text(
            humanize(i * IcRange / nLabels * 1000),
            -LABEL_MARGIN,
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
    textAlign(LEFT, CENTER);
    text("t", xScale * UceRange, 0);
    pop();
    for (let i = 0; i < nLabels; i++) {
        /*text(
            humanize(i * UceRange / nLabels),
            xScale * i * UceRange / nLabels,
            LABEL_SPACING);*/
        textAlign(RIGHT, CENTER);
        text(
            humanize(i * IcRange / nLabels * 1000),
            -LABEL_MARGIN,
            -yScale * i * IcRange / nLabels);
    }

    stroke("white");
    goToUceGraph();
    line(0, 0, UceRange * xScale, 0);
    line(0, 0, 0, -IcRange * yScale);
    noStroke();
    push();
    textAlign(LEFT, CENTER);
    pop();
    /*for (let i = 0; i < nLabels; i++) {
         text(
             humanize(i * UceRange / nLabels),
             xScale * i * UceRange / nLabels,
             LABEL_SPACING);
         text(
             humanize(i * IcRange / nLabels * 1000),
             -LABEL_SPACING,
             -yScale * i * IcRange / nLabels);
    }*/

    stroke(colors.gridLines);
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
    for (let i = 0; i < nLabels; i++) {
        textAlign(RIGHT, CENTER);
        text(
            humanize(i * inputs.IbMax / nLabels * 1000),
            -LABEL_MARGIN,
            -i * LLLength / nLabels);
    }
}

function humanize(x) {
    return x.toFixed(6).replace(/\.?0*$/, '');
}

let elems_created = false;

function createGUI() {
    resetMatrix();
    fill(colors.sidebar);
    //rect(0, 0, SIDEBAR_WIDTH, windowHeight);
    var i = 0;
    //textSize(sidebar_spacing);
    Object.keys(inputs).forEach((inp) => {
        /*let label = createElement('span', inp);
        label.position(5, i * sidebar_spacing);
        label.style(`color:white; font-size:${sidebar_spacing / 2}; vertical-align:25px;`);*/
        push();
        fill("white");
        noStroke();
        textSize(sidebar_spacing * 0.8);
        textAlign(LEFT, CENTER);
        text(inp, 1, i * sidebar_spacing + sidebar_spacing / 2);
        pop();
        i++;
        if (!elems_created) {
            let input = createInput(inputs[inp]);
            $(input.elt).attr('placeholder', inp);
            input.position(0, i * sidebar_spacing);
            input.size(sidebar_width - LABEL_MARGIN, sidebar_spacing);
            /*input.changed(() => {
                inputs[inp] = parseFloat(input.value());
                LLLength = sqrt(((inputs.Ec * xScale) ** 2) + ((inputs.Ec / inputs.Rc * yScale) ** 2));
                $(input.elt).css('border', '');
            });*/
            input.input(() => {
                // $(input.elt).css('border', 'solid red');
                if (!isNaN(parseFloat(input.value())))
                    inputs[inp] = parseFloat(input.value());
            });
        }
        i++;
    });
    if (!elems_created) {
        startBtn = createButton('start');
        startBtn.position(LABEL_MARGIN, i * sidebar_spacing + LABEL_MARGIN);
        startBtn.size(sidebar_width - LABEL_MARGIN, sidebar_spacing * 2);
        startBtn.mousePressed(() => {
            running = !running;
            $(startBtn.elt).text(running ? 'pause' : 'start');
        });
    }
    i += 2;

    if (!elems_created) {
        rescaleGraphs = createButton('rescale graphs');
        rescaleGraphs.position(LABEL_MARGIN, i * sidebar_spacing + LABEL_MARGIN);
        rescaleGraphs.size(sidebar_width - LABEL_MARGIN, sidebar_spacing * 2);
        $(rescaleGraphs.elt).css('white-space', 'nowrap');
        rescaleGraphs.mousePressed(() => {
            calculateScalings();
            background(colors.background);
            createLayout();
        });
    }
    i += 2;
    elems_created = true;
}

function goToMainGraph() {
    resetMatrix();
    translate((windowWidth + sidebar_width) / 2, IcRange * yScale / fitScale + graphs_spacing / 2);//windowHeight / 2 );
}

function goToIcGraph() {
    goToMainGraph();
    translate(-UceRange * xScale - graphs_spacing, 0);
}

function goToUceGraph() {
    goToMainGraph();
    //translate(0, IcRange * yScale);
    translate(0, graphs_spacing);
    scale(1, -1);
}

function goToIbGraph() {
    goToMainGraph();
    translate(inputs.Ec * xScale, 0);
    rotate(atan2(1 / xScale, inputs.Rc / yScale) - 90);
    translate(IbGraphOffset, 0);
}

function calculateScalings() {
    UceRange = 2 * inputs.Ec;
    IcRange = 2 * inputs.Ec / inputs.Rc;
    graphs_spacing = min(windowWidth, windowHeight) / 16;
    minDimension = min(windowWidth - sidebar_width - LABEL_MARGIN - graphs_spacing, windowHeight - graphs_spacing);
    sidebar_width = windowWidth / 8;
    sidebar_spacing = min(windowHeight / (Object.keys(inputs).length * 2 + 2 * 2 + 2), 30);
    xScale = (minDimension) / (2 * UceRange) * fitScale;
    yScale = (minDimension) / (2 * IcRange) * fitScale;
    LLLength = sqrt(((inputs.Ec * xScale) ** 2) + ((inputs.Ec / inputs.Rc * yScale) ** 2));
    IbGraphOffset = minDimension / 4;
};