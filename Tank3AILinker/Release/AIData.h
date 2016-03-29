#ifndef KUANGSHUAZUIQIANG
#define KUANGSHUAZUIQIANG

/*
 * �洢�����Ϣ
 * x,y�������꣬����ԭ�������Ͻǣ�x�����ң�y�����£���λΪ��
 * angle�����ڹܵ�ƫ�ǣ��Ի��ȱ�ʾ�����·�Ϊ0��˳ʱ��Ϊ������
 * angle���ܻᳬ��2�л���С��0
 * restBullets������һ��ܷ������ӵ�
 * idΪΨһ��ʶ�ַ���
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
 * �洢�ӵ���Ϣ
 * owner�����ӵ������˵�id
 * x,y,angle��ʽ�������ͬ��angleΪ�ӵ����ٶȷ���
 * restTime�����ӵ�ʣ�����ʱ�䣬��λΪ֡
 * radius�����ӵ��İ뾶����λΪ��
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
 * ָ����Ϣ
 * ���ֵ��0Ϊ��1Ϊ�ǣ������������δ����Ƿ���ǰ�������ת�ڹܣ���ת�ڹܣ�����/ʹ�õ���
 */
struct Instruction
{
	int MOVE_FORWARD, MOVE_LEFT, MOVE_RIGHT, MOVE_BACK, FIRE;
	Instruction() { MOVE_FORWARD = MOVE_LEFT = MOVE_RIGHT = MOVE_BACK = FIRE = 0; }
	Instruction(int MOVE_FORWARD, int MOVE_LEFT, int MOVE_RIGHT, int MOVE_BACK, int FIRE) : \
		MOVE_FORWARD(MOVE_FORWARD), MOVE_LEFT(MOVE_LEFT), MOVE_RIGHT(MOVE_RIGHT), MOVE_BACK(MOVE_BACK), FIRE(FIRE) {}
};

#endif
