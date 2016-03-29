// ConsoleApplication1.cpp : �������̨Ӧ�ó������ڵ㡣
//

#include "stdafx.h"
#include <Windows.h>
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <vector>
#include <cstdarg>
#include <fstream>
#include <io.h>
#include <direct.h>

using std::placeholders::_1;
using std::placeholders::_2;
using std::placeholders::_3;
using std::placeholders::_4;
using namespace sio;
using namespace std;

std::mutex _lock;
std::condition_variable_any _cond;
bool connect_finish = false;
bool IN_DEBUG = false;
bool SAVE_LOG = true;
ofstream logue("log.txt");

class connection_listener
{
	sio::client &handler;

public:

	connection_listener(sio::client& h) :
		handler(h)
	{
	}

	void on_connected()
	{
		_lock.lock();
		_cond.notify_all();
		connect_finish = true;
		_lock.unlock();
	}
	void on_close(client::close_reason const& reason)
	{
		std::cout << "sio closed " << std::endl;
		exit(0);
	}

	void on_fail()
	{
		std::cout << "sio failed " << std::endl;
		exit(0);
	}
};

//C++���Ĵ洢������ֱ�Ӵӷ���˶�ȡ
class GameMap
{
public :
	int n, m;
	vector<vector<int>> right, down;
};
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
//C���Ĵ洢��������AI������
struct PlayerC
{
	double x, y, angle;
	int restBullets;
	char* id;
	PlayerC()
	{
		x = y = angle = 0.0;
		restBullets = 0;
	}
	~PlayerC()
	{
		delete[] id;
	}
};
struct BulletC
{
	char* owner;
	double x, y, angle, restTime, radius;
	BulletC()
	{
		x = y = angle = restTime = radius = 0.0;
	}
	~BulletC()
	{
		delete[] owner;
	}
};
//ָ��
struct Instruction
{
	int MOVE_FORWARD, MOVE_LEFT, MOVE_RIGHT, MOVE_BACK, FIRE;
	Instruction() { MOVE_FORWARD = MOVE_LEFT = MOVE_RIGHT = MOVE_BACK = FIRE = false; }
	Instruction(int MOVE_FORWARD, int MOVE_LEFT, int MOVE_RIGHT, int MOVE_BACK, int FIRE) : \
		MOVE_FORWARD(MOVE_FORWARD), MOVE_LEFT(MOVE_LEFT), MOVE_RIGHT(MOVE_RIGHT), MOVE_BACK(MOVE_BACK), FIRE(FIRE) {}
};

//ת����
void copyPlayerInfo(const Player &a, PlayerC &b)
{
	b.angle = a.angle, b.x = a.x, b.y = a.y, b.restBullets = a.restBullets;
	b.id = new char[a.id.length() + 1];
	strcpy_s(b.id, a.id.length() + 1, a.id.c_str());
}
void copyBulletInfo(const Bullet &a, BulletC &b)
{
	b.angle = a.angle, b.x = a.x, b.y = a.y, b.radius = a.radius, b.restTime = a.restTime;
	b.owner = new char[a.owner.length() + 1];
	strcpy_s(b.owner, a.owner.length() + 1, a.owner.c_str());
}

void _hgwrite() { cout << endl; if (SAVE_LOG) logue << endl; }
template <typename T, typename ... Args>
void _hgwrite(const T& t, Args ... args) { cout << t; if (SAVE_LOG) logue << t; _hgwrite(args...); }

void _sswrite() { /*��Ĭ֮��*/ }
template <typename T, typename ... Args>
void _sswrite(const T& t, Args ... args) { cout << t; if (SAVE_LOG) logue << t; _sswrite(args...); }

void _gwrite() { if (IN_DEBUG) cout << endl; }
template <typename T, typename ... Args>
void _gwrite(const T& t, Args ... args) { cout << t; _gwrite(args...); }

void _swrite() { /*��Ĭ����*/ }
template <typename T, typename ... Args>
void _swrite(const T& t, Args ... args) { cout << t; _swrite(args...); }

//����֮�������������Ļ��������ⳤ�ȵĲ��������ѡ�񱣴�log��д��log���������з���
//���֮�������������Ļ��������ⳤ�ȵĲ��������ѡ�񱣴�log��д��log�����������з���
template <typename... Args>
inline void heart_gold_spray(const Args& ... data) { _hgwrite(data...); }
template <typename... Args>
inline void soul_silver_spray(const Args& ... data) { _sswrite(data...); }

//��ɫ�������������ⳤ�ȵĲ����������з���
//��ɫ�������������ⳤ�ȵĲ������������з���
template <typename... Args>
inline void gold_spray(const Args& ... data) { if (IN_DEBUG) _gwrite(data...); }
template <typename... Args>
inline void silver_spray(const Args& ... data) { if (IN_DEBUG) _swrite(data...); }

//��������������һ�д��ı���Ϣ
void bug_spray(const string &x) { if (IN_DEBUG) cout << x << endl; }

//�����Ϣ��͵�ͼ��Ϣ
map<string, Player> players;
GameMap gm;
vector<Bullet> bullets;
wstring AIName, libName;
string AIName_UTF8;

//����AI�еĺ����ĺ���ָ��
typedef Instruction(*getInstruction)(\
	const int &playerNum, \
	const PlayerC* players, \
	const int &bulletNum, \
	const BulletC* bullets\
);
typedef void(*setGameMap)(\
	const int &mapN, \
	const int &mapM, \
	const int* right, \
	const int* down
);

getInstruction AIInstruction;
setGameMap giveMap;

void read_map(message::ptr const& data)
{
	for (auto i : data->get_map()["map"]->get_map())
	{
		switch (i.first[0])
		{
			case 'm': gm.m = i.second->get_int();  break;
			case 'n': gm.n = i.second->get_int();  break;
		}
	}

	vector<message::ptr> horiwall = data->get_map()["map"]->get_map()["walls"]->get_map()["hori"]->get_vector();
	vector<message::ptr> vertwall = data->get_map()["map"]->get_map()["walls"]->get_map()["vert"]->get_vector();

	//����ͼ�Ĵ洢vector��С�������Դ���ʵ�ʵ�ͼ

	gm.right.resize(gm.n + 10);
	for (int i = 0; i < gm.right.size(); ++ i)
		gm.right[i].resize(gm.m + 10);

	gm.down.resize(gm.n + 10);
	for (int i = 0; i < gm.down.size(); ++ i)
		gm.down[i].resize(gm.m + 10);

	//�����ͼ��Ϣ

	for (int ii = 0; ii + 1 < gm.n; ++ ii)
	{
		for (int jj = 0; jj < gm.m; ++ jj)
		{
			gm.right[ii][jj] = vertwall[ii]->get_vector()[jj]->get_int();
			gold_spray(gm.right[ii][jj], " ");
		}
		gold_spray();
	}
	for (int ii = 0; ii < gm.n; ++ ii)
	{
		for (int jj = 0; jj + 1 < gm.m; ++ jj)
		{
			gm.down[ii][jj] = horiwall[ii]->get_vector()[jj]->get_int();
			gold_spray(gm.down[ii][jj], " ");
		}
		gold_spray();
	}
}

void read_player(message::ptr const& data)
{
	for (auto i : data->get_map()["players"]->get_map())
	{
		//������ҵĻ�����Ϣ
		string nowID = i.second->get_map()["id"]->get_string();
		players[nowID].x = i.second->get_map()["pos"]->get_map()["x"]->get_double();
		players[nowID].y = i.second->get_map()["pos"]->get_map()["y"]->get_double();
		players[nowID].angle = i.second->get_map()["angle"]->get_double();
		players[nowID].restBullets = i.second->get_map()["restBullets"]->get_int();
		players[nowID].id = nowID;
		
		//�������
		gold_spray("[DEBUG] Player Info: {x: ", players[nowID].x, " y: ", players[nowID].y, " angle: ", players[nowID].angle, "ID: ", nowID);
	}
}

void read_bullets(message::ptr const &data)
{
	int cnt = 0;

	//�ӵ��Ĵ洢�ռ��������ǰ�ӵ���
	bullets.resize(data->get_map()["bullets"]->get_vector().size());

	for (auto i : data->get_map()["bullets"]->get_vector())
	{
		//�����ӵ��Ļ�����Ϣ
		bullets[cnt].x = i->get_map()["pos"]->get_map()["x"]->get_double();
		bullets[cnt].y = i->get_map()["pos"]->get_map()["y"]->get_double();
		bullets[cnt].angle = i->get_map()["angle"]->get_double();
		bullets[cnt].restTime = i->get_map()["restTime"]->get_double();
		bullets[cnt].owner = i->get_map()["owner"]->get_string();
		bullets[cnt].radius = i->get_map()["radius"]->get_double();

		++ cnt;
	}
}
void bind_options(sio::socket::ptr &sock)
{
	sock->on("userinfo", sio::socket::event_listener_aux([&](string const& name, message::ptr const& data, bool isAck, message::list &ack_resp)
	{
		_lock.lock();
		bug_spray("[DEBUG] Now here comes the user info!");
		if (data->get_map().find("newplayer") != data->get_map().end())
		{
			string newID = data->get_map()["newplayer"]->get_map()["id"]->get_string();
			heart_gold_spray("[֪ͨ] IDΪ", newID, "������Ѿ�������Ϸ");
		}
		else if (data->get_map().find("playerleave") != data->get_map().end())
		{
			string oldID = data->get_map()["playerleave"]->get_string();
			heart_gold_spray("[֪ͨ] IDΪ", oldID, "������Ѿ��뿪��Ϸ");

			//������Ƴ�map
			players.erase(oldID);
		}
		else bug_spray("[DEBUG] However it is a piece of junk info!");
		_lock.unlock();
	}));
	sock->on("gameinfo", sio::socket::event_listener_aux([&](string const& name, message::ptr const& data, bool isAck, message::list &ack_resp)
	{
		_lock.lock();
		bug_spray("[DEBUG] Now received game info!");
		string gametype = data->get_map()["type"]->get_string();
		gold_spray("[DEBUG] Game Info Type: ", gametype);


		if (gametype == "serverupdate")
		{
			read_player(data);
			read_bullets(data);

			//����Ϣ����ɴ�ͳ�����з���
			PlayerC* playersC = new PlayerC[players.size()];
			BulletC* bulletsC = new BulletC[bullets.size()];

			int cnt = 0;
			for (auto i : players)
				copyPlayerInfo(i.second, playersC[cnt ++]);
			cnt = 0;
			for (auto i : bullets)
				copyBulletInfo(i, bulletsC[cnt ++]);

			//��õ�ǰ��ָ��
			Instruction ins = AIInstruction(players.size(), playersC, bullets.size(), bulletsC);
			
			//ɾ������õ�C�����Ϣ
			delete[] playersC;
			delete[] bulletsC;

			//�����˱����ˤ��ɤ��͡�

			object_message::ptr msgpack = object_message::create();
			object_message::ptr movpack = object_message::create();
			object_message *msgpackptr = (object_message*)msgpack.get();
			object_message *movpackptr = (object_message*)movpack.get();

			bool_message::ptr MTrue = bool_message::create(true);
			bool_message::ptr MFalse = bool_message::create(false);

			if (ins.MOVE_FORWARD) movpackptr->insert("forward", MTrue);
			if (ins.MOVE_LEFT) movpackptr->insert("left", MTrue);
			if (ins.MOVE_RIGHT) movpackptr->insert("right", MTrue);
			if (ins.MOVE_BACK) movpackptr->insert("back", MTrue);
			if (ins.FIRE) movpackptr->insert("fire", MTrue);

			msgpackptr->insert("type", "move");
			msgpackptr->insert("move", movpack);

			sock->emit("message", msgpack);
		}
		else if (gametype == "waitforuser")
		{
			heart_gold_spray("[֪ͨ] ��ǰ���ȴ�������ҽ�����Ϸ�����������ֹ");
		}
		else if (gametype == "startscene")
		{
			//�յ��³�����������

			//���ɤ��͡�

			object_message::ptr msgpack = object_message::create();
			object_message::ptr reqpack = object_message::create();
			object_message *msgpackptr = (object_message*)msgpack.get();
			object_message *reqpackptr = (object_message*)reqpack.get();

			reqpackptr->insert("type", "new_scene");

			msgpackptr->insert("type", "req");
			msgpackptr->insert("req", reqpack);

			sock->emit("message", msgpack);
			_cond.notify_all();

			heart_gold_spray("[֪ͨ] ��Ϸ�ѽ����³�����");
		}
		else if (gametype == "newscene")
		{
			read_map(data);
			read_player(data);

			//�½�һ��C���ĵ�ͼ��Ϣ�洢��
			int *right = new int[(gm.n - 1) * gm.m];
			int *down = new int[gm.n * (gm.m - 1)];

			for (int i = 0; i + 1 < gm.n; ++ i)
				for (int j = 0; j < gm.m; ++ j)
					right[i * gm.m + j] = gm.right[i][j];
			for (int i = 0; i < gm.n; ++ i)
				for (int j = 0; j + 1 < gm.m; ++ j)
					down[i * (gm.m - 1) + j] = gm.down[i][j];

			//�ѵ�ͼ��Ϣ����AI
			giveMap(gm.n, gm.m, right, down);

			//�ӵ�����
			delete[] right;
			delete[] down;
		}

		_lock.unlock();
	}));
}

//���ӵ�AI
bool linkAI()
{
	HINSTANCE hDLL = LoadLibrary(libName.c_str());
	if (hDLL)
	{
		AIInstruction = (getInstruction)GetProcAddress(hDLL, "giveInstruction");
		giveMap = (setGameMap)GetProcAddress(hDLL, "setMapInfo");
		if (AIInstruction && giveMap)
			return true;
		else heart_gold_spray("[֪ͨ] Ѱ�Һ�����ַʧ�ܣ�");
	}
	else heart_gold_spray("[֪ͨ] DLL�ļ�����ʧ�ܣ�");
	return false;
}

void utf8ToUnicode(const std::string& src, std::wstring& result)
{
	int n = MultiByteToWideChar(CP_UTF8, 0, src.c_str(), -1, NULL, 0);
	result.resize(n);
	::MultiByteToWideChar(CP_UTF8, 0, src.c_str(), -1, (LPWSTR)result.c_str(), result.length());
}

void unicodeToUTF8(const std::wstring &src, std::string& result)
{
	int n = WideCharToMultiByte(CP_UTF8, 0, src.c_str(), -1, 0, 0, 0, 0);
	result.resize(n);
	::WideCharToMultiByte(CP_UTF8, 0, src.c_str(), -1, (char*)result.c_str(), result.length(), 0, 0);
}

int _tmain(int argc, _TCHAR* argv[])
{
	_TCHAR tbuff[255];
	char buff[255];
	_getcwd(buff, 255);
	MultiByteToWideChar(CP_ACP, 0, buff, -1, tbuff, 255);

	wstring ws = tbuff;
	ws += _T("\\profile.ini");

	if (_access("profile.ini", 0) == -1)
	{
		WritePrivateProfileString(_T("AILinker"), _T("Name"), _T("����������Ĳ���"), ws.c_str());
		WritePrivateProfileString(_T("AILinker"), _T("AI File Name"), _T("sample.dll"), ws.c_str());
		WritePrivateProfileString(_T("AILinker"), _T("Save Log"), _T("1"), ws.c_str());
	}
	//���������ļ�
	_TCHAR ttbuff[30];
	GetPrivateProfileString(_T("AILinker"), _T("Name"), _T("AI_Linker"), ttbuff, 30, ws.c_str());
	AIName = ttbuff;
	GetPrivateProfileString(_T("AILinker"), _T("AI File Name"), _T("sample.dll"), ttbuff, 30, ws.c_str());
	libName = ttbuff;
	SAVE_LOG = GetPrivateProfileInt(_T("AILinker"), _T("Save Log"), false, ws.c_str());

	unicodeToUTF8(AIName, AIName_UTF8);

	//������AI
	if (!linkAI())
	{
		heart_gold_spray("[֪ͨ] AI����ʧ�ܣ���������ֹ");
		exit(1);
	}
	else heart_gold_spray("[֪ͨ] AI���ӳɹ���");
	sio::client h;
	connection_listener l(h);

	h.set_open_listener(std::bind(&connection_listener::on_connected, &l));
	h.set_close_listener(std::bind(&connection_listener::on_close, &l, std::placeholders::_1));
	h.set_fail_listener(std::bind(&connection_listener::on_fail, &l));

	//���ӵ�������
	h.connect("http://121.42.201.137:5000/");
	//�ȴ���������ټ���
	_lock.lock();
	if (!connect_finish)
	{
		_cond.wait(_lock);
	}
	_lock.unlock();

	h.socket()->on("onconnected", sio::socket::event_listener_aux([&](string const& name, message::ptr const& data, bool isAck, message::list &ack_resp)
	{
		heart_gold_spray("[֪ͨ] �ɹ����������������û�ID��", data->get_map()["id"]->get_string());

		h.socket()->off("onconnected");
	}));

	socket::ptr cur_sock = h.socket();
	bind_options(cur_sock);

	int_message::ptr tmp_int_msg = int_message::create(0);
	string_message::ptr tmp_str_msg = string_message::create(AIName_UTF8);

	object_message::ptr nicknamepack = object_message::create();
	object_message *nnp = (object_message*)nicknamepack.get();

	object_message::ptr reqpack = object_message::create();
	object_message *rp = (object_message*)reqpack.get();

	rp->insert("type", "join_game");
	rp->insert("nickname", tmp_str_msg);
	
	nnp->insert("type", "req");
	nnp->insert("req", reqpack);

	//��������
	h.socket()->emit("message", nicknamepack);

	system("pause");
	return 0;
}