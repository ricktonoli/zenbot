#!/usr/bin/env node

/* Zenbot 4 Backtest Results Comparison
 * Rick Tonoli <rick.tonoli@gmail.com>
 * 01/02/2018
 *
 * Example: ./best.js --directory="./strategies" --days=30 --strategy="dema'
 */
let shell = require('shelljs')
let parallel = require('run-parallel-limit')
let json2csv = require('json2csv')
let roundp = require('round-precision')
let GeneticAlgorithmCtor = require('geneticalgorithm')
let StripAnsi = require('strip-ansi')
let moment = require('moment')
let fs = require('fs')
let path = require('path');
let Phenotypes = require('./phenotype.js')

let PARALLEL_LIMIT = (process.env.PARALLEL_LIMIT && +process.env.PARALLEL_LIMIT) || require('os').cpus().length
//let PARALLEL_LIMIT = 1

let runCommand = (taskStrategyName, phenotype, cb) => {
	var cmdArgs = Object.assign({}, phenotype)
	cmdArgs.strategy = taskStrategyName

//console.log(JSON.stringify(cmdArgs))

	var selector = cmdArgs.selector.normalized?cmdArgs.selector.normalized:cmdArgs.selector

	delete cmdArgs.selector
	delete cmdArgs.sim

	let zenbot_cmd = process.platform === 'win32' ? 'zenbot.bat' : './zenbot.sh'
	let command = `${zenbot_cmd} sim ${selector} --asset_capital=0 --currency_capital=1000`

	for (const [ key, value ] of Object.entries(cmdArgs)) {
		if (key != 'start' && key != 'end') {
			command += ` --${key}=${value}`
		}
	}

	command += " --days=" + days

//  console.log('Running ' + selector + ', ' + days + ' days')
  console.log(`${command}`)
//	console.log(`[ ${iterationCount++}/${populationSize * selectedStrategies.length} ] ${command}`)

//	comparison['sim'] = {}

	shell.exec(command, {
	silent: true,
	async: true
	}, (code, stdout, stderr) => {
	if (code) {
	  console.error(command)
	  console.error(stderr)
	  return cb(null, null)
	}

	var phenotype = {sim:''}

	let result = null
	try {
	  result = processOutput(stdout)
	  phenotype['sim'] = result
	  result['fitness'] = Phenotypes.fitness(phenotype)
	} catch (err) {
	  console.log('Bad output detected', err.toString())
	  console.log(stdout)
	}

	cb(null, result)
	})
}

let runUpdate = (days, selector) => {
  let zenbot_cmd = process.platform === 'win32' ? 'zenbot.bat' : './zenbot.sh'
  let command = `${zenbot_cmd} backfill --days=${days} ${selector}`
  console.log('Backfilling (might take some time) ...')
  console.log(command)

  shell.exec(command, {
    silent: true,
    async: false
  })
}

let processOutput = output => {
  let jsonRegexp = /(\{[\s\S]*?\})\send balance/g
  let endBalRegexp = /end balance: (\d+\.\d+) \(/g
  let buyHoldRegexp = /buy hold: (\d+\.\d+) \(/g
  let vsBuyHoldRegexp = /vs. buy hold: (-?\d+\.\d+)%/g
  let wlRegexp = /win\/loss: (\d+)\/(\d+)/g
  let errRegexp = /error rate: (.*)%/g

  let strippedOutput = StripAnsi(output)
  let output2 = strippedOutput.substr(strippedOutput.length - 3500)

  let rawParams = jsonRegexp.exec(output2)[1]
  let params = JSON.parse(rawParams)
  let endBalance = endBalRegexp.exec(output2)[1]
  let buyHold = buyHoldRegexp.exec(output2)[1]
  let vsBuyHold = vsBuyHoldRegexp.exec(output2)[1]
  let wlMatch = wlRegexp.exec(output2)
  let errMatch      = errRegexp.exec(output2)
  let wins          = wlMatch !== null ? parseInt(wlMatch[1]) : 0
  let losses        = wlMatch !== null ? parseInt(wlMatch[2]) : 0
  let errorRate     = errMatch !== null ? parseInt(errMatch[1]) : 0
//  let days = parseInt(params.days)
  let start = parseInt(params.start)
  let end = parseInt(params.end)

  let roi = roundp(
    ((endBalance - params.currency_capital) / params.currency_capital) * 100,
    3
  )

  let r = JSON.parse(rawParams.replace(/[\r\n]/g, ''))
  delete r.asset_capital
  delete r.buy_pct
  delete r.currency_capital
  delete r.days
  delete r.mode
  delete r.order_adjust_time
  delete r.population
  delete r.population_data
  delete r.sell_pct
  delete r.start
  delete r.end
  delete r.stats
  delete r.use_strategies
  delete r.verbose
  r.selector = r.selector.normalized

  if (start) {
    r.start = moment(start).format('YYYYMMDDhhmm')
  }
  if (end) {
    r.end = moment(end).format('YYYYMMDDhhmm')
  }
  if (!start && !end && params.days) {
    r.days = params.days
  }

  return {
    params: 'module.exports = ' + JSON.stringify(r),
    endBalance: parseFloat(endBalance),
    buyHold: parseFloat(buyHold),
    vsBuyHold: parseFloat(vsBuyHold),
    wins: wins,
    losses: losses,
    errorRate: parseFloat(errorRate),
    period_length: params.period_length,
    days: days,
    min_periods: params.min_periods,
    markdown_buy_pct: params.markdown_buy_pct,
    markup_sell_pct: params.markup_sell_pct,
    order_type: params.order_type,
    roi: roi,
    wlRatio: losses > 0 ? roundp(wins / losses, 3) : 'Infinity',
    selector: params.selector,
    strategy: params.strategy,
    frequency: roundp((wins + losses) / days, 3)
  }
}

let argv = require('yargs').argv
let args = Object.assign({}, argv)

var days = args.days?args.days:30
var directory = args.directory?args.directory:"./strategies"

var walkSync  = function(dir, filelist) {
      var path = path || require('path');
      var fs = fs || require('fs'),
          files = fs.readdirSync(dir);
      filelist = filelist || [];
      files.forEach(function(file) {
          if (fs.statSync(path.join(dir, file)).isDirectory()) {
              filelist = walkSync(path.join(dir, file), filelist);
          }
          else {
          		if (file.split(".")[1] === "conf") {
                if (args.strategy) {
                  if (file.split(".")[0] === args.strategy) {
                    filelist.push(path.join(dir, file));
                  }
                } else {
                  filelist.push(path.join(dir, file));
                }
	        		}
          }
      });
      return filelist;
};

var filelist = []

walkSync(directory, filelist)

//var tasks = []

//console.log(filelist)

function importedData(file) {
	result = [];
	console.log(file)
	imported = JSON.parse(fs.readFileSync(file, 'utf8').replace('module.exports =',''))
	result.push(imported)
	return result;
}


let tasks = filelist.map(file => 
    importedData(file).map(data => {
      return cb => {
        runCommand(data.strategy, data, cb)
      }
    })
  ).reduce((a, b) => a.concat(b))

var finishedRun = []

parallel(tasks, PARALLEL_LIMIT, (err, results) => {
	finishedRun.push(results)
  results.sort((a, b) => (a?a.fitness:0 < b?b.fitness:0) ? 1 : ((b?b.fitness:0 < a?a.fitness:0) ? -1 : 0))

  outputDir="strategies/" + results[0].selector.normalized + "/best/"

  if (args.strategy) {
    outputDir+=args.strategy+"/"
  }

  fs.mkdirp(outputDir)

  fs.writeFile(outputDir + "best.conf", results[0].params, err => {
   if (err) throw err; 
  });

})


fs.mkdirp = function(dirname) {
    dirname = path.normalize(dirname).split(path.sep);
    dirname.forEach((sdir,index)=>{
        var pathInQuestion = dirname.slice(0,index+1).join(path.sep);
        if((!fs.isDir(pathInQuestion)) && pathInQuestion) fs.mkdirSync(pathInQuestion);
    });
};

fs.isDir = function(dpath) {
    try {
        return fs.lstatSync(dpath).isDirectory();
    } catch(e) {
        return false;
    }
};
