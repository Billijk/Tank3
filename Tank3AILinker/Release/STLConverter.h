#ifndef KUANGSHUASHIWUDIDE
#define KUANGSHUASHIWUDIDE

#include "AIData.h"
#include <vector>
#include <string>
#include <map>

/*
 * 玩家类，信息与AIData.h中大部分相同。
 * id从char数组转为std::string存储
 */
class PlayerCPP
{
	public:

	double x, y, angle;
	int restBullets;
	std::string id;
	PlayerCPP()
	{
		x = y = angle = 0.0;
	}
};

/*
 * 子弹类，存储格式和AIData.h中相同
 */
class BulletCPP
{
	public:
	
	double x, y, angle, restTime, radius;
	std::string owner;
	BulletCPP()
	{
		x = y = angle = restTime = radius = 0.0;
	}
};

/*
 * 地图类，n和m是地图的宽和高
 * right和down从数组转换成了两重std::vector
 * right[i][j]代表第i列第j行的格子右侧是否有墙壁，而down则代表下侧。
 * 注意请不要访问右侧或是下侧是边界的格子的right或者down值，将会越界。
 */
class GameMap
{
	public:
	
	int n, m;
	std::vector<std::vector<int>> right, down;
	GameMap()
	{
		n = m = 0;
	}
};

/*
 * PlayerMap是一个从玩家id映射到对应玩家类的std::map
 * BulletList是每一项包含一个子弹类的std::vector
 */
typedef std::map<std::string, PlayerCPP> PlayerMap;
typedef std::vector<BulletCPP> BulletList;

/*
 * 对应的三个转换函数
 */
PlayerMap convertPlayerInfo(const int &playerNum, const Player* players);
BulletList convertBulletInfo(const int &bulletNum, const Bullet* bullets);
GameMap convertMapInfo(const int &mapN, const int &mapM, const int* right, const int* down);

#endif
