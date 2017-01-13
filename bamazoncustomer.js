var inquirer = require('inquirer');
var mysql = require('mysql');
require('console.table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", //Your username
    password: "", //Your password
    database: "bamazon"
})

connection.connect(function(err) {
	console.log("Connected as id: " +connection.threadId);
	products();
});

var products = function () {
	var query = 'SELECT * FROM products'
	connection.query(query, function(err, res) {
			console.table(res);

		transaction();
	})
}

var transaction = function() {
	inquirer.prompt([{
		name: "choice",
		type: "input",
		message: "What is the ID of the product you would like to buy?",
			validate: function(value) {
			if(isNaN(value)==false) {
				return true;
			} else {
				return false;
			}
		}
	}, {
		name: "amount",
		type: "input",
		message: "How many would you like to buy?",
		validate:  function(value) {
			if(isNaN(value)==false) {
				return true;
			} else {
				return false;
			}
		}
	}
	]).then(function(answer) {
            var selection = answer.choice;
            var quantity = answer.amount;
            connection.query('SELECT ProductName, DepartmentName, Price FROM products WHERE ItemID = ' + selection, function(err, res) {
                if(err) throw err;
                console.table(res[0]);
            });
            connection.query('SELECT StockQuantity FROM products WHERE ItemID = ' + selection, function(err, res) {
                if(err) throw err;

                if (res[0].StockQuantity < quantity) {
                    console.log("We don't have that much in stock");
                    products();
                } else {
                  
                    var new_quantity = res[0].StockQuantity - quantity;
                    connection.query('UPDATE products SET ? WHERE ?', 
                        [{StockQuantity: new_quantity},{ItemID: selection}], 
                        function(err, res){
                            if(err) throw err;
                    });
                    console.log("Your total comes out to:")
                    connection.query('SELECT Price FROM products WHERE ItemID = ' + selection, function(err, res) {
                        var price = res[0].Price;
                        var totalCost = quantity*price;
                        console.table("$" + totalCost);
                    })
                    products();
                }
            });
            
        })
}; 


