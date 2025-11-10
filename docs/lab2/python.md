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

**Shell 命令：**

```bash
hdfs dfs -mv /源路径 /目标路径
```
