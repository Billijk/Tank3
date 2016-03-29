#ifndef KUANGSHUATAIQIANGLE
#define KUANGSHUATAIQIANGLE

#include "AIData.h"

#ifdef __cplusplus
extern "C"
{
#endif

/*
 * 链接器获取你的指令的函数，每个游戏回合调用
 * playerNum, bulletNum表示玩家和子弹的数目
 * players, bullets为指向包含相应数目的Player和Bullet结构体的数组头指针
 * 你需要返回一个值表示当前回合所需要作出的指令
 */
__declspec(dllexport) Instruction giveInstruction( \
	const int &playerNum, \
	const Player* players, \
	const int &bulletNum, \
	const Bullet* bullets
);

/*
 * 设置地图信息的函数，游戏进入新场景时调用
 * mapN, mapM为地图的宽度和高度，单位为格
 * right指向一个长度为(mapN-1)*mapM的数组
 * down指向一个长度为mapN*(mapM-1)的数组
 * 分别代表每个格子的右侧和下侧是否有墙壁。格子在数组中的排序方式为按x（列号）为第一关键字，y（行号）为第二关键字；如果一个格子的右侧或者下侧是边界，则不会被记录在right或者down数组里面
 */
__declspec(dllexport) void setMapInfo( \
	const int &mapN, \
	const int &mapM, \
	const int* right, \
	const int* down
);

#ifdef __cplusplus
}
#endif

#endif
