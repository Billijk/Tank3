window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
			return window.setTimeout(callback, 1000 / 60);
		};
})();

// player class saves player properties
var player = function() {
	this.BULLETS = 5;
	this.TANK_SPEED = 0.015;
	this.TANK_ROTATE_SPEED = 0.05;

	this.id;
	this.name = "";
	this.pos = { x:0, y:0 };
	this.radius = 1.0/6;
	this.angle;
	this.color = utils.prototype.getRandomColor();
	this.score = 0;
	this.buff=0;
	this.restBullets = this.BULLETS;
	this.operation = {};

	this.init = function() {
		this.pos.x = this.pos.y = this.angle = this.buff = 0;
		this.restBullets = this.BULLETS;
		this.operation = {};
	};

	this.fire = function() {
		this.restBullets--;
		myBullet = new bullet(); 
		myBullet.angle = this.angle;
		myBullet.pos.x = this.pos.x+Math.cos(this.angle)/3;
		myBullet.pos.y = this.pos.y+Math.sin(this.angle)/3;
		myBullet.owner = this.id;
		myBullet.restTime = myBullet.BULLET_LIFE;
		return myBullet;
	}
	this.CheckGG = function(bullet) {
		if (this.radius*this.radius>(bullet.pos.x-this.pos.x)*(bullet.pos.x-this.pos.x)+(bullet.pos.y-this.pos.y)*(bullet.pos.y-this.pos.y) && bullet.restTime>0) 
		{
			this.buff=-1;
			return true;
		}
		return false;
	}

	this.sgn = function(v) {
		eps=1e-5;
		if (Math.abs(v)<=eps) return 0;
		if (v>0) return 1;
		else return -1;
	}

	this.check = function(v){
		if (this.sgn(v)==0) return 0;
		else return v;
	}

	this.next = function(direction,n,m,right,down) {
		eps=1e-5;
		availableTime=1;
		x = Math.floor(this.pos.x);
		y = Math.floor(this.pos.y);
		vx = Math.cos(this.angle)*direction*this.TANK_SPEED;
		vy = Math.sin(this.angle)*direction*this.TANK_SPEED;
		t1=t2=t3=t4=1;
		if (vx<0)
		{
			if (x==0 || down[x-1][y]==1) 
			{
				t1=Math.abs((this.pos.x-this.radius-x)/vx);
				availableTime=Math.min(availableTime,t1);
			}
		}
		if (vx>0)
		{
			if (x==n-1 || down[x][y]==1) 
			{
				t2=Math.abs((x+1-this.pos.x-this.radius)/vx);
				availableTime=Math.min(t2,availableTime);
			}
		}
		if (vy<0)
		{
			if (y==0 || right[x][y-1]==1)
			{
				t3=Math.abs((this.pos.y-this.radius-y)/vy);
				availableTime=Math.min(t3,availableTime);
			}
		}
		if (vy>0)
		{
			if (y==m-1 || right[x][y]==1)
			{
				t4=Math.abs((y+1-this.pos.y-this.radius)/vy);
				availableTime=Math.min(availableTime,t4);
			}
		}
		l=0;r=1;
		for (var a=0;a<100;a++)
		{
			mid=(l+r)/2.0;
			able=1;
			newx = this.pos.x+vx*mid;
			newy = this.pos.y+vy*mid;
			for (var b=0;b<=1;b++)
				for (var c=0;c<=1;c++)
				{
					xx = x+b;
					yy = y+c;
					if (xx==0 || yy==0 || xx>=n || yy>=m || down[xx-1][yy] || right[xx][yy-1] || down[xx-1][yy-1] || right[xx-1][yy-1])
					{
						if (this.sgn((xx-newx)*(xx-newx)+(yy-newy)*(yy-newy)-this.radius*this.radius)<=0) able=0;
					}
				}
			if (able==0) r=mid;
			else l=mid;
		}
		if (this.sgn(r-availableTime)<=0)
		{
			this.pos.x += this.check(vx*r);
			this.pos.y += this.check(vy*r);
		}
		else
		{
			this.pos.x += this.check(vx*availableTime);
			this.pos.y += this.check(vy*availableTime);
			if (!(Math.abs(t1-availableTime)<=eps || Math.abs(t2-availableTime)<=eps)) this.pos.x += this.check(vx * (Math.min(t1,t2)-availableTime));
			if (!(Math.abs(t3-availableTime)<=eps || Math.abs(t4-availableTime)<=eps)) this.pos.y += this.check(vy * (Math.min(t3,t4)-availableTime));
		}
	}
};

// bullet class deals with bullet properties
var bullet = function() {
	this.BULLET_LIFE = 800; //milliseconds

	this.id;
	this.pos = { x:0, y:0 };
	this.angle;
	this.restTime;
	this.owner;
	this.speed = 0.03;

	this.init = function() {
		this.pos.x = this.pos.y = this.angle = this.owner = 0;
		this.restTime = this.BULLET_LIFE;
	}

	this.next = function(n,m,right,down) {
		if (this.pos.x<0 || this.pos.y<0 || this.pos.x>n || this.pos.y>m)
		{
			this.restTime=0;
			return;
		}
		this.restTime--;
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
					collide=1;
					if (nx<0) newangle=Math.PI-newangle,collidetime=this.pos.x/vx;
					if (nx>=n) newangle=Math.PI-newangle,collidetime=(n-this.pos.x)/vx;
					if (ny<0) newangle=2*Math.PI-newangle,collidetime=this.pos.y/vy;
					if (ny>=m) newangle=2*Math.PI-newangle,collidetime=(m-this.pos.y)/vy;
				}
				else
				{
					if (Math.abs(nx-x)==1)
					{
						if ((x<nx && down[x][y]==1) || (nx<x && down[nx][ny]==1))
						{
							collide=1;
							newangle=Math.PI-newangle;
							if (x<nx) collidetime=(nx-this.pos.x)/vx;
							else collidetime=(this.pos.x-x)/vx;
						}
					}
					else
					{
						if ((y<ny && right[x][y]==1) || (ny<y && right[nx][ny]==1))
						{
							collide=1;
							newangle=2*Math.PI-newangle;
							if (y<ny) collidetime=(ny-this.pos.y)/vy;
							else collidetime=(this.pos.y-y)/vy;
						}
					}
				}
				collidetime=Math.abs(collidetime);
				if (collide==1)
				{
					newx=this.pos.x+collidetime*vx;
					newy=this.pos.y+collidetime*vy;
					vx=Math.cos(newangle)*this.speed;
					vy=Math.sin(newangle)*this.speed;
					newx+=(1-collidetime)*vx;
					newy+=(1-collidetime)*vy;
					this.pos.x=newx;
					this.pos.y=newy;
					this.angle=newangle;
				}
				else
				{
					this.pos.x=newx;
					this.pos.y=newy;
					this.angle=newangle;
				}
			}
			else
			{
				this.angle=this.angle+Math.PI;
				if (this.angle>Math.PI*2) this.angle-=Math.PI*2;
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

