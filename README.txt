#
# author: lopo
# version: 1.0.0
#
# 使用方法 - 修改本机hosts文件并刷新
1. 打开文件资源管理器, 在路径中输入 C:\Windows\System32\drivers\etc 并回车跳转
2. 右键 hosts 文件, 选择打开方式 -- 记事本
3. 打开 github_hosts.txt 将其中的内容全部复制添加到 hosts 中并保存
4. win+r 打开 "运行", 并输入 cmd/powershell 打开控制台
5. 输入 ipconfig /flushdns 刷新 dns 缓存

# 可选
1. 打开搜索, 输入 "环境变量", 点击其中的 "编辑系统环境变量"
2. 弹出的窗口点击 "环境变量" 按钮
3. 在 "用户变量" 或 "系统变量" 中新建变量如下
    -- 变量名: HOST_PATH (!变量名不能取为 HOST, 会导致某些本机程序解析 dns 时冲突, 无法解析 localhost)
    -- 变量值: C:\Windows\System32\drivers\etc
4. 在对应的域中找到Path变量并双击打开 (用户变量中建的 HOST_PATH 就在用户变量中找 Path; 系统变量中建的 HOST_PATH 就在系统
变量中找 Path)
5. 在新的弹窗中点击新建, 输入 %HOST_PATH%
6. 把所有的窗口都确定掉
7. 此时你可以直接在 Explorer 的输入栏中直接输入 %HOST_PATH% 来打开 hosts 文件所在的目录(这一个可选就这点作用, 所以是可选 ^u^! )