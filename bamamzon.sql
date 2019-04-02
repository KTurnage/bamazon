DROP DATABASE IF EXISTS bamazonDB;

CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products (
	id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
	product_name VARCHAR(50),
	department_name VARCHAR(50),
	price DECIMAL(10, 2),
	stock_quantity INTEGER NOT NULL
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("leash", "pet supply", 13.95, 42), ("big train chai", "food", 29.95, 34), ("32oz glass water bottle", "housewares", 14.50, 12), ("laptop", "computers/electronics", 498.75, 104);


SELECT * FROM products;