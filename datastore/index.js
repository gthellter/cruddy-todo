const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {

  counter.getNextUniqueId((err, id) => {
    if (err) {
      throw (err, 'error getting ID')
    } else {
      let destination = path.join(exports.dataDir, id + '.txt');
      fs.writeFile(destination, text, {flag: 'w+'}, (err) => {
        if (err) {
          callback(err, 'error writing file');
        } else {
          callback(null, {id, text});
        }
      })}
  });
  // items[id] = text;
  // callback(null, { id, text });
};

exports.readAll = (callback) => {
  //fs.readdir(path to dir, options(optional), callback(err, NamesOfFiles))
  //maybe need an eventHandler (eventEmitter())
  //as soon as readdir function emits event, run below function (note: both id and text should be id)
  var data = _.map(items, (text, id) => {
    return { id, text };
  });
  callback(null, data);
};

exports.readOne = (id, callback) => {
  //fs.readFile(`./dataDir/${id}`, (err)=>{[same as below, but instead of !text err]})
  var text = items[id];
  if (!text) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback(null, { id, text });
  }
};

exports.update = (id, text, callback) => {
  //I think this is gonna be similar to exports.create, but with existing id
  var item = items[id];
  if (!item) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    items[id] = text;
    callback(null, { id, text });
  }
};

exports.delete = (id, callback) => {
  //fs.rm(`./dataDir/${id}.txt`, (err)=>{[same error as below]}) or fs.unlink
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
