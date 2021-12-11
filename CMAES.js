// Vivek T R 2021 November
// Dependencies: Matlab.js
// Code converted from purecmaes.m MATLAB code by Nikolas Hansen



function CMAES(){
  var objfunc=function(x){ return sum([...x].map(elem=>elem**2));}
  var xinit= [[1],[1]]
  // % --------------------  Initialization --------------------------------  
  //   % User defined input parameters (need to be edited)
  //   strfitnessfct = 'frosenbrock';  % name of objective/fitness function
  //   N = 2;               % number of objective variables/problem dimension
  //   xmean = rand(N,1);    % objective variables initial point
  //   sigma = 0.3;          % coordinate wise standard deviation (step size)
  //   stopfitness = 1e-10;  % stop if fitness < stopfitness (minimization)
  //   stopeval = 1e3*N^2;   % stop after stopeval number of function evaluations
  
  
  // --------------------  Initialization --------------------------------  
  // User defined input parameters (need to be edited)  
  var N = 2;               // number of objective variables/problem dimension
  var xmean = rand(N,1);//[...Array(N)].map(_=>Math.random()); // objective variables initial point
  var sigma = 0.3;          // coordinate wise standard deviation (step size)
  var stopfitness = 1e-10;  // stop if fitness < stopfitness (minimization)
  var stopeval = 120; // 1e3*N^2; 
  
  // % Strategy parameter setting: Selection  
  // lambda = 4+floor(3*log(N));  % population size, offspring number
  // mu = lambda/2;               % number of parents/points for recombination
  // weights = log(mu+1/2)-log(1:mu)'; % muXone array for weighted recombination
  // mu = floor(mu);        
  // weights = weights/sum(weights);     % normalize recombination weights array
  // mueff=sum(weights)^2/sum(weights.^2); % variance-effectiveness of sum w_i x_i
  
  
  // Strategy parameter setting: Selection  
  var lambda = 4+Math.floor(3*Math.log(N)); // population size, offspring number
  var mu = Math.floor(lambda/2);  // number of parents/points for recombination
  var weights = [...Array(mu)].map((_elem,index)=>Math.log(mu+0.5)-Math.log(index+1));
  weights=transpose(weights);
  //  weights = Math.log(mu+1/2)-Math.log(1:mu)'; % muXone array for weighted recombination
  var sum_weights = sum(weights)
  weights = div(weights,sum_weights);   // normalize recombination weights array
  var mueff = 1/( weights.map(elem=>elem*elem).reduce((a, b) => a + b, 0)); // variance-effectiveness of sum w_i x_i
  //  mueff=sum(weights)^2/sum(weights.^2); 
  
  // % Strategy parameter setting: Adaptation
  // cc = (4+mueff/N) / (N+4 + 2*mueff/N);  % time constant for cumulation for C
  // cs = (mueff+2) / (N+mueff+5);  % t-const for cumulation for sigma control
  // c1 = 2 / ((N+1.3)^2+mueff);    % learning rate for rank-one update of C
  // cmu = min(1-c1, 2 * (mueff-2+1/mueff) / ((N+2)^2+mueff));  % and for rank-mu update
  // damps = 1 + 2*max(0, sqrt((mueff-1)/(N+1))-1) + cs; % damping for sigma 
  
  
  // Strategy parameter setting: Adaptation
  var cc = (4 + mueff/N) / (N+4 + 2*mueff/N); // time constant for cumulation for C
  var cs = (mueff+2) / (N+mueff+5);  // t-const for cumulation for sigma control
  var c1 = 2 / (Math.pow(N+1.3,2)+mueff);    // learning rate for rank-one update of C
  var cmu = Math.min(1-c1, 2 * (mueff-2+1/mueff) / (Math.pow(N+2,2)+mueff));  // and for rank-mu update
  var damps = 1 + 2*Math.max(0, Math.sqrt((mueff-1)/(N+1))-1) + cs; // damping for sigma usually close to 1
  
  // % Initialize dynamic (internal) strategy parameters and constants
  // pc = zeros(N,1); ps = zeros(N,1);   % evolution paths for C and sigma
  // B = eye(N,N);                       % B defines the coordinate system
  // D = ones(N,1);                      % diagonal D defines the scaling
  // C = B * diag(D.^2) * B';            % covariance matrix C
  // invsqrtC = B * diag(D.^-1) * B';    % C^-1/2 
  // eigeneval = 0;                      % track update of B and D
  // chiN=N^0.5*(1-1/(4*N)+1/(21*N^2));  % expectation of 
  
  // Initialize dynamic (internal) strategy parameters and constants
  var pc =  zeros(N,1);
  var ps =  zeros(N,1);  // evolution paths for C and sigma
  var B = eye(N,N);                    // B defines the coordinate system
  var D = ones(N,1);               // diagonal D defines the scaling
  var C = eye(N,N);                // covariance matrix C (simplification here)
  var invsqrtC =   mul(mul(B,diag(pow(D,-1))), transpose(B))    //eye(N,N);    // C^-1/2  (simplification here) 
  var eigeneval = 0;                // track update of B and D
  var chiN = Math.pow(N,0.5)*(1-1/(4*N)+1/(21*N*N));  // expectation of  ||N(0,I)|| == norm(randn(N,1))
  
  
  console.log('Generation Loop');
  // -------------------- Generation Loop --------------------------------
  var  counteval = 0;
  
  var arx=zeros(N,lambda);
  var arfitness=zeros(1,lambda);
  
  for (let g=0;g< Math.round(stopeval/lambda); g++ ) {
    console.log("Generation:"+g)
    for (let k=0; k<lambda;k++) {
      //arx(:,k) = xmean + sigma * B * (D .* randn(N,1)); // m + sig * Normal(0,C) 
      var arxk = (add(xmean, mul(sigma,mul(B,dotmul(D,randn(N,1))))));
      
      // for (let i = 0; i < tmp.length; i++) {
      [arx[0][k],arx[1][k]] = [arxk[0][0], arxk[1][0]] ; 
      // arx[k]=arxk;
      // } 
      //arfitness(k) = feval(strfitnessfct, arx(:,k)); // objective function call
      arfitness[k] = objfunc(arxk);
      counteval++;
    }
    
    
    // % Sort by fitness 
    // [arfitness, arindex] = sort(arfitness); % minimization
    var arindex;
    var sortedarfitness=[...arfitness];
    [sortedarfitness, arindex]  = sort(sortedarfitness);
    
    // compute weighted mean into xmean
    xold=copy(xmean);
    // xmean = arx(:,arindex(1:mu))*weights;   % recombination, new mean value
    
    xmean = mul(get(arx,':',get(arindex,range(1,mu))),weights)
    // % Cumulation: Update evolution paths
    // ps = (1-cs)*ps ... 
    //       + sqrt(cs*(2-cs)*mueff) * invsqrtC * (xmean-xold) / sigma; 
    ps=add( mul((1-cs),ps) , 
    mul(mul(sqrt(cs*(2-cs)*mueff) , invsqrtC), mul(sub(xmean,xold),1/sigma) ) )
    
    
    // hsig = norm(ps)/sqrt(1-(1-cs)^(2*counteval/lambda))/chiN < 1.4 + 2/(N+1);
    hsig = norm(ps)/sqrt(1-(1-cs)**(2*counteval/lambda))/chiN < 1.4 + 2/(N+1);
    
    // pc = (1-cc)*pc ...
    //       + hsig * sqrt(cc*(2-cc)*mueff) * (xmean-xold) / sigma;
    pc= add(mul(1-cc,pc),
    mul(hsig* sqrt(cc*(2-cc)*mueff)/sigma, sub(xmean, xold)));
    
    // % Adapt covariance matrix C
    // artmp = (1/sigma) * (arx(:,arindex(1:mu))-repmat(xold,1,mu));
    artmp= mul(1/sigma, sub(get(arx,':',get(arindex,range(1,mu))), repmat(xold,1,mu)  ))
    // C = (1-c1-cmu) * C ...                  % regard old matrix  
    //      + c1 * (pc*pc' ...                 % plus rank one update
    //              + (1-hsig) * cc*(2-cc) * C) ... % minor correction if hsig==0
    //      + cmu * artmp * diag(weights) * artmp'; % plus rank mu update
    let part1 = mul(1-c1-cmu,C)
    let part2 = mul(c1, add( mul(pc,transpose(pc)),   mul((1-hsig)*cc*(2-cc),C) ) )
    let part3 = mul(mul(mul(artmp,diag(weights)),transpose(artmp)),cmu)
    
    C = add(add(part1,part2),part3);
    
    // % Adapt step size sigma
    // sigma = sigma * exp((cs/damps)*(norm(ps)/chiN - 1)); 
    sigma = sigma * Math.exp((cs/damps)*(norm(ps)/chiN - 1)); 
    
    // % Decomposition of C into B*diag(D.^2)*B' (diagonalization)
    // if counteval - eigeneval > lambda/(c1+cmu)/N/10  % to achieve O(N^2)
    //     eigeneval = counteval;
    //     C = triu(C) + triu(C,1)'; % enforce symmetry
    //     [B,D] = eig(C);           % eigen decomposition, B==normalized eigenvectors
    //     D = sqrt(diag(D));        % D is a vector of standard deviations now
    //     invsqrtC = B * diag(D.^-1) * B';
    // end
    
    
    if(counteval-eigeneval > lambda/(c1+cmu)/N/10){
      eigeneval = counteval;
      C=add( triu(C) , transpose(triu(C,1)));
      let temp=math.eigs(C);
      B=transpose(temp.vectors);
      D=transpose(temp.values);
      // D=sqrt(diag(D));
      D=sqrt((D));
      invsqrtC = mul(mul(B,diag(pow(D,-1))), transpose(B)) 
    }
    
    // % Break, if fitness is good enough or condition exceeds 1e14, better termination methods are advisable 
    // if arfitness(1) <= stopfitness || max(D) > 1e7 * min(D)
    //     break;
    // end
    
    if(sortedarfitness[0]<= stopfitness || max(D) > 1e7* min(D)){
      break;
    }
    
    // end % while, end generation loop
    
    // xmin = arx(:, arindex(1)); % Return best point of last iteration.
    //                        % Notice that xmean is expected to be even
    //                        % better.
    // % ---------------------------------------------------------------  
    
    xmin=get(arx,':', arindex[0]);
    // console.log("xmin:")
    // disp(xmin)
    
    
    // end   
    
    
  } // end of for loop
  
  console.log("Final solution:")
  disp(xmin)
  console.log("Fitness:")
  disp(objfunc(xmin))
  
}