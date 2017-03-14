// display all the items available for sale. including ids, name, and price of those products.

//prompt users with two messages 
//1. ask for the id of the product the user wants
//2. ask how many units of the product the user would like to buy

//after placing the order, the application should check if the store has enough of the product to meet the customers request
//if not the log the phrase "Insufficient quantity!" and prevent the order from going through

//however, if there is enough left then fullfill the users order
//update SQL table to reflect the remaining quantity
//show the customer the total cost of their purchase

var mysql = require("mysql");

var inquirer = require("inquirer");


var connection = mysql.createConnection({
    host:"localhost",
    port: 3336,
    user:"root",
    password: "root",
    database: "Bamazon"
});

connection.connect(function(err){
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    showProducts();
    buyProduct();
});

var showProducts = function() {
    connection.query("SELECT * FROM products", function(err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name + " Department" +" | " + "$" + res[i].price + " | " + "(" + res[i].stock_quantity + " left)");
        }
    console.log("-----------------------------------");
    });
};

var buyProduct = function() {
    connection.query("SELECT * FROM products", function(err, res){2
        inquirer.prompt({
            name: "choice",
            type: "rawlist",
            choices: function(value) {
                var productArray = [];
                for (var i = 0; i < res.length; i++){
                    productArray.push(res[i].product_name);
                }
                return productArray;
            },
            message: "What product would you like to buy?"
        }).then(function(answer){
            for (var i = 0; i < res.length; i++){
                if (res[i].product_name === answer.choice) {
                    var chosenItem = res[i];
                    inquirer.prompt({
                        name: "buy",
                        type: "input",
                        message: "How many would you like to buy?"
                    }).then(function(answer){
                        
                        if (chosenItem.stock_quantity >= parseInt(answer.buy)){
                            var stockCount = chosenItem.stock_quantity - answer.buy;
                            connection.query("UPDATE products SET ? WHERE ?", [{
                                stock_quantity: stockCount
                            }, {
                                item_id: chosenItem.item_id
                            }], function(err, res) {
                                console.log("Purchase successful!");
                                var total = answer.buy * chosenItem.price;
                                console.log("~~~~~~~~~~~~~~~~~~~~~~~");
                                console.log("Your total comes to $" + total + ".00");
                                console.log("~~~~~~~~~~~~~~~~~~~~~~~");
                                showProducts();
                                connection.end();
                            });
                        } else {
                            console.log("! ! ! Purchase unsuccessful ! ! !");
                            showProducts();
                            connection.end();
                        }
                    });
                }
            }
        });
    });
};

