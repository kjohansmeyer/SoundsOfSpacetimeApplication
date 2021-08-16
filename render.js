//window.alert("Headphones are recommended for the best user experience. Cellphone and laptop may not be able to produce frequencies near or below 90 Hz.");

'use strict'

// ----------------------------- Slider Debug ----------------------------- //
function printVars() {
    console.log({ alpha }, { m1sliderval }, { m2sliderval });
}

//=============================================================================//
// ----------------------------- Update function ----------------------------- //
//=============================================================================//
// This entire function updates every time a slider is changed
function updateFunction(alpha, m1sliderval, m2sliderval) {
    // ----------------------------- Defining Variables ----------------------------- //
    const Msun = 0.00000492686088; //mass of the sun using geometric units to get f in Hz

    //let A = 1.343797621, //change later to exact calculation
    let deltat = 0.0001,
        tmax = 10,
        N = tmax / deltat,
        t = new Array(N).fill(0), //probably can define with time steps instead of defining with zeros
        f = new Array(N).fill(0), //change this out for faster method? f = new Array(N); for (let i=0; i<n; ++i a[i]=0;
        h = new Array(N).fill(0),
        v = new Array(N).fill(0),
        phi = new Array(N).fill(0);

    t[0] = 0;
    for (let i = 1; i < N; i++) {
        t[i] = t[i - 1] + deltat;
    }

    let m1 = m1sliderval * Msun,
        m2 = m2sliderval * Msun,
        M = (m1 + m2);

    //initial conditions:
    f[0] = 90;
    v[0] = Math.pow(Math.PI * M * f[0], 1 / 3);


    // ----------------------------- Calculations ----------------------------- //
    let eta = (m1 * m2) / (M * M), //reduced mass ratio, varies from 0 to 0.25
        phic = 0,
        tc = t[0] + (5 / 256) * (M / (eta * Math.pow(v[0], 8)));

    for (let n = 0; n < N; n++) {
        v[n] = Math.pow((256 / 5) * (eta / M) * (tc - t[n]), -1 / 8); //Solution to dv/dt = 32/5 (eta/M) v^9
        phi[n] = phic - (1 / 5) * Math.pow(5 / eta, 3 / 8) * Math.pow((tc - t[n]) / M, 5 / 8); //Solution to dphi/dt = v^3/M
        f[n] = Math.pow(v[n], 3) / (Math.PI * M);
    }
    // filters Not-a-Numbers (NaN's) from v, phi, and f
    // Citation: https://www.codegrepper.com/code-examples/javascript/js+remove+all+NaN+string+from+array
    let vFiltered = v.filter(x => x),
        phiFiltered = phi.filter(x => x),
        fFiltered = f.filter(x => x);
    
    let A = 1/Math.pow(Math.max(...vFiltered),2); // A scales the strain function: A = 1/(vf)^2 which makes -1 < h(t) < 1 when alpha = 0

    // h(t) is calculated separate since it depends on A, which depends on the final frequency
    for (let n = 0; n < N; n++) {
        h[n] = A * ((Math.pow(v[n], 2)) * Math.sin(2 * phi[n]) + alpha * (Math.pow(v[n], 3) * Math.sin(3 * phi[n])));
    }
    let hFiltered = h.filter(x => x);

    // t_f = v.length*deltat; can be calculated analytically using t_f = t[0] + (5/256)*(M/eta)*(1/(v[0])^8 + 1/(vf)^8))

    console.log({vFiltered}, {phiFiltered}, {hFiltered}, {fFiltered});

    // ----------------------------- Plotting ----------------------------- //
    // Strain vs. Time Plot
    let layout0 = {
        title: {
            text: 'Strain vs. Time',
            font: {
                family: 'Times New Roman',
                size: 24,
                color: 'white'
            },
        },
        xaxis: {
            title: {
                text: 'Time',
                font: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: 'white'
                }
            },
            color: 'white',
            rangemode: 'nonnegative'
        },
        yaxis: {
            title: {
                text: 'Strain',
                font: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: 'white'
                }
            },
            color: 'white',
        },
        plot_bgcolor: "#383838",
        paper_bgcolor: "#181818"
    }

    let trace0 = {
        x: t,
        y: hFiltered,
        name: "Strain vs. Time",
        type: 'scatter'
    };

    let data0 = [trace0];

    Plotly.newPlot('strainVsTimePlot', data0, layout0);
    
    // Frequency vs. Time Plot
    let layout1 = {
        title: {
            text: 'Frequency vs. Time',
            font: {
                family: 'Times New Roman',
                size: 24,
                color: 'white'
            },
        },
        xaxis: {
            title: {
                text: 'Time',
                font: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: 'white'
                }
            },
            color: 'white'
        },
        yaxis: {
            title: {
                text: 'Frequency',
                font: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: 'white'
                }
            },
            color: 'white'
        },
        plot_bgcolor: "#383838",
        paper_bgcolor: "#181818"
    }

    let trace1 = {
        x: t,
        y: fFiltered,
        type: 'scatter'
    };

    let data1 = [trace1];
    Plotly.newPlot('frequencyVsTimePlot', data1, layout1, {scrollZoom: true});

}
//=============================================================================//
// ------------------------- Button Press/Play Audio ------------------------- //
//=============================================================================//
// function buttonPress() {
//     //Citation: https://stackoverflow.com/questions/6343450/generating-sound-on-the-fly-with-javascript-html5
//     //one context per document
//     var context = new (window.AudioContext || window.webkitAudioContext)();
//     var osc = context.createOscillator(); // instantiate an oscillator
//     osc.type = 'sine'; // this is the default - also square, sawtooth, triangle
//     osc.frequency.value = 440; // Hz
//     osc.connect(context.destination); // connect it to the destination
//     osc.start(); // start the oscillator
//     osc.stop(context.currentTime + 2); // stop 2 seconds after the current time
//     //setInterval(function(){ alert("Hello"); }, 3000);
// }
//=============================================================================//
// ------------------------- Button Press/Play Audio ------------------------- //
//=============================================================================//
// function buttonPress() {
//     var whiteNoise = new Pizzicato.Sound(function(e) {

//         var output = e.outputBuffer.getChannelData(0);
//         for (var i = 0; i < e.outputBuffer.length; i++)
//             output[i] = Math.random();
//     });
//     whiteNoise.play();
// }
let waveSound = new Pizzicato.Sound({ 
    source: 'wave', 
    options: {
        frequency: 440
    }
});

function startAudio() {
    waveSound.play(),
    printVars();
}

function stopAudio() {
    waveSound.stop();
}

// ----------------------------- UI Elements ----------------------------- //
const alphaSlider = document.getElementById("alphaSlider");
const m1slider = document.getElementById("m1slider");
const m2slider = document.getElementById("m2slider");

let alpha = Number(alphaSlider.value),
    m1sliderval = Number(m1slider.value),
    m2sliderval = Number(m2slider.value);

console.log({ alpha }, { m1sliderval }, { m2sliderval });

// ----------------------------- Update Slider Values ----------------------------- //
alphaSlider.addEventListener('change', function (event) {
    alpha = Number(alphaSlider.value);
    printVars();
    //keep zoom window?
    waveSound.stop();
    updateFunction(alpha, m1sliderval, m2sliderval);
})

m1slider.addEventListener('change', function (event) {
    m1sliderval = Number(m1slider.value);
    printVars();
    waveSound.stop();
    updateFunction(alpha, m1sliderval, m2sliderval);
})

m2slider.addEventListener('change', function (event) {
    m2sliderval = Number(m2slider.value);
    printVars();
    waveSound.stop();
    updateFunction(alpha, m1sliderval, m2sliderval);
})
// ----------------------------- Execute update Function for initial time ----------------------------- //
updateFunction(alpha, m1sliderval, m2sliderval);