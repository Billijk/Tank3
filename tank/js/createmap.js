function drawLine(x1,y1,x2,y2)
{
	context.moveTo(x1+5,y1+5);
	context.lineTo(x2+5,y2+5);
	context.lineWidth=1;
	context.stroke();
}

function createMap(n,m)
{
	down=[];
	right=[];
	for (var a=0;a+1<n;a++)
	{
		down[a]=[];
		for (var b=0;b<n;b++)
			down[a][b]=Math.floor(Math.random()*2);
	}
	for (var a=0;a<n;a++)
	{
		right[a]=[];
		for (var b=0;b+1<n;b++)
			right[a][b]=Math.floor(Math.random()*2);
	}
	perWidth=20;
	for (var a=0;a+1<n;a++)
		for (var b=0;b<n;b++)
			if (down[a][b]==1) drawLine((a+1)*perWidth,b*perWidth,(a+1)*perWidth,(b+1)*perWidth);
	for (var a=0;a<n;a++)
		for (var b=0;b+1<n;b++)
			if (right[a][b]==1) drawLine(a*perWidth,(b+1)*perWidth,(a+1)*perWidth,(b+1)*perWidth);
	for (var a=0;a<n;a++)
	{
		drawLine(a*perWidth,0,(a+1)*perWidth,0);
		drawLine(a*perWidth,m*perWidth,(a+1)*perWidth,m*perWidth);
	}
	for (var a=0;a<m;a++)
	{
		drawLine(0,a*perWidth,0,(a+1)*perWidth);
		drawLine(n*perWidth,a*perWidth,n*perWidth,(a+1)*perWidth);
	}
	drawLine(1000,1000,1000,1000);
}
