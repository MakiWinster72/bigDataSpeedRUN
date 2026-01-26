> [!note]
> 本教程演示如何通过 **Java 程序** 实现 Hadoop Shell 的常见文件操作，包括上传、下载、查看、删除、移动等。
> 需确保已正确配置 `HADOOP_HOME` 环境变量。
> [Hadoop伪分布式安装](../lab1/PseudoDistributed.md)

> 因为要写 java 程序，可以选择使用 VSCode 远程登录，或者Ubuntu Desktop 的直接在虚拟机安装 VSCode，也可以尝试新的编辑器 Neovim！

## 一、编译与运行环境举例

1. 创建 Java 源文件

```bash
vim UploadFileHDFS.java

# 或安装了 neovim 的使用 nvim
```

2. 使用 `javac` 并显式加入 Hadoop 依赖

```bash
javac -cp $(hadoop classpath) *.java
```

3. 打包为jar文件

```bash
jar -cvf jar文件名 class文件
```

> 或直接运行 `java -cp .:$(hadoop classpath) 类 参数1 参数2...`

4. 运行示例

```bash
hadoop jar jar文件 函数 参数1 参数2
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

#### 运行

```bash
javac -cp $(hadoop classpath) UploadFileHDFS.java

jar -cvf UploadFileHDFS.jar UploadFileHDFS.class

hadoop jar UploadFileHDFS.jar UploadFileHDFS test /input/test false
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

#### 运行

编译 Java 文件：

```bash
javac -cp $(hadoop classpath) DownloadFileHDFS.java
```

生成 JAR 包：

```bash
jar -cvf DownloadFileHDFS.jar DownloadFileHDFS.class
```

执行下载（如果本地文件已存在，将自动重命名为 xxx_new）：

```bash
hadoop jar DownloadFileHDFS.jar DownloadFileHDFS /input/test /home/hadoop/test
```

说明：  
当 `/home/hadoop/test` 已存在时，程序会自动将目标路径改为 `/home/hadoop/test_new`，避免覆盖本地已有文件。

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

#### 运行

编译 Java 文件：

```bash
javac -cp $(hadoop classpath) CatFileHDFS.java
```

打包生成 JAR：

```bash
jar -cvf CatFileHDFS.jar CatFileHDFS.class
```

执行并在终端输出文件内容：

```bash
hadoop jar CatFileHDFS.jar CatFileHDFS /input/test
```

说明：  
程序会直接将 `/input/test` 的 HDFS 文件内容打印到当前终端，与 `hdfs dfs -cat` 效果一致。

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

#### 运行

编译 Java 文件：

```bash
javac -cp $(hadoop classpath) FileInfoHDFS.java
```

生成 JAR 包：

```bash
jar -cvf FileInfoHDFS.jar FileInfoHDFS.class
```

执行查看属性：

```bash
hadoop jar FileInfoHDFS.jar FileInfoHDFS /input/test
```

程序将输出 HDFS 文件 `/input/test` 的权限、大小、修改时间和完整路径，与 `hdfs dfs -ls -d` 的效果一致。

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

#### 运行

编译 Java 文件：

```bash
javac -cp $(hadoop classpath) ListDirHDFS.java
```

打包生成 JAR：

```bash
jar -cvf ListDirHDFS.jar ListDirHDFS.class
```

执行递归列出目录：

```bash
hadoop jar ListDirHDFS.jar ListDirHDFS /user/hadoop
```

程序会从 `/user/hadoop` 开始，递归打印每个文件与子目录的路径、权限、大小，与 `hdfs dfs -ls -R` 的效果一致。

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

#### 运行

编译 Java 文件：

```bash
javac -cp $(hadoop classpath) CreateDeleteFileHDFS.java
```

打包生成 JAR：

```bash
jar -cvf CreateDeleteFileHDFS.jar CreateDeleteFileHDFS.class
```

创建文件（若上级目录不存在将自动创建）：

```bash
hadoop jar CreateDeleteFileHDFS.jar CreateDeleteFileHDFS /dir1/dir2/file.txt true
```

删除文件：

```bash
hadoop jar CreateDeleteFileHDFS.jar CreateDeleteFileHDFS /dir1/dir2/file.txt false
```

程序行为等价于使用 `hdfs dfs -mkdir -p`、`hdfs dfs -touchz` 和 `hdfs dfs -rm`。

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

#### 运行

编译 Java 文件：

```bash
javac -cp $(hadoop classpath) AppendFileHDFS.java
```

生成 JAR 包：

```bash
jar -cvf AppendFileHDFS.jar AppendFileHDFS.class
```

在 HDFS 文件**结尾追加内容**：

```bash
hadoop jar AppendFileHDFS.jar AppendFileHDFS /input/test append.txt true
```

在 HDFS 文件**开头追加内容**（即把新内容写在最前面，再写入旧内容）：

```bash
hadoop jar AppendFileHDFS.jar AppendFileHDFS /input/test append.txt false
```

说明：  
Hadoop 原生命令 `hdfs dfs -appendToFile` 只能在结尾追加。  
此 Java 程序可以选择追加到文件开头或结尾。

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

#### 运行

编译 Java 文件：

```bash
javac -cp $(hadoop classpath) DeleteFileHDFS.java
```

打包生成 JAR：

```bash
jar -cvf DeleteFileHDFS.jar DeleteFileHDFS.class
```

执行删除操作：

```bash
hadoop jar DeleteFileHDFS.jar DeleteFileHDFS /input/test
```

程序会删除 HDFS 中的 `/input/test` 文件，效果与 `hdfs dfs -rm` 等同。

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

#### 运行

编译 Java 文件：

```bash
javac -cp $(hadoop classpath) MoveFileHDFS.java
```

打包生成 JAR：

```bash
jar -cvf MoveFileHDFS.jar MoveFileHDFS.class
```

执行移动操作：

```bash
hadoop jar MoveFileHDFS.jar MoveFileHDFS /input/test /input/test2
```

程序会将 `/input/test` 移动到 `/input/test2`。

**对应命令：**

```bash
hdfs dfs -mv /源路径 /目标路径
```
