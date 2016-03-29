#ifndef KUANGSHUATAIQIANGLE
#define KUANGSHUATAIQIANGLE

#include "AIData.h"

#ifdef __cplusplus
extern "C"
{
#endif

/*
 * ��������ȡ���ָ��ĺ�����ÿ����Ϸ�غϵ���
 * playerNum, bulletNum��ʾ��Һ��ӵ�����Ŀ
 * players, bulletsΪָ�������Ӧ��Ŀ��Player��Bullet�ṹ�������ͷָ��
 * ����Ҫ����һ��ֵ��ʾ��ǰ�غ�����Ҫ������ָ��
 */
__declspec(dllexport) Instruction giveInstruction( \
	const int &playerNum, \
	const Player* players, \
	const int &bulletNum, \
	const Bullet* bullets
);

/*
 * ���õ�ͼ��Ϣ�ĺ�������Ϸ�����³���ʱ����
 * mapN, mapMΪ��ͼ�Ŀ�Ⱥ͸߶ȣ���λΪ��
 * rightָ��һ������Ϊ(mapN-1)*mapM������
 * downָ��һ������ΪmapN*(mapM-1)������
 * �ֱ����ÿ�����ӵ��Ҳ���²��Ƿ���ǽ�ڡ������������е�����ʽΪ��x���кţ�Ϊ��һ�ؼ��֣�y���кţ�Ϊ�ڶ��ؼ��֣����һ�����ӵ��Ҳ�����²��Ǳ߽磬�򲻻ᱻ��¼��right����down��������
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
