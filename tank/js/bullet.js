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
		upt=50;
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

if ('undefined' != typeof(global)) {
	module.exports = global.bullet = bullet;
}
