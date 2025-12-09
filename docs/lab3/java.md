> [!note]  
> 本教程演示如何使用 **Java 程序**和 **HBase Shell** 对 HBase 进行常用操作，包括列出表、扫描数据、修改列族、清空表以及统计行数。
>
> 请先完成 [伪分布式](../lab1/PseudoDistributed.md) 安装。

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

**HBase Shell 等价命令**：

```shell
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

**HBase Shell 等价命令**：

```shell
count 'mytable'
```

---

## 六、总结对照表

| 功能          | Java 类名                  | HBase Shell 命令     |
| ------------- | -------------------------- | -------------------- |
| 列出表        | ListTables                 | `list`               |
| 扫描表        | ScanTable                  | `scan 'mytable'`     |
| 添加/删除列族 | ModifyColumnFamily         | `alter`              |
| 添加/删除列   | ModifyColumnFamily / shell | `put/delete`         |
| 清空表        | TruncateTable              | `truncate 'mytable'` |
| 统计行数      | CountRows                  | `count 'mytable'`    |
