CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, customer_name TEXT, region TEXT);
INSERT INTO customers VALUES (1,'田中商事','東京'),(2,'佐藤物産','大阪'),(3,'鈴木工業','東京'),(4,'高橋商会','福岡'),(5,'伊藤産業','大阪');
CREATE TABLE products (product_id INTEGER PRIMARY KEY, product_name TEXT, category TEXT, unit_price INTEGER);
INSERT INTO products VALUES (101,'ノートPC','電子機器',120000),(102,'マウス','電子機器',2500),(103,'デスク','家具',35000),(104,'チェア','家具',18000),(105,'モニター','電子機器',28000),(106,'ペン','文具',150);
CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, quantity INTEGER, order_date TEXT);
INSERT INTO orders VALUES (1001,1,101,2,'2024-01-15'),(1002,1,102,5,'2024-01-15'),(1003,2,103,1,'2024-02-03'),(1004,3,105,3,'2024-02-10'),(1005,2,104,4,'2024-03-01'),(1006,1,105,2,'2024-03-12'),(1007,4,102,10,'2024-03-20'),(1008,3,101,1,'2024-04-05'),(1009,5,106,50,'2024-04-18'),(1010,2,101,1,'2024-05-02');
