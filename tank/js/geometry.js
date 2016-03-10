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

if ('undefined' != typeof(global)) {
	module.exports = global.geometry = geometry;
}
