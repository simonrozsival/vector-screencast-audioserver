/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {/// <reference path='../typings/node/node.d.ts' />
	/// <reference path='./node-libs.d.ts' />
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	var _ws = __webpack_require__(1);
	
	var _wav = __webpack_require__(2);
	
	var _fs = __webpack_require__(3);
	
	var fs = _interopRequireWildcard(_fs);
	
	var _nodeUuid = __webpack_require__(4);
	
	var _colors = __webpack_require__(5);
	
	var _AudioConvertor = __webpack_require__(6);
	
	var _AudioConvertor2 = _interopRequireDefault(_AudioConvertor);
	
	var Server = (function () {
	    function Server(cfg) {
	        _classCallCheck(this, Server);
	
	        this.cfg = cfg;
	        if (!cfg.port) cfg.port = 45678;
	        if (!cfg.outputDir) cfg.outputDir = __dirname;
	        if (!cfg.formats) cfg.formats = ['mp3', 'ogg'];
	        this.config = cfg;
	    }
	
	    _createClass(Server, [{
	        key: 'Start',
	        value: function Start() {
	            var _this = this;
	
	            this.server = new _ws.WebSocketServer({
	                port: this.config.port
	            });
	            if (this.server) {
	                console.log(_colors.colors.yellow('Audio recorder is running and listening on port ' + this.config.port));
	            } else {
	                console.log(_colors.colors.red('Audio recorder could not be started.'));
	            }
	            this.server.on('connection', function (socket) {
	                return _this.HandleClient(socket);
	            });
	            this.server.on('error', function (error) {
	                return console.log('ERROR: ' + error);
	            });
	        }
	    }, {
	        key: 'HandleClient',
	        value: function HandleClient(socket) {
	            var _this2 = this;
	
	            try {
	                console.log(_colors.colors.blue('Handling new client'));
	                var fileWriter = null;
	                var $this = this;
	                var name = this.GetTempFileName(this.cfg.outputDir, '.wav');
	                var recordingEndedProperly = false;
	                socket.on('message', function (message, flags) {
	                    if (recordingEndedProperly === false) {
	                        if (!flags.binary) {
	                            var msg = JSON.parse(message);
	                            if (!!msg && msg.type === 'start') {
	                                fileWriter = _this2.InitRecording(name, msg);
	                            } else if (!!msg && msg.type === 'end') {
	                                recordingEndedProperly = true;
	                                _this2.FinishRecording(_this2.cfg.hostName, name, fileWriter, socket, _this2.cfg.deleteWav);
	                            } else {
	                                console.log(_colors.colors.red('Unsupported message'), message);
	                            }
	                        } else {
	                            if (!!fileWriter) {
	                                fileWriter.file.write(message);
	                            } else {
	                                console.log(_colors.colors.red('Binary data can\'t be accepted - initialisation wasn\'t done properly.'));
	                                socket.close();
	                            }
	                        }
	                    }
	                });
	                socket.on('close', function () {
	                    console.log('stream closed');
	                    if (!recordingEndedProperly) {
	                        if (fileWriter !== null) {
	                            fileWriter.end();
	                            fs.unlink(name, function (err) {
	                                if (err) {
	                                    console.log(_colors.colors.red('Can\'t delete tmp wav file ' + name));
	                                    return;
	                                }
	                                console.log(_colors.colors.yellow('Tmp file ' + name + ' was deleted as stream was closed and not ended properly'));
	                            });
	                        }
	                    }
	                });
	            } catch (e) {
	                console.log(_colors.colors.red('A fatal error occured while serving a client. Recording session was aborted.'), e);
	            }
	        }
	    }, {
	        key: 'InitRecording',
	        value: function InitRecording(name, msg) {
	            console.log(_colors.colors.gray('initialising streaming into ') + name);
	            var fileWriter = new _wav.Wav.FileWriter(name, {
	                channels: msg.channels || 1,
	                sampleRate: msg.sampleRate || 48000,
	                bitDepth: msg.bitDepth || 16
	            });
	            return fileWriter;
	        }
	    }, {
	        key: 'FinishRecording',
	        value: function FinishRecording(hostName, name, fileWriter, socket, deleteWav) {
	            fileWriter.end();
	            fileWriter = null;
	            this.TryConvertTo(name, deleteWav, function (results) {
	                if (!!socket) {
	                    for (var i = 0; i < results.length; i++) {
	                        results[i].url = hostName + results[i].url;
	                    }
	                    socket.send(JSON.stringify({
	                        error: false,
	                        files: results
	                    }));
	                } else {
	                    console.log(_colors.colors.red('Can\'t report the result - socket is already closed'));
	                }
	                socket.close();
	            });
	        }
	    }, {
	        key: 'GetTempFileName',
	        value: function GetTempFileName(dir, ext) {
	            dir = dir || './';
	            ext = ext || '';
	            return dir + '/' + _nodeUuid.uuid.v4() + ext;
	        }
	    }, {
	        key: 'TryConvertTo',
	        value: function TryConvertTo(input, deleteWav, _success) {
	            (0, _AudioConvertor2['default'])({
	                input: input,
	                formats: this.cfg.formats,
	                quality: 64,
	                publicRoot: './public',
	                outputDir: '/recordings',
	                channels: 1,
	                debug: false,
	                success: function success(files) {
	                    var resultFileNames = [{
	                        url: input,
	                        type: 'audio/wav'
	                    }];
	                    if (files.length > 0) {
	                        if (deleteWav) {
	                            fs.unlink(input, function (err) {
	                                if (err) {
	                                    console.log(_colors.colors.red('Can\'t delete tmp wav file ' + input));
	                                    return;
	                                }
	                                console.log(_colors.colors.green('Tmp file ' + input + ' was deleted'));
	                            });
	                            resultFileNames = files;
	                        } else {
	                            resultFileNames = resultFileNames.concat(files);
	                        }
	                    }
	                    if (_success) {
	                        _success(resultFileNames);
	                    }
	                },
	                error: function error() {
	                    console.log(_colors.colors.red('Error while converting the result from wav to ' + this.cfg.formats));
	                }
	            });
	        }
	    }]);
	
	    return Server;
	})();
	
	exports['default'] = Server;
	module.exports = exports['default'];
	/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("ws");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("wav");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("node-uuid");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("colors");

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/// <refenrece path="../typings/tsd.d.ts" />
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	exports['default'] = convert;
	
	var _child_process = __webpack_require__(7);
	
	var _colors = __webpack_require__(5);
	
	function convert(cfg) {
	    if (cfg === undefined) {
	        console.log(_colors.colors.red("Audio Converted Error - No information passed."));
	        return false;
	    }
	    if (!cfg.hasOwnProperty("input")) {
	        console.log("Audio Converter Error - No input filename specified.");
	        return false;
	    }
	    var name = cfg.input.substr(cfg.input.lastIndexOf("/") + 1);
	    name = name.substr(0, name.lastIndexOf("."));
	    var outputDir = cfg.publicRoot + cfg.outputDir || "./";
	    var formats = cfg.formats || ["mp3"];
	    var done = 0;
	    var successful = [];
	    var debug = cfg.debug === undefined ? true : cfg.debug;
	    var overrideArg = cfg.hasOwnProperty("override") && cfg.override !== undefined ? cfg.override === true ? "-y" : "-n" : "-y";
	    for (var i in formats) {
	        var ext = formats[i];
	        convertTo(cfg, outputDir + "/" + name, ext, overrideArg, debug, function (ext) {
	            successful.push({
	                url: cfg.outputDir + '/' + name + '.' + ext,
	                type: 'audio/' + ext
	            });
	            if (++done === formats.length) {
	                if (cfg.hasOwnProperty("success")) {
	                    cfg.success(successful);
	                }
	            }
	        }, function (ext) {
	            if (++done === formats.length) {
	                if (cfg.hasOwnProperty("success")) {
	                    cfg.success(successful);
	                }
	            }
	        });
	    }
	}
	
	function convertTo(cfg, name, ext, overrideArg, debug, success, error) {
	    var output = name + "." + ext;
	    console.log(_colors.colors.gray('Trying to convert ' + cfg.input + ' to ' + output + '.'));
	    var ffmpeg = (0, _child_process.spawn)("ffmpeg", ["-i", cfg.input.toString(), "-ac", cfg.channels.toString() || "1", "-ab", cfg.quality.toString() || "64", "-loglevel", debug ? "verbose" : "quiet", overrideArg, output]);
	    ffmpeg.on("exit", function (code) {
	        if (code === 0) {
	            console.log(_colors.colors.gray('[' + _colors.colors.green("OK") + '] ' + ext));
	            success(ext);
	        } else {
	            console.log(_colors.colors.gray('[' + _colors.colors.red("XX") + '] ' + ext));
	            error(ext);
	        }
	    });
	    ffmpeg.stderr.on("data", function (err) {
	        console.log("FFmpeg err: %s", err);
	    });
	}
	module.exports = exports['default'];

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("child_process");

/***/ }
/******/ ]);
//# sourceMappingURL=audio-server.js.map