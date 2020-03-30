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
        this.value = value
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
        }
    }

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
        expenseContainer: '.expenses__list'
    };

    return {
        getInput: function() {
            return {
                type : document.querySelector(inputStrings.inputType).value,
                description : document.querySelector(inputStrings.inputDescription).value,
                value : document.querySelector(inputStrings.inputValue).value        
            };
        },

        addListItem: function(obj, type) {
            var html, newHTML, element;

            //Creat some string HTML with placeholder text
            if (type === "inc") {
                element = inputStrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === "exp") {
                element = inputStrings.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            //Replace placeholder with actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', obj.value);
            //Insert it into DOM
            //Gotta use insertAdjacent method
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
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

        getinputStrings: function() {
            return inputStrings;
        }
    };
    
})();

//GLOBAL APP CONTROLLER module
var controller = (function(budgetCtrl, UICtrl){

    //As we will write more EventListener so, to control it, we need to create a function that includes all EventListener
    //In order to control it easier
    var controlEventListerner = function() {

        //Variable inputString cua add__btn
        var inputStrings = UICtrl.getinputStrings();

        document.querySelector(inputStrings.inputAddBtn).addEventListener("click", CtrlAdd);
        document.addEventListener('keypress', function(concac){ //dung para ten gi cung dc
            if(concac.keyCode === 13)
                CtrlAdd();
        });
    
    }

    //Boi vi 2 buoc nay di chung vs nhau
    //Va 1 lat se dung no de xoa item nen se tach rieng ra de follow DRY rule
    var updateBudget = function() {
        //4. Calculate budget

        //5. Return budget

        //6. Display budget on UI

    }

    var CtrlAdd = function(){
        var input, obj;
    //1. Get the input from user
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. Add item to budget controller
            obj = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add item to UI
            UICtrl.addListItem(obj, input.type);

            //Then clear the Input Fields
            UICtrl.clearInputFields();

            //4. Calculate and Update budget
            updateBudget();
        }
    
    }
    
    return {
        init : function() {
            console.log("Your system has started");
            controlEventListerner();
        }
    }
    
})(budgetController, UIController);

controller.init();