#ifndef KUANGSHUAZUIQIANG
#define KUANGSHUAZUIQIANG

/*
 * 存储玩家信息
 * x,y代表坐标，坐标原点在左上角，x轴向右，y轴向下，单位为格
 * angle代表炮管的偏角，以弧度表示，正下方为0，顺时针为正方向
 * angle可能会超过2π或者小于0
 * restBullets代表玩家还能发多少子弹
 * id为唯一标识字符串
 */
struct Player
{
	double x, y, angle;
	int restBullets;
	char* id;
	Player()
	{
		x = y = angle = 0.0;
		restBullets = 0;
	}
};

/*
 * 存储子弹信息
 * owner代表子弹的主人的id
 * x,y,angle格式与玩家相同，angle为子弹的速度方向
 * restTime代表子弹剩余存在时间，单位为帧
 * radius代表子弹的半径，单位为格
 */
struct Bullet
{
	char* owner;
	double x, y, angle, restTime, radius;
	Bullet()
	{
		x = y = angle = restTime = radius = 0.0;
	}
};

/*
 * 指令信息
 * 五个值，0为否1为是，从左往右依次代表是否向前，向后，左转炮管，右转炮管，开火/使用道具
 */
struct Instruction
{
	int MOVE_FORWARD, MOVE_LEFT, MOVE_RIGHT, MOVE_BACK, FIRE;
	Instruction() { MOVE_FORWARD = MOVE_LEFT = MOVE_RIGHT = MOVE_BACK = FIRE = 0; }
	Instruction(int MOVE_FORWARD, int MOVE_LEFT, int MOVE_RIGHT, int MOVE_BACK, int FIRE) : \
		MOVE_FORWARD(MOVE_FORWARD), MOVE_LEFT(MOVE_LEFT), MOVE_RIGHT(MOVE_RIGHT), MOVE_BACK(MOVE_BACK), FIRE(FIRE) {}
};

#endif
