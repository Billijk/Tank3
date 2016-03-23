#include <bits/stdc++.h>
using namespace std;

/*
 * ��ǰ�����ĵ�ͼ��Ϣ
 * n����������m��������
 * right��ʵ�ʴ�СΪn*(m-1), right[i][j]�����i�е�j�еĸ����Ҳ��Ƿ���ǽ��
 * down��ʵ�ʴ�СΪ(n-1)*m, down[i][j]�����i�е�j�еĸ��ӵ��²��Ƿ���ǽ��
 * ����յ�right��down�Ĵ�С���Դ�������ʵ��ֵ������Ϊ�˷�ֹ�����Խ�絼�³��������
 * ��Щ��Χ֮������ݲ������κ���Ч��Ϣ��
 */
class GameMap
{
public :
	int n, m;
	vector<vector<int>> right, down;
};

/*
 * ÿһ����ҵ���Ϣ
 * x��y�������꣬��λΪ��ע�ⶼ��ʵ����ʾ��
 * ����Ϊ(x,y)����ҵ�ʵ��λ��Ϊ���ͼ���Եx�񣬾��ͼ�ϱ�Եy��
 * angle�����ڹܵ�ת�ǣ��Ի���Ϊ��λ�����ҷ���Ϊ��ת��㣬˳ʱ��Ϊ��ת������
 * * * ע�� * * *���ڹܵ�ת�ǵ�ȡֵ��ΧΪȫ��ʵ������������[ 0, 2��]�������Ӧ��
 * ���н���ת��Ϊ�����Χ�ڵ�ֵ�Է���ȷ���ڹܵ�ʵ�ʷ���
 * restBullets�������ʣ����ӵ���
 * id��Ψһ��ʶ�ַ���
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
 * �ӵ�����Ϣ
 * owner�Ƿ�������ӵ�����ҵ�Ψһ��ʶ�ַ���
 * xy�������꣬��ʽ����ҵ���ͬ��angle���ӵ��ٶ������ķ��ǣ���ʽ�������ͬ��
 * restTime�����ӵ���ʣ�����ʱ��, ��֡Ϊ��λ
 * radius�����ӵ��İ뾶���Ը�Ϊ��λ
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
 * ָ����
 * �⽫���㷵�ظ����ӳ������Ϣ
 * MOVE_FORWARD������һ����ǰ�ߵ�ָ��
 * MOVE_LEFT������һ������ת���ڹܵ�ָ��
 * MOVE_RIGHT������һ������ת���ڹܵ�ָ��
 * MOVE_BACK������һ������˵�ָ��
 * FIRE������һ�������ӵ���ָ��
 * ������Ӧָ�������Ϊ��ʱ���غϽ����͸�ָ��
 * �йظ�ָ�����ϸ��Ϣ����ϸ�Ķ���Ϸ˵���ĵ�
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
 * ��������������Ҫ��д�ĺ���
 * ע�⣺���в�����Ϊconst���ԣ�����㽫���ܶ����ǽ���д�������
 *       �����޸ĺ����Ķ�����ʽ������������������ֵ���ͣ����������������ͣ�����˳��
 *       ����Ҫ��ɵ�ֻ����Ӻ����岢��������������ֵ
 */

/*
 * ����д���������ʵ�ֶ���Ϸ��̹�˵Ĳ���
 * ���ӳ���ÿ���յ�����������ʱ��������������ѯ�����ָ��
 *
 * ���Ĳ������Ƿ��������������Ϣ
 * playerInfo��һ��map������һ������ҵ�Ψһ��ʶ�ַ������洢�����Ϣ��������ӳ���
 * ����ĳ��ҵ�Ψһ��ʶ�ַ���Ϊksq���������ͨ��playerinfo["ksq"]���õ��洢�������Ϣ�������
 * bulletInfo��һ���洢�и��ӵ���Ϣ�ı�ÿһ��Ϊһ���ӵ��ࡣ
 * ������������������κζ������Ϣ��
 *
 * ���ӳ����յ��ú����ķ���ֵʱ���Ὣ�����͵�����ˣ��Ӷ�������Ӧ����
 * ָ��ĸ�ʽ��ǰ������
 */
Instruction giveInstruction( \
		const map<string, Player> &playerInfo, \
		const vector<Bullet> &bulletInfo \
	)
{
	return Instruction(0, 0, 1, 1, 1);
}

/*
 * �³�����ʼ֮ǰ���ӳ��򽫻�����������
 * �㽫�ܴӲ����еõ���������ͼ����Ϣ������ҵĳ�ʼ��Ϣ
 * ��ͼ��Ϣ�Ĵ洢��ʽ����ͼ���˵���������Ϣ�Ĵ洢��ʽ���ϸ���������ͬ
 * ����д��������Ա�����Щ��Ϣ����������Ӧ�ĳ�ʼ������
 */
void setMapInfo( \
		const GameMap &mapInfo, \
		const map<string, Player> &playerInfo \
	)
{
}


