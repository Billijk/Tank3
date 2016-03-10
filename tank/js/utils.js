window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
		return window.setTimeout(callback, 1000 / 60);
	};
})();

// geometry class 

var geometry = function(){};

geometry.prototype.eps=1e-7;

geometry.prototype.sgn = function(v)
{
	if (Math.abs(v)<=geometry.prototype.eps) return 0;
	if (v>0) return 1;
	else return -1;
}

geometry.prototype.mult = function(p1,p2,p3) {
	return (p2.x-p1.x)*(p3.y-p1.y)-(p3.x-p1.x)*(p2.y-p1.y);
}

geometry.prototype.distance = function(p1,p2){
	return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y));
}

geometry.prototype.disttoline = function(p1,p2,p3) {
	return Math.abs((geometry.prototype.mult(p1,p2,p3))/geometry.prototype.distance(p2,p3));
}

geometry.prototype.checkCircleandSegmentSeriously = function(c,p1,p2){
	d1=geometry.prototype.distance({x:c.x,y:c.y},p1);
	d2=geometry.prototype.distance({x:c.x,y:c.y},p2);
	if (geometry.prototype.sgn(d1-c.r)<=0 || geometry.prototype.sgn(d2-c.r)<=0) return 1;
	pd={x:c.x,y:c.y};
	pc={x:c.x,y:c.y};
	pc.x=pc.x+p1.y-p2.y;
	pc.y=pc.y+p2.x-p1.x;
	return geometry.prototype.sgn(geometry.prototype.mult(p1,pd,pc)*geometry.prototype.mult(p2,pd,pc))<=0 && geometry.prototype.sgn(geometry.prototype.disttoline(pd,p1,p2)-c.r)<=0;
}

geometry.prototype.checkCircleandSegmentnotSeriously = function(c,p1,p2){
	d1=geometry.prototype.distance({x:c.x,y:c.y},p1);
	d2=geometry.prototype.distance({x:c.x,y:c.y},p2);
	if (geometry.prototype.sgn(d1-c.r)<0 || geometry.prototype.sgn(d2-c.r)<0) return 1;
	pd={x:c.x,y:c.y};
	pc={x:c.x,y:c.y};
	pc.x=pc.x+p1.y-p2.y;
	pc.y=pc.y+p2.x-p1.x;
	return geometry.prototype.sgn(geometry.prototype.mult(p1,pd,pc)*geometry.prototype.mult(p2,pd,pc))<0 && geometry.prototype.sgn(geometry.prototype.disttoline(pd,p1,p2)-c.r)<0;
}

// player class saves player properties
var player = function() {
	this.BULLETS = 5;
	this.TANK_SPEED = 0.015*1.5;
	this.TANK_ROTATE_SPEED = 0.05;
	this.TANK_RADIUS = 1.0/6;

	this.id;
	this.name = "";
	this.pos = { x:0, y:0 };
	this.radius = this.TANK_RADIUS;
	this.angle;
	this.color = utils.prototype.getRandomColor();
	this.score = 0;
	this.buff=0;
	this.restBullets = this.BULLETS;
	this.operation = {};

	this.init = function() {
		this.pos.x = this.pos.y = this.buff = 0;
		this.restBullets = this.BULLETS;
		this.angle = Math.random() * 2 * Math.PI;
		this.radius = this.TANK_RADIUS;
		this.operation = {};
	};

	this.fire = function(bullets) {
		if (this.buff==-1) return;
		if (this.buff==0)
		{
			if (this.restBullets>0)
			{
				this.restBullets--;
				myBullet = new bullet(); 
				myBullet.angle = this.angle;
				myBullet.pos.x = this.pos.x+Math.cos(this.angle)/3;
				myBullet.pos.y = this.pos.y+Math.sin(this.angle)/3;
				myBullet.owner = this.id;
				myBullet.restTime = myBullet.BULLET_LIFE;
				bullets.push(myBullet);
			}
		}
		if (this.buff==1)
		{
			for (var a=0;a<bullets.length;a++)
				bullets[a].angle=Math.random()*2*Math.PI;
			this.buff=0;
		}
		if (this.buff==2)
		{
			for (var a=0;a<bullets.length;a++)
				bullets[a].radius*=2;
			this.buff=0;
		}
		if (this.buff==3)
		{
			for (var a=0;a<5;a++)
			{
				var myBullet = new bullet(); 
				myBullet.angle = this.angle;
				myBullet.pos.x = this.pos.x+Math.cos(this.angle)*(1.0/3+0.08*a);
				myBullet.pos.y = this.pos.y+Math.sin(this.angle)*(1.0/3+0.08*a);
				myBullet.restTime = myBullet.BULLET_LIFE;
				myBullet.owner = -1;
				bullets.push(myBullet);
			}
			this.buff=0;
		}
		if (this.buff==4)
		{
			for (var a=0;a<8;a++)
			{
				var myBullet = new bullet(); 
				myBullet.angle = this.angle+Math.PI/4*a;
				myBullet.pos.x = this.pos.x+Math.cos(this.angle+Math.PI/4*a)*(1.0/3);
				myBullet.pos.y = this.pos.y+Math.sin(this.angle+Math.PI/4*a)*(1.0/3);
				myBullet.restTime = myBullet.BULLET_LIFE;
				myBullet.owner = -1;
				bullets.push(myBullet);
			}
			this.buff=0;
		}
	}
	this.CheckGG = function(bullet) {
		if ((this.radius+bullet.radius)*(this.radius+bullet.radius)>(bullet.pos.x-this.pos.x)*(bullet.pos.x-this.pos.x)+(bullet.pos.y-this.pos.y)*(bullet.pos.y-this.pos.y) && bullet.restTime>0) 
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
		x = Math.floor(this.pos.x);
		y = Math.floor(this.pos.y);
		vx = Math.cos(this.angle)*direction*this.TANK_SPEED;
		vy = Math.sin(this.angle)*direction*this.TANK_SPEED;
		l=0;r=1;
		upt=100;
		for (var a=0;a<upt;a++)
		{
			mid=(l+r)/2.0;
			able=1;
			newx = this.pos.x+vx*mid;
			newy = this.pos.y+vy*mid;
			for (var b=-1;b<=1;b++)
				for (var c=-1;c<=1;c++)
				{
					xx = x+b;
					yy = y+c;
					if (xx<0 || yy<0 || xx>=n-1 || yy>=m || down[xx][yy])
					{
						if (geometry.prototype.checkCircleandSegmentSeriously({x:newx,y:newy,r:this.radius},{x:xx+1,y:yy},{x:xx+1,y:yy+1})) able=0;
					}
					if (xx<0 || yy<0 || xx>=n || yy>=m-1 || right[xx][yy])
					{
						if (geometry.prototype.checkCircleandSegmentSeriously({x:newx,y:newy,r:this.radius},{x:xx,y:yy+1},{x:xx+1,y:yy+1})) able=0;
					}
				}
			if (able==0) r=mid;
			else l=mid;
		}
		this.pos.x += this.check(vx*r);
		this.pos.y += this.check(vy*r);
		x = Math.floor(this.pos.x);
		y = Math.floor(this.pos.y);
		restT=1-r;
		l=0;r=restT;
		for (var a=0;a<upt;a++)
		{
			mid=(l+r)/2.0;
			able=1;
			newx = this.pos.x+vx*mid;
			newy = this.pos.y;
			for (var b=-1;b<=1;b++)
				for (var c=-1;c<=1;c++)
				{
					xx = x+b;
					yy = y+c;
					if (xx<0 || yy<0 || xx>=n-1 || yy>=m || down[xx][yy])
					{
						if (geometry.prototype.checkCircleandSegmentnotSeriously({x:newx,y:newy,r:this.radius},{x:xx+1,y:yy},{x:xx+1,y:yy+1})) able=0;
					}
					if (xx<0 || yy<0 || xx>=n || yy>=m-1 || right[xx][yy])
					{
						if (geometry.prototype.checkCircleandSegmentnotSeriously({x:newx,y:newy,r:this.radius},{x:xx,y:yy+1},{x:xx+1,y:yy+1})) able=0;
					}
				}
			if (able==0) r=mid;
			else l=mid;
		}
		dx = this.check(vx*r);
		l=0;r=restT;
		for (var a=0;a<upt;a++)
		{
			mid=(l+r)/2.0;
			able=1;
			newx = this.pos.x;
			newy = this.pos.y+vy*mid;
			for (var b=-1;b<=1;b++)
				for (var c=-1;c<=1;c++)
				{
					xx = x+b;
					yy = y+c;
					if (xx<0 || yy<0 || xx>=n-1 || yy>=m || down[xx][yy])
					{
						if (geometry.prototype.checkCircleandSegmentnotSeriously({x:newx,y:newy,r:this.radius},{x:xx+1,y:yy},{x:xx+1,y:yy+1})) able=0;
					}
					if (xx<0 || yy<0 || xx>=n || yy>=m-1 || right[xx][yy])
					{
						if (geometry.prototype.checkCircleandSegmentnotSeriously({x:newx,y:newy,r:this.radius},{x:xx,y:yy+1},{x:xx+1,y:yy+1})) able=0;
					}
				}
			if (able==0) r=mid;
			else l=mid;
		}
		dy = this.check(vy*r);
		this.pos.x += dx;
		this.pos.y += dy;
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
	this.radius=1.0/25;

	this.init = function() {
		this.pos.x = this.pos.y = this.angle = this.owner = 0;
		this.restTime = this.BULLET_LIFE;
	}

	this.checkRight = function(n,m,right,x,y) {
		if (x<0 || y<0) return 0;
		if (x>=n || y>=m) return 0;
		return y==m-1 || right[x][y];
	}

	this.checkDown = function(n,m,down,x,y) {
		if (x<0 || y<0) return 0;
		if (x>=n || y>=m) return 0;
		return x==n-1 || down[x][y];
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
		x = Math.floor(this.pos.x);
		y = Math.floor(this.pos.y);
		if (this.checkRight(n,m,right,x,y) && geometry.prototype.checkCircleandSegmentnotSeriously({x:this.pos.x,y:this.pos.y,r:this.radius},{x:x,y:y+1},{x:x+1,y:y+1}))
		{
			this.restTime=0;
			return;
		}
		if (this.checkDown(n,m,down,x,y) && geometry.prototype.checkCircleandSegmentnotSeriously({x:this.pos.x,y:this.pos.y,r:this.radius},{x:x+1,y:y},{x:x+1,y:y+1}))
		{
			this.restTime=0;
			return;
		}
		if (this.checkRight(n,m,right,x,y-1) && geometry.prototype.checkCircleandSegmentnotSeriously({x:this.pos.x,y:this.pos.y,r:this.radius},{x:x,y:y},{x:x+1,y:y}))
		{
			this.restTime=0;
			return;
		}
		if (this.checkDown(n,m,down,x-1,y) && geometry.prototype.checkCircleandSegmentnotSeriously({x:this.pos.x,y:this.pos.y,r:this.radius},{x:x,y:y},{x:x,y:y+1}))
		{
			this.restTime=0;
			return;
		}
		l=0;r=1;
		upt=100;
		collide=0;
		for (var a=0;a<upt;a++)
		{
			mid=(l+r)/2.0;
			able=1;
			newx = this.pos.x+vx*mid;
			newy = this.pos.y+vy*mid;
			for (var b=-1;b<=1;b++)
				for (var c=-1;c<=1;c++)
				{
					xx = x+b;
					yy = y+c;
					if (xx<0 || yy<0 || xx>=n-1 || yy>=m || down[xx][yy])
					{
						if (geometry.prototype.checkCircleandSegmentSeriously({x:newx,y:newy,r:this.radius},{x:xx+1,y:yy},{x:xx+1,y:yy+1})) able=0,collide=1;
					}
					if (xx<0 || yy<0 || xx>=n || yy>=m-1 || right[xx][yy])
					{
						if (geometry.prototype.checkCircleandSegmentSeriously({x:newx,y:newy,r:this.radius},{x:xx,y:yy+1},{x:xx+1,y:yy+1})) able=0,collide=2;
					}
				}
			if (able==0) r=mid;
			else l=mid;
		}
		if (collide==0)
		{
			this.pos.x += vx;
			this.pos.y += vy;
		}
		else
		{
			newangle = this.angle;
			this.pos.x += r*vx;
			this.pos.y += r*vy;
			if (collide==1) newangle = Math.PI-newangle;
			else newangle = 2*Math.PI-newangle;
			vx = Math.cos(newangle)*this.speed;
			vy = Math.sin(newangle)*this.speed;
			x = Math.floor(this.pos.x);
			y = Math.floor(this.pos.y);
			l=0;r=1-r;
			newcollide=collide;
			collide=0;
			for (var a=0;a<upt;a++)
			{
				mid=(l+r)/2.0;
				able=1;
				newx = this.pos.x+vx*mid;
				newy = this.pos.y+vy*mid;
				for (var b=-1;b<=1;b++)
					for (var c=-1;c<=1;c++)
					{
						xx = x+b;
						yy = y+c;
						if (xx<0 || yy<0 || xx>=n-1 || yy>=m || down[xx][yy])
						{
							if (geometry.prototype.checkCircleandSegmentnotSeriously({x:newx,y:newy,r:this.radius},{x:xx+1,y:yy},{x:xx+1,y:yy+1})) able=0,collide=1;
						}
						if (xx<0 || yy<0 || xx>=n || yy>=m-1 || right[xx][yy])
						{
							if (geometry.prototype.checkCircleandSegmentnotSeriously({x:newx,y:newy,r:this.radius},{x:xx,y:yy+1},{x:xx+1,y:yy+1})) able=0,collide=1;
						}
					}
				if (able==0) r=mid;
				else l=mid;
			}
			if (collide==1)
			{
				this.pos.x += r*vx;
				this.pos.y += r*vy;
				collide=3-newcollide;
				if (collide==1) newangle = Math.PI-newangle;
				else newangle = 2*Math.PI-newangle;
				vx = Math.cos(newangle)*this.speed;
				vy = Math.sin(newangle)*this.speed;
				r=1-r;
				this.pos.x += r*vx;
				this.pos.y += r*vy;
				this.angle = newangle;
			}
			else
			{
				this.pos.x += vx*r;
				this.pos.y += vy*r;
				this.angle = newangle;
			}
		}
	}

};

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

