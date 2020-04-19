//BUDGET CONTROLLER module
var budgetController = (function() {

    var Income = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value
    };

    var Expense = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value,
        this.percent = -1
    };

    Expense.prototype.calcPercent = function(totalInc) {
        if (totalInc > 0)
        {
            this.percent = Math.round((this.value / totalInc) * 100);
        }
        else {
            this. percent = -1;
        }
    };

    Expense.prototype.getPercent = function() {
        return this.percent;
    };

    //to stored all of Inc/Exp obj, an array is the best solution
    //to maximize it more effectively
    var data = {
        allTypes : {
            inc : [],
            exp : []
        },
        total : {
            inc : 0,
            exp : 0
        },
        budget : 0,
        percentage : -1
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allTypes[type].forEach(element => {
            sum += element.value;
        });
        data.total[type] = sum;
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            //First element
            if(data.allTypes[type].length == 0) {
                ID = 0;
            } else {
                // [1 2 3 4 5], the next ID is 6
                // [1 2 4 6 8], the next ID should be 9
                // => ID = last ID + 1
                //                                      .id tuc la id cua cai thang Exp hay Inc do
                //                                      VD: exp[cc(1), dmm(2), ...]
                ID = data.allTypes[type][data.allTypes[type].length - 1].id + 1;
            }
            
            //Create New Item
            if(type === "inc"){
                newItem = new Income(ID, des, val);
            } else if (type === "exp") {
                newItem = new Expense(ID, des, val);
            }

            //Push it into data structure
            data.allTypes[type].push(newItem);
            return newItem;
        },

        removeItem: function(type, id) {
            //Ex: [1 2 4 6 9], we want to del id 6
            // -> element = 3
            var ids, element;
            //Different from forEach, map is another method can loop over an array but then return an diff array
            ids = data.allTypes[type].map(function(cur) {
                return cur.id;
            });

            //Return an index of an array
            element = ids.indexOf(id);
            if (element !== -1) {
                //SLPICE la method de xoa element
                data.allTypes[type].splice(element, 1);
            }
        },

        calculateBudget: function() {
            //Calculate total income and expense
            calculateTotal('inc');
            calculateTotal('exp');
            //Calculate budget: income-expense
            data.budget = data.total.inc - data.total.exp;
            //Calculate percentage
            if(data.budget > 0) {
                data.percentage = Math.round(data.total.exp / data.total.inc * 100);
            } else if (data.budget === 0) {
                data.percentage = 0;
            }
        },

        calculateExpPercentages: function() {
            //totalinc = 300, exp1 = 30 -> per = 1/10
            data.allTypes.exp.forEach(cur => {
                cur.calcPercent(data.total.inc);
            });
        },

        getPercentages: function() {
            var allPer = data.allTypes.exp.map(function(cur) {
                return cur.getPercent();
            });
            return allPer;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                percent: data.percentage,
                totalIncome: data.total.inc,
                totalExpense: data.total.exp
            }
        },

        testing: function(){
            console.log(data);
        }
    };
})();

//UI CONTROLLER module
var UIController = (function() {
    
    //When we have to change some input string manually, it can causes some bugs because we might not delete all of those strings
    //Best solution is to create a private variable to contain it
    var inputStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputAddBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLable: '.budget__value',
        totalIncLable: '.budget__income--value',
        totalExpLable: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        container: '.container',
        percentagesExpense: '.item__percentage',
        date: ".budget__title--month"
    };

    var formatNumber = function(num, type) {
        var numSplit;
        // Decimal
        num = Math.abs(num);
        // toFixed() convert a number to a string, keeps '2' decimals
        num = num.toFixed(2);
        
        //, thousand
        numSplit = num.split('.'); //-> split[0] : int, split[1] : dec
        if(numSplit[0].length > 3) {
            numSplit[0] = numSplit[0].substring(0, numSplit[0].length - 3) + ',' + num.substring(numSplit[0].length - 3, numSplit[0].length);

        }

        //+ -
        return (type === "inc" ? '+' : '-') + ' ' + numSplit[0] + '.' + numSplit[1];
    };

    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type : document.querySelector(inputStrings.inputType).value,
                description : document.querySelector(inputStrings.inputDescription).value,
                value : parseFloat(document.querySelector(inputStrings.inputValue).value)        
            };
        },

        addListItem: function(obj, type) {
            var html, newHTML, element;

            //Creat some string HTML with placeholder text
            if (type === "inc") {
                element = inputStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === "exp") {
                element = inputStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            //Replace placeholder with actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
            //Insert it into DOM
            //Gotta use insertAdjacent method
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        removeListItem: function(itemID) {
            var el;
            el = document.getElementById(itemID);
            el.parentNode.removeChild(el);
            //In JS, you cannot remove element, can ONLY remove CHILD
        },

        clearInputFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(inputStrings.inputDescription + ',' + inputStrings.inputValue);
            //fields tra ve LIST

            //Boi vi list vs array kha giong nhau, day la 1 cach de trick = slice function
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            })

            //Focus cho gia tri dau tien cua fieldsArr which is Description
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(inputStrings.budgetLable).textContent = formatNumber(obj.budget, type);
            document.querySelector(inputStrings.totalIncLable).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(inputStrings.totalExpLable).textContent = formatNumber(obj.totalExpense, 'exp');
            if(obj.percent > 0) {
                document.querySelector(inputStrings.percentageLable).textContent = obj.percent + '%';
            } else {
                document.querySelector(inputStrings.percentageLable).textContent = '---';
            }

        },

        displayPercentages: function(percentageArrays) {
            var fields = document.querySelectorAll(inputStrings.percentagesExpense);
            
            // fields return a NODE LIST, and it doesnt have Arr-method
            // That's why we have to create our NodeList-ForEach
            // But I already removed it above cuz we have to use it again in ChangeColor
            
            nodeListForEach(fields, function(cur, index) {
                if (percentageArrays[index] > 0) {
                    cur.textContent = percentageArrays[index] + '%';
                } else {
                    cur.textContent = '---';
                }
            });

        },

        displayDate: function() {
            var now, month, year, months;

            now = new Date(); //with no parameters, it will be today
            months = ['January', 'Februay', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth(); //0 -> 11
            year = now.getFullYear();

            document.querySelector(inputStrings.date).textContent = months[month] + ', ' + year;
        },

        changeColor: function() {
            var fields;

            fields = document.querySelectorAll(inputStrings.inputType + ',' +
                                        inputStrings.inputValue + ',' +
                                        inputStrings.inputDescription);

            // The classList property returns the class name(s) of an element
            // is used to add, remove, toggle classes on an element
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle("red-focus");
            });

            document.querySelector(inputStrings.inputAddBtn).classList.toggle("red");
        },

        getinputStrings: function() {
            return inputStrings;
        }
    };
    
})();

//GLOBAL APP CONTROLLER module
var controller = (function(budgetCtrl, UICtrl) {

    //As we will write more EventListener so, to control it, we need to create a function that includes all EventListener
    //In order to control it easier
    var controlEventListerner = function() {

        //Variable inputString cua add__btn
        var inputStrings = UICtrl.getinputStrings();

        document.querySelector(inputStrings.inputAddBtn).addEventListener("click", CtrlAdd);
        document.querySelector(inputStrings.container).addEventListener('click', CtrlDelete);
        document.addEventListener('keypress', function(concac){ //dung para ten gi cung dc
            if(concac.keyCode === 13)
                CtrlAdd();
        });
    
        document.querySelector(inputStrings.inputType).addEventListener("change", UICtrl.changeColor);
    }

    //Boi vi 2 buoc nay di chung vs nhau
    //Va 1 lat se dung no de xoa item nen se tach rieng ra de follow DRY rule
    var updateBudget = function() {
        //4. Calculate budget
        budgetCtrl.calculateBudget();
        //5. Return budget
        var budget = budgetCtrl.getBudget();
        //6. Display budget on UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function() {
        // 1. Calculate percentages
        budgetCtrl.calculateExpPercentages();

        // 2. Read percentages from budget controller (GET)
        var listpercentages = budgetCtrl.getPercentages();

        // 3. Update percentage UI
        UICtrl.displayPercentages(listpercentages);
    }
    var CtrlAdd = function(){
        var input, obj;
    // 1. Get the input from user
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add item to budget controller
            obj = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add item to UI
            UICtrl.addListItem(obj, input.type);

            // Then clear the Input Fields
            UICtrl.clearInputFields();

            // 4. Calculate and Update budget
            updateBudget();

            // 5. Update Expense Percentages
            updatePercentages();
        }
    }
    
    //addEventListener has a callback function that always access to "event" object
    var CtrlDelete = function(event) {

        var itemID, type, ID, arr;
        // This is called DOM traversing
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            arr = itemID.split('-');
            type = arr[0];
            //Boi vi cai nay la string kf int nen ko so sanh trong ham 1. dc
            ID = parseInt(arr[1]);
    
        }

        // 1. Delete the item from the budgetCTRler
        budgetCtrl.removeItem(type, ID);

        // 2. Delete frome the UICtrl
        UICtrl.removeListItem(itemID);
        
        // 3. Display the updated budget
        updateBudget();
        
        // 4. Update Expense Percentages
        updatePercentages();
    }

    return {
        init : function() {
            console.log("Your system has started");
            controlEventListerner();
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                percent: 0,
                totalIncome: 0,
                totalExpense: 0
            });
        }
    }
    
})(budgetController, UIController);

controller.init();