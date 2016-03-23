#include <bits/stdc++.h>
using namespace std;

/*
 * 当前场景的地图信息
 * n代表行数，m代表列数
 * right的实际大小为n*(m-1), right[i][j]代表第i行第j列的格子右侧是否有墙壁
 * down的实际大小为(n-1)*m, down[i][j]代表第i行第j列的格子的下侧是否有墙壁
 * 你接收的right和down的大小都略大于上述实际值，这是为了防止你访问越界导致程序崩溃。
 * 这些范围之外的数据不包括任何有效信息。
 */
class GameMap
{
public :
	int n, m;
	vector<vector<int>> right, down;
};

/*
 * 每一个玩家的信息
 * x和y代表坐标，单位为格（注意都用实数表示）
 * 坐标为(x,y)的玩家的实际位置为距地图左边缘x格，距地图上边缘y格
 * angle代表炮管的转角，以弧度为单位。正右方向为旋转起点，顺时针为旋转正方向
 * * * 注意 * * *：炮管的转角的取值范围为全体实数而不仅限于[ 0, 2π]，因此你应当
 * 自行将其转换为这个范围内的值以方便确定炮管的实际方向。
 * restBullets代表玩家剩余的子弹数
 * id是唯一标识字符串
 */
class Player
{
public:
	double x, y, angle;
	int restBullets;
	string id;
	Player()
	{
		x = y = angle = 0.0;
		restBullets = 0;
	}
};

/*
 * 子弹的信息
 * owner是发射这颗子弹的玩家的唯一标识字符串
 * xy代表坐标，格式与玩家的相同；angle是子弹速度向量的辐角，格式与玩家相同。
 * restTime代表子弹的剩余存在时间, 以帧为单位
 * radius代表子弹的半径，以格为单位
 */
class Bullet
{
public:
	string owner;
	double x, y, angle, restTime, radius;
	Bullet()
	{
		x = y = angle = restTime = radius = 0.0;
	}
};

/*
 * 指令类
 * 这将是你返回给链接程序的信息
 * MOVE_FORWARD代表发送一个向前走的指令
 * MOVE_LEFT代表发送一个向左转动炮管的指令
 * MOVE_RIGHT代表发送一个向右转动炮管的指令
 * MOVE_BACK代表发送一个向后退的指令
 * FIRE代表发送一个发射子弹的指令
 * 代表相应指令的属性为真时本回合将发送该指令
 * 有关各指令的详细信息请仔细阅读游戏说明文档
 */
class Instruction
{
public :
	bool MOVE_FORWARD, MOVE_LEFT, MOVE_RIGHT, MOVE_BACK, FIRE;
	Instruction() { MOVE_FORWARD = MOVE_LEFT = MOVE_RIGHT = MOVE_BACK = FIRE = false; }
	Instruction(bool MOVE_FORWARD, bool MOVE_LEFT, bool MOVE_RIGHT, bool MOVE_BACK, bool FIRE) : \
		MOVE_FORWARD(MOVE_FORWARD), MOVE_LEFT(MOVE_LEFT), MOVE_RIGHT(MOVE_RIGHT), MOVE_BACK(MOVE_BACK), FIRE(FIRE) {}
};

/*
 * 接下来将是你需要重写的函数
 * 注意：所有参数均为const属性，因此你将不能对它们进行写入操作。
 *       请勿修改函数的定义形式，包括函数名，返回值类型，参数名，参数类型，参数顺序。
 *       你需要完成的只有添加函数体并返回你所期望的值
 */

/*
 * 请重写这个函数以实现对游戏中坦克的操作
 * 链接程序每当收到服务器更新时将会调用这个函数询问你的指令
 *
 * 它的参数将是服务器交给你的信息
 * playerInfo是一个map，它是一个从玩家的唯一标识字符串到存储玩家信息的玩家类的映射表。
 * 例：某玩家的唯一标识字符串为ksq，则你可以通过playerinfo["ksq"]来得到存储该玩家信息的玩家类
 * bulletInfo是一个存储有各子弹信息的表，每一项为一个子弹类。
 * 上述两个表将不会包含任何多余的信息。
 *
 * 链接程序收到该函数的返回值时，会将它发送到服务端，从而进行相应操作
 * 指令的格式如前文所述
 */
Instruction giveInstruction( \
		const map<string, Player> &playerInfo, \
		const vector<Bullet> &bulletInfo \
	)
{
	return Instruction(0, 0, 1, 1, 1);
}

/*
 * 新场景开始之前链接程序将会调用这个函数
 * 你将能从参数中得到本场景地图的信息，和玩家的初始信息
 * 地图信息的存储格式见地图类的说明，玩家信息的存储格式和上个函数中相同
 * 请重写这个函数以保存这些信息，并进行相应的初始化操作
 */
void setMapInfo( \
		const GameMap &mapInfo, \
		const map<string, Player> &playerInfo \
	)
{
}


