//function message() {
//  window.alert("Headphones are recommended for the best user experience.
//Cellphone and laptop may not be able to produce frequencies near or below 90 Hz.");
//}
//message();

//defining variables
const Msun = 0.00000492686088; //mass of the sun using geometric units to get f in Hz
let alpha = 0.1,
    m1slider = 1.0,
    m2slider = 1.4;

let A = 3.2, //change later to exact calculation
    deltat = 0.0001,
    tmax = 3,
    N = tmax / deltat,
    t = new Array(N).fill(0), //probably can define with time steps instead of defining with zeros
    f = new Array(N).fill(0), //change this out for faster method? f = new Array(N); for (let i=0; i<n; ++i a[i]=0;
    h = new Array(N).fill(0),
    v = new Array(N).fill(0),
    phi = new Array(N).fill(0);

t[0] = 0;
for (let i = 1; i < N; i++) {
    t[i] = t[i-1] + deltat;
}

//these need to be changed to work with sliders
let m1 = m1slider*Msun,
    m2 = m2slider*Msun,
    M = (m1+m2);

//initial conditions:
f[0] = 90;
//v[0] = (Math.PI*M*f[0])**(1/3);
v[0] = Math.pow(Math.PI*M*f[0],1/3);

console.log(f[0], v[0]);

let eta = (m1*m2)/(M*M), //reduced mass ratio, varies from 0 to 0.25
    phic = 0,
    //tc = t[0]+(5/256)*(M/(eta*v[0]**8));
    tc = t[0]+(5/256)*(M/(eta*Math.pow(v[0],8)));

for (let n = 0; n < N; n++) { //commented code is previous Python
    //v[n] = ((256/5)*(eta/M)*(tc-t[n]))**(-1/8); //Solution to dv/dt = 32/5 (eta/M) v^9
    v[n] = Math.pow((256/5)*(eta/M)*(tc-t[n]),-1/8);
    //phi[n] = phic-(1/5)*(5/eta)**(3/8)*((tc-t[n])/M)**(5/8); //Solution to dphi/dt = v^3/M
    phi[n] = phic-(1/5)*Math.pow(5/eta,3/8)*Math.pow((tc-t[n])/M,5/8); //Solution to dphi/dt = v^3/M
    //h[n] = A*((v[n]**2)*math.sin(2*phi[n])+alpha*(v[n]**3)*math.sin(3*phi[n]))
    h[n] = A*((Math.pow(v[n],2))*Math.sin(2*phi[n])+alpha*(Math.pow(v[n],3)*Math.sin(3*phi[n])));
    //f[n] = v[n]**3/(Math.pi*M)
    f[n] = Math.pow(v[n],3)/(Math.PI*M);
}
console.log(t, v ,phi ,h ,f);

let trace0 = {
    x: t,
    y: h,
    type: 'scatter'
};

let data0 = [trace0];

Plotly.newPlot('myDiv0',data0);

let trace1 = {
    x: t,
    y: f,
    type: 'scatter'
};

let data1 = [trace1];
Plotly.newPlot('myDiv1',data1);


// Slider functions
//function render() {
//    let val = document.getElementByID('alphaSlider').value
    //document.getElementById('curValue').innerHTML = val
//}

//document.getElementById('waveFormBtn').addEventListener('click',render)