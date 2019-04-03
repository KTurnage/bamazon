// install and require mysql to communicate with database.
// install and require inquirer to take input from user.
// require Table to easily view the store, items and inventory numbers.
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

// create a connection to mysql database
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
});

// create a function to display the products on the table in the command line
var displayProducts = function () {
    // create a variable to store the "select * from" table in database
    var query = "Select * FROM products";
    // connection query takes in the variable query, with callback function taking in error and results
    connection.query(query, function (err, res) {
        // if there is an error, throw error
        if (err) throw err;
        // create a variable for the display table on the command line
        // lay out the table in the same fashion as the mySQL database
        var displayTable = new Table({
            head: ["item_id", "product_name", "department_name", "price", "stock_quantity"],
            colWidths: [10, 25, 25, 10, 14]
        });
        // create a for loop that will push the items for sale to the array
        for (var i = 0; i < res.length; i++) {
            displayTable.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
            );
        }
        console.log(displayTable.toString());
        // call the start function to start shopping
        start();
    });

}
// start function initiates inquirer asking for user input to choose the ID of the product they want to buy.
function start() {
    inquirer.prompt(
        [
            {
                type: "input",
                name: "itemID",
                message: "WHAT IS THE ID OF THE PRODUCT YOU WOULD LIKE TO BUY?"
            },
            // after user input, take in the results, and console log the results + itemID
        ]).then(function (res) {
            console.log(res.itemID);
            // set value for new variable equal to results + itemID
            var itemDesired = res.itemID;
            // all get quanitity id passing through itemsDesired variable
            getQuantity(itemDesired);
        })

}
// get user input to find out how many of their item they would like to purchase.
function getQuantity(itemID) {
    inquirer.prompt(
        [
            {
                type: "input",
                name: "itemQuantity",
                message: "HOW MANY UNITS OF THE PRODUCT WOULD YOU LIKE TO BUY?"
            },
            // after user input, take in results and console log results + itemQuantity and itemID
        ]).then(function (res) {
            console.log(res.itemQuantity, itemID);
            // set value for new variable equal to results + itemQuantity
            var qtyDesired = res.itemQuantity;
            // call purchaseOrder function
            purchaseOrder(qtyDesired, itemID);
        })
}
displayProducts();
// takes in quantitiy and id of products, make sure the requested quantity is in stock, update the database with new stock, give customer their total for the order.
function purchaseOrder(qty, id) {
    console.log("qty desired", qty, id);
    // create new variable for item_ id from products table
    var query = "Select * FROM products WHERE item_id =" + id;
    console.log(query)
    // create connection query that takes in new variable
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log(res, parseInt(qty))
        // create new variable that multiplies requested quantity by item price
        var price = res[0].price * qty;
        // turn price into integer from string using parseInt
        // if requested qty is too high, alert customer and start back at the beginning
        if (parseInt(qty) > res[0].stock_quantity) {
            console.log("Insufficient Quantity. Try again.");
            displayProducts();
        } else {
            // if requested qty can be filled, remove requested qty from database stock
            console.log("inventory check");
            // create new variable for adjusted stock count
            var newStock = res[0].stock_quantity - qty;
            // update the database
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
// opt out function
function endConnection() {
    // user must choose if they would like to keep shopping or exit
    inquirer.prompt([
        {
            name: "end",
            type: "list",
            choices: ["buy more stuff", "quit"],
            message: "Would you like to buy more stuff, or leave?"
        }
    ]).then(function (res) {
        // if user chooses to buy more stuff, call displayProducts function to allow more shopping
        if (res.end == "buy more stuff") {
            displayProducts();
            // if they choose quit, end the connection to the database
        } else {
            connection.end()
        }
    });

}