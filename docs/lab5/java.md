# MapReduce

## 实验目的

1.通过实验掌握基本的 MapReduce 编程方法；

2.掌握用 MapReduce 解决一些常见的数据处理问题，包括数据去重、数据排序和数据挖掘等。

## ① 两文件合并并去重

对于两个输入文件，即文件 A 和文件 B，请编写 MapReduce 程序，对两个文件进行合并，并剔除其中重复的内容，得到一个新的输出文件 C。下面是输入文件和输出文件的一个样例供参考。

> 思路：Mapper 逐行读取任一输入文件，把整行作为 key 输出；Reducer 对相同 key 只输出一次，达到去重合并效果。

### 准备文件

#### fileA

```
20150101 x
20150102 y
20150103 x
20150104 y
20150105 z
20150106 x
```

---

#### fileB

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

### `MergeMapper.java`

```java
import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

public class MergeMapper extends Mapper<LongWritable, Text, Text, NullWritable> {
    private final Text line = new Text();

    @Override
    protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {
        String s = value.toString().trim();
        if (!s.isEmpty()) {
            line.set(s);
            context.write(line, NullWritable.get()); // 将整行作为 key 输出
        }
    }
}
```

### `MergeReducer.java`

```java
import java.io.IOException;

import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

public class MergeReducer extends Reducer<Text, NullWritable, Text, NullWritable> {
    @Override
    protected void reduce(Text key, Iterable<NullWritable> values, Context context)
            throws IOException, InterruptedException {
        // 对相同 key 只输出一次，实现去重
        context.write(key, NullWritable.get());
    }
}
```

### `MergeDriver.java`

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.input.TextInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;

public class MergeDriver {
    public static void main(String[] args) throws Exception {
        if (args.length != 2) {
            System.err.println("Usage: MergeDriver <input path> <output path>");
            System.exit(-1);
        }

        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "merge_dedup");
        job.setJarByClass(MergeDriver.class);

        job.setMapperClass(MergeMapper.class);
        job.setReducerClass(MergeReducer.class);

        job.setMapOutputKeyClass(Text.class);
        job.setMapOutputValueClass(NullWritable.class);

        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(NullWritable.class);

        job.setInputFormatClass(TextInputFormat.class);
        job.setOutputFormatClass(TextOutputFormat.class);

        // 可选：设置 reducer 数量（1 个 reducer 可保证输出在单个 part 文件中）
        job.setNumReduceTasks(1);

        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
```

### 运行

1. 获取 Hadoop classpath 并编译：

```bash
# 获取 Hadoop classpath
export HADOOP_CLASSPATH=$(hadoop classpath)

# 创建输出目录并编译
mkdir -p build
javac -classpath $HADOOP_CLASSPATH -d build MergeMapper.java MergeReducer.java MergeDriver.java
```

2. 打包为 jar：

```bash
jar -cvf merge-dedup.jar -C build .
```

3. 上传输入文件到 HDFS（创建目录并上传）：

```bash
hdfs dfs -mkdir -p /user/hadoop/merge_input
hdfs dfs -put fileA.txt fileB.txt /user/hadoop/merge_input/
```

#### 提交作业

```bash
hadoop jar merge-dedup.jar MergeDriver /user/hadoop/merge_input /user/hadoop/output/merge_dedup
```

查看结果（查看（cat）输出文件）：

```bash
hdfs dfs -cat /user/hadoop/output/merge_dedup/part-*
```

![](https://img.makis-life.cn/images/20251210050727832.png)

说明与注意事项：

- Mapper 将每行作为 Text key 输出，Reducer 针对每个 key 只写一次，达到去重合并效果。
- 输出顺序由 Hadoop 的 key 排序决定（按文本字典序 lexicographical order）；若需保持原文件时间顺序或按时间戳合并，需要在 key 中包含排序字段并相应调整逻辑。
- 若输入行可能包含前后空白或不可见字符，Mapper 中的 `trim()` 已去除首尾空白；如需更严格预处理（规范空格、统一编码等），可在 Mapper 增加处理逻辑。
- `job.setNumReduceTasks(1);` 可保证所有结果写入单个 `part-*` 文件，便于查看；在数据量大时可去掉或设为更高数以并行化（仍然保持去重正确性）。

---

## ② 多文件整数排序并输出序号（rank）

现在有多个输入文件，每个文件中的每行内容均为一个整数。要求读取所有文件中的整数，进行升序排序后，输出到一个新的文件中，输出的数据格式为每行两个整数，第一个数字为第二个整数的排序位次，第二个整数为原待排列的整数。下面是输入文件和输出文件的一个样例供参考。

> - 需求：合并多个文件中的整数（每行一个整数），升序排序后输出 `rank value`（rank 从 1 开始）。
>
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

### `SortMapper.java`

```java
import java.io.IOException;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;

public class SortMapper extends Mapper<Object, Text, IntWritable, NullWritable> {
    private final IntWritable number = new IntWritable();

    @Override
    protected void map(Object key, Text value, Context context)
            throws IOException, InterruptedException {
        String line = value.toString().trim();
        if (!line.isEmpty()) {
            try {
                number.set(Integer.parseInt(line));
                context.write(number, NullWritable.get());
            } catch (NumberFormatException e) {
                // 非整数行忽略
            }
        }
    }
}
```

### `SortReducer.java`

```java
import java.io.IOException;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;

public class SortReducer extends Reducer<IntWritable, NullWritable, IntWritable, IntWritable> {
    private int rank = 1;

    @Override
    protected void reduce(IntWritable key, Iterable<NullWritable> values, Context context)
            throws IOException, InterruptedException {
        for (NullWritable v : values) {
            context.write(new IntWritable(rank), key);
            rank++;
        }
    }
}
```

### `SortDriver.java`

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.lib.input.TextInputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;

public class SortDriver {
    public static void main(String[] args) throws Exception {
        if (args.length != 2) {
            System.err.println("Usage: SortDriver <input> <output>");
            System.exit(-1);
        }

        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "sort_rank");
        job.setJarByClass(SortDriver.class);

        job.setMapperClass(SortMapper.class);
        job.setReducerClass(SortReducer.class);
        job.setNumReduceTasks(1); // 全局排序

        job.setMapOutputKeyClass(IntWritable.class);
        job.setMapOutputValueClass(NullWritable.class);
        job.setOutputKeyClass(IntWritable.class);
        job.setOutputValueClass(IntWritable.class);

        job.setInputFormatClass(TextInputFormat.class);
        job.setOutputFormatClass(TextOutputFormat.class);

        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
```

### 运行

```bash
# 设置 Hadoop classpath
export HADOOP_CLASSPATH=$(hadoop classpath)

# 创建编译输出目录
mkdir -p build

# 编译
javac -classpath $HADOOP_CLASSPATH -d build SortMapper.java SortReducer.java SortDriver.java

# 打包为 jar
jar -cvf sort-rank.jar -C build .
```

#### 提交作业

```bash
hadoop jar sort-rank.jar SortDriver /user/hadoop/sort_input /user/hadoop/output/sort_rank
```

#### 查看结果

```bash
hdfs dfs -cat /user/hadoop/output/sort_rank/part-*
```

![](https://img.makis-life.cn/images/20251210050637608.png)

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

### `GPMapper.java`

```java
import java.io.IOException;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

public class GPMapper extends Mapper<Object, Text, Text, Text> {
    private final Text outKey = new Text();
    private final Text outValue = new Text();

    @Override
    protected void map(Object key, Text value, Context context)
            throws IOException, InterruptedException {
        String line = value.toString().trim();
        if (line.isEmpty() || line.startsWith("child")) return; // 跳过表头

        String[] parts = line.split("\\s+");
        if (parts.length < 2) return;

        String child = parts[0];
        String parent = parts[1];

        outKey.set(parent);
        outValue.set("CHILD:" + child);
        context.write(outKey, outValue);

        outKey.set(child);
        outValue.set("PARENT:" + parent);
        context.write(outKey, outValue);
    }
}
```

### `GPReducer.java`

```java
import java.io.IOException;
import java.util.ArrayList;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

public class GPReducer extends Reducer<Text, Text, Text, Text> {
    @Override
    protected void reduce(Text key, Iterable<Text> values, Context context)
            throws IOException, InterruptedException {
        ArrayList<String> children = new ArrayList<>();
        ArrayList<String> parents = new ArrayList<>();

        for (Text val : values) {
            String s = val.toString();
            if (s.startsWith("CHILD:")) {
                children.add(s.substring(6));
            } else if (s.startsWith("PARENT:")) {
                parents.add(s.substring(7));
            }
        }

        for (String c : children) {
            for (String p : parents) {
                context.write(new Text(c), new Text(p));
            }
        }
    }
}
```

### `GPDriver.java`

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.lib.input.TextInputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;

public class GPDriver {
    public static void main(String[] args) throws Exception {
        if (args.length != 2) {
            System.err.println("Usage: GPDriver <input> <output>");
            System.exit(-1);
        }

        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "grandchild_grandparent");
        job.setJarByClass(GPDriver.class);

        job.setMapperClass(GPMapper.class);
        job.setReducerClass(GPReducer.class);

        job.setMapOutputKeyClass(Text.class);
        job.setMapOutputValueClass(Text.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(Text.class);

        job.setInputFormatClass(TextInputFormat.class);
        job.setOutputFormatClass(TextOutputFormat.class);

        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
```

### 运行

```bash
# 设置 Hadoop classpath
export HADOOP_CLASSPATH=$(hadoop classpath)

# 创建编译输出目录
mkdir -p build

# 编译
javac -classpath $HADOOP_CLASSPATH -d build GPMapper.java GPReducer.java GPDriver.java

# 打包为 jar
jar -cvf gp-extract.jar -C build .
```

#### 提交 MapReduce 作业

```bash
# 如果输出目录已存在，需要先删除
hdfs dfs -rm -r /user/hadoop/output/grandparent

# 提交作业
hadoop jar gp-extract.jar org.example.GPDriver /user/hadoop/gp_input /user/hadoop/output/grandparent
```

#### 查看结果

```bash
hdfs dfs -cat /user/hadoop/output/grandparent/part-*
```

![](https://img.makis-life.cn/images/20251210050637609.png)
