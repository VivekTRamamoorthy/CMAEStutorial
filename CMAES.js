// Vivek T R 2021 November
// Dependencies: Matlab.js, math.js
// Code converted from purecmaes.m MATLAB code by Nikolas Hansen
// insert github link for cma-es here

// CMAES script

var objfunc=function(x){ return x[0][0]**2 + x[1][0]**2;}
var xinit= [[1],[1]]

// --------------------  Initialization --------------------------------  
// User defined input parameters (need to be edited)  
var N = 2;               // number of objective variables/problem dimension
var xmean = [[1],[1]];// rand(N,1);//[...Array(N)].map(_=>Math.random()); // objective variables initial point
var sigma = 0.3;          // coordinate wise standard deviation (step size)
var stopfitness = 1e-10;  // stop if fitness < stopfitness (minimization)
var stopeval = 120; // 1e3*N^2; 

// Strategy parameter setting: Selection  
var lambda = 20// 4+Math.floor(3*Math.log(N)); // population size, offspring number
var mu = Math.floor(lambda/2);  // number of parents/points for recombination
var weights = [...Array(mu)].map((_elem,index)=>Math.log(mu+0.5)-Math.log(index+1));
weights=transpose(weights); //  weights = Math.log(mu+1/2)-Math.log(1:mu)'; % muXone array for weighted recombination
var sum_weights = sum(weights);
weights = div(weights,sum_weights);   // normalize recombination weights array
var mueff = 1/( weights.map(elem=>elem*elem).reduce((a, b) => a + b, 0)); // variance-effectiveness of sum w_i x_i


// Strategy parameter setting: Adaptation
var cc = (4 + mueff/N) / (N+4 + 2*mueff/N); // time constant for cumulation for C
var cs = (mueff+2) / (N+mueff+5);  // t-const for cumulation for sigma control
var c1 = 2 / (Math.pow(N+1.3,2)+mueff);    // learning rate for rank-one update of C
var cmu = Math.min(1-c1, 2 * (mueff-2+1/mueff) / (Math.pow(N+2,2)+mueff));  // and for rank-mu update
var damps = 1 + 2*Math.max(0, Math.sqrt((mueff-1)/(N+1))-1) + cs; // damping for sigma usually close to 1


// Initialize dynamic (internal) strategy parameters and constants
var pc =  zeros(N,1);
var ps =  zeros(N,1);                 // evolution paths for C and sigma
var B = eye(N,N);                     // B defines the coordinate system
var D = ones(N,1);                    // diagonal D defines the scaling
var C = eye(N,N);                     // covariance matrix C (simplification here)
var invsqrtC =   mul(mul(B,diag(pow(D,-1))), transpose(B))   // C^-1/2  (simplification here) 
var eigeneval = 0;                    // track update of B and D
var chiN = Math.pow(N,0.5)*(1-1/(4*N)+1/(21*N*N));  // expectation of  ||N(0,I)|| == norm(randn(N,1))


var  counteval = 0;
var arx=zeros(N,lambda);
var arfitness=zeros(1,lambda);
var g=0;
var fmin;


// -------------------- Generation Loop --------------------------------

function CMAESgeneration(){
  g++;
  // base plot
  c.clearRect(0,0,canvas.width,canvas.height)
  drawAxes()
  drawContours()
  
  // Sampling points
  for (let k=0; k<lambda;k++) {
    var arxk = (add(xmean, mul(sigma,mul(B,dotmul(D,randn(N,1))))));
    [arx[0][k],arx[1][k]] = [arxk[0][0], arxk[1][0]] ; 
    arfitness[k] = objfunc(arxk);
    counteval++;
    
    // plotting points
    drawPoint(xtoPx(arx[0][k]),ytoPx(arx[1][k]))
  }
  
  
  // % Sort by fitness 
  var arindex;
  var sortedarfitness=[...arfitness];
  [sortedarfitness, arindex]  = sort(sortedarfitness);
  
  // compute weighted mean into xmean
  xold=copy(xmean);
  xmean = mul(get(arx,':',get(arindex,range(1,mu))),weights)
  
  // % Cumulation: Update evolution paths
  ps=add( mul((1-cs),ps) , 
  mul(mul(sqrt(cs*(2-cs)*mueff) , invsqrtC), mul(sub(xmean,xold),1/sigma) ) )
  
  hsig = norm(ps)/sqrt(1-(1-cs)**(2*counteval/lambda))/chiN < 1.4 + 2/(N+1);
  
  pc= add(mul(1-cc,pc),
  mul(hsig* sqrt(cc*(2-cc)*mueff)/sigma, sub(xmean, xold)));
  
  // % Adapt covariance matrix C
  artmp= mul(1/sigma, sub(get(arx,':',get(arindex,range(1,mu))), repmat(xold,1,mu)  ))
  let part1 = mul(1-c1-cmu,C)
  let part2 = mul(c1, add( mul(pc,transpose(pc)),   mul((1-hsig)*cc*(2-cc),C) ) )
  let part3 = mul(mul(mul(artmp,diag(weights)),transpose(artmp)),cmu)
  C = add(add(part1,part2),part3);
  
  // % Adapt step size sigma
  sigma = sigma * Math.exp((cs/damps)*(norm(ps)/chiN - 1)); 
  
  // % Decomposition of C into B*diag(D.^2)*B' (diagonalization)
  if(counteval-eigeneval > lambda/(c1+cmu)/N/10){
    eigeneval = counteval;
    C=add( triu(C) , transpose(triu(C,1)));
    let temp=math.eigs(C);
    B=transpose(temp.vectors);
    D=transpose(temp.values);
    D=sqrt((D));
    invsqrtC = mul(mul(B,diag(pow(D,-1))), transpose(B)) 
  }
  
  //update best
  xmin=get(arx,':', arindex[0]);
  fmin=min(arfitness);
  // Notice that xmean is expected to be even better.
  
  // display values
  updateValuesToScreen();
  
}

function updateValuesToScreen(){
  document.getElementById("x1").innerText=(Math.round(xmin[0][0]*1e7)/1e7).toExponential(6);
  document.getElementById("x2").innerText=(Math.round(xmin[1][0]*1e7)/1e7).toExponential(6);
  document.getElementById("fmin").innerText=fmin.toExponential(6);
  document.getElementById("g").innerText=g;
}

var isRunning=0;
function CMAESrunToggle(){
  if(isRunning==0){
    isRunning=1;
    window.requestAnimationFrame(CMAESupdateLoop);
    document.getElementById("runToggleButton").innerText="Stop";
  }
  else{
    isRunning=0;
    document.getElementById("runToggleButton").innerText="Keep running";
  }
  
  
}

function CMAESupdateLoop(){
  if(isRunning==1){
    CMAESgeneration();
    window.requestAnimationFrame(CMAESupdateLoop);
  }else{
    return
  }
  
  
}


function reset(){
  g=0;
  // base plot
  c.clearRect(0,0,canvas.width,canvas.height)
  drawAxes()
  drawContours()
  
  isRunning=0;
  document.getElementById("runToggleButton").innerText="Keep running";
  updateValuesToScreen();
  clc();
  
  
  // --------------------  Initialization --------------------------------  
  // User defined input parameters (need to be edited)  
  N = 2;               // number of objective variables/problem dimension
  xmean = [[1],[1]]; //rand(N,1);//[...Array(N)].map(_=>Math.random()); // objective variables initial point
  sigma = 0.3;          // coordinate wise standard deviation (step size)
  stopfitness = 1e-10;  // stop if fitness < stopfitness (minimization)
  stopeval = 120; // 1e3*N^2; 
  
  // Strategy parameter setting: Selection  
  lambda = 20// 4+Math.floor(3*Math.log(N)); // population size, offspring number
  mu = Math.floor(lambda/2);  // number of parents/points for recombination
  weights = [...Array(mu)].map((_elem,index)=>Math.log(mu+0.5)-Math.log(index+1));
  weights=transpose(weights); //  weights = Math.log(mu+1/2)-Math.log(1:mu)'; % muXone array for weighted recombination
  sum_weights = sum(weights);
  weights = div(weights,sum_weights);   // normalize recombination weights array
  mueff = 1/( weights.map(elem=>elem*elem).reduce((a, b) => a + b, 0)); // variance-effectiveness of sum w_i x_i
  
  
  // Strategy parameter setting: Adaptation
  cc = (4 + mueff/N) / (N+4 + 2*mueff/N); // time constant for cumulation for C
  cs = (mueff+2) / (N+mueff+5);  // t-const for cumulation for sigma control
  c1 = 2 / (Math.pow(N+1.3,2)+mueff);    // learning rate for rank-one update of C
  cmu = Math.min(1-c1, 2 * (mueff-2+1/mueff) / (Math.pow(N+2,2)+mueff));  // and for rank-mu update
  damps = 1 + 2*Math.max(0, Math.sqrt((mueff-1)/(N+1))-1) + cs; // damping for sigma usually close to 1
  
  
  // Initialize dynamic (internal) strategy parameters and constants
  pc =  zeros(N,1);
  ps =  zeros(N,1);                 // evolution paths for C and sigma
  B = eye(N,N);                     // B defines the coordinate system
  D = ones(N,1);                    // diagonal D defines the scaling
  C = eye(N,N);                     // covariance matrix C (simplification here)
  invsqrtC =   mul(mul(B,diag(pow(D,-1))), transpose(B))   // C^-1/2  (simplification here) 
  eigeneval = 0;                    // track update of B and D
  chiN = Math.pow(N,0.5)*(1-1/(4*N)+1/(21*N*N));  // expectation of  ||N(0,I)|| == norm(randn(N,1))
  
  
  
  counteval = 0;
  arx=zeros(N,lambda);
  arfitness=zeros(1,lambda);
  g=0;
  fmin=NaN;
  xmin=xmean;
  
  updateValuesToScreen();
  
}
