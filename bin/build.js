#!/usr/bin/env node
'use strict';

const rollup = require('rollup');
const nodeResolve = require('rollup-plugin-node-resolve');

const chokidar = require("chokidar");
const exec = require("child_process").exec;
const packageJSON = require("../package.json");
const CMD = "jasmine";


const config = {
  input : {
    input: './index.js',
    //external : ["@aboutweb/proxyscope"]
    plugins: [
      function() {
        console.log("arg", arguments);
      },
      nodeResolve()
    ],
  },

  output : [{
    file : packageJSON.main,
    name: 'proxyClass',
    format: 'umd',
    sourcemap: true,
  }, {
    file : packageJSON.module,
    sourcemap: true,
    format: 'es'
  }]
};

const flags = {
  "w" : "watch",
  "v" : "verbose"
}

const options = {};

process.argv.forEach((raw) => {
  let [property, value] = raw.replace(/^--?/, "").split("=");

  if(property in flags) {
    property = flags[property];
  }

  options[property] = value || true;
});

const {
  watch = false,
  verbose = false
} = options;

function test() {
  return exec(CMD, {
    stdio : "inherit"
  }, function(error, stdout, stderr) {
    if(verbose) {
      console.log(stdout || stderr);
    }
  }).on("error", console.log);
};

function build() {
  rollup.rollup(config.input).then((output) => {
    if(verbose) {
      console.log("exports", output.exports);
    }

    let queue = config.output.map((outputConfig) => {
      return output.write(outputConfig)
    });
    Promise.all(queue).then((output) => {
      test();
    })
  })
}



if(watch) {
  let change = (fileId) => {
    if(verbose) {
      console.log("changed", fileId);
    }

    build();
  }

  chokidar.watch(config.input.input, {
    ignored: /node_modules/,
    ignoreInitial : true,
    cwd : __dirname+"../"
  })
    .on("add", change)
    .on("change", change)
    .on("unlink", (fileId) => console.warn("error: removed a dependecy", fileId))
  ;

  chokidar.watch("spec/spec.js", {
    ignoreInitial : true,
    disableGlobbing : true,
    persistent: false,
    ignored: /node_modules/,
    cwd : __dirname+"../"
  }).on("change", test);
}

build();
