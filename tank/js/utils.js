window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
		return window.setTimeout(callback, 1000 / 60);
	};
})();

var equipment = function() {

	this.EquipementTypeNumber = 1;
	this.pos = {x:0,y:0};
	this.type = Math.floor(Math.random()*(this.EquipementType-1))+1;
}

// utils class contains utilizations for both server and client side
var utils = function() {};

// set 'utils' global at server side for convenience
if ('undefined' != typeof(global)) {
	module.exports = global.utils = utils;
}

utils.prototype.getRandomColor = function() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++ ) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
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
	for (var a=0;a<k;a++)
		pos[a][0]+=0.5,pos[a][1]+=0.5;
	return pos;
}

