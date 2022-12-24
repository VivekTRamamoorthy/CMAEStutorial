
var canvas=document.getElementById("canvas");

var c=canvas.getContext("2d");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

window.addEventListener("resize",function(){
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
})

// PLOTTING 
let paddingX=60;
let paddingY=60;
let xlim=[-1,1];
let ylim=[-1,1];
let xspan=xlim[1]-xlim[0];
let yspan=ylim[1]-ylim[0];

function xtoPx(xvalue){
    return (xvalue - xlim[0])/(xlim[1]-xlim[0])*(canvas.width-2*paddingY)+paddingY;
}

function ytoPx(yvalue){
    return canvas.height -((yvalue - ylim[0])/(ylim[1]-ylim[0])*(canvas.height-2*paddingX)+paddingX);
}

function drawAxes(){
    // Draws the axes
    let body = document.querySelector('body')
    let fontSizePx=parseInt(window.getComputedStyle(body).getPropertyValue("font-size").slice(0,-2)); // canvas.height/50;
    c.font = fontSizePx+ 'px Verdana';
    c.fillStyle='#000000' ;
    c.textAlign='center';
    
    c.strokeStyle = '#333';
    c.lineWidth = 3;
    
    // box
    c.beginPath();
    c.moveTo(xtoPx(xlim[0]),ytoPx(ylim[0]));
    c.lineTo(xtoPx(xlim[1]),ytoPx(ylim[0]));
    c.lineTo(xtoPx(xlim[1]),ytoPx(ylim[1]));
    c.lineTo(xtoPx(xlim[0]),ytoPx(ylim[1]));
    c.lineTo(xtoPx(xlim[0]),ytoPx(ylim[0]));
    c.stroke();
    
    
    //x and y axis
    c.beginPath()
    //x axis
    c.moveTo(xtoPx(xlim[0]),ytoPx(0));
    c.lineTo(xtoPx(xlim[1]),ytoPx(0));
    //y axis
    c.moveTo(xtoPx(0),ytoPx(ylim[0]));
    c.lineTo(xtoPx(0),ytoPx(ylim[1]));
    c.strokeStyle = '#333';
    c.lineWidth = 1;
    c.stroke();
    
    
    // x Ticks
    let xTicks=range(xlim[0],xspan/5,xlim[1])
    for (let i = 0; i < xTicks.length; i++) {
        xvalue = Math.round((xTicks[i])*100)/100;
        c.moveTo( xtoPx(xvalue),ytoPx(ylim[0]+.01*yspan )) ;
        c.lineTo( xtoPx(xvalue),ytoPx(ylim[0]-.01*yspan ) );
        c.fillText(xvalue.toString(), xtoPx(xvalue),ytoPx(ylim[0]-.01*yspan)+fontSizePx );
        
    }
    c.stroke();
    // x label
    let xCenter = (xlim[0]+xlim[1])/2;
    c.fillText('x_1', xtoPx(xCenter),ytoPx(ylim[0]-.07*yspan)+fontSizePx );
    
    // y Ticks
    let yTicks=range(ylim[0],yspan/5,ylim[1])
    for (let i = 0; i < xTicks.length; i++) {
        yvalue = Math.round((xTicks[i])*100)/100;
        c.moveTo( xtoPx(xlim[0]-.01*yspan),ytoPx( yvalue)) ;
        c.lineTo( xtoPx(xlim[0]+.01*yspan),ytoPx( yvalue) );
        c.fillText(yvalue.toString(), xtoPx(xlim[0]-.01*xspan)-fontSizePx, ytoPx(yvalue),);
        
    }
    c.stroke();
    // y lable
    let yCenter = (ylim[0]+ylim[1])/2;
    c.fillText('x_2', xtoPx(xlim[0]-.05*xspan)-fontSizePx, ytoPx(yCenter),);
}

// var color

function drawContours(){
    c.lineWidth = 2;
    let radii=range(0,.1,1);
    let colorNumbers=range(0,Math.round(colormap.length/radii.length),colormap.length-1);
    for (let i = 0; i < radii.length; i++) {
        color = colormap[colorNumbers[i]];
        drawCircle(0,0,radii[i],color)
    }
}

function drawCircle(cx,cy,r,color){
    let  colorCode="rgba("+color[0]+ "," +color[1]+","+ color[2]+",0.8)";
    c.strokeStyle= colorCode//"rgb(200,200,200)"; // from color value
    c.beginPath()
    c.moveTo(xtoPx(cx+r*Math.cos(0)), ytoPx(cx+r*Math.sin(0)))
    for (let theta = 0; theta <= Math.PI*2; theta=theta+0.01*Math.PI) {
        c.lineTo(xtoPx(cx+r*Math.cos(theta)), ytoPx(cy+r*Math.sin(theta)));
    }

    c.stroke();
}

function drawPoint(cx,cy,r=4){

    c.strokeStyle= "blue";
    c.beginPath()
    for (let theta = 0; theta <= Math.PI*2; theta=theta+0.01*Math.PI) {
        c.lineTo(cx+r*Math.cos(theta), cy+r*Math.sin(theta));
    }
    c.fillStyle='blue' ;
    c.stroke();
}


drawContours();
drawAxes();
