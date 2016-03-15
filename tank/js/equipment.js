//equipment class
var equipment = function() {
	this.MAXTYPE = 4;
	this.type = 0;
	this.pos = { x:0,y:0 };
	this.existence = 1;
	this.init = function() {
		this.pos.x = this.pos.y =0;
		this.existence = 1;
		this.type = Math.floor(Math.random()*this.MAXTYPE)+1;
	}
};

if ('undefined' != typeof(global)) {
	module.exports = global.equipment = equipment;
}
