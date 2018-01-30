// These values limit the writing of a new config file to /strategies
let fs = require('fs');
let path = require('path');

// These settings allow you to fine tune at which point a configuration is exported to your strategies folder
let MIN_ROI = 5;
let MIN_WIN_LOSS_RATIO = 0.3;
let MIN_VSBUYHOLD = 2;

module.exports = {
  best: function(best, dataJSON) {


    fs.isDir = function(dpath) {
        try {
            return fs.lstatSync(dpath).isDirectory();
        } catch(e) {
            return false;
        }
    };

    fs.mkdirp = function(dirname) {
        dirname = path.normalize(dirname).split(path.sep);
        dirname.forEach((sdir,index)=>{
            var pathInQuestion = dirname.slice(0,index+1).join(path.sep);
            if((!fs.isDir(pathInQuestion)) && pathInQuestion) fs.mkdirSync(pathInQuestion);
        });
    };


    roi = best.sim.roi
    wins = best.sim.wins
    losses = best.sim.losses
    vsBuyHold = best.sim.vsBuyHold
    days = best.sim.days
    wlRatio = best.sim.wlRatio

    // basic safety net to prevent bad config file
    if (roi > MIN_ROI && vsBuyHold >= MIN_VSBUYHOLD && wlRatio > MIN_WIN_LOSS_RATIO) {
      parameters = best.sim.params

      selector = best.sim.selector
      strategy = best.sim.strategy

      outputDir="strategies/" + selector + "/" + days + "/"

      fs.mkdirp(outputDir)

      fs.writeFile(outputDir + strategy + ".conf", parameters, err => {
       if (err) throw err; 
      });

      fs.writeFile(outputDir + strategy + "_results.json", JSON.stringify(best), err => {
       if (err) throw err;
      });

      fs.writeFile(outputDir + strategy + "_data.json", dataJSON, err => {
       if (err) throw err;
      });
      console.log("Good result, writing new config")
      console.log("\r\nResults: roi: " + roi + ", wins: " + wins + ", losses: " + losses + ", vsBuyHold: " + vsBuyHold)
    } else {
      console.log("\r\nNot writing new config: roi: " + roi + ", wins: " + wins + ", losses: " + losses + ", vsBuyHold: " + vsBuyHold)
    }
  }
}