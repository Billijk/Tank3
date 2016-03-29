Tank3 AI 开发工具包

一、综述

Tank 3 AI Linker是一个可用自定义AI和其他AI或者玩家进行Tank 3游戏的工具。
此工具包用于编写Tank 3 AI Linker所支持的AI程序。

二、使用说明

如果你使用C/C++语言：

请在源码中包括AILinker.h，然后按照要求定义其中的两个导出函数即可。
注：如果你是C++用户并且不习惯使用C风格的数据存储格式，可以在源码中包括STLConverter.h，并在编译时加入STLConverter.lib库。该静态库中包含三个能将Tank 3 AI Linker发送的C风格的数据转换成C++的STL存储。
注2：虽然STLConverter.lib的后缀名是.lib但事实上它是用MinGW编译生成的（对应linux下的.a文件），因此如果要使用该静态库请确保你使用MinGW编译器并且版本不低于4.8.1。

如果你使用其他语言：

请确保你的编译器能够直接生成Windows动态链接库。并且保持函数的导出名称与参数格式与AILinker.h中定义的一致。
如果你不能看懂C语言中的定义语法，或者不知道C语言中各类型的存储格式以及如何转换成你使用的语言中的类型，建议google搜索。

三、使用方法

将程序编译为含有指定的两个导出函数，并且导出函数格式正确的dll文件后即可使用。具体使用方法参见Tank 3 AI Linker的说明。
Tank 3 AI Linker将隐式调用你所编写的动态链接库，因此你将无需生成.def，.a,.lib等文件
