## MapReduce 实验 

① 实验前的数据准备
输入fileA的样例如下：

|                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------- |
| 20150101     x<br><br>20150102     y<br><br>20150103     x<br><br>20150104     y<br><br>20150105     z<br><br>20150106     x |

输入文件B的样例如下：

|                                                                                                             |
| ----------------------------------------------------------------------------------------------------------- |
| 20150101      y<br><br>20150102      y<br><br>20150103      x<br><br>20150104      z<br><br>20150105      y |


---

## ① 两文件合并并去重

* 思路：Mapper 逐行读取任一输入文件，把整行作为 key 输出；Reducer 对相同 key 只输出一次，达到去重合并效果。

* mapper (`merge_mapper.py`)：

```python
#!/usr/bin/env python3
import sys
for line in sys.stdin:
    line = line.strip()
    if line:
        print(f"{line}\t1")
```

* reducer (`merge_reducer.py`)：

```python
#!/usr/bin/env python3
import sys

prev_key = None
for line in sys.stdin:
    key, _ = line.rstrip("\n").split("\t", 1)
    if key != prev_key:
        print(key)
        prev_key = key
```

* 运行命令（Hadoop Streaming）：

```bash
# 上传文件到hdfs
hdfs dfs -mkdir -p /user/maki/merge_input
hdfs dfs -put fileA.txt fileB.txt /user/maki/merge_input/ 

# 计算
hadoop jar $HADOOP_HOME/share/hadoop/tools/lib/hadoop-streaming-*.jar \
  -D mapreduce.job.name="merge_dedup" \
  -input /user/maki/merge_input/* \
  -output /user/maki/output/merge_dedup \
  -mapper merge_mapper.py \
  -reducer merge_reducer.py \
  -file merge_mapper.py \
  -file merge_reducer.py
```

* 结果查看：`hdfs dfs -cat /user/maki/output/merge_dedup/part-*`（HDFS）

---

## ② 多文件整数排序并输出序号（rank）

输入文件one的样例如下：

|                                  |
| -------------------------------- |
| 33<br><br>37<br><br>12<br><br>40 |

输入文件two的样例如下：

|   |
|---|
|4<br><br>16<br><br>39<br><br>5|

输入文件three的样例如下：

|   |
|---|
|1<br><br>45<br><br>25|

* 需求：合并多个文件中的整数（每行一个整数），升序排序后输出 `rank value`（rank 从 1 开始）。

* 实现思路：使用 **单个 reducer**（`-D mapreduce.job.reduces=1`），mapper 将每个整数作为 key 输出，Hadoop 在 reducer 处会按 key 排序（lexicographic->需确保数值排序：把 key 转为定长或使用数值排序）。

* mapper (`sort_mapper.py`)：

```python
#!/usr/bin/env python3
import sys
for line in sys.stdin:
    s = line.strip()
    if s:
        try:
            v = int(s)
            print(v)
        except:
            continue
```

* reducer (`sort_reducer.py`)：在单 reducer 中收集所有整数、排序、再输出带 rank 的行

```python
#!/usr/bin/env python3
import sys

nums = []
for line in sys.stdin:
    try:
        nums.append(int(line.strip()))
    except:
        continue

nums.sort()
rank = 1
for n in nums:
    print(f"{rank} {n}")
    rank += 1
```

* 运行命令（注意 `-D mapreduce.job.reduces=1` 强制单 reducer）：

```bash
# 上传文件到hdfs
hdfs dfs -mkdir -p /user/maki/sort_input
hdfs dfs -put ints1.txt ints2.txt ints3.txt /user/maki/sort_input/

# 计算
hadoop jar $HADOOP_HOME/share/hadoop/tools/lib/hadoop-streaming-*.jar \
  -D mapreduce.job.name="global_sort_rank" \
  -D mapreduce.job.reduces=1 \
  -input /user/maki/sort_input/* \
  -output /user/maki/output/sort_rank \
  -mapper sort_mapper.py \
  -reducer sort_reducer.py \
  -file sort_mapper.py \
  -file sort_reducer.py
```


---

## ③ 从 child-parent 表挖掘祖孙（grandchild-grandparent）

child_parent

child          parent

Steven        Lucy

Steven        Jack

Jone         Lucy

Jone         Jack

Lucy         Mary

Lucy         Frank

Jack         Alice

Jack         Jesse

David       Alice

David       Jesse

Philip       David

Philip       Alma

Mark       David

Mark       Alma

* 思路：针对每条 (child, parent) 记录，mapper 为可能的“中间人” M 发两个标记：

  * emit key = parent, value = `CHILD:<child>`（表示 M 的子）
  * emit key = child,  value = `PARENT:<parent>`（表示 M 的父）
    在 reducer 中，针对中间人 M，将所有 CHILD 列表与 PARENT 列表笛卡尔组合，输出 (grandchild, grandparent)。

* mapper (`gp_mapper.py`)：

```python
#!/usr/bin/env python3
import sys

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    # 假设列由空白分隔 child parent
    parts = line.split()
    if len(parts) < 2:
        continue
    child = parts[0]
    parent = parts[1]
    # 输出两条记录，key 为“中间人”
    print(f"{parent}\tCHILD:{child}")
    print(f"{child}\tPARENT:{parent}")
```

* reducer (`gp_reducer.py`)：

```python
#!/usr/bin/env python3
import sys

current = None
children = []
parents = []

def emit_pairs():
    for c in children:
        for p in parents:
            print(f"{c}\t{p}")

for line in sys.stdin:
    key, val = line.rstrip("\n").split("\t", 1)
    if current is None:
        current = key

    if key != current:
        # process previous
        emit_pairs()
        # reset
        children = []
        parents = []
        current = key

    if val.startswith("CHILD:"):
        children.append(val[len("CHILD:"):])
    elif val.startswith("PARENT:"):
        parents.append(val[len("PARENT:"):])

# final
if current is not None:
    emit_pairs()
```

* 说明：输入文件 `child_parent.txt` 应只包含实际 pairs（若包含表头 `child parent` 请先删除或在 mapper 中跳过）。
* 运行命令：

```bash
hdfs dfs -mkdir -p /user/maki/gp_input
hdfs dfs -put child_parent.txt /user/maki/gp_input/

hadoop jar $HADOOP_HOME/share/hadoop/tools/lib/hadoop-streaming-*.jar \
  -D mapreduce.job.name="grandparent_extraction" \
  -input /user/maki/gp_input/* \
  -output /user/maki/output/grandparent \
  -mapper gp_mapper.py \
  -reducer gp_reducer.py \
  -file gp_mapper.py \
  -file gp_reducer.py
```

* 输出示例（将得到 `grandchild\tgrandparent` 列表）：

```
Steven  Alice
Steven  Jesse
Jone    Alice
Jone    Jesse
Steven  Mary
Steven  Frank
Jone    Mary
Jone    Frank
Philip  Alice
Philip  Jesse
Mark    Alice
Mark    Jesse
```

---