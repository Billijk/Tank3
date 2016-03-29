#include <bits/stdc++.h>
#include "STLConverter.h"
using namespace std;

PlayerMap convertPlayerInfo(const int &playerNum, const Player* players)
{
	PlayerMap ret;
	ret.clear();
	for (int i = 0; i < playerNum; ++ i)
	{
		ret[players[i].id].x = players[i].x;
		ret[players[i].id].y = players[i].y;
		ret[players[i].id].angle = players[i].angle;
		ret[players[i].id].restBullets = players[i].restBullets;
		ret[players[i].id].id = players[i].id;
	}
	return ret;
}

BulletList convertBulletInfo(const int &bulletNum, const Bullet* bullets)
{
	BulletList bl;
	bl.resize(bulletNum);
	for (int i = 0; i < bulletNum; ++ i)
	{
		bl[i].x = bullets[i].x;
		bl[i].y = bullets[i].y;
		bl[i].angle = bullets[i].angle;
		bl[i].restTime = bullets[i].restTime;
		bl[i].radius = bullets[i].radius;
		bl[i].owner = bullets[i].owner;
	}
	return bl;
}

GameMap convertMapInfo(const int &mapN, const int &mapM, const int* right, const int* down)
{
	GameMap ret;
	ret.n = mapN, ret.m = mapM;

	ret.right.resize(mapN - 1);
	for (int i = 0; i + 1 < mapN; ++ i)
		ret.right[i].resize(mapM);
	ret.down.resize(mapN);
	for (int i = 0; i < mapN; ++ i)
		ret.down[i].resize(mapM - 1);

	for (int i = 0; i + 1 < mapN; ++ i)
		for (int j = 0; j < mapM; ++ j)
			ret.right[i][j] = right[i * mapM + j];

	for (int i = 0; i < mapN; ++ i)
		for (int j = 0; j + 1 < mapM; ++ j)
			ret.down[i][j] = down[i * (mapM - 1) + j];

	return ret;
}
