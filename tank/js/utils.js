window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
			return window.setTimeout(callback, 1000 / 60);
		};
})();

// player class saves player properties
var player = function() {
	this.BULLETS = 5;
	this.TANK_SPEED = 2.5;
	this.TANK_ROTATE_SPEED = 0.15;

	this.id;
	this.pos = { x:0, y:0 };
	this.angle;
	this.color;
	this.score;
	this.equipment;
	this.restBullets;

	this.init = function() {
		this.pos.x = this.pos.y = this.angle = this.score = this.equipment = 0;
		this.restBullets = this.BULLETS;
	};
};

// bullet class deals with bullet properties
var bullet = function() {
	this.BULLET_LIFE = 15000; //milliseconds

	this.id;
	this.pos = { x:0, y:0 };
	this.angle;
	this.restTime;
	this.owner;

	this.init = function() {
		this.pos.x = this.pos.y = this.angle = this.owner = 0;
		this.restTime = this.BULLET_LIFE;
	}
};

// utils class contains utilizations for both server and client side
var utils = function() {};

// set 'utils' global at server side for convenience
if ('undefined' != typeof(global)) {
	module.exports = global.utils = utils;
	module.exports = global.player = player;
	module.exports = global.bullet = bullet;
}

// create a n*m random map with k players
// represented by vertical and horizontal walls
utils.prototype.createMap = function(n, m) {
	down=[];
	right=[];
	// randomize vertical walls
	for (var a=0;a+1<n;a++)
	{
		down[a]=[];
		for (var b=0;b<m;b++)
			down[a][b]=Math.floor(Math.random()*2);
	}
	// randomize horizontal walls
	for (var a=0;a<n;a++)
	{
		right[a]=[];
		for (var b=0;b+1<m;b++)
			right[a][b]=Math.floor(Math.random()*2);
	}
	return {vert: down, hori: right};
}

utils.prototype.createPlayer = function(n,m,right,down,k)
{
	visit=[];
	color=[];
	for (var a=0;a<n;a++)
	{
		visit[a]=[];
		color[a]=[];
		for (var b=0;b<m;b++)
		{
			visit[a][b]=0;
			color[a][b]=-1;
		}
	}
	size=[];
	col=0;
	bx=[1,-1,0,0];
	by=[0,0,1,-1];
	for (var a=0;a<n;a++)
		for	(var b=0;b<m;b++)
			if (visit[a][b]==0)
			{
				front=0;tail=0;
				que=[];
				que[0]=[a,b];
				visit[a][b]=true;
				size[col]=0;
				while (front<=tail)
				{
					x=que[front][0];
					y=que[front][1];
					color[x][y]=col;
					size[col]++;
					front++;
					for (var c=0;c<4;c++)
					{
						xx=x+bx[c];
						yy=y+by[c];
						if (xx<n && yy<m && xx>=0 && yy>=0)
						{
							able=1;
							if (c==0 && down[x][y]==1) able=0;
							if (c==1 && down[xx][yy]==1) able=0;
							if (c==2 && right[x][y]==1) able=0;
							if (c==3 && right[xx][yy]==1) able=0;
							if (visit[xx][yy]==0 && able)
							{
								visit[xx][yy]=1;
								tail++;
								que[tail]=[xx,yy];
							}
						}
					}
				}
				col++;
			}
	c=0;
	for (var d=1;d<col;d++)
		if (size[d]>size[c]) c=d;
	if (size[c]<k)
	{
	}
	pos=[];
	for (var a=0;a<k;a++)
	{
		while (true)
		{
			do
			{
				x=Math.floor(Math.random()*n);
				y=Math.floor(Math.random()*m);
			}while (color[x][y]!=c);
			able=1;
			for (var b=0;b<a;b++)
				if (pos[b][0]==x && pos[b][1]==y) able=0;
			if (able)
			{
				pos[a]=[x,y];
				break;
			}
		}
	}	
	return pos;
}


utils.prototype.drawLine = function(context, x1,y1,x2,y2)
{
	context.moveTo(x1+5,y1+5);
	context.lineTo(x2+5,y2+5);
	context.stroke();
}

utils.prototype.drawPlayer = function(context,x,y)
{
		context.moveTo(x*perWidth+perWidth+5,y*perWidth+perWidth/2+5);
		context.arc(x*perWidth+perWidth/2+5,y*perWidth+perWidth/2+5,perWidth/2,Math.PI*2,false);
		context.stroke();
}

// draw map on canvas
utils.prototype.drawMap = function(context, map) {
	var n = map.n;
	var m = map.m;
	var right = map.walls.hori;
	var down = map.walls.vert;

	// calculate tile size
	perWidth=Math.min((mainCanvas.width - 10) / m, (mainCanvas.height - 10) / n);

	context.lineWidth = 3;
	context.strokestyle = "#000000";

	// draw walls
	for (var a=0;a+1<n;a++)
		for (var b=0;b<m;b++)
			if (down[a][b]==1) this.drawLine(context, (a+1)*perWidth,b*perWidth,(a+1)*perWidth,(b+1)*perWidth);
	for (var a=0;a<n;a++)
		for (var b=0;b+1<m;b++)
			if (right[a][b]==1) this.drawLine(context, a*perWidth,(b+1)*perWidth,(a+1)*perWidth,(b+1)*perWidth);

	// draw border
	this.drawLine(context, 0, 0, n*perWidth, 0);
	this.drawLine(context, 0, m*perWidth, n*perWidth, m*perWidth);
	this.drawLine(context, 0, 0, 0, m*perWidth, 0);
	this.drawLine(context, n*perWidth, 0, n*perWidth, m*perWidth);

	for (var a=0;a<map.k;a++)
		this.drawPlayer(context,map.player[a][0],map.player[a][1]);
}
