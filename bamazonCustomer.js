var mysql = require("mysql");
var Table = require("cli-table");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazonDB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    // afterConnection();
});

var displayProducts = function () {
    var query = "Select * FROM products";
    connection.query(query, function (err, res) {
        if (err) throw err;
        var displayTable = new Table({
            head: ["item_id", "product_name", "department_name", "price", "stock_quantity"],
            colWidths: [10, 25, 25, 10, 14]
        });
        for (var i = 0; i < res.length; i++) {
            displayTable.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
            );
        }
        console.log(displayTable.toString());
        start();
    });

}

function start() {
    inquirer.prompt(
        [
            {
                type: "input",
                name: "itemID",
                message: "WHAT IS THE ID OF THE PRODUCT YOU WOULD LIKE TO BUY?"
            },
        ]).then(function (res) {
            console.log(res.itemID);
            var itemDesired = res.itemID;
            getQuantity(itemDesired);
        })
    // purchaseOrder()

}

function getQuantity(itemID) {
    inquirer.prompt(
        [
            {
                type: "input",
                name: "itemQuantity",
                message: "HOW MANY UNITS OF THE PRODUCT WOULD YOU LIKE TO BUY?"
            },
        ]).then(function (res) {
            console.log(res.itemQuantity, itemID);
            var qtyDesired = res.itemQuantity;
            purchaseOrder(qtyDesired, itemID);
        })
}
displayProducts();

function purchaseOrder(qty, id) {
    console.log("qty desired", qty, id);
    var query = "Select * FROM products WHERE item_id =" + id;
    console.log(query)
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log(res, parseInt(qty))
        var price = res[0].price * qty;
        if (parseInt(qty) > res[0].stock_quantity) {
            console.log("Insufficient Quantity. Try again.");
            displayProducts();
        } else {
            console.log("inventory check");
            var newStock = res[0].stock_quantity - qty;
            var query = "UPDATE products SET ? WHERE ?";
            connection.query(query, [{ stock_quantity: newStock }, { item_id: id }], function (err, res) {
                console.log("updated stock")
                console.log(price);
                endConnection();
            })


        }
    }
    )
};

function endConnection() {
    inquirer.prompt([
        {
            name: "end",
            type: "list",
            choices: ["buy more stuff", "quit"],
            message: "Would you like to buy more stuff, or leave?"
        }
    ]).then (function (res) {
        if (res.end == "buy more stuff") {
            displayProducts();
        } else {
            connection.end()
        }
    });
    
}