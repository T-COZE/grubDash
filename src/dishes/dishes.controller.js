const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// read, list, update, create, delete
function list(req, res, next) {
    res.json({ data: dishes });
  }

function read(req, res, next) {
    res.json({ data: res.locals.dish });
  }

function dishExists(req, res, next) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
      res.locals.dish = foundDish;
      return next();
    }
    next({
      status: 404,
      message: `Dish id does not exist: ${dishId}`,
    });
    next();
  }
  function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const id = nextId();
    const newDish = {
      id,
      name,
      description,
      price,
      image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
  }
  function validateName(req, res, next) {
    const { name } = req.body.data;
    if (name) {
      return next();
    }
    next({ status: 400, message: "Dish must include a name" });
  }
 
  function validateDescription(req, res, next){
    const { description } = req.body.data;
    if (description) {
      return next();
    }
    next({ status: 400, message: "Dish must include a description" });
  }
   function validateImage(req, res, next){
    const { image_url } = req.body.data;
  if (image_url) {
    return next();
  }
  next({ status: 400, message: "Dish must include a image_url" });
   }


   function validatePrice(req, res, next){
    const { price } = req.body.data;
    if (price > 0) {
      return next();
    } else {
      next({
        status: 400,
        message: "Dish must include a price",
      });
    }
    next();
   }

   function validateNumber(req, res, next){
    const { price } = req.body.data;
    if (typeof(price) === "number") {
      return next();
    } else {
      next({
        status: 400,
        message: "Dish must have a price that is an integer greater than 0",
      });
    }
    next();
   }
 
   function validateId(req, res, next){
    const { dishId } = req.params;
    const { id } = req.body.data;
    if (!id || id === dishId) {
      return next();
    } else {
      next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
      });
    }
    next();
   }

   // put function
function update(req, res, next){
    const dish = res.locals.dish;
    const { data: { name, description, price, image_url } = {} } = req.body;

    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url

    res.json({data: dish})
}


module.exports ={
    list, 
    read:[dishExists, 
        read],
        create:[
            validateName,
            validateDescription,
            validateNumber, 
            validateId,
            validateImage,
            validatePrice,
            create
        ],
        update:[dishExists,
        validateId,
         validateDescription,
        validateName,
        validateImage,
        validateNumber,
        validatePrice, 
        update],

}