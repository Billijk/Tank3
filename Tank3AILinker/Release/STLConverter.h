#ifndef KUANGSHUASHIWUDIDE
#define KUANGSHUASHIWUDIDE

#include "AIData.h"
#include <vector>
#include <string>
#include <map>

/*
 * ����࣬��Ϣ��AIData.h�д󲿷���ͬ��
 * id��char����תΪstd::string�洢
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
 * �ӵ��࣬�洢��ʽ��AIData.h����ͬ
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
 * ��ͼ�࣬n��m�ǵ�ͼ�Ŀ�͸�
 * right��down������ת����������std::vector
 * right[i][j]�����i�е�j�еĸ����Ҳ��Ƿ���ǽ�ڣ���down������²ࡣ
 * ע���벻Ҫ�����Ҳ�����²��Ǳ߽�ĸ��ӵ�right����downֵ������Խ�硣
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
 * PlayerMap��һ�������idӳ�䵽��Ӧ������std::map
 * BulletList��ÿһ�����һ���ӵ����std::vector
 */
typedef std::map<std::string, PlayerCPP> PlayerMap;
typedef std::vector<BulletCPP> BulletList;

/*
 * ��Ӧ������ת������
 */
PlayerMap convertPlayerInfo(const int &playerNum, const Player* players);
BulletList convertBulletInfo(const int &bulletNum, const Bullet* bullets);
GameMap convertMapInfo(const int &mapN, const int &mapM, const int* right, const int* down);

#endif
