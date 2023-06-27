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



// put function


module.exports = {
  list,
  read: [dishExists, read],
  create: [
    validateName,
    validateDescription,
    validateNumber,
    validateId,
    validateImage,
    validatePrice,
    create,
  ],
  update: [
    dishExists,
    validateId,
    validateDescription,
    validateName,
    validateImage,
    validateNumber,
    validatePrice,
    update,
  ],
};
