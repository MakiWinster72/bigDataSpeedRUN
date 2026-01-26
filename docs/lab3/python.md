> [!note]  
> 本教程演示如何使用 **Python** 和 **HBase Shell** 对 HBase 进行常用操作，包括列出表、扫描数据、修改列族、清空表以及统计行数。
>
> 请先完成 [伪分布式](../lab1/PseudoDistributed.md) 安装。

> 因为要写 python 程序，可以选择使用 VSCode 远程登录，或者Ubuntu Desktop 的直接在虚拟机安装 VSCode，也可以尝试新的编辑器 Neovim！

### python 环境前置

```bash
# 安装 Python 虚拟环境与 pip（Ubuntu 22.04 及以上必需）
sudo apt install python3-pip python3.12-venv

# 创建并激活虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装 HDFS 操作依赖
pip install hdfs happybase -i https://pypi.tuna.tsinghua.edu.cn/simple
```

① **前置条件**：HBase Thrift Server 已启动

```bash
hbase thrift start
```

② **运行 Python 脚本**：在虚拟环境下执行

```bash
python3 your_script.py
```

---

### ① 列出所有表

```python
import happybase

connection = happybase.Connection('localhost')  # HBase Thrift 地址
connection.open()

tables = connection.tables()
print("Tables:", tables)

connection.close()
```

> **`import happybase`**
> 导入用于操作 HBase 的 Python 库。
>
> **`connection = happybase.Connection('localhost')`**
> 创建与 HBase Thrift 服务的连接对象，`'localhost'` 表示连接本机。
>
> **`connection.open()`**
> 打开与 HBase 的连接通道。
>
> **`tables = connection.tables()`**
> 获取当前 HBase 数据库中的所有表名列表。
>
> **`print("Tables:", tables)`**
> 输出表名列表。
>
> **`connection.close()`**
> 关闭连接，释放网络资源。

**Shell 对应命令**：

```shell
list
```

---

### ② 扫描表中所有记录

```python
import happybase

connection = happybase.Connection('localhost')
connection.open()

table_name = 'mytable'
table = connection.table(table_name)

for key, data in table.scan():
    print("Row:", key.decode())
    for k, v in data.items():
        print(f"Column: {k.decode()}, Value: {v.decode()}")

connection.close()
```

> **`connection = happybase.Connection('localhost')`**
> 创建与本地 HBase Thrift 服务的连接对象。
>
> **`connection.open()`**
> 打开连接，准备进行数据操作。
>
> **`table_name = 'mytable'`**
> 指定要访问的表名为 `mytable`。
>
> **`table = connection.table(table_name)`**
> 获取名为 `mytable` 的表对象。
>
> **`for key, data in table.scan():`**
> 扫描整张表，逐行返回行键（_row key_）和对应的数据字典。
>
> **`print("Row:", key.decode())`**
> 输出当前行的行键（字节类型需解码为字符串）。
>
> **`for k, v in data.items():`**
> 遍历该行的所有列及其值。
>
> **`print(f"Column: {k.decode()}, Value: {v.decode()}")`**
> 输出每个列名与对应的值（同样需要解码）。

**Shell 对应命令**：

```shell
scan 'mytable'
```

---

### ③ 添加/删除列族

```python
import happybase

connection = happybase.Connection('localhost')
connection.open()
admin = connection

table_name = 'mytable'

# 添加列族
admin.create_table(table_name, {'newcf': dict()})

# 删除列族
admin.delete_table(table_name, disable=True)

connection.close()
```

> **`connection = happybase.Connection('localhost')`**
> 创建与本地 HBase Thrift 服务的连接对象。
>
> **`connection.open()`**
> 打开连接，准备执行管理操作。
>
> **`admin = connection`**
> 将连接对象赋给变量 `admin`，方便后续作为管理员操作。
>
> **`table_name = 'mytable'`**
> 指定目标表名为 `mytable`。
>
> **`admin.create_table(table_name, {'newcf': dict()})`**
> 创建一张名为 `mytable` 的新表，并定义一个列族（_column family_）`newcf`。
>
> **`admin.delete_table(table_name, disable=True)`**
> 删除表 `mytable`。
> 参数 `disable=True` 表示在删除前会先禁用（_disable_）该表。
> ⚠️ 注意：`happybase` 不支持单独删除列族，只能通过删除整张表来实现。

**Shell 对应命令**：

```shell
alter 'mytable', 'newcf'
alter 'mytable', 'delete', 'oldcf'
```

---

### ④ 清空表数据

```python
import happybase

connection = happybase.Connection('localhost')
connection.open()

table = connection.table('mytable')
for key, _ in table.scan():
    table.delete(key)

connection.close()
```

> **`connection = happybase.Connection('localhost')`**
> 创建与本地 HBase Thrift 服务的连接对象。
>
> **`connection.open()`**
> 打开连接，准备执行数据操作。
>
> **`table = connection.table('mytable')`**
> 获取名为 `mytable` 的表对象，用于后续操作。
>
> **`for key, _ in table.scan():`**
> 扫描整张表，逐行返回行键（`key`）和值（此处 `_` 表示忽略值）。
>
> **`table.delete(key)`**
> 根据行键删除对应的整行数据，实现清空表内容的效果。

**Shell 对应命令**：

```shell
truncate 'mytable'
```

---

### ⑤ 统计表行数

```python
import happybase

connection = happybase.Connection('localhost')
connection.open()

table = connection.table('mytable')
count = sum(1 for _ in table.scan())

print("Total rows:", count)
connection.close()
```

> **`connection = happybase.Connection('localhost')`**
> 创建与本地 HBase Thrift 服务的连接对象。
>
> **`connection.open()`**
> 打开连接，准备执行查询操作。
>
> **`table = connection.table('mytable')`**
> 获取名为 `mytable` 的表对象。
>
> **`count = sum(1 for _ in table.scan())`**
> 扫描整张表，通过遍历统计行数：
> 每扫描到一行就累加 `1`，最终得到总行数。
>
> **`print("Total rows:", count)`**
> 输出表中的总行数。

**Shell 对应命令**：

```shell
count 'mytable'
```

---

### 🔹 总结

| 功能          | Python 实现                    | HBase Shell       |
| ------------- | ------------------------------ | ----------------- |
| 列出表        | `connection.tables()`          | `list`            |
| 扫描表        | `table.scan()`                 | `scan 'mytable'`  |
| 添加/删除列族 | `create_table/delete_table`    | `alter`           |
| 清空表        | `table.delete()`               | `truncate`        |
| 统计行数      | `sum(1 for _ in table.scan())` | `count 'mytable'` |

Python 版本通过 `happybase` 可以快速实现大部分 HBase 操作，但对列族的单独增删需要依赖 Java API 或 HBase Shell。
