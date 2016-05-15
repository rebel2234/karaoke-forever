let fs = require('fs')

export default function(item) {
  return new Promise(function(resolve, reject) {
    fs.stat(item, function(err, stats){
      if (err) { return reject(err) }
      return resolve(stats)
    })
  })
}
