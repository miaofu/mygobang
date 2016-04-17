# Mybanggo
use Nerual Network Based AI to Play with Human or Rule-based-AI, Learning with Genetic Algorithm (基于神经网络学习五子棋，使用进化算法训练神经网络)
这个项目mygobang的想法是找到一个基于规则的AI或者人类，与一个基于神经网络的AI进行五子棋的对抗，利用进化算法的思想，不断训练基于神经网络的ＡＩ的表现效果。用神经网络学习超级马里奥游戏（http://chuansong.me/n/1997511）。不过遗传算法并没有找到效率高的训练方式。
运行myindex.html（runtime:1min）。可以查看每一代每一个AI与基于规则的棋局对抗结果。
运行test_human2AI.html。可以与基于规则的AI对抗。
代码说明：
              ：underscore-min.js，gobang-ai-fast.js，完成了定义基于规则的AI, 是github上的开源代码。
              ：convnet.js 是著名的convnetjs项目的代码，可以github上免费下载。
              ：mygobang.js是主程序，gobang_nn_ai.js定义了神经网络AI以及进化训练算法。  
