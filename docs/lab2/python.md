> [!note]
> 本教程演示如何通过 **Python** 实现 Hadoop Shell 的常见文件操作，包括上传、下载、查看、删除、移动等。
> 需确保已正确配置 `HADOOP_HOME` 环境变量。
> [Hadoop伪分布式安装](../lab1/PseudoDistributed.md)


---

使用python操控hdfs需要预安装hdfs依赖
```bash
sudo apt install pip python3.12-venv
# 使用虚拟环境(ubuntu22.04以上必须)
python3 -m venv venv
source venv/bin/activate
# 安装hdfs依赖
pip install hdfs -i https://pypi.tuna.tsinghua.edu.cn/simple
```

使用`python3 .py文件`即可运行

## ① 上传文件到 HDFS（追加或覆盖）

**upload_file_hdfs.py**

```python
from hdfs import InsecureClient
import sys
import os

# 参数说明：
# sys.argv[1] -> 本地文件路径
# sys.argv[2] -> HDFS 目标路径
# sys.argv[3] -> 是否追加（True/False）

def upload_file(local_path, hdfs_path, append):
    client = InsecureClient('http://localhost:9870', user='hadoop')  # 修改为你的 HDFS web 地址
    if client.status(hdfs_path, strict=False):
        if append:
            # HDFS 不支持直接在原文件开头写入，只能追加
            with open(local_path, 'rb') as f:
                data = f.read()
            client.write(hdfs_path, data, append=True)
        else:
            client.upload(hdfs_path, local_path, overwrite=True)
    else:
        client.upload(hdfs_path, local_path)
    print("✅ 上传完成：", hdfs_path)

if __name__ == "__main__":
    upload_file(sys.argv[1], sys.argv[2], sys.argv[3].lower() == 'true')
```

> **`from hdfs import InsecureClient`**
> 从 `hdfs` 库导入 `InsecureClient`，用于在无认证模式下连接 HDFS。
>
> **`import sys, os`**
> 导入 `sys` 和 `os` 模块，用于读取命令行参数和处理文件路径。
>
> **函数参数说明：**
>
> * `sys.argv[1]`：本地文件路径。
> * `sys.argv[2]`：HDFS 上的目标路径。
> * `sys.argv[3]`：是否以追加（`True`/`False`）方式写入。
>
> **`client = InsecureClient('http://localhost:9870', user='hadoop')`**
> 创建 HDFS 客户端，连接到 `http://localhost:9870`，用户为 `hadoop`。
>
> **`if client.status(hdfs_path, strict=False):`**
> 检查目标路径是否存在，若存在则进入更新逻辑。
>
> **`if append:`**
> 若选择追加模式：
>
> * 打开本地文件并读取全部数据；
> * 使用 `client.write(..., append=True)` 将内容追加到 HDFS 文件末尾。
>
> **`else:`**
> 若非追加模式，则调用 `client.upload(..., overwrite=True)` 覆盖上传目标文件。
>
> **`else:`**
> 若目标路径不存在，直接上传新文件。
> **`if __name__ == "__main__":`**
> 当脚本被直接运行时，从命令行读取参数并调用 `upload_file()` 执行上传。

**Shell 命令：**

```bash
# 覆盖上传
hdfs dfs -put -f 本地文件 HDFS目标路径

# 追加上传
hdfs dfs -appendToFile 本地文件 HDFS目标路径
```

---

## ② 从 HDFS 下载文件（自动重命名）

**download_file_hdfs.py**

```python
from hdfs import InsecureClient
import sys
import os

# sys.argv[1] -> HDFS 文件路径
# sys.argv[2] -> 本地保存路径

def download_file(hdfs_file, local_file):
    client = InsecureClient('http://localhost:9870', user='hadoop')
    if os.path.exists(local_file):
        local_file = local_file + "_new"

    client.download(hdfs_file, local_file, overwrite=True)
    print("✅ 下载完成：", local_file)

if __name__ == "__main__":
    download_file(sys.argv[1], sys.argv[2])
```

> **`if os.path.exists(local_file):`**
> 检查本地目标文件是否已存在，若存在则在文件名后追加 `_new`，避免覆盖。
>
> **`client.download(hdfs_file, local_file, overwrite=True)`**
> 从 HDFS 下载指定文件到本地路径，若存在同名文件则覆盖。

**Shell 命令：**

```bash
hdfs dfs -get HDFS文件路径 本地路径
mv 本地路径 本地路径_new
```

---

## ③ 输出 HDFS 文件内容到终端

**cat_file_hdfs.py**

```python
from hdfs import InsecureClient
import sys

# sys.argv[1] -> HDFS 文件路径

def cat_file(hdfs_file):
    client = InsecureClient('http://localhost:9870', user='hadoop')
    with client.read(hdfs_file, encoding='utf-8') as reader:
        print(reader.read())

if __name__ == "__main__":
    cat_file(sys.argv[1])
```

> **`with client.read(hdfs_file, encoding='utf-8') as reader:`**
> 打开 HDFS 文件用于读取，按 UTF-8 解码。
>
> **`print(reader.read())`**
> 读取整个文件内容并输出到终端。


**Shell 命令：**

```bash
hdfs dfs -cat HDFS文件路径
```

---

## ④ 显示文件属性

**file_info_hdfs.py**

```python
from hdfs import InsecureClient
import sys
import time

# sys.argv[1] -> HDFS 文件路径

def file_info(hdfs_file):
    client = InsecureClient('http://localhost:9870', user='hadoop')
    status = client.status(hdfs_file)

    print("权限:", status['permission'])
    print("大小:", status['length'])
    print("修改时间:", time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(status['modificationTime']/1000)))
    print("路径:", status['pathSuffix'])

if __name__ == "__main__":
    file_info(sys.argv[1])
```

> **`status = client.status(hdfs_file)`**
> 获取 HDFS 文件的状态信息，包括权限、大小、修改时间等。
>
> **`print("权限:", status['permission'])`**
> 输出文件权限。
>
> **`print("大小:", status['length'])`**
> 输出文件大小（字节）。
>
> **`print("修改时间:", time.strftime(...))`**
> 将文件的修改时间（毫秒）转换为可读的年月日时分秒格式并输出。
>
> **`print("路径:", status['pathSuffix'])`**
> 输出文件在 HDFS 中的路径后缀（不含父目录）。


**Shell 命令：**

```bash
hdfs dfs -ls -d HDFS文件路径
```

---

## ⑤ 递归输出目录下所有文件属性

**list_dir_hdfs.py**

```python
from hdfs import InsecureClient
import sys

# sys.argv[1] -> HDFS 目录路径

def list_dir(hdfs_dir):
    client = InsecureClient('http://localhost:9870', user='hadoop')
    def recurse(path):
        for item in client.list(path, status=True):
            info = item[1]
            print(f"{path}/{item[0]} 权限:{info['permission']} 大小:{info['length']}")
            if info['type'] == 'DIRECTORY':
                recurse(f"{path}/{item[0]}")

    recurse(hdfs_dir)

if __name__ == "__main__":
    list_dir(sys.argv[1])
```

> **`for item in client.list(path, status=True):`**
> 列出指定 HDFS 目录下的所有文件和子目录，并获取状态信息。
>
> **`print(f"{path}/{item[0]} 权限:{info['permission']} 大小:{info['length']}")`**
> 输出每个文件或目录的完整路径、权限和大小。
>
> **`if info['type'] == 'DIRECTORY': recurse(...)`**
> 如果是子目录，则递归遍历其内容，实现目录树式列出所有文件。

**Shell 命令：**

```bash
hdfs dfs -ls -R HDFS目录路径
```

---

## ⑥ 创建或删除文件（自动创建目录）

**create_delete_file_hdfs.py**

```python
from hdfs import InsecureClient
import sys
import os

# sys.argv[1] -> 文件路径
# sys.argv[2] -> True 创建 / False 删除

def create_delete_file(hdfs_path, create):
    client = InsecureClient('http://localhost:9870', user='hadoop')

    if create:
        parent = os.path.dirname(hdfs_path)
        if not client.status(parent, strict=False):
            client.makedirs(parent)
        client.write(hdfs_path, b"", overwrite=True)
        print("✅ 文件已创建：", hdfs_path)
    else:
        client.delete(hdfs_path)
        print("🗑️ 文件已删除：", hdfs_path)

if __name__ == "__main__":
    create_delete_file(sys.argv[1], sys.argv[2].lower() == 'true')
```

> **`if create:`**
> 判断操作类型：若为 `True`，执行创建文件操作；否则执行删除。
>
> **`if not client.status(parent, strict=False): client.makedirs(parent)`**
> 若文件的父目录不存在，则先创建父目录。
>
> **`client.write(hdfs_path, b"", overwrite=True)`**
> 创建一个空文件，若同名文件存在则覆盖。
>
> **`client.delete(hdfs_path)`**
> 删除指定 HDFS 文件。
>
> **`print(...)`**
> 输出文件创建或删除的提示信息。

**Shell 命令：**

```bash
hdfs dfs -mkdir -p /dir1/dir2
hdfs dfs -touchz /dir1/dir2/file.txt
hdfs dfs -rm /dir1/dir2/file.txt
```

---

## ⑦ 创建或删除目录（递归）

**create_delete_dir_hdfs.py**

```python
from hdfs import InsecureClient
import sys

# sys.argv[1] -> 目录路径
# sys.argv[2] -> True 创建 / False 删除
# sys.argv[3] -> 删除时是否递归（可选）

def create_delete_dir(hdfs_dir, create, recursive=False):
    client = InsecureClient('http://localhost:9870', user='hadoop')
    if create:
        client.makedirs(hdfs_dir)
        print("✅ 目录已创建：", hdfs_dir)
    else:
        client.delete(hdfs_dir, recursive=recursive)
        print("🗑️ 目录已删除：", hdfs_dir)

if __name__ == "__main__":
    recursive = len(sys.argv) > 3 and sys.argv[3].lower() == 'true'
    create_delete_dir(sys.argv[1], sys.argv[2].lower() == 'true', recursive)
```

> **`if create:`**
> 判断操作类型：若为 `True`，执行创建目录；否则执行删除目录。
>
> **`client.makedirs(hdfs_dir)`**
> 创建指定 HDFS 目录（若父目录不存在会一并创建）。
>
> **`client.delete(hdfs_dir, recursive=recursive)`**
> 删除指定 HDFS 目录，参数 `recursive=True` 可递归删除子目录和文件。
>
> **`print(...)`**
> 输出目录创建或删除的提示信息。

**Shell 命令：**

```bash
hdfs dfs -mkdir -p /dir1/dir2
hdfs dfs -rm -r /dir1/dir2
```

---

## ⑧ 追加文件内容（开头或结尾）

**append_file_hdfs.py**

```python
from hdfs import InsecureClient
import sys
import tempfile

# sys.argv[1] -> HDFS 文件路径
# sys.argv[2] -> 本地内容文件
# sys.argv[3] -> True 追加到结尾 / False 追加到开头

def append_file(hdfs_file, content_file, append_to_end):
    client = InsecureClient('http://localhost:9870', user='hadoop')

    with open(content_file, 'rb') as f:
        new_data = f.read()

    if append_to_end:
        client.write(hdfs_file, new_data, append=True)
    else:
        # 先下载旧文件
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            client.download(hdfs_file, tmp.name, overwrite=True)
            with open(tmp.name, 'rb') as old:
                old_data = old.read()
        # 覆盖写入新内容+旧内容
        client.write(hdfs_file, new_data + old_data, overwrite=True)
    print("✅ 文件内容追加成功")

if __name__ == "__main__":
    append_file(sys.argv[1], sys.argv[2], sys.argv[3].lower() == 'true')
```

> **`with open(content_file, 'rb') as f: new_data = f.read()`**
> 读取本地文件内容，用于追加到 HDFS 文件。
>
> **`if append_to_end: client.write(hdfs_file, new_data, append=True)`**
> 若选择追加到末尾，直接使用 HDFS 的追加功能。
>
> **`else:`**
> 若选择追加到开头：
>
> * 先下载原 HDFS 文件到临时文件；
> * 读取原文件内容；
> * 将新内容与原内容合并后覆盖写入 HDFS，实现“追加到开头”。

**Shell 命令：**

```bash
hdfs dfs -appendToFile 本地文件 HDFS文件路径
```

---

## ⑨ 删除文件

**delete_file_hdfs.py**

```python
from hdfs import InsecureClient
import sys

# sys.argv[1] -> HDFS 文件路径

def delete_file(hdfs_file):
    client = InsecureClient('http://localhost:9870', user='hadoop')
    client.delete(hdfs_file)
    print("🗑️ 文件已删除：", hdfs_file)

if __name__ == "__main__":
    delete_file(sys.argv[1])
```

> **`client.delete(hdfs_file)`**
> 删除指定的 HDFS 文件。

**Shell 命令：**

```bash
hdfs dfs -rm HDFS文件路径
```

---

## ⑩ 移动文件

**move_file_hdfs.py**

```python
from hdfs import InsecureClient
import sys

# sys.argv[1] -> 源文件路径
# sys.argv[2] -> 目标路径

def move_file(src_path, dst_path):
    client = InsecureClient('http://localhost:9870', user='hadoop')
    client.rename(src_path, dst_path)
    print(f"✅ 文件已移动：{src_path} -> {dst_path}")

if __name__ == "__main__":
    move_file(sys.argv[1], sys.argv[2])
```

> **`client.rename(src_path, dst_path)`**
> 将 HDFS 中的源文件重命名或移动到目标路径。

**Shell 命令：**

```bash
hdfs dfs -mv /源路径 /目标路径
```
