#include <bits/stdc++.h>
#include "AILinker.h"
#include "STLConverter.h"
using namespace std;

Instruction giveInstruction( \
		const int &playerNum, \
		const Player* players, \
		const int &bulletNum, \
		const Bullet* bullets
	)
{

	PlayerMap pm = convertPlayerInfo(playerNum, players);
	BulletList bl = convertBulletInfo(bulletNum, bullets);

	FILE *f = fopen("D:\\info.txt", "w");
	fprintf(f, "%d %d\n", playerNum, bulletNum);
	for (int i = 0; i < playerNum; ++ i)
		fprintf(f, "%lf %lf %lf %d %s\n", players[i].x, players[i].y, players[i].angle, players[i].restBullets, players[i].id);
	for (int i = 0; i < bulletNum; ++ i)
		fprintf(f, "%lf %lf %lf %lf %lf %s\n", bullets[i].x, bullets[i].y, bullets[i].angle, bullets[i].restTime, bullets[i].radius, bullets[i].owner);

	for (auto i : pm)
	{
		fprintf(f, "%lf %lf %lf %d %s\n", i.second.x, i.second.y, i.second.angle, i.second.restBullets, i.second.id.c_str());
	}

	for (auto i : bl)
	{
		fprintf(f, "%lf %lf %lf %lf %lf %s\n", i.x, i.y, i.angle, i.restTime, i.radius, i.owner.c_str());
	}
	fclose(f);
	return Instruction(0, 0, 1, 0, 1);
}

void setMapInfo( \
		const int &mapN, \
		const int &mapM, \
		const int* right, \
		const int* down
	)
{
	FILE *f = fopen("D:\\mapinfo.txt", "w");
	fprintf(f, "%d %d\n", mapN, mapM);
	for (int j = 0; j + 1 < mapM; ++ j)
	{
		for (int i = 0; i < mapN; ++ i)
			fprintf(f, "%d ", down[i * (mapM - 1) + j]);
		fprintf(f, "\n");
	}
	for (int j = 0; j < mapM; ++ j)
	{
		for (int i = 0; i + 1 < mapN; ++ i)
			fprintf(f, "%d ", right[i * mapM + j]);
		fprintf(f, "\n");
	}

	GameMap gm = convertMapInfo(mapN, mapM, right, down);
	fprintf(f, "%d %d\n", gm.n, gm.m);
	for (int j = 0; j + 1 < mapM; ++ j)
	{
		for (int i = 0; i < mapN; ++ i)
			fprintf(f, "%d ", gm.down[i][j]);
		fprintf(f, "\n");
	}
	for (int j = 0; j < mapM; ++ j)
	{
		for (int i = 0; i + 1 < mapN; ++ i)
			fprintf(f, "%d ", gm.right[i][j]);
		fprintf(f, "\n");
	}

	fclose(f);
}

