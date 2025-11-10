本教程演示如何通过 **Java 程序** 实现 Hadoop Shell 的常见文件操作，包括上传、下载、查看、删除、移动等。
所有代码均可在本地或集群环境中运行，需确保已正确配置 `HADOOP_HOME` 环境变量。
[Hadoop伪分布式安装](../lab1/PseudoDistributed.md)

---

## 一、编译与运行环境举例

① 创建 Java 源文件

```bash
vim UploadFileHDFS.java
```

② 使用 Hadoop 提供的编译器编译

```bash
hadoop com.sun.tools.javac.Main name.java
```

③ 或使用 `javac` 并显式加入 Hadoop 依赖

```bash
javac -cp $HADOOP_HOME/share/hadoop/common/hadoop-common-*.jar:$HADOOP_HOME/share/hadoop/hdfs/hadoop-hdfs-*.jar *.java
```

④ 运行示例

```bash
java -cp .:$HADOOP_HOME/share/hadoop/common/hadoop-common-*.jar:$HADOOP_HOME/share/hadoop/hdfs/hadoop-hdfs-*.jar UploadFileHDFS 本地文件 HDFS路径 true
```

---

## 二、常见 HDFS 操作 Java 实现

### ① 上传文件（追加或覆盖）

**UploadFileHDFS.java**

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.*;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class UploadFileHDFS {
    public static void main(String[] args) throws IOException {
        String localPath = args[0];
        String hdfsPath = args[1];
        boolean append = Boolean.parseBoolean(args[2]);

        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.get(conf);
        Path hPath = new Path(hdfsPath);

        if (fs.exists(hPath)) {
            if (append) {
                FSDataOutputStream out = fs.append(hPath);
                byte[] content = Files.readAllBytes(Paths.get(localPath));
                out.write(content);
                out.close();
            } else {
                fs.copyFromLocalFile(false, true, new Path(localPath), hPath);
            }
        } else {
            fs.copyFromLocalFile(new Path(localPath), hPath);
        }
        fs.close();
    }
}
```

**对应命令：**

```bash
# 覆盖上传
hdfs dfs -put -f 本地文件 HDFS目标路径
# 追加上传
hdfs dfs -appendToFile 本地文件 HDFS目标路径
```

---

### ② 下载文件（自动重命名）

**DownloadFileHDFS.java**

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.*;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class DownloadFileHDFS {
    public static void main(String[] args) throws IOException {
        String hdfsFile = args[0];
        String localFile = args[1];

        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.get(conf);
        Path hPath = new Path(hdfsFile);
        Path lPath = new Path(localFile);

        if (Files.exists(Paths.get(localFile))) {
            lPath = new Path(localFile + "_new");
        }

        fs.copyToLocalFile(hPath, lPath);
        fs.close();
    }
}
```

**对应命令：**

```bash
hdfs dfs -get HDFS文件路径 本地路径
mv 本地路径 本地路径_new
```

---

### ③ 输出文件内容到终端

**CatFileHDFS.java**

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.*;
import java.io.IOException;

public class CatFileHDFS {
    public static void main(String[] args) throws IOException {
        String hdfsFile = args[0];
        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.get(conf);

        FSDataInputStream in = fs.open(new Path(hdfsFile));
        org.apache.hadoop.io.IOUtils.copyBytes(in, System.out, conf, false);
        in.close();
        fs.close();
    }
}
```

**对应命令：**

```bash
hdfs dfs -cat HDFS文件路径
```

---

### ④ 显示文件属性

**FileInfoHDFS.java**

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.*;
import java.io.IOException;

public class FileInfoHDFS {
    public static void main(String[] args) throws IOException {
        String hdfsFile = args[0];
        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.get(conf);

        FileStatus status = fs.getFileStatus(new Path(hdfsFile));
        System.out.println("权限: " + status.getPermission());
        System.out.println("大小: " + status.getLen());
        System.out.println("修改时间: " + status.getModificationTime());
        System.out.println("路径: " + status.getPath());

        fs.close();
    }
}
```

**对应命令：**

```bash
hdfs dfs -ls -d HDFS文件路径
```

---

### ⑤ 递归列出目录内容

**ListDirHDFS.java**

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.*;
import java.io.IOException;

public class ListDirHDFS {
    public static void main(String[] args) throws IOException {
        String dirPath = args[0];
        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.get(conf);

        listFiles(fs, new Path(dirPath));
        fs.close();
    }

    private static void listFiles(FileSystem fs, Path dir) throws IOException {
        FileStatus[] files = fs.listStatus(dir);
        for (FileStatus file : files) {
            System.out.println(file.getPath() + " 权限:" + file.getPermission() + " 大小:" + file.getLen());
            if (file.isDirectory()) listFiles(fs, file.getPath());
        }
    }
}
```

**对应命令：**

```bash
hdfs dfs -ls -R HDFS目录路径
```

---

### ⑥ 创建或删除文件（自动建目录）

**CreateDeleteFileHDFS.java**

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.*;
import java.io.IOException;

public class CreateDeleteFileHDFS {
    public static void main(String[] args) throws IOException {
        String filePath = args[0];
        boolean create = Boolean.parseBoolean(args[1]);

        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.get(conf);
        Path path = new Path(filePath);

        if (create) {
            if (!fs.exists(path.getParent())) fs.mkdirs(path.getParent());
            fs.create(path).close();
        } else {
            fs.delete(path, false);
        }
        fs.close();
    }
}
```

**对应命令：**

```bash
hdfs dfs -mkdir -p /dir1/dir2
hdfs dfs -touchz /dir1/dir2/file.txt
hdfs dfs -rm /dir1/dir2/file.txt
```

---

### ⑦ 创建或删除目录（递归）

**CreateDeleteDirHDFS.java**

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.*;
import java.io.IOException;

public class CreateDeleteDirHDFS {
    public static void main(String[] args) throws IOException {
        String dirPath = args[0];
        boolean create = Boolean.parseBoolean(args[1]);
        boolean recursive = args.length > 2 && Boolean.parseBoolean(args[2]);

        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.get(conf);
        Path path = new Path(dirPath);

        if (create) {
            fs.mkdirs(path);
        } else {
            fs.delete(path, recursive);
        }
        fs.close();
    }
}
```

**对应命令：**

```bash
hdfs dfs -mkdir -p /dir1/dir2
hdfs dfs -rm -r /dir1/dir2
```

---

### ⑧ 文件内容追加（开头或结尾）

**AppendFileHDFS.java**

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.*;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class AppendFileHDFS {
    public static void main(String[] args) throws IOException {
        String hdfsFile = args[0];
        String contentFile = args[1];
        boolean appendToEnd = Boolean.parseBoolean(args[2]);

        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.get(conf);
        Path path = new Path(hdfsFile);

        byte[] newContent = Files.readAllBytes(Paths.get(contentFile));

        if (appendToEnd) {
            FSDataOutputStream out = fs.append(path);
            out.write(newContent);
            out.close();
        } else {
            FSDataInputStream in = fs.open(path);
            byte[] oldContent = org.apache.hadoop.io.IOUtils.readFullyToByteArray(in);
            in.close();
            FSDataOutputStream out = fs.create(path, true);
            out.write(newContent);
            out.write(oldContent);
            out.close();
        }

        fs.close();
    }
}
```

**对应命令（仅支持结尾追加）：**

```bash
hdfs dfs -appendToFile 本地文件 HDFS文件路径
```

---

### ⑨ 删除文件

**DeleteFileHDFS.java**

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.*;
import java.io.IOException;

public class DeleteFileHDFS {
    public static void main(String[] args) throws IOException {
        String hdfsFile = args[0];
        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.get(conf);
        fs.delete(new Path(hdfsFile), false);
        fs.close();
    }
}
```

**对应命令：**

```bash
hdfs dfs -rm HDFS文件路径
```

---

### ⑩ 移动文件

**MoveFileHDFS.java**

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.*;
import java.io.IOException;

public class MoveFileHDFS {
    public static void main(String[] args) throws IOException {
        String srcPath = args[0];
        String dstPath = args[1];

        Configuration conf = new Configuration();
        FileSystem fs = FileSystem.get(conf);
        fs.rename(new Path(srcPath), new Path(dstPath));
        fs.close();
    }
}
```

**对应命令：**

```bash
hdfs dfs -mv /源路径 /目标路径
```

---

## 三、总结

| 功能      | Java 类名              | Hadoop Shell 等价命令               |
| ------- | -------------------- | ------------------------------- |
| 上传文件    | UploadFileHDFS       | `hdfs dfs -put / -appendToFile` |
| 下载文件    | DownloadFileHDFS     | `hdfs dfs -get`                 |
| 查看内容    | CatFileHDFS          | `hdfs dfs -cat`                 |
| 查看属性    | FileInfoHDFS         | `hdfs dfs -ls -d`               |
| 递归列出    | ListDirHDFS          | `hdfs dfs -ls -R`               |
| 创建/删除文件 | CreateDeleteFileHDFS | `hdfs dfs -touchz / -rm`        |
| 创建/删除目录 | CreateDeleteDirHDFS  | `hdfs dfs -mkdir / -rm -r`      |
| 追加内容    | AppendFileHDFS       | `hdfs dfs -appendToFile`        |
| 删除文件    | DeleteFileHDFS       | `hdfs dfs -rm`                  |
| 移动文件    | MoveFileHDFS         | `hdfs dfs -mv`                  |
