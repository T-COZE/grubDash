const path = require("path");
const { json } = require("express/lib/response");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");



  
  function list(req, res, next) {
    res.json({ data: orders });
  }
  
  function read(req, res, next) {
    res.json({ data: res.locals.order });
  }

  function orderExists(req, res, next){
    const{ orderId}= req.params
    const foundId = orders.find(o => o.id === ordersId)
    if(foundId){
        res.locals.order = foundId
        return next()
    }
    next({status:404, message:`Order id does not exist: ${orderId}`})
  }



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


  function orderExists(req, res, next){
    const {orderId} = req.params
    const foundOrder = orders.find(o =>o.id === orderId)
    
    if(foundOrder){
        foundOrder = res.locals.order 
        next()
    }
    next({ status: 404, message: `Order id not found: ${orderId}`})
  }

  function read(req, res, next){
    const order = res.locals.order;
    res.json({ data: order });
  }
  function allFieds(req, res, next){
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

  function validateUpdate(req, res, next){
    const {orderId}= req.params
    const order = res.locals.order
    const {data: {id, status}={}}= req.body

    if(id && id !== orderId){
        next({status: 400, message:`Order id does not match order: Order: ${id} Route: ${orderId} `})
    }
    if(!status || !["pending","preparing", "out-for-delivery", "delivered"].includes(status)){
        next({status: 400, message:"Order must have a status of pending, preparing, out-for-delivery, delivered"})
    }
  }
  function update(req, res) {
    const order = res.locals.order;
    const { data: { deliverTo, mobileNumber, dishes, quantity } = {} } = req.body;
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.dishes = dishes;
    order.quantity = quantity;

    res.json({data: order})
}

  function destroy(req, res, next) {
    const orderToDelete = res.locals.order;
  
    if (orderToDelete.status !== "pending") {
      next({
        status: 400,
        message: "An order cannot be deleted unless it is pending",
      });
    }
  
    const index = orders.findIndex((order) => order.id === orderToDelete.id);
    orders.splice(index, 1);
    res.sendStatus(204);
  }

  
module.exports = {
    list,
    read: [orderExists, read],
    create: [allFields, create],
    update: [orderExists, allFields, validateUpdate, update],
    delete: [orderExists, deleteValidate, destroy]
}