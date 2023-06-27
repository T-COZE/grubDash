
const path = require("path");


//TASK 3 DONE HERE


// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//GET /orders - This route will respond with a list of all existing order data. - LIST
function list(req, res, next) {
    res.json({ data: orders });
  }

// GET -Return the ORDER with the specified id - READ

function read(req, res, next) {
    res.json({ data: res.locals.order });
  }

function orderExists(req, res, next) {
    const {orderId} = req.params;
    const foundId = orders.find((order) => order.id === orderId);
    if (foundId) {
      res.locals.order = foundId;
      return next();
    }
    next({
      status: 404,
      message: `Order id does not exist: ${orderId}`,
    });
}

//POST /orders -This route will save the order and respond with the newly created order.

function create(req, res) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
    const id = nextId();
    const newOrder = {
      id,
      deliverTo,
      mobileNumber,
      dishes,
      status: "delivered",
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
  }

//DELIVER TO PROPERTY W ERRORS
//MOBILENUMBER W ERROR 
//INCLUDE A DISH
//AT LEAST ONE DISH
//DISH QUANTITIY 
 
function hasReqFields(req, res, next){
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
    if(!deliverTo){
        next ({
            status: 400,
            message: "Order must include deliverTo"
        })
    } 
    if (!mobileNumber) {
        next({
            status: 400,
            message: "Order must include mobileNumber"
        })
    } 
    if (!dishes) {
        next({
            status: 400,
            message: "Order must include a dish"
        })
    }
    if(!(Array.isArray(dishes) && dishes.length > 0)){
        next({
            status: 400,
            message: "Order must include at least one dish"
        })
    }
    dishes.forEach((dish, i) => {
        if (!Number.isInteger(dish.quantity) || dish.quantity <= 0) {
            next({
              status: 400,
              message: `Dish ${i} must have a quantity that is an integer greater than 0`,
            })
        }
    })
    next()
}

//PUT -Update an existing ORDER with the data in the request.
function update(req, res) {
    const order = res.locals.order;
    const { data: { deliverTo, mobileNumber, dishes, quantity } = {} } = req.body;
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.dishes = dishes;
    order.quantity = quantity;

    res.json({data: order})
}


//The update validation must include all of the same validation as the POST /orders route, plus the following:

function updateValidate(req, res, next) {
    const { orderId } = req.params;
    const order = res.locals.order
    const { data: { id, status } = {} } = req.body;

    if (id && id !== orderId) {
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
          });
    }  
      if(!status || !["pending", "preparing", "out-for-dellivery", "delivered"].includes(status)) {
            next({
                status: 400,
                message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
        })
    }
      if(order.status === "delivered"){
          next({
              status: 400,
              message: "A delivered order cannot be changed",
          })
      }
      next()
}

//DELETE /orders/:orderId - This route will delete the order where id === :orderId, or return 404 if no matching order is found.

  function destroy(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === Number(orderId));
      orders.splice(index, 1);
    res.sendStatus(204);
  }

//Validation The delete method must include the following validation: Validation	Error message. status property of the order !== "pending - An order cannot be deleted unless it is pending"

  function validateDelete(req, res, next){
      const order = res.locals.order
      if(order.status !== "pending"){
          next({
              status: 400,
              message: "An order cannot be deleted unless it is pending",
          })

      }
      next()
  }

//TO CONFIRM TASK 3 IS DONE ADD THE LIST, CREATE, READ, UPDATE AND DELETE HERE 

module.exports = {
    list,
    read: [orderExists, read],
    create: [hasReqFields, create],
    update: [orderExists, hasReqFields, updateValidate, update],
    delete: [orderExists, validateDelete, destroy]
}