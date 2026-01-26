> [!note]  
> 本教程演示如何使用 **Java 程序**和 **HBase Shell** 对 HBase 进行常用操作，包括列出表、扫描数据、修改列族、清空表以及统计行数。
>
> 请先完成 [伪分布式](../lab1/PseudoDistributed.md) 安装。

> 因为要写 java 程序，可以选择使用 VSCode 远程登录，或者Ubuntu Desktop 的直接在虚拟机安装 VSCode，也可以尝试新的编辑器 Neovim！

## 一、列出所有表信息

**Java 实现**：

```java
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.client.Admin;
import org.apache.hadoop.hbase.client.Connection;
import org.apache.hadoop.hbase.client.ConnectionFactory;
import org.apache.hadoop.hbase.HTableDescriptor;

public class ListTables {
    public static void main(String[] args) throws Exception {
        org.apache.hadoop.conf.Configuration config = HBaseConfiguration.create();
        try (Connection connection = ConnectionFactory.createConnection(config);
             Admin admin = connection.getAdmin()) {

            HTableDescriptor[] tables = admin.listTables();
            for (HTableDescriptor table : tables) {
                System.out.println("Table Name: " + table.getNameAsString());
            }
        }
    }
}
```

#### 运行

```bash
javac -cp $(hbase classpath) ListTables.java
java -cp .:$(hbase classpath) ListTables
```

**HBase Shell 等价命令**：

```bash
hbase shell
list
```

---

## 二、扫描表中所有记录

**Java 实现**：

```java
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.*;
import org.apache.hadoop.hbase.util.Bytes;

public class ScanTable {
    public static void main(String[] args) throws Exception {
        if (args.length < 1) {
            System.out.println("Usage: java ScanTable <table_name>");
            System.exit(1);
        }

        String tableName = args[0];
        org.apache.hadoop.conf.Configuration config = org.apache.hadoop.hbase.HBaseConfiguration.create();

        try (Connection connection = ConnectionFactory.createConnection(config);
             Table table = connection.getTable(TableName.valueOf(tableName))) {

            Scan scan = new Scan();
            try (ResultScanner scanner = table.getScanner(scan)) {
                for (Result result : scanner) {
                    result.listCells().forEach(cell -> {
                        System.out.println(
                            "Row: " + Bytes.toString(cell.getRowArray(), cell.getRowOffset(), cell.getRowLength()) +
                            ", Column: " + Bytes.toString(cell.getFamilyArray(), cell.getFamilyOffset(), cell.getFamilyLength()) +
                            ":" + Bytes.toString(cell.getQualifierArray(), cell.getQualifierOffset(), cell.getQualifierLength()) +
                            ", Value: " + Bytes.toString(cell.getValueArray(), cell.getValueOffset(), cell.getValueLength())
                        );
                    });
                }
            }
        }
    }
}
```

#### 运行

```bash
# 编译
javac -cp $(hbase classpath) ScanTable.java

# 运行（假设要扫描的表名为 mytable）
java -cp .:$(hbase classpath) ScanTable mytable

```

**HBase Shell 等价命令**：

```shell
scan 'mytable'
```

---

## 三、添加或删除列族

**Java 实现**：

```java
import org.apache.hadoop.hbase.HColumnDescriptor;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.*;

public class ModifyColumnFamily {
    public static void main(String[] args) throws Exception {
        if (args.length < 1) {
            System.out.println("Usage: java ModifyColumnFamily <table_name> [add_cf] [delete_cf]");
            System.exit(1);
        }

        String tableNameStr = args[0];
        String addCF = args.length >= 2 ? args[1] : null;
        String delCF = args.length >= 3 ? args[2] : null;

        org.apache.hadoop.conf.Configuration config = org.apache.hadoop.hbase.HBaseConfiguration.create();
        try (Connection connection = ConnectionFactory.createConnection(config);
             Admin admin = connection.getAdmin()) {

            TableName tableName = TableName.valueOf(tableNameStr);

            if (addCF != null && !addCF.isEmpty()) {
                HColumnDescriptor newColumn = new HColumnDescriptor(addCF);
                admin.addColumn(tableName, newColumn);
                System.out.println("Added column family: " + addCF);
            }

            if (delCF != null && !delCF.isEmpty()) {
                admin.deleteColumn(tableName, delCF.getBytes());
                System.out.println("Deleted column family: " + delCF);
            }

            if ((addCF == null || addCF.isEmpty()) && (delCF == null || delCF.isEmpty())) {
                System.out.println("No operation specified.");
            }
        }
    }
}
```

#### 运行

```bash
# 编译
javac -cp $(hbase classpath) ModifyColumnFamily.java

# 运行示例
# 添加列族 newcf
java -cp .:$(hbase classpath) ModifyColumnFamily mytable newcf

# 删除列族 oldcf
java -cp .:$(hbase classpath) ModifyColumnFamily mytable "" oldcf

```

说明：

1. `$(hbase classpath)` 展开为 HBase 的依赖 jar 路径，保证编译和运行都能找到 HBase 类。
2. `"."` 表示当前目录，确保能找到 `ModifyColumnFamily` 类。
3. 添加列族时第二个参数为要添加的列族名，删除列族时第二个参数可填空字符串 `""`，第三个参数为要删除的列族名。
4. 如果不传第二、第三个参数，程序会提示 `"No operation specified."`。

**HBase Shell 等价命令**：

```shell
# 添加列族
alter 'mytable', 'newcf'

# 删除列族
alter 'mytable', 'delete', 'oldcf'
```

**添加或删除列（列族内单列）**：

```shell
# 添加单列
put 'mytable', 'row1', 'cf1:newcolumn', 'value'

# 删除单列
delete 'mytable', 'row1', 'cf1:oldcolumn'
```

---

## 四、清空表数据

**Java 实现**：

```java
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.*;

public class TruncateTable {
    public static void main(String[] args) throws Exception {
        if (args.length < 1) {
            System.out.println("Usage: java TruncateTable <table_name>");
            System.exit(1);
        }

        String tableNameStr = args[0];
        org.apache.hadoop.conf.Configuration config = org.apache.hadoop.hbase.HBaseConfiguration.create();

        try (Connection connection = ConnectionFactory.createConnection(config);
             Table table = connection.getTable(TableName.valueOf(tableNameStr))) {

            try (ResultScanner scanner = table.getScanner(new Scan())) {
                for (Result result : scanner) {
                    Delete delete = new Delete(result.getRow());
                    table.delete(delete);
                }
            }

            System.out.println("All rows in table " + tableNameStr + " have been deleted.");
        }
    }
}
```

#### 运行

```bash
# 编译
javac -cp $(hbase classpath) TruncateTable.java

# 运行示例
java -cp .:$(hbase classpath) TruncateTable mytable

```

**HBase Shell 等价命令**：

```shell
truncate 'mytable'
```

---

## 五、统计表行数

**Java 实现**：

```java
import org.apache.hadoop.hbase.client.*;
import org.apache.hadoop.hbase.TableName;

public class CountRows {
    public static void main(String[] args) throws Exception {
        if (args.length < 1) {
            System.out.println("Usage: java CountRows <table_name>");
            System.exit(1);
        }

        String tableNameStr = args[0];
        org.apache.hadoop.conf.Configuration config = org.apache.hadoop.hbase.HBaseConfiguration.create();

        try (Connection connection = ConnectionFactory.createConnection(config);
             Table table = connection.getTable(TableName.valueOf(tableNameStr));
             ResultScanner scanner = table.getScanner(new Scan())) {

            int count = 0;
            for (Result result : scanner) count++;
            System.out.println("Total rows in table " + tableNameStr + ": " + count);
        }
    }
}
```

#### 运行

```bash
# 编译
javac -cp $(hbase classpath) CountRows.java

# 运行示例
java -cp .:$(hbase classpath) CountRows mytable
```

**HBase Shell 等价命令**：

```shell
count 'mytable'
```
