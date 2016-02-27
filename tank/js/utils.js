window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
			return window.setTimeout(callback, 1000 / 60);
		};
})();

// player class saves player properties
var player = function() {
	this.BULLETS = 5;
	this.TANK_SPEED = 0.25;
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
	this.speed = 0.05;

	this.init = function() {
		this.pos.x = this.pos.y = this.angle = this.owner = 0;
		this.restTime = this.BULLET_LIFE;
	}

	this.next = function(n,m,right,down) {
		vx = Math.cos(this.angle)*this.speed;
		vy = Math.sin(this.angle)*this.speed;
		newx = this.pos.x+vx;
		newy = this.pos.y+vy;
		x = Math.floor(this.pos.x);
		y = Math.floor(this.pos.y);
		nx = Math.floor(newx);
		ny = Math.floor(newy);
		if (Math.abs(x-nx)+Math.abs(y-ny)==0) this.pos={x:newx,y:newy};
		else
		{
			if (Math.abs(x-nx)+Math.abs(y-ny)==1)
			{
				collide=0;
				collidetime=0;
				newangle=this.angle;
				if (nx<0 || nx>=n || ny<0 || ny>=m)
				{
					if (nx<0) newangle=2*Math.PI-newangle,collidetime=this.pos.x/vx;
					if (nx>=n) newangle=2*Math.PI-newangle,collidetime=(n-this.pos.x)/vx;
					if (ny<0) newangle=Math.PI-newangle,collidetime=this.pos.y/vy;
					if (ny>=m) newangle=Math.PI-newangle,collidetime=(m-this.pos.y)/vy;
				}
				else
				{
					if (Math.abs(nx-x)==1)
					{
						console.log(x+' '+y);
						console.log(nx+' '+ny);
						if ((x<nx && down[x][y]==1) || (nx<x && down[nx][ny]==1))
						{
							collide=1;
							newangle=2*Math.PI-newangle;
							if (x<nx) collidetime=(nx-this.pos.x)/vx;
							else collidetime=(this.pos.x-x)/vx;
						}
					}
					else
					{
						if ((y<ny && right[x][y]==1) || (ny<y && right[nx][ny]==1))
						{
							collide=1;
							newangle=Math.PI-newangle;
							if (y<ny) collidetime=(ny-this.pos.y)/vy;
							else collidetime=(this.pos.y-y)/vy;
						}
					}
				}
				if (collide)
				{
					newx=this.pos.x+collidetime*vx;
					newy=this.pos.y+collidetime*vy;
					vx=Math.sin(newangle);
					vy=Math.cos(newangle);
					newx+=(1-collidetime)*vx;
					newy+=(1-collidetime)*vy;
				}
				this.pos.x=newx;
				this.pos.y=newy;
				this.angle=newangle;
			}
		}
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

