//=============================================================================//
// --------------------------------- Header ---------------------------------- //
//=============================================================================//
//                      Created by Kevin Johansmeyer                           //
//                    Email: kevinjohansmeyer@gmail.com                        //
//                 University: Montclair State University                      //
//                        Advisor: Dr. Marc Favata                             //
//                        www.soundsofspacetime.org                            //
//=============================================================================//

'use strict'

// Timer needed in order to make page load before alert shows
//let myTimer = setTimeout(headphoneAlert, 10);
function headphoneAlert() {
    window.alert("Headphones are recommended for the best user experience. Cellphone and laptops may not be able to produce frequencies near 90 Hz.");
}

//=============================================================================//
// ------------------------------ Slider Debug ------------------------------- //
//=============================================================================//
function printVars() {
    console.log({ alpha }, { m1sliderval }, { m2sliderval });
}

//=============================================================================//
// ----------------------------- Defining Arrays ----------------------------- //
//=============================================================================//
let deltat = 0.0001,
    tmax = 10,
    N = tmax / deltat,
    t = new Float32Array(N).fill(0), //probably can define with time steps instead of defining with zeros
    f = new Float32Array(N).fill(0), //change this out for faster method? f = new Array(N); for (let i=0; i<n; ++i a[i]=0;
    h = new Float32Array(N).fill(0),
    v = new Float32Array(N).fill(0),
    phi = new Float32Array(N).fill(0);

//=============================================================================//
// ----------------------------- Information Box ----------------------------- //
//=============================================================================//


// Citation: https://www.codeproject.com/Questions/699630/How-to-display-the-specific-Text-on-change-of-HTML
var infoBoxArray = new Array();
infoBoxArray[0] = "Basic Binaries Sample Text: Learn a bit about the gravitational-wave signal from two coalescing black holes, including the different phases of the signal. We also explore the role of the total mass of the binary and the effect of neglecting the final merger of the two black holes.";
infoBoxArray[1] = "Circular Binaries Sample Text: Here we focus on two compact objects (neutron stars or black holes) in a circular orbit that is shrinking due to the gravitational waves that are emitted. We expect this to be the most common LIGO source.";
infoBoxArray[2] = "Spinning Binaries Sample Text: Now we allow our individual stars to spin about each of their axes. Because the spin of a body affects its gravity in Einstein's theory, we will see that the gravitational-wave signal (and the corresponding sound) is likewise affected.";
infoBoxArray[3] = 'Elliptical Binaries Sample Text: When we allow the binary orbit to be elliptical the "sound" of the signal become even more interesting.';

function getInfoText(slction){
    var txtSelected = slction.selectedIndex;
    document.getElementById('infoBox').innerHTML = infoBoxArray[txtSelected];
}
//=============================================================================//
// ----------------------------- Update function ----------------------------- //
//=============================================================================//
// This entire function updates every time a slider is changed
function updateFunction(alpha, m1sliderval, m2sliderval) {

    const Msun = 0.00000492686088; //mass of the sun using geometric units to get f in Hz

    t[0] = 0;
    for (let i = 1; i < N; i++) {
        t[i] = t[i - 1] + deltat;
    }

    let m1 = m1sliderval * Msun,
        m2 = m2sliderval * Msun,
        M = (m1 + m2);
    
    // Selected device determines the starting frequency
    // Citation: https://stackoverflow.com/questions/1085801/get-selected-value-in-dropdown-list-using-javascript
    var deviceSelection = document.getElementById("selectDevice");
    var strDeviceSelection = deviceSelection.options[deviceSelection.selectedIndex].text;
    console.log(strDeviceSelection);

    // Initial conditions:
    if (strDeviceSelection == 'Laptop (120 Hz)') {
        f[0] = 120; //Hertz
    } else if (strDeviceSelection == 'Headphones (50 Hz)') {
        f[0] = 50; //Hertz
    } else if (strDeviceSelection == 'Subwoofer (40 Hz)') {
        f[0] = 40; //Hertz
    }
    v[0] = Math.pow(Math.PI * M * f[0], 1/3);

    // ----------------------------- Calculations ----------------------------- //
    let eta = (m1 * m2) / (M * M), //reduced mass ratio, varies from 0 to 0.25
        phic = 0,
        tc = t[0] + (5 / 256) * (M / (eta * Math.pow(v[0], 8)));

    for (let n = 0; n < N; n++) {
        v[n] = Math.pow((256/5) * (eta/M) * (tc - t[n]), -1/8); //Solution to dv/dt = 32/5 (eta/M) v^9
        phi[n] = phic - (1/5) * Math.pow(5/eta, 3/8) * Math.pow((tc - t[n]) / M, 5/8); //Solution to dphi/dt = v^3/M
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

    let tstop = hFiltered.length*deltat //can be calculated analytically using t_f = t[0] + (5/256)*(M/eta)*(1/(v[0])^8 + 1/(vf)^8))
    //console.log({vFiltered}, {phiFiltered}, {hFiltered}, {fFiltered});

    // ----------------------------- Plotting ----------------------------- //
    // ----------------------- Strain vs. Time Plot ---------------------- //
    let layout0 = {
        title: {text: 'Strain vs. Time', font: {family: 'Times New Roman', size: 32, color: 'white'}},
        xaxis: {
            title: {
                text: 'Time (sec)',
                font: {family: 'Times New Roman', size: 26,color: 'white'}
            },
            tickfont: {family: 'Times New Roman', size: 18, color: 'white'},
            color: 'white',
            rangemode: 'nonnegative',
            showgrid: false,
            ticks: 'outside'
        },
        yaxis: {
            title: {
                text: 'Normalized Strain',
                font: {family: 'Times New Roman', size: 26,color: 'white'}
            },
            tickfont: {family: 'Times New Roman', size: 18,color: 'white'},
            color: 'white',
            showgrid: false,
            ticks: 'outside',
            range: [-Math.max(...hFiltered), Math.max(...hFiltered)] 
        },
        margin: {l: 100, r: 50, b: 60, t: 75, pad: 4},
        plot_bgcolor: 'white', //"#383838",
        paper_bgcolor: "#181818"
    }

    let trace0 = {
        x: t,
        y: hFiltered,
        name: "Strain vs. Time",
        type: 'scatter',
        line: {
            color: '#282828', //'white',
            width: 3
          }
    };

    var config0 = {
        toImageButtonOptions: {
          format: 'png', // one of png, svg, jpeg, webp
          filename: 'GWStrainVsTimePlot',
          height: 500,
          width: 1754,
          scale: 2 // Multiply title/legend/axis/canvas sizes by this factor
        },
        modeBarButtonsToRemove: ['autoScale2d','toggleSpikelines','hoverClosestCartesian','hoverCompareCartesian']
    };

    let data0 = [trace0];

    Plotly.newPlot('strainVsTimePlot', data0, layout0, config0);
    
    // ----------------------- Frequency vs. Time Plot ---------------------- //
    let layout1 = {
        title: {text: 'Frequency vs. Time', font: {family: 'Times New Roman', size: 32, color: 'white'}},
        xaxis: {
            title: {text: 'Time (sec)', font: {family: 'Times New Roman', size: 26, color: 'white'}},
            color: 'white',
            showgrid: false,
            ticks: 'outside',
            tickfont: {family: 'Times New Roman', size: 18,color: 'white'},
        },
        yaxis: {
            title: {text: 'Frequency', font: {family: 'Times New Roman', size: 26, color: 'white'}},
            color: 'white',
            showgrid: false,
            ticks: 'outside',
            tickfont: {family: 'Times New Roman', size: 18,color: 'white'},
        },
        margin: {l: 100, r: 50, b: 60, t: 75, pad: 4},
        plot_bgcolor: 'white', //"#383838",
        paper_bgcolor: "#181818"
    }

    let trace1 = {
        x: t,
        y: fFiltered,
        type: 'scatter',
        line: {
            color: '#282828', //'white',
            width: 3
          }
    };

    var config1 = {
        toImageButtonOptions: {
          format: 'png', // one of png, svg, jpeg, webp
          filename: 'GWFrequencyVsTimePlot',
          height: 500,
          width: 1754,
          scale: 2 // Multiply title/legend/axis/canvas sizes by this factor
        },
        modeBarButtonsToRemove: ['autoScale2d','toggleSpikelines','hoverClosestCartesian','hoverCompareCartesian']
    };

    let data1 = [trace1];
    Plotly.newPlot('frequencyVsTimePlot', data1, layout1, config1, {modeBarButtonsToRemove: ['autoScale2d','toggleSpikelines','hoverClosestCartesian','hoverCompareCartesian']});
    
    // ----------------------------- Audio ----------------------------- //
    document.getElementById("startAudioBtn").onclick = function() {playAudio()};

    // Citation: https://darthvanger.medium.com/synthesize-sound-with-javascript-sine-wave-940f9cd7dae2
    const sampleRate = 1/deltat;

    function startAudio({ array, sampleRate }) {
        // We have to start with creating AudioContext
        const audioContext = new AudioContext({sampleRate});
        // create audio buffer of the same length as our array
        const audioBuffer = audioContext.createBuffer(1, array.length, sampleRate);
        // this copies our sine wave to the audio buffer
        audioBuffer.copyToChannel(array, 0);
        // some JavaScript magic to actually play the sound
        const source = audioContext.createBufferSource();
        source.connect(audioContext.destination);
        source.buffer = audioBuffer;
        source.start();
        }

    function playAudio() {
        startAudio({ array: hFiltered, sampleRate });
    }

} // ----------------------- End of Update Function ---------------------- //

// ----------------------------- UI Elements ----------------------------- //
const alphaSlider = document.getElementById("alphaSlider");
const m1slider = document.getElementById("m1slider");
const m2slider = document.getElementById("m2slider");
const selectDevice = document.getElementById("selectDevice");

let alpha = Number(alphaSlider.value),
    m1sliderval = Number(m1slider.value),
    m2sliderval = Number(m2slider.value),
    deviceSelection = new String("Laptop");

console.log({ alpha }, { m1sliderval }, { m2sliderval });

// ----------------------------- Update Slider Values ----------------------------- //
alphaSlider.addEventListener('change', function (event) {
    alpha = Number(alphaSlider.value);
    printVars();
    //waveSound.stop(); //does not work because waveSound is in function
    updateFunction(alpha, m1sliderval, m2sliderval, deviceSelection);
})

m1slider.addEventListener('change', function (event) {
    m1sliderval = Number(m1slider.value);
    printVars();
    updateFunction(alpha, m1sliderval, m2sliderval, deviceSelection);
})

m2slider.addEventListener('change', function (event) {
    m2sliderval = Number(m2slider.value);
    printVars();
    updateFunction(alpha, m1sliderval, m2sliderval, deviceSelection);
})

selectDevice.addEventListener('change', function (event) {
    deviceSelection = Number(m2slider.value);
    printVars();
    updateFunction(alpha, m1sliderval, m2sliderval, deviceSelection);
})

// --------------------------- Side Bar Functionality --------------------------- //
function openNav() {
    document.getElementById("mySidebar").style.width = "200px";
    document.getElementById("main").style.marginLeft = "200px";
  }
  
  function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
  }
// --------------------------- Toggle Plots --------------------------- //
//Citation: https://www.w3schools.com/howto/howto_js_toggle_hide_show.asp
function toggleStrainVsTimePlot() {
    var x = document.getElementById("strainVsTimePlot");
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  }

function toggleFrequencyVsTimePlot() {
    var x = document.getElementById("frequencyVsTimePlot");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
// ------------------ Execute update Function for initial time ------------------ //
updateFunction(alpha, m1sliderval, m2sliderval, deviceSelection);

/* 
Things that need to be added or updated:
- Fix NaN problem
- Stop sound when sliders are changed
- Stop sound when button is pressed again
- Put box around plots with tick marks?
- Pick deltat more carefully (based on sliders)
- Change masses 1-100 solar masses
- Separate images?
- Check mobile view

Other: 
- Look at Ghosh Python code
- GW assignments and readings

Things that have been fixed:
- Plot download size, resolution, and file name
- Completely new sound programming
- Changed plot colors (may need tweaking) [maybe add drop down menu for dark/light mode?]
*/
