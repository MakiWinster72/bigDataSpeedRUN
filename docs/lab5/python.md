# MapReduce

## 实验目的

1.通过实验掌握基本的 MapReduce 编程方法；

2.掌握用 MapReduce 解决一些常见的数据处理问题，包括数据去重、数据排序和数据挖掘等。

## ① 两文件合并并去重

对于两个输入文件，即文件 A 和文件 B，请编写 MapReduce 程序，对两个文件进行合并，并剔除其中重复的内容，得到一个新的输出文件 C。下面是输入文件和输出文件的一个样例供参考。

> 思路：Mapper 逐行读取任一输入文件，把整行作为 key 输出；Reducer 对相同 key 只输出一次，达到去重合并效果。

### fileA

```
20150101 x
20150102 y
20150103 x
20150104 y
20150105 z
20150106 x
```

---

### fileB

```
20150101 y
20150102 y
20150103 x
20150104 z
20150105 y
```

### 上传文件

```bash
hdfs dfs -mkdir -p /user/hadoop/merge_input
hdfs dfs -put fileA fileB /user/hadoop/merge_input/
hdfs dfs -ls /user/hadoop/merge_input
```

### mapper (`merge_mapper.py`)

```python
#!/usr/bin/env python3
import sys
for line in sys.stdin:
    line = line.strip()
    if line:
        print(f"{line}\t1")
```

从标准输入读取文本，每行输出 `<内容>\t1`，用于统计每个元素出现次数。

> **`for line in sys.stdin:`**  
> 从标准输入（_standard input_）逐行读取数据。  
> 常用于管道处理或重定向文件输入，例如：
>
> ```bash
> cat file.txt | python3 script.py
> ```
>
> **`line = line.strip()`**  
> 去掉每行字符串开头和结尾的空白字符（包括空格、换行符等）。  
> **`if line:`**  
> 判断该行是否非空，空行会被跳过。  
> **`print(f"{line}\t1")`**  
> 打印格式化的字符串，将原始内容和数字 `1` 用制表符 (`\t`) 分隔。

### reducer (`merge_reducer.py`)

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

从标准输入读取文本，每行输出 `<内容>`，达到去重效果。

> **`prev_key = None`**  
> 初始化一个变量，用于记录前一行的 key。  
> **`for line in sys.stdin:`**  
> 从标准输入（_standard input_）逐行读取数据。  
> **`key, _ = line.rstrip("\n").split("\t", 1)`**  
> `line.rstrip("\n")` 去掉每行末尾的换行符。  
> `split("\t", 1)` 将每行按第一个制表符 (`\t`) 分成两部分，左边赋值给 `key`，右边赋值给 `_`（不使用的部分）。  
> **`if key != prev_key:`**  
> 判断当前 key 是否与前一行的 key 不同，用于去重连续重复的 key，只输出第一次出现的 key。  
> **`prev_key = key`**  
> 更新 `prev_key` 为当前 key，为下一轮循环做比较。

### 运行命令（Hadoop Streaming）

```bash
# 上传文件到hdfs
hdfs dfs -mkdir -p /user/hadoop/merge_input
hdfs dfs -put fileA.txt fileB.txt /user/hadoop/merge_input/

# 计算
hadoop jar $HADOOP_HOME/share/hadoop/tools/lib/hadoop-streaming-*.jar \
  -D mapreduce.job.name="merge_dedup" \
  -input /user/hadoop/merge_input/* \
  -output /user/hadoop/output/merge_dedup \
  -mapper merge_mapper.py \
  -reducer merge_reducer.py \
  -file merge_mapper.py \
  -file merge_reducer.py
```

- 结果查看：`hdfs dfs -cat /user/hadoop/output/merge_dedup/part-*`
  ![](https://img.makis-life.cn/images/20251210050727832.png?x-oss-process=style/yasuo)

---

## ② 多文件整数排序并输出序号（rank）

现在有多个输入文件，每个文件中的每行内容均为一个整数。要求读取所有文件中的整数，进行升序排序后，输出到一个新的文件中，输出的数据格式为每行两个整数，第一个数字为第二个整数的排序位次，第二个整数为原待排列的整数。下面是输入文件和输出文件的一个样例供参考。

> - 需求：合并多个文件中的整数（每行一个整数），升序排序后输出 `rank value`（rank 从 1 开始）。
> - 实现思路：使用 **单个 reducer**（`-D mapreduce.job.reduces=1`），mapper 将每个整数作为 key 输出，Hadoop 在 reducer 处会按 key 排序（lexicographic->需确保数值排序：把 key 转为定长或使用数值排序）。

### 准备数据文件

#### 文件 one

```
33
37
12
40
```

---

#### 文件 two

```
4
16
39
5
```

---

#### 文件 three

```
1
45
25
```

### 上传文件

#### 创建 HDFS 输入目录

```bash
hdfs dfs -mkdir -p /user/hadoop/sort_input
```

#### 上传三个文件

```bash
hdfs dfs -put one two three /user/hadoop/sort_input/
```

### mapper (`sort_mapper.py`)

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

> **`for line in sys.stdin:`**  
> 从标准输入（_standard input_）逐行读取数据。  
> **`s = line.strip()`**  
> 去掉每行开头和结尾的空白字符，包括空格、换行符等。  
> **`if s:`**  
> 判断该行是否非空，空行会被跳过。  
> **`v = int(s)`**  
> 将字符串 `s` 转换为整数，如果无法转换会抛出异常。

### reducer (`sort_reducer.py`)

在单 reducer 中收集所有整数、排序、再输出带 rank 的行

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

> **`nums = []`**  
> 用于存储从标准输入读取的整数。  
> **`for line in sys.stdin:`**  
> 从标准输入逐行读取数据。  
> **`nums.append(int(line.strip()))`**  
> 去掉行首尾空白后，将字符串转换为整数并添加到 `nums` 列表中。  
> **`except:`**  
> 如果某行不是数字，则跳过。  
> **`nums.sort()`**  
> 对列表 `nums` 中的整数进行升序排序。  
> **`rank = 1`**  
> 初始化排名计数器，从 1 开始。  
> **`for n in nums:`**  
> 遍历排序后的整数列表。  
> **`rank += 1`**  
> 每打印一个数字，排名加 1。

### 运行命令

注意 `-D mapreduce.job.reduces=1` 强制单 reducer：

> Hadoop 会自动将不同 key 分配给多个 reducer 并行处理。
> 每个 reducer 内的排序是局部排序，不保证全局顺序。

```bash
# 上传文件到hdfs
hdfs dfs -mkdir -p /user/hadoop/sort_input
hdfs dfs -put ints1.txt ints2.txt ints3.txt /user/hadoop/sort_input/

# 计算
hadoop jar $HADOOP_HOME/share/hadoop/tools/lib/hadoop-streaming-*.jar \
  -D mapreduce.job.name="global_sort_rank" \
  -D mapreduce.job.reduces=1 \
  -input /user/hadoop/sort_input/* \
  -output /user/hadoop/output/sort_rank \
  -mapper sort_mapper.py \
  -reducer sort_reducer.py \
  -file sort_mapper.py \
  -file sort_reducer.py
```

- 结果查看：`hdfs dfs -cat /user/hadoop/output/sort_rank/part-*`
  ![](https://img.makis-life.cn/images/20251210050637608.png?x-oss-process=style/yasuo)

---

## ③ 从 child-parent 表挖掘祖孙（grandchild-grandparent）

下面给出一个 child-parent 的表格，要求挖掘其中的父子辈关系，给出祖孙辈关系的表格。

```
Steven Lucy
Steven Jack
Jone Lucy
Jone Jack
Lucy Mary
Lucy Frank
Jack Alice
Jack Jesse
David Alice
David Jesse
Philip David
Philip Alma
Mark David
Mark Alma
```

> 思路：针对每条 (child, parent) 记录，mapper 为可能的“中间人” M 发两个标记：
> emit key = parent, value = `CHILD:<child>`（表示 M 的子）
> emit key = child, value = `PARENT:<parent>`（表示 M 的父）
> 在 reducer 中，针对中间人 M，将所有 CHILD 列表与 PARENT 列表笛卡尔组合，输出 (grandchild, grandparent)。

### 上传文件

```bash
# 创建 HDFS 输入目录
hdfs dfs -mkdir -p /user/hadoop/gp_input

# 上传文件
hdfs dfs -put table /user/hadoop/gp_input/

# 检查是否上传成功
hdfs dfs -ls /user/hadoop/gp_input/
```

- 思路：针对每条 (child, parent) 记录，mapper 为可能的“中间人” M 发两个标记：
  - emit key = parent, value = `CHILD:<child>`（表示 M 的子）
  - emit key = child, value = `PARENT:<parent>`（表示 M 的父）
    在 reducer 中，针对中间人 M，将所有 CHILD 列表与 PARENT 列表笛卡尔组合，输出 (grandchild, grandparent)。

#### mapper (`gp_mapper.py`)

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

> **`for line in sys.stdin:`**  
> 从标准输入逐行读取数据。  
> **`line = line.strip()`**  
> 去掉每行开头和结尾的空白字符（包括空格和换行符）。  
> **`if not line:`**  
> 跳过空行。  
> **`parts = line.split()`**  
> 将一行按空白字符分割成若干部分。假设每行格式为 `child parent`。  
> **`if len(parts) < 2:`**  
> 如果行中少于两列，说明格式不完整，跳过。  
> **`child = parts[0]`**  
> 第一列为子节点（child）。  
> **`parent = parts[1]`**  
> 第二列为父节点（parent）。  
> **`print(f"{parent}\tCHILD:{child}")`**  
> 输出一条记录，key 为父节点，value 表示其子节点。  
> **`print(f"{child}\tPARENT:{parent}")`**  
> 输出另一条记录，key 为子节点，value 表示其父节点。

#### reducer (`gp_reducer.py`)

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

说明：输入文件 `child_parent.txt` 应只包含实际 pairs（若包含表头 `child parent` 请先删除或在 mapper 中跳过）。

> **`current = None`**  
> 初始化变量，用于记录当前处理的 key。  
> **`children = []`**, **`parents = []`**  
> 分别存储当前 key 对应的子节点列表和父节点列表。  
> **`def emit_pairs():`**  
> 定义一个函数，将当前 key 的每个子节点与每个父节点组合输出。  
> **`for line in sys.stdin:`**  
> 从标准输入逐行读取数据。  
> **`key, val = line.rstrip("\n").split("\t", 1)`**  
> 去掉行尾换行符，并按第一个制表符拆分为 key 和 value。  
> **`if current is None:`**  
> 初始化当前 key，第一次循环会触发。  
> **`if key != current:`**  
> 遇到新 key 时，处理上一组 key 的 children 和 parents，调用 `emit_pairs()`，然后重置 `children`、`parents` 列表，并更新 `current`。  
> **`if val.startswith("CHILD:"):`**  
> 如果 value 以 `"CHILD:"` 开头，将子节点添加到 `children` 列表中。  
> **`elif val.startswith("PARENT:"):`**  
> 如果 value 以 `"PARENT:"` 开头，将父节点添加到 `parents` 列表中。  
> **`if current is not None:`**  
> 循环结束后，处理最后一个 key 的数据，确保所有组合都被输出。  
> **输出逻辑**  
> 对于每个 key，打印所有子节点和父节点的笛卡尔积：
>
> ```text
> child1\tparent1
> child1\tparent2
> child2\tparent1
> ...
> ```
>
> 适用于 MapReduce 或关系映射分析。

#### 运行命令

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

- 结果查看：`hdfs dfs -cat /user/maki/output/grandparent/part-*`
  ![](https://img.makis-life.cn/images/20251210050637609.png?x-oss-process=style/yasuo)
