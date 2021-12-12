
var canvas=document.getElementById("canvas");

var c=canvas.getContext("2d");
canvas.width=0.8*Math.min(window.innerHeight,window.innerWidth);
canvas.height=0.8*Math.min(window.innerHeight,window.innerWidth);
canvas.style="border:1px solid black;"

window.addEventListener("resize",function(){
    canvas.width=0.7*Math.min(window.innerHeight,window.innerWidth);
    canvas.height=0.7*Math.min(window.innerHeight,window.innerWidth);
})




// PLOTTING 
let paddingPx=40;
let xlim=[-1,1];
let ylim=[-1,1];
let xspan=xlim[1]-xlim[0];
let yspan=ylim[1]-ylim[0];

function xtoPx(xvalue){
    return (xvalue - xlim[0])/(xlim[1]-xlim[0])*(canvas.width-2*paddingPx)+paddingPx;
}

function ytoPx(yvalue){
    return canvas.height -((yvalue - ylim[0])/(ylim[1]-ylim[0])*(canvas.height-2*paddingPx)+paddingPx);
}

function drawAxes(){
    
    
    
    let fontSizePx=15; // canvas.height/50;
    c.font = fontSizePx+ 'px Arial';
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
    let xTicks=range(xlim[0],xspan/10,xlim[1])
    for (let i = 0; i < xTicks.length; i++) {
        xvalue = Math.round((xTicks[i])*100)/100;
        c.moveTo( xtoPx(xvalue),ytoPx(ylim[0]+.01*yspan )) ;
        c.lineTo( xtoPx(xvalue),ytoPx(ylim[0]-.01*yspan ) );
        c.fillText(xvalue.toString(), xtoPx(xvalue),ytoPx(ylim[0]-.01*yspan)+fontSizePx );
        
    }
    c.stroke();
    
    // y Ticks
    let yTicks=range(ylim[0],yspan/10,ylim[1])
    for (let i = 0; i < xTicks.length; i++) {
        yvalue = Math.round((xTicks[i])*100)/100;
        c.moveTo( xtoPx(xlim[0]-.01*yspan),ytoPx( yvalue)) ;
        c.lineTo( xtoPx(xlim[0]+.01*yspan),ytoPx( yvalue) );
        c.fillText(yvalue.toString(), xtoPx(xlim[0]-.01*xspan)-fontSizePx, ytoPx(yvalue),);
        
    }
    c.stroke();
    
    
    // for(var i=0;i<=100;i++){
    // 	c.lineTo(this.x+springWidth/2*Math.sin(i/100*10*Math.PI),meanposy+this.y+r/2+i/100*(meanposy-this.y-r/2));
    
    // // Draws a spring
    // c.beginPath();
    // c.moveTo(this.x,meanposy+this.y+r/2);
    // for(var i=0;i<=100;i++){
    // 	c.lineTo(this.x+springWidth/2*Math.sin(i/100*10*Math.PI),meanposy+this.y+r/2+i/100*(meanposy-this.y-r/2));
    
    // }
    // c.strokeStyle = 'blue';
    // c.lineWidth = 8;
    // c.stroke();
    
    // // Fill a rectangle
    // c.fillStyle='rgba(255,50,50,0.8)' ;
    // c.fillRect(this.x-r/2,meanposy+this.y-r/2,r,r)
    
    
    // //  Write text M
    // c.font = r/2+ 'px Arial';
    // c.fillStyle='#000000' ;
    // c.textAlign='center';
    // c.fillText('M', this.x, meanposy+this.y+r/4);
    
    
    
    
}
var color

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

function drawPoint(cx,cy){
    c.strokeStyle= "blue";//"rgb(200,200,200)"; // from color value
    let r=.03;
    c.beginPath()
    for (let theta = 0; theta <= Math.PI*2; theta=theta+0.01*Math.PI) {
        c.lineTo(xtoPx(cx+r*Math.cos(theta)), ytoPx(cy+r*Math.sin(theta)));
    }
    c.fillStyle='blue' ;
    c.stroke();
}


drawContours();
drawAxes();
