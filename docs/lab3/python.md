[hbaseInstall](hbaseInstall.md)

python环境前置
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
admin.delete_table(table_name, disable=True)  # 注意：happybase不支持单独删除列族，只能删除表

connection.close()
```

**Shell 对应命令**：

```shell
alter 'mytable', 'newcf'
alter 'mytable', 'delete', 'oldcf'
```

> **注意**：HappyBase 只能创建/删除整张表，单独增删列族需用 HBase shell 或 Java API。

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

**Shell 对应命令**：

```shell
count 'mytable'
```

---

### 🔹 总结

| 功能      | Python 实现                      | HBase Shell       |
| ------- | ------------------------------ | ----------------- |
| 列出表     | `connection.tables()`          | `list`            |
| 扫描表     | `table.scan()`                 | `scan 'mytable'`  |
| 添加/删除列族 | `create_table/delete_table`    | `alter`           |
| 清空表     | `table.delete()`               | `truncate`        |
| 统计行数    | `sum(1 for _ in table.scan())` | `count 'mytable'` |

Python 版本通过 `happybase` 可以快速实现大部分 HBase 操作，但对列族的单独增删需要依赖 Java API 或 HBase Shell。
