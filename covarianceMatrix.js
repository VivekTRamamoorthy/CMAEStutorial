var covarianceMatrixDemoState={
    mu1:0,
    mu2:0,
    C11:1,
    C12:0,
    C21:0,
    C22:1,
    N:20,
}


window.addEventListener('DOMContentLoaded',()=>{

getSliderValues()


})

function getSliderValues(chooseC21 = false){
    let mu1 = document.getElementById('mu1');
    let mu2 = document.getElementById('mu2');
    let C11 = document.getElementById('C11'); // variance
    let C12 = document.getElementById('C12'); // correlation
    let C21 = document.getElementById('C21'); // correlation
    let C22 = document.getElementById('C22'); // variance
    let N = document.getElementById('N');

    covarianceMatrixDemoState.mu1 = parseFloat(mu1.value);
    covarianceMatrixDemoState.mu2 = parseFloat(mu2.value);
    covarianceMatrixDemoState.C11 = parseFloat(C11.value);
    covarianceMatrixDemoState.C12 = chooseC21? parseFloat(C21.value): parseFloat(C12.value) ;
    covarianceMatrixDemoState.C21 = chooseC21? parseFloat(C21.value): parseFloat(C12.value) ;
    covarianceMatrixDemoState.C22 = parseFloat(C22.value);
    covarianceMatrixDemoState.N = parseInt(N.value);
    if (chooseC21){
        C12.value = C21.value;
    }else{
        C21.value = C12.value;
    }
    let covarianceUpperLimit = Math.sqrt(C11.value*C22.value);

    mu1.labels[0].innerText = "= "+covarianceMatrixDemoState.mu1.toPrecision(2);
    mu2.labels[0].innerText = "= "+covarianceMatrixDemoState.mu2.toPrecision(2);
    C11.labels[0].innerText = "= "+covarianceMatrixDemoState.C11.toPrecision(2);
    C12.labels[0].innerText = "= "+(covarianceMatrixDemoState.C12*covarianceUpperLimit).toPrecision(2);
    C21.labels[0].innerText = "= "+(covarianceMatrixDemoState.C21*covarianceUpperLimit).toPrecision(2);
    C22.labels[0].innerText = "= "+covarianceMatrixDemoState.C22.toPrecision(2);
    N.labels[0].innerText = "= "+covarianceMatrixDemoState.N;
    updateCovarianceMatrixPlot(covarianceMatrixDemoState)
}




function updateCovarianceMatrixPlot(state){
    // get canvas
    let canvas = document.getElementById('covariance');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height)

    // update stroke settings
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    // update font settings
    let body = document.querySelector('body')
    let fontSize = parseInt(window.getComputedStyle(body).getPropertyValue("font-size").slice(0,-2)); // canvas.height/50;
    ctx.font = fontSize+'px Verdana';
    ctx.textAlign = 'center';
    
    // x axis
    ctx.moveTo(0,canvas.height/2);
    ctx.lineTo(canvas.width,canvas.height/2);
    ctx.stroke();

    // y axis
        ctx.moveTo(canvas.width/2,0);
    ctx.lineTo(canvas.width/2,canvas.height);
    ctx.stroke();

    // lim
    let xlim = [-11,11];
    let ylim = [-11,11];
    // scales 
    let xToPx = x=> canvas.width*(x-xlim[0])/(xlim[1]-xlim[0])
    let yToPx = y=> canvas.height*(1-(y-ylim[0])/(ylim[1]-ylim[0]))


    // ticks
    let xticks = [-10,-5,5,10];
    let yticks = [-10,-5,5,10];
    xticks.forEach( x=>{
        ctx.fillText(x.toString(), xToPx(x),yToPx(0)+1.2*fontSize);
        ctx.moveTo(xToPx(x),yToPx(0)-0.25*fontSize)
        ctx.lineTo(xToPx(x),yToPx(0)+0.25*fontSize)
        ctx.stroke()

    })
    yticks.forEach( y=>{
        ctx.fillText(y.toString(), xToPx(0)-1.2*fontSize,yToPx(y)+0.25*fontSize);
        ctx.moveTo(xToPx(0)+.25*fontSize,yToPx(y))
        ctx.lineTo(xToPx(0)-.25*fontSize,yToPx(y))
        ctx.stroke()

    })

    // generating sample points
    let N = state.N;
    let covarianceUpperLimit = Math.sqrt(state.C11*state.C22);
    let C = [[state.C11, state.C12*covarianceUpperLimit ],[state.C12*covarianceUpperLimit,state.C22]];
    let xmean = [[state.mu1],[state.mu2]];
    // decomposing C
    let temp=math.eigs(C);
    let B=transpose(temp.vectors);
    let D=transpose(temp.values);
    D=sqrt((D));
    
    
    
    // draw Circle
    let drawCircle = function(cx,cy,r){
        ctx.beginPath()
        ctx.moveTo(cx+r,cy)
        for (let theta = 0; theta <= Math.PI*2; theta=theta+0.01*Math.PI) {
            ctx.lineTo(cx+r*Math.cos(theta), cy+r*Math.sin(theta));
        }
        ctx.stroke();
    }
    // draw Arrow
    let drawArrow= function(cx,cy,direction,arrowLength = 30,arrowHead = 4){
        let r = Math.sqrt(direction[0][0]**2 + direction[1][0]**2);
        let theta = Math.arctan(direction[1][0]/direction[0][0])
        ctx.beginPath()
        ctx.moveTo(cx,cy)
        ctx.lineTo(cx+direction[0][0]/r*arrowLength, cy+direction[1][0]/r*arrowLength);
        ctx.stroke();

        ctx.beginPath()
        ctx.moveTo(cx+direction[0][0], cy+direction[1][0]);
        ctx.lineTo(cx+direction[0][0]*(r-4)/r, cy+direction[1][0]*(r-4)/r);


    }
   

    
    // Draw sampled points
    ctx.fillStyle="blue" ;
    ctx.strokeStyle= "blue";//"rgb(200,200,200)"; // from color value
    for (let i = 0; i < N; i++) {
        // sampling one point OLD method
        // let xsampled = (add(xmean, mul(sigma,mul(B,dotmul(D,randn(2,1))))));
        // console.log(''+xsampled[0][0]+ ' '+xsampled[1][0]);

        // sampling using https://stats.stackexchange.com/questions/120179/generating-data-with-a-given-sample-covariance-matrix
        let cholC = chol(C);
        let xsampled;
        if(cholC === -1){
            xsampled = [[state.mu1],[state.mu2]]; // fallback for cholesky failed
        }
        else{
            disp(cholC);
            disp(mul(cholC,transpose(cholC)));
            disp(C)
            let xsampledT = mul(randn(1,2), cholC);
            xsampled = [[state.mu1+xsampledT[0][0]],[state.mu2+xsampledT[0][1]]];
        }
        
        // draw points
        let cx = xToPx(xsampled[0][0])
        let cy = yToPx(xsampled[1][0])
        let r=4;
        ctx.beginPath()
        ctx.moveTo(cx+r,cy)
        for (let theta = 0; theta <= Math.PI*2; theta=theta+0.01*Math.PI) {
            ctx.lineTo(cx+r*Math.cos(theta), cy+r*Math.sin(theta));
        }
        ctx.stroke();



    }

     // Draw the mean
     ctx.fillStyle="red" ;
     ctx.strokeStyle= "red";//"rgb(200,200,200)"; // from color value
     drawCircle(xToPx(xmean[0][0]),yToPx(xmean[1][0]),4)



}