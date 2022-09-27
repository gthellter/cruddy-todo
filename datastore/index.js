const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

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
};

exports.readAll = (callback) => {
  //fs.readdir(path to dir, options(optional), callback(err, NamesOfFiles))
  //as soon as readdir function emits event, run below function (note: both id and text should be id)
  let readDirAsync = function () {
    return new Promise((resolve, reject) => {
      fs.readdir(exports.dataDir, (err, data) => {
        if(err) { reject(err) }
        else { resolve(data ) }
      })
    })
  }

  var ids = [];
  readDirAsync(exports.dataDir).then((data) => {
    return Promise.all(data.map((file) => {
      let filePath = path.join(exports.dataDir, file);
      file = file.substring(0, file.length - 4);
      ids.push(file);
      return fs.promises.readFile(filePath, 'utf8');
    }))
  }).then((array) => {
    return array.map((text, index) => {
      let id = ids[index];
      return {id: id, text: text};
  })})
  .then((array) => {
    callback(null, array);})
  .catch((err) => callback(err));
};

exports.readOne = (id, callback) => {
  //fs.readFile(`./dataDir/${id}`, (err)=>{[same as below, but instead of !text err]})
  let destination = path.join(exports.dataDir, id + '.txt');
  fs.readFile(destination, 'utf8', (err, text) => {
    if (err) {
      callback(err);
    } else {
      callback(null, { id, text } );
    }
  })
};

exports.update = (id, text, callback) => {
  //I think this is gonna be similar to exports.create, but with existing id
  let destination = path.join(exports.dataDir, id + '.txt');

  fs.readdir(exports.dataDir, (err, data) => {
    if (err) {
      callback(err);
    } else if (data.includes(id + '.txt')) {
      fs.writeFile(destination, text, {flag: 'w+'}, (err) => {
        if (err) {
          callback(err, 'error writing file');
        } else {
          callback(null, {id, text});
        }
      });
    } else {
      callback('File Doesn\'t exist');
    }
  })
};

exports.delete = (id, callback) => {
  //fs.rm(`./dataDir/${id}.txt`, (err)=>{[same error as below]}) or fs.unlink
  let destination = path.join(exports.dataDir, id + '.txt');
  fs.rm(destination, (err) => {
    if (err) { callback(new Error(`No item with id: ${id}`)) }
    else { callback() }
  });
  // var item = items[id];
  // delete items[id];
  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback();
  // }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
