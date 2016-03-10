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
		upt=50;
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

if ('undefined' != typeof(global)) {
	module.exports = global.player = player;
}

