(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("arrow.ts", function(exports, require, module) {
/// <reference path="../node_modules/phaser/types/phaser.d.ts" />
"use strict";
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
var Matter = Phaser.Physics.Matter.Matter;
exports.direction = [
    [0, -150],
    [100, -100],
    [0, -125],
    [-100, -100],
];
exports.page = [
    [0, -10],
    [10, 0],
    [-10, 0],
];
function to(f, center, arrow, point) {
    var x = point[0], y = point[1];
    var angle = Math.atan2(arrow.y, arrow.x) + Math.PI / 2;
    var rotated = Matter.Vector.rotate({ x: x, y: y }, angle);
    var translated = Matter.Vector.add(center, rotated);
    f(translated.x, translated.y);
}
function drawArrow(graphics, center, arrow, points, color, hide) {
    var dist = Matter.Vector.magnitude(arrow);
    if (hide) {
        graphics.fillStyle(color, Math.max(0, Math.min((dist / 250) - 1, 1)));
    }
    else {
        graphics.fillStyle(color);
    }
    var move = function (x, y) { return graphics.moveTo(x, y); };
    var line = function (x, y) { return graphics.lineTo(x, y); };
    to(move, center, arrow, points[0]);
    points.slice(1).forEach(function (point) { return to(line, center, arrow, point); });
    to(line, center, arrow, points[0]);
    graphics.fillPath();
}
exports.drawArrow = drawArrow;


});

require.register("book.ts", function(exports, require, module) {
/// <reference path="../node_modules/phaser/types/phaser.d.ts" />
"use strict";
var random = require("./random");
var color_1 = require("./color");
var minWidth = 10;
var maxWidth = 15;
var minHeight = 0.7; // multiplied by the available height
var maxHeight = 0.9; // multiplied by the available height
var maxGroup = 5;
function generateBooks(rect, rng) {
    var books = [];
    var pos = 0;
    while (true) {
        var groupSize = random.groupSize(maxGroup, rng);
        var width = minWidth + Math.floor(rng() * (maxWidth - minWidth + 1));
        if (pos + groupSize * width > rect.width) {
            break;
        }
        var height = rect.height * (minHeight + rng() * (maxHeight - minHeight));
        var color = random.color(0x80, rng);
        for (var i = 0; i < groupSize; i++) {
            books.push({
                rect: new Phaser.Geom.Rectangle(rect.left + pos, rect.bottom - height, width, height),
                color: color,
            });
            pos += width;
        }
    }
    var shift = (rect.width - pos) / 2;
    books.forEach(function (book) { book.rect.x += shift; });
    return books;
}
exports.generateBooks = generateBooks;
function drawBooks(rect, graphics, rng) {
    generateBooks(rect, rng).forEach(function (book) {
        var dark = color_1.multiply(book.color, 0.95);
        var light = color_1.multiply(book.color, 1.05);
        graphics.fillStyle(dark);
        graphics.fillRect(book.rect.x, book.rect.y, book.rect.width / 2, book.rect.height);
        graphics.fillStyle(light);
        graphics.fillRect(book.rect.x + book.rect.width / 2, book.rect.y, book.rect.width / 2, book.rect.height);
    });
}
exports.drawBooks = drawBooks;


});

require.register("color.ts", function(exports, require, module) {
"use strict";
function rgbToHex(r, g, b) {
    return (r << 16) | (g << 8) | b;
}
exports.rgbToHex = rgbToHex;
function hexToRgb(hex) {
    var b = hex & 0xff;
    hex >>= 8;
    var g = hex & 0xff;
    hex >>= 8;
    var r = hex & 0xff;
    return [r, g, b];
}
exports.hexToRgb = hexToRgb;
function clamp(x, min, max) {
    return Math.min(Math.max(min, x), max);
}
function multiply(color, brightness) {
    var _a = hexToRgb(color)
        .map(function (component) { return clamp(component * brightness, 0, 255); })
        .map(Math.round), r = _a[0], g = _a[1], b = _a[2];
    return rgbToHex(r, g, b);
}
exports.multiply = multiply;


});

require.register("graph.ts", function(exports, require, module) {
"use strict";
var map_1 = require("./map");
function bfs(graph, start, depth) {
    var result = [];
    var visited = new map_1.JSONMap();
    var queue = [[start, 0]];
    var _loop_1 = function () {
        var _a = queue.shift(), v = _a[0], d = _a[1];
        visited.set(v, null);
        if (d < depth) {
            graph.neighbors(v).filter(function (n) { return !(visited.has(n)); }).forEach(function (n) {
                queue.push([n, d + 1]);
            });
        }
        else {
            result.push(v);
        }
    };
    while (queue.length > 0) {
        _loop_1();
    }
    return result;
}
exports.bfs = bfs;


});

require.register("hud.ts", function(exports, require, module) {
/// <reference path="../node_modules/phaser/types/phaser.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var page_1 = require("./page");
var story = require("./story");
var text_1 = require("./text");
var delay = 100;
var HUD = (function (_super) {
    __extends(HUD, _super);
    function HUD() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HUD.prototype.create = function () {
        var _this = this;
        addEventListener('resize', function () {
            _this.cameras.main.setSize(innerWidth, innerHeight);
        });
        this.graphics = this.add.graphics();
        this.text = new text_1.Text(this.add.text(10, 10, '', {
            fontFamily: 'sans-serif',
            fontSize: '50px',
        }));
        this.page = new page_1.Page(this.add.text(0, 0, ''), this.add.text(0, 0, ''));
        this.sequence(story.introduction, 'introduction', 'library');
        this.sequence(story.library, 'library', 'move');
        this.sequence(story.move, 'move', 'waiting');
        this.coloredSequence(story.book1, 'book1', 'getting1');
        this.coloredSequence(story.book2, 'book2', 'getting2');
        this.coloredSequence(story.book3, 'book3', 'getting3');
        this.coloredSequence(story.book4, 'book4', 'getting4');
        this.coloredSequence(story.close, 'close', 'end');
        this.showBook(story.books[0], 'found1', 'book2');
        this.showBook(story.books[1], 'found2', 'book3');
        this.showBook(story.books[2], 'found3', 'book4');
        this.showBook(story.books[3], 'found4', 'close');
        var leftKey = this.input.keyboard.addKey('LEFT');
        var rightKey = this.input.keyboard.addKey('RIGHT');
        this.input.on('pointerdown', function () { _this.justClicked = true; });
        leftKey.on('down', function () { _this.justLeft = true; });
        rightKey.on('down', function () { _this.justRight = true; });
        this.opacity = 0;
        this.events.on('hud-end', function () {
            _this.tweens.add({
                targets: _this,
                opacity: 1,
                duration: 5000,
                onComplete: function () {
                    var credits = _this.add.text(50, 50, story.credits.join('\n'), {
                        fontFamily: 'sans-serif',
                        fontSize: '25px',
                    });
                    credits.setAlpha(0);
                    _this.tweens.add({
                        targets: credits,
                        alpha: 1,
                        duration: 1000,
                    });
                }
            });
        });
        if (this.registry.values.save.progress === 'end') {
            this.events.emit('hud-end');
        }
    };
    HUD.prototype.update = function () {
        var _this = this;
        if (this.justClicked) {
            this.justClicked = false;
            if (this.input.activePointer.x < this.cameras.main.worldView.centerX) {
                if (this.page.leftArrow) {
                    this.page.pageNum -= 2;
                }
            }
            else {
                if (this.page.rightArrow) {
                    this.page.pageNum += 2;
                }
            }
        }
        if (this.justLeft) {
            this.justLeft = false;
            if (this.page.leftArrow) {
                this.page.pageNum -= 2;
            }
        }
        if (this.justRight) {
            this.justRight = false;
            if (this.page.rightArrow) {
                this.page.pageNum += 2;
            }
        }
        this.text.update(this.cameras.main.worldView);
        this.page.update(this.cameras.main.worldView, function () { return _this.add.graphics(); }, function (key) { return _this.textures.remove(key); });
        this.graphics.clear();
        this.page.render(this.graphics);
        if (this.opacity > 0) {
            var _a = this.cameras.main.worldView, width = _a.width, height = _a.height;
            this.graphics.fillStyle(0x000000, this.opacity);
            this.graphics.fillRect(0, 0, width, height);
        }
    };
    HUD.prototype.coloredSequence = function (lines, event, progress) {
        var _this = this;
        var next = function () {
            var cline = _this.queue.shift();
            if (cline) {
                var color = cline[0], line = cline[1];
                _this.tweens.add(_this.text.reveal(delay, color, line, function () {
                    _this.time.addEvent({ delay: 250, callback: function () {
                            _this.text.progress = 0;
                            _this.time.addEvent({ delay: 250, callback: next });
                        } });
                }));
            }
            else {
                _this.registry.values.save.progress = progress;
                _this.events.emit("hud-" + progress);
            }
        };
        var main = this.scene.get('main');
        main.events.on("main-" + event, function () {
            _this.queue = lines;
            next();
        });
    };
    HUD.prototype.sequence = function (lines, event, progress) {
        var coloredLines = lines.map(function (line) { return ['white', line]; });
        this.coloredSequence(coloredLines, event, progress);
    };
    HUD.prototype.showBook = function (paragraphs, event, progress) {
        var _this = this;
        this.scene.get('main').events.on("main-" + event, function () {
            _this.page.rebuild(paragraphs, function () { return _this.add.graphics(); }, function (key) { return _this.textures.remove(key); });
            _this.tweens.add({
                targets: _this.page,
                opacity: 1,
                duration: 1000,
                onComplete: function () {
                    var escape = _this.input.keyboard.addKey('ESC');
                    escape.once('down', function () {
                        _this.tweens.add({
                            targets: _this.page,
                            opacity: 0,
                            duration: 1000,
                            onComplete: function () {
                                _this.registry.values.save.progress = progress;
                                _this.events.emit("hud-" + progress);
                            },
                        });
                    });
                },
            });
        });
    };
    return HUD;
}(Phaser.Scene));
exports.HUD = HUD;


});

require.register("main.ts", function(exports, require, module) {
"use strict";
var electron_1 = require("electron");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
function createWindow() {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600
    });
    // and load the HTML of the app.
    mainWindow.loadURL("file://" + __dirname + "/electron.html");
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}
;
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on('ready', createWindow);
// Quit when all windows are closed.
electron_1.app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});


});

require.register("map.ts", function(exports, require, module) {
"use strict";
var JSONMap = (function () {
    // the original Map constructor takes any iterable, not just an array
    function JSONMap(iterable) {
        this.inner = iterable
            ? new Map(iterable.map(function (_a) {
                var k = _a[0], v = _a[1];
                return [JSON.stringify(k), v];
            }))
            : new Map();
    }
    Object.defineProperty(JSONMap.prototype, "size", {
        get: function () {
            return this.inner.size;
        },
        enumerable: true,
        configurable: true
    });
    JSONMap.prototype.clear = function () {
        this.inner.clear();
    };
    JSONMap.prototype.delete = function (key) {
        return this.inner.delete(JSON.stringify(key));
    };
    // the original Map.entries returns an Iterator, not an array
    JSONMap.prototype.entries = function () {
        return Array.from(this.inner.entries()).map(function (_a) {
            var k = _a[0], v = _a[1];
            return [JSON.parse(k), v];
        });
    };
    // the original Map.forEach also takes a thisArg parameter
    JSONMap.prototype.forEach = function (callbackFn) {
        var _this = this;
        this.entries().forEach(function (_a) {
            var k = _a[0], v = _a[1];
            return callbackFn(k, v, _this);
        });
    };
    JSONMap.prototype.get = function (key) {
        return this.inner.get(JSON.stringify(key));
    };
    JSONMap.prototype.has = function (key) {
        return this.inner.has(JSON.stringify(key));
    };
    // the original Map.keys returns an Iterator, not an array
    JSONMap.prototype.keys = function () {
        return Array.from(this.inner.keys()).map(function (k) { return JSON.parse(k); });
    };
    JSONMap.prototype.set = function (key, value) {
        this.inner.set(JSON.stringify(key), value);
        return this;
    };
    // the original Map.values returns an Iterator, not an array
    JSONMap.prototype.values = function () {
        return Array.from(this.inner.values());
    };
    return JSONMap;
}());
exports.JSONMap = JSONMap;


});

require.register("music.ts", function(exports, require, module) {
"use strict";
var Tone = require("tone");
function line(synth, start, chords) {
    var runningTime = start;
    chords.forEach(function (_a) {
        var notes = _a[0], duration = _a[1];
        notes.forEach(function (note) {
            synth.triggerAttackRelease(note, duration, runningTime);
        });
        runningTime += Tone.Time(duration);
    });
}
var bass1 = [
    [['F2'], '4n'],
    [[], '8n'],
    [[], '4n'],
    [['F2'], '8n'],
    [[], '4n.'],
    [[], '4n'],
    [[], '8n'],
    [[], '4n'],
    [[], '8n'],
    [[], '4n'],
    [['Eb2'], '8n'],
    [[], '4n.'],
    [[], '4n'],
    [[], '8n'],
    [[], '4n'],
    [[], '8n'],
    [[], '4n'],
    [['Bb2'], '8n'],
    [[], '4n.'],
    [[], '4n'],
    [[], '8n'],
    [[], '4n'],
    [[], '8n'],
    [[], '4n'],
    [['Bb2'], '8n'],
    [[], '4n.'],
    [[], '4n'],
    [[], '8n'],
];
var bass2 = [
    [['F2'], '4n'],
    [['C3'], '8n'],
    [[], '4n'],
    [['F2'], '8n'],
    [['C3'], '4n.'],
    [[], '4n'],
    [[], '8n'],
    [[], '4n'],
    [['G#2'], '8n'],
    [[], '4n'],
    [['Eb2'], '8n'],
    [['G#2'], '4n.'],
    [[], '4n'],
    [[], '8n'],
    [[], '4n'],
    [['Eb3'], '8n'],
    [[], '4n'],
    [['Bb2'], '8n'],
    [['Eb3'], '4n.'],
    [[], '4n'],
    [[], '8n'],
    [[], '4n'],
    [['D3'], '8n'],
    [[], '4n'],
    [['Bb2'], '8n'],
    [['D3'], '4n.'],
    [[], '4n'],
    [[], '8n'],
];
var bass3 = [
    [['F2'], '4n'],
    [['C3'], '8n'],
    [[], '4n'],
    [['F2'], '8n'],
    [['C3'], '4n.'],
    [['C3'], '4n'],
    [['C3'], '8n'],
    [[], '4n'],
    [['G#2'], '8n'],
    [[], '4n'],
    [['Eb2'], '8n'],
    [['G#2'], '4n.'],
    [['G#2'], '4n'],
    [['G#2'], '8n'],
    [[], '4n'],
    [['Eb3'], '8n'],
    [[], '4n'],
    [['Bb2'], '8n'],
    [['Eb3'], '4n.'],
    [['Eb3'], '4n'],
    [['Eb3'], '8n'],
    [[], '4n'],
    [['D3'], '8n'],
    [[], '4n'],
    [['Bb2'], '8n'],
    [['D3'], '4n.'],
    [['D3'], '4n'],
    [['D3'], '8n'],
];
var treble1 = [
    [['G#3'], '8n'],
    [['Bb3'], '4n'],
    [[], '4n.'],
    [[], '4n.'],
    [[], '8n'],
    [['C4'], '8n'],
    [[], '8n'],
    [['G#3'], '8n'],
    [['Bb3'], '8n'],
    [[], '8n'],
    [[], '4n.'],
    [['Eb4'], '4n'],
    [['C#4'], '8n'],
    [['G#3'], '8n'],
    [[], '4n'],
    [['F#4'], '8n'],
    [[], '8n'],
    [[], '4n'],
    [['Eb4'], '4n'],
    [['F4'], '4n'],
    [['C#4'], '8n'],
    [['Bb3'], '4n'],
    [[], '8n'],
    [['C4'], '4n'],
    [['Eb4'], '4n'],
    [[], '4n'],
    [['Bb3'], '4n.'],
    [[], '8n'],
    [[], '4n'],
];
var treble2 = [
    [['G#3'], '8n'],
    [['Bb3'], '4n'],
    [[], '4n.'],
    [['F4'], '4n.'],
    [[], '8n'],
    [['C4'], '8n'],
    [[], '8n'],
    [['G#3'], '8n'],
    [['Bb3'], '8n'],
    [[], '8n'],
    [['Bb3'], '4n.'],
    [['Eb4'], '4n'],
    [['C#4'], '8n'],
    [['G#3'], '8n'],
    [['Eb4'], '4n'],
    [['F#4'], '8n'],
    [['G#3'], '8n'],
    [['G#4'], '4n'],
    [['Eb4'], '4n'],
    [['F4'], '4n'],
    [['C#4'], '8n'],
    [['Bb3'], '4n'],
    [[], '8n'],
    [['C4'], '4n'],
    [['Eb4'], '4n'],
    [['F4'], '4n'],
    [['Bb3'], '4n.'],
    [['D4'], '8n'],
    [[], '4n'],
];
var treble3 = [
    [['G#3'], '8n'],
    [['Bb3'], '4n'],
    [['Bb3'], '4n.'],
    [['C4', 'Eb4', 'F4'], '4n.'],
    [[], '8n'],
    [['C4'], '8n'],
    [['Bb3'], '8n'],
    [['F3', 'G#3'], '8n'],
    [['Bb3'], '8n'],
    [['C4'], '8n'],
    [['Bb3'], '4n.'],
    [['C#4', 'Eb4'], '4n'],
    [['C#4'], '8n'],
    [['Bb3', 'G#3'], '8n'],
    [['Eb4'], '4n'],
    [['Eb4', 'F#4'], '8n'],
    [['G#3'], '8n'],
    [['G#4'], '4n'],
    [['Eb4'], '4n'],
    [['F4'], '4n'],
    [['C#4'], '8n'],
    [['Bb3'], '4n'],
    [['Bb3'], '8n'],
    [['C4'], '4n'],
    [['Eb4'], '4n'],
    [['F4'], '4n'],
    [['Bb3'], '4n.'],
    [['C4', 'D4'], '8n'],
    [['Bb3'], '4n'],
];
var high1 = [
    [[], '4n.'],
    [[], '8n'],
    [['Eb5', 'G5', 'Bb5'], '4n'],
    [[], '8n'],
    [[], '8n'],
    [[], '8n'],
    [[], '4n.'],
    [[], '4n.'],
    [[], '8n'],
    [['C5', 'Eb5', 'G5'], '4n'],
    [[], '8n'],
    [[], '8n'],
    [[], '8n'],
    [[], '4n.'],
    [[], '4n.'],
    [[], '8n'],
    [['Bb4', 'C5', 'Eb5'], '4n'],
    [[], '8n'],
    [[], '8n'],
    [[], '8n'],
    [[], '4n.'],
    [[], '4n.'],
    [[], '8n'],
    [['C#5', 'Eb5', 'F5'], '4n'],
    [[], '8n'],
    [[], '8n'],
    [[], '8n'],
    [[], '4n.'],
];
var high2 = [
    [[], '4n.'],
    [[], '8n'],
    [['Eb5', 'G5', 'Bb5'], '4n'],
    [[], '8n'],
    [[], '8n'],
    [['Eb5', 'F5', 'G#5'], '8n'],
    [[], '4n.'],
    [[], '4n.'],
    [[], '8n'],
    [['C5', 'Eb5', 'G5'], '4n'],
    [[], '8n'],
    [[], '8n'],
    [['C5', 'Eb5', 'F5'], '8n'],
    [[], '4n.'],
    [[], '4n.'],
    [[], '8n'],
    [['Bb4', 'C5', 'Eb5'], '4n'],
    [[], '8n'],
    [[], '8n'],
    [['Bb4', 'Eb5', 'F5'], '8n'],
    [[], '4n.'],
    [[], '4n.'],
    [[], '8n'],
    [['C#5', 'Eb5', 'F5'], '4n'],
    [[], '8n'],
    [[], '8n'],
    [['Eb5', 'G5'], '8n'],
    [[], '4n.'],
];
var high3 = [
    [[], '4n.'],
    [['Eb5'], '8n'],
    [['Eb5', 'G5', 'Bb5'], '4n'],
    [[], '8n'],
    [['Eb5'], '8n'],
    [['Eb5', 'F5', 'G#5'], '8n'],
    [[], '4n.'],
    [[], '4n.'],
    [['C5'], '8n'],
    [['C5', 'Eb5', 'G5'], '4n'],
    [[], '8n'],
    [['C5'], '8n'],
    [['C5', 'Eb5', 'F5'], '8n'],
    [[], '4n.'],
    [[], '4n.'],
    [['Bb4'], '8n'],
    [['Bb4', 'C5', 'Eb5'], '4n'],
    [[], '8n'],
    [['Bb4'], '8n'],
    [['Bb4', 'Eb5', 'F5'], '8n'],
    [[], '4n.'],
    [[], '4n.'],
    [['C#5'], '8n'],
    [['C#5', 'Eb5', 'F5'], '4n'],
    [[], '8n'],
    [['Eb5'], '8n'],
    [['Eb5', 'G5'], '8n'],
    [[], '4n.'],
];
function play(save) {
    var bassSynth = new Tone.PolySynth().toMaster();
    var trebleSynth = new Tone.PolySynth().toMaster();
    var highSynth = new Tone.PolySynth().toMaster();
    highSynth.volume.value = -10;
    Tone.Transport.bpm.value = 180; // actually 120bpm, I think it thinks 4n = 4n.
    Tone.Transport.timeSignature = [12, 8];
    Tone.Transport.scheduleRepeat(function (time) {
        switch (save.progress) {
            case 'sleeping':
                line(bassSynth, time, bass1);
                break;
            case 'library':
                line(bassSynth, time, bass2);
                break;
            case 'move':
                line(bassSynth, time, bass3);
                break;
            case 'waiting':
                line(bassSynth, time, bass3);
                break;
            case 'book1':
                line(bassSynth, time, bass3);
                line(trebleSynth, time, treble1);
                break;
            case 'getting1':
                line(bassSynth, time, bass3);
                line(trebleSynth, time, treble1);
                line(highSynth, time, high1);
                break;
            case 'found1':
                line(bassSynth, time, bass3);
                break;
            case 'book2':
                line(bassSynth, time, bass3);
                line(trebleSynth, time, treble2);
                break;
            case 'getting2':
                line(bassSynth, time, bass3);
                line(trebleSynth, time, treble2);
                line(highSynth, time, high2);
                break;
            case 'found2':
                line(bassSynth, time, bass3);
                break;
            case 'book3':
                line(bassSynth, time, bass3);
                line(trebleSynth, time, treble3);
                break;
            case 'getting3':
                line(bassSynth, time, bass3);
                line(trebleSynth, time, treble3);
                line(highSynth, time, high3);
                break;
            case 'found3':
                line(bassSynth, time, bass2);
                break;
            case 'book4':
                line(bassSynth, time, bass1);
                line(trebleSynth, time, treble2);
                break;
            case 'getting4':
                line(bassSynth, time, bass1);
                line(trebleSynth, time, treble2);
                line(highSynth, time, high2);
                break;
            case 'found4':
                line(bassSynth, time, bass1);
                break;
            case 'close':
                line(bassSynth, time, bass3);
                line(trebleSynth, time, treble3);
                break;
            case 'end':
                line(bassSynth, time, bass3);
                line(highSynth, time, high3);
                break;
        }
    }, '4m');
    Tone.Transport.start();
}
exports.play = play;


});

require.register("octopus.ts", function(exports, require, module) {
/// <reference path="../node_modules/phaser/types/phaser.d.ts" />
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
var Matter = Phaser.Physics.Matter.Matter;
var _ = require("underscore");
var color = require("./color");
var random = require("./random");
var raycast_1 = require("./raycast");
function adjacents(array) {
    return _.times(array.length - 1, function (i) { return [array[i], array[i + 1]]; });
}
function bodyToWorld(body, point) {
    return Matter.Vector.add(body.position, Matter.Vector.rotate(point, body.angle));
}
var orange = 0xffa500;
var Arm = (function () {
    function Arm(config) {
        this.comp = Matter.Composite.create();
        var x = config.x, y = config.y, numSegments = config.numSegments, segmentLength = config.segmentLength, segmentRadius = config.segmentRadius, collisionFilter = config.collisionFilter;
        this.segmentLength = segmentLength;
        this.segmentRadius = segmentRadius;
        this.segments = _.times(numSegments, function () { return Matter.Bodies.rectangle(x, y, segmentLength, segmentRadius * 2, { chamfer: { radius: segmentRadius }, collisionFilter: collisionFilter, }); });
        var constraints = adjacents(this.segments).map(function (_a, i) {
            var s1 = _a[0], s2 = _a[1];
            var direction = i % 2 === 0 ? 1 : -1;
            var offset = direction * (segmentLength / 2.0 - segmentRadius);
            return Matter.Constraint.create({
                bodyA: s1,
                pointA: { x: offset, y: 0 },
                bodyB: s2,
                pointB: { x: offset, y: 0 },
                stiffness: 1,
                length: 0,
            });
        });
        // @ts-ignore: Argument of type 'Body[]' is not assignable ...
        Matter.Composite.add(this.comp, this.segments);
        // @ts-ignore: Argument of type 'Constraint[]' is not assignable ...
        Matter.Composite.add(this.comp, constraints);
        this.hook = Matter.Bodies.rectangle(x, y, 1, 1, {
            isStatic: true,
            collisionFilter: __assign({}, collisionFilter, { mask: 0 })
        });
        var i = numSegments - 1;
        var direction = i % 2 === 0 ? 1 : -1;
        var offset = direction * (segmentLength / 2.0 - segmentRadius);
        this.spring = Matter.Constraint.create({
            bodyA: this.segments[numSegments - 1],
            bodyB: this.hook,
            pointA: { x: offset, y: 0 },
            stiffness: 0.01,
            length: 0,
        });
        Matter.Composite.add(this.comp, this.hook);
        Matter.Composite.add(this.comp, this.spring);
        this.stopped = true;
    }
    Arm.prototype.segmentTip = function (index) {
        var direction = index % 2 === 0 ? 1 : -1;
        var offset = direction * (this.segmentLength / 2.0 - this.segmentRadius);
        return bodyToWorld(this.segments[index], { x: offset, y: 0 });
    };
    Arm.prototype.tipPosition = function () {
        return this.segmentTip(this.segments.length - 1);
    };
    Arm.prototype.stop = function () {
        this.stopped = true;
    };
    Arm.prototype.move = function (point) {
        this.hook.position = point;
        this.stopped = false;
    };
    Arm.prototype.update = function (center, reach) {
        var v = Matter.Vector.sub(this.hook.position, center);
        var dist = Matter.Vector.magnitude(v);
        if (dist > reach) {
            this.stop();
        }
        if (this.stopped) {
            this.hook.position = this.tipPosition();
        }
    };
    Arm.prototype.render = function (graphics, center, mult) {
        var _this = this;
        var vectors = this.segments.map(function (s, i) { return _this.segmentTip(i); });
        var points = [center].concat(vectors).map(function (_a) {
            var x = _a.x, y = _a.y;
            return new Phaser.Math.Vector2(x, y);
        });
        var spline = new Phaser.Curves.Spline(points);
        graphics.lineStyle(this.segmentRadius * 2, color.multiply(orange, mult));
        spline.draw(graphics);
        vectors.forEach(function (_a) {
            var x = _a.x, y = _a.y;
            graphics.fillCircle(x, y, _this.segmentRadius);
        });
    };
    return Arm;
}());
// in ms
var jumpLength = 1000;
var Octopus = (function () {
    function Octopus(config) {
        var _this = this;
        this.comp = Matter.Composite.create();
        var x = config.x, y = config.y, headRadius = config.headRadius, numArms = config.numArms, segmentLength = config.segmentLength, segmentRadius = config.segmentRadius, segmentsPerArm = config.segmentsPerArm;
        this.headRadius = headRadius;
        this.reach = (segmentLength - 2 * segmentRadius) * segmentsPerArm;
        var group = Matter.Body.nextGroup(true);
        var collisionFilter = {
            group: group,
            mask: ~0,
            category: 1,
        };
        this.head = Matter.Bodies.circle(x, y, headRadius, { collisionFilter: collisionFilter });
        this.arms = _.times(numArms, function () { return new Arm({
            x: x, y: y - 30,
            numSegments: segmentsPerArm,
            segmentLength: segmentLength,
            segmentRadius: segmentRadius,
            collisionFilter: collisionFilter,
        }); });
        var constraints = this.arms.map(function (arm) {
            var offset = -1 * (segmentLength / 2.0 - segmentRadius);
            return Matter.Constraint.create({
                bodyA: _this.head,
                bodyB: arm.segments[0],
                pointB: { x: offset, y: 0 },
                stiffness: 1,
                length: 0,
            });
        });
        Matter.Composite.add(this.comp, this.head);
        // @ts-ignore: Argument of type 'Composite[]' is not assignable ...
        Matter.Composite.add(this.comp, this.arms.map(function (arm) { return arm.comp; }));
        // @ts-ignore: Argument of type 'Constraint[]' is not assignable ...
        Matter.Composite.add(this.comp, constraints);
        this.hook = Matter.Bodies.rectangle(x, y, 1, 1, {
            isStatic: true,
            collisionFilter: __assign({}, collisionFilter, { mask: 0 })
        });
        this.spring = Matter.Constraint.create({
            bodyA: this.head,
            bodyB: this.hook,
            stiffness: 0.01,
            length: 0,
        });
        Matter.Composite.add(this.comp, this.hook);
        Matter.Composite.add(this.comp, this.spring);
        this.goal = null;
        this.cooldown = 0;
        this.jumpCooldown = 0;
        this.jumpDirection = { x: 0, y: 0 };
        this.replenishArmOrder();
        this.brightness = 0;
    }
    Octopus.prototype.replenishArmOrder = function () {
        this.armOrder = this.arms.map(function (arm, i) { return i; });
    };
    Octopus.prototype.maybeReachable = function (bodies) {
        var octobodies = new Set(Matter.Composite.allBodies(this.comp));
        // haha see what I did there?
        var relevantBodies = bodies.filter(function (b) { return !octobodies.has(b); });
        var center = this.head.position;
        var reachBody = Matter.Bodies.circle(center.x, center.y, this.reach);
        return Matter.Query.region(relevantBodies, reachBody.bounds);
    };
    Octopus.prototype.isGrounded = function () {
        return this.arms.some(function (arm) { return !(arm.stopped); });
    };
    Octopus.prototype.jump = function (toward) {
        if (this.isGrounded() && this.jumpCooldown <= 0) {
            this.jumpCooldown = jumpLength;
            this.arms.forEach(function (arm) { return arm.stop(); });
            var rawDiff = Matter.Vector.sub(toward, this.head.position);
            var normalized = Matter.Vector.normalise(rawDiff);
            this.jumpDirection = Matter.Vector.mult(normalized, 200);
        }
    };
    Octopus.prototype.moveArm = function (reachable, toMove, tries) {
        var _this = this;
        var start = this.head.position;
        var angles = _.times(tries, function () { return random.weighted(-Math.PI / 2, Math.PI / 2); });
        var points = angles.map(function (angle) {
            var v1 = Matter.Vector.sub(_this.goal, start);
            var v2 = Matter.Vector.rotate(v1, angle);
            var end2 = Matter.Vector.add(start, v2);
            var ray = Matter.Query.ray(reachable, start, end2);
            var cast = raycast_1.raycast(ray.map(function (obj) { return obj.body; }), start, end2);
            return cast.map(function (raycol) { return raycol.point; })[0];
        }).filter(function (point) {
            if (!point) {
                return false;
            }
            var dist = Matter.Vector.magnitude(Matter.Vector.sub(point, start));
            if (dist > _this.reach) {
                return false;
            }
            return true;
        });
        if (points.length > 0) {
            var point = points.reduce(function (acc, cur) {
                var d1 = Matter.Vector.magnitude(Matter.Vector.sub(acc, _this.goal));
                var d2 = Matter.Vector.magnitude(Matter.Vector.sub(cur, _this.goal));
                return d2 < d1 ? cur : acc;
            }, points[0]);
            toMove.move(point);
        }
    };
    Octopus.prototype.update = function (time, delta, world) {
        var _this = this;
        this.cooldown = Math.max(0, this.cooldown - delta);
        this.jumpCooldown = Math.max(0, this.jumpCooldown - delta);
        if (this.isGrounded()) {
            var total = this.arms.reduce(function (acc, cur) {
                return Matter.Vector.add(acc, cur.tipPosition());
            }, { x: 0, y: 0 });
            var centroid = Matter.Vector.div(total, this.arms.length);
            if (this.goal) {
                var dir = Matter.Vector.sub(this.goal, this.head.position);
                var normie = Matter.Vector.normalise(dir); // yes I'm fun at parties
                var lean = Matter.Vector.mult(normie, 3 * this.headRadius);
                this.hook.position = Matter.Vector.add(centroid, lean);
            }
            else {
                this.hook.position = centroid;
            }
        }
        else {
            this.hook.position = Matter.Vector.add(this.head.position, Matter.Vector.mult(this.jumpDirection, (1.0 / jumpLength) * Math.max(0, this.jumpCooldown - jumpLength * 0.5)));
        }
        var bodies = Matter.Composite.allBodies(world);
        var reachable = this.maybeReachable(bodies);
        if (this.goal) {
            this.arms.filter(function (arm) { return arm.stopped; }).forEach(function (arm) { return _this.moveArm(reachable, arm, 1); });
            if (this.cooldown <= 0) {
                this.cooldown = 250;
                var bestArm = this.arms[this.armOrder[0]];
                this.armOrder.shift();
                if (this.armOrder.length === 0) {
                    this.replenishArmOrder();
                }
                this.moveArm(reachable, bestArm, 100);
            }
        }
        this.arms.forEach(function (arm) { return arm.update(_this.head.position, _this.reach); });
    };
    Octopus.prototype.render = function (graphics, progress) {
        var _this = this;
        graphics.fillStyle(color.multiply(orange, this.brightness));
        this.arms.forEach(function (arm) { return arm.render(graphics, _this.head.position, _this.brightness); });
        var center = this.head.position;
        var radius = this.headRadius;
        graphics.fillCircle(center.x, center.y, radius);
        graphics.fillStyle(color.multiply(0xffffff, this.brightness));
        if (progress === 'sleeping') {
            graphics.fillRoundedRect(center.x - radius / 3.0 - radius / 5.0, center.y, radius / 3.0, radius / 10.0, radius / 20.0);
            graphics.fillRoundedRect(center.x + radius / 3.0 - radius / 5.0, center.y, radius / 3.0, radius / 10.0, radius / 20.0);
        }
        else {
            graphics.fillEllipse(center.x - radius / 3.0, center.y, radius / 5.0, radius / 2.0);
            graphics.fillEllipse(center.x + radius / 3.0, center.y, radius / 5.0, radius / 2.0);
        }
    };
    return Octopus;
}());
exports.Octopus = Octopus;


});

require.register("page.ts", function(exports, require, module) {
/// <reference path="../node_modules/phaser/types/phaser.d.ts" />
"use strict";
var _ = require("underscore");
var arrow = require("./arrow");
var testLine = 'F';
function maxLines(text, height) {
    text.setText(testLine);
    var n = 1;
    while (text.displayHeight <= height) {
        text.setText(text.text + "\n" + testLine);
        n++;
    }
    return n - 1;
}
var Page = (function () {
    function Page(left, right) {
        [left, right].forEach(function (text) {
            text.setColor('black');
            text.setFontFamily('serif');
            text.setFontSize(25);
        });
        this.left = left;
        this.right = right;
        this.pages = [];
        this.pageNum = 0;
        this.opacity = 0;
    }
    Page.prototype.rebuild = function (paragraphs, makeGraphics, destroyTexture) {
        this.paragraphs = paragraphs;
        this.left.setX(100);
        this.left.setY(100);
        this.right.setX(this.worldView.centerX + 50);
        this.right.setY(100);
        this.left.setWordWrapWidth((this.worldView.width - 300) / 2);
        var linesPerPage = maxLines(this.left, this.worldView.height - 200);
        var lines = this.left.runWordWrap(paragraphs.join('\n\n')).split('\n');
        this.left.setWordWrapWidth(null); // otherwise it would wrap "twice", weird
        this.pages = _.chunk(lines, linesPerPage).map(function (page) {
            return _.toArray(page).join('\n');
        });
        this.left.setText('');
        this.right.setText('');
        if (this.pages.length > this.pageNum) {
            this.left.setText(this.pages[this.pageNum]);
            if (this.pages.length > this.pageNum + 1) {
                this.right.setText(this.pages[this.pageNum + 1]);
            }
        }
        this.savedPageNum = this.pageNum;
        this.leftArrow = (this.pageNum > 0);
        this.rightArrow = (this.pageNum + 2 < this.pages.length);
        destroyTexture('book');
        var g = makeGraphics();
        g.fillStyle(0x4f2c0f);
        g.fillRect(40, 40, this.worldView.width - 80, this.worldView.height - 80);
        g.fillStyle(0xffffff);
        g.fillRect(50, 50, this.worldView.width - 100, this.worldView.height - 100);
        g.fillStyle(0x888888);
        g.fillRect(this.worldView.centerX - 2, 50, 4, this.worldView.height - 100);
        if (this.leftArrow) {
            arrow.drawArrow(g, { x: (50 + this.worldView.centerX) / 2, y: this.worldView.bottom - 75 }, { x: -1, y: 0 }, arrow.page, 0x000000, false);
        }
        if (this.rightArrow) {
            arrow.drawArrow(g, { x: (this.worldView.right - 50 + this.worldView.centerX) / 2, y: this.worldView.bottom - 75 }, { x: 1, y: 0 }, arrow.page, 0x000000, false);
        }
        g.generateTexture('book');
        g.destroy();
    };
    Page.prototype.update = function (worldView, makeGraphics, destroyTexture) {
        this.left.setAlpha(this.opacity);
        this.right.setAlpha(this.opacity);
        if (!(this.worldView)
            || worldView.width !== this.worldView.width
            || worldView.height !== this.worldView.height
            || (this.paragraphs && this.savedPageNum !== this.pageNum)) {
            this.worldView = new Phaser.Geom.Rectangle(worldView.x, worldView.y, worldView.width, worldView.height);
            if (this.paragraphs) {
                this.rebuild(this.paragraphs, makeGraphics, destroyTexture);
            }
        }
    };
    Page.prototype.render = function (graphics) {
        graphics.fillStyle(0xffffff, this.opacity);
        graphics.setTexture('book');
        graphics.fillRect(0, 0, this.worldView.width, this.worldView.height);
        graphics.setTexture();
    };
    return Page;
}());
exports.Page = Page;


});

require.register("random.ts", function(exports, require, module) {
"use strict";
var _ = require("underscore");
var color_1 = require("./color");
function choose(array) {
    // https://stackoverflow.com/a/4550514/5044950
    return array[Math.floor(Math.random() * array.length)];
}
exports.choose = choose;
function weighted(min, max) {
    var x = Math.random();
    var y = 2 * x - 1;
    return 0.5 * ((y * y * y) * (max - min) + (min + max));
}
exports.weighted = weighted;
function color(sum, rng) {
    var r = Math.floor(rng() * (sum + 1));
    var g = Math.floor(rng() * (sum - r + 1));
    var b = sum - r - g;
    return color_1.rgbToHex(r, g, b);
}
exports.color = color;
function groupSize(max, rng) {
    var pmf = new Map(_.times(max, function (i) {
        var outcome = i + 1;
        return [outcome, 1 / (outcome * outcome)];
    }));
    var total = Array.from(pmf.values()).reduce(function (x, y) { return x + y; });
    var choice = rng() * total;
    var running = 0;
    for (var i = 1; i <= max; ++i) {
        var next = running + pmf.get(i);
        if (choice < next) {
            return i;
        }
        running = next;
    }
    return 1;
}
exports.groupSize = groupSize;


});

require.register("raycast.js", function(exports, require, module) {
// https://github.com/liabru/matter-js/issues/181
// https://pastebin.com/7M2CvK29

const Matter = Phaser.Physics.Matter.Matter;

//
//				code by Isaiah Smith
//		technostalgic.itch.io  |  @technostalgicGM
//
//raycast functionality integrated with matter.js since there
//is no built-in method for raycasting that returns the ray's
//intersection points

//function 'raycast' - returns an array of 'raycol' objects
//param 'bodies' - bodies to check collision with; passed
//	through 'Matter.Query.ray()'
//param 'start' - start point of raycast
//param 'end' - end point of raycast
//param 'sort' - whether or not the ray collisions should be
//	sorted based on distance from the origin
function raycast(bodies, start, end, sort = true){
	//convert the start & end parameters to my custom
	//'vec2' object type
	start = vec2.fromOther(start);
	end = vec2.fromOther(end);

	//The bodies that the raycast will be tested against
	//are queried and stored in the variable 'query'.
	//This uses the built-in raycast method which takes
	//advantage of the broad-phase collision optomizations
	//instead of iterating through each body in the list
	var query = Matter.Query.ray(bodies, start, end);

	//'cols': the array that will contain the ray
	//collision information
	var cols = [];
	//'raytest': the ray object that will be tested for
	//collision against the bodies
	var raytest = new ray(start, end);

	//Next, since all the bodies that the ray collides with
	//have already been queried, we iterate through each
	//one to see where the ray intersects with the body
	//and gather other information
	for(var i = query.length - 1; i >= 0; i--){
		var bcols = ray.bodyCollisions(raytest, query[i].body);
		for(var k = bcols.length - 1; k >= 0; k--){
			cols.push(bcols[k]);
		}
	}

	//if desired, we then sort the collisions based on the
	//disance from the ray's start
	if(sort)
		cols.sort(function(a,b){
			return a.point.distance(start) > b.point.distance(start);
		});

	return cols;
}

//data type that contains information about an intersection
//between a ray and a body
class raycol{
	//initailizes a 'raycol' object with the given data
	//param 'body' - stores the body that the ray has
	//	collided with
	//param 'point' - stores the collision point
	//param 'normal' - stores the normal of the edge that
	//	the ray collides with
	//param 'verts' - stores the vertices of the edge that
	//	the ray collides with
	constructor(body, point, normal, verts){
		this.body = body;
		this.point = point;
		this.normal = normal;
		this.verts = verts;
	}
}

//data type that contains information and methods for a
//ray object
class ray{
	//initializes a ray instance with the given parameters
	//param 'start' - the starting point of the ray
	//param 'end' - the ending point of the ray
	constructor(start, end){
		this.start = start;
		this.end = end;
	}

	yValueAt(x){
		//returns the y value on the ray at the specified x
		//slope-intercept form:
		//y = m * x + b
		return this.offsetY + this.slope * x;
	}
	xValueAt(y){
		//returns the x value on the ray at the specified y
		//slope-intercept form:
		//x = (y - b) / m
		return (y - this.offsetY) / this.slope;
	}

	pointInBounds(point){
		//checks to see if the specified point is within
		//the ray's bounding box (inclusive)
		var minX = Math.min(this.start.x, this.end.x);
		var maxX = Math.max(this.start.x, this.end.x);
		var minY = Math.min(this.start.y, this.end.y);
		var maxY = Math.max(this.start.y, this.end.y);
		return (
			point.x >= minX &&
			point.x <= maxX &&
			point.y >= minY &&
			point.y <= maxY );
	}
	calculateNormal(ref){
		//calulates the normal based on a specified
		//reference point
		var dif = this.difference;

		//gets the two possible normals as points that lie
		//perpendicular to the ray
		var norm1 = dif.normalized().rotate(Math.PI / 2);
		var norm2 = dif.normalized().rotate(Math.PI / -2);

		//returns the normal that is closer to the provided
		//reference point
		if(this.start.plus(norm1).distance(ref) < this.start.plus(norm2).distance(ref))
			return norm1;
		return norm2;
	}

	get difference(){
		//pretty self explanitory
		return this.end.minus(this.start);
	}
	get slope(){
		var dif = this.difference;
		return dif.y / dif.x;
	}
	get offsetY(){
		//the y-offset at x = 0, in slope-intercept form:
		//b = y - m * x
		//offsetY = start.y - slope * start.x
		return this.start.y - this.slope * this.start.x;
	}
	get isHorizontal(){ return compareNum(this.start.y, this.end.y); }
	get isVertical(){ return compareNum(this.start.x, this.end.x); }

	static intersect(rayA, rayB){
		//returns the intersection point between two rays
		//null if no intersection

		//conditional checks for axis aligned rays
		if(rayA.isVertical && rayB.isVertical) return null;
		if(rayA.isVertical) return new vec2(rayA.start.x, rayB.yValueAt(rayA.start.x));
		if(rayB.isVertical) return new vec2(rayB.start.x, rayA.yValueAt(rayB.start.x));
		if(compareNum(rayA.slope, rayB.slope)) return null;
		if(rayA.isHorizontal) return new vec2(rayB.xValueAt(rayA.start.y), rayA.start.y);
		if(rayB.isHorizontal) return new vec2(rayA.xValueAt(rayB.start.y), rayB.start.y);

		//slope intercept form:
		//y1 = m2 * x + b2; where y1 = m1 * x + b1:
		//m1 * x + b1 = m2 * x + b2:
		//x = (b2 - b1) / (m1 - m2)
		var x = (rayB.offsetY - rayA.offsetY) / (rayA.slope - rayB.slope)
		return new vec2(x, rayA.yValueAt(x));
	}
	static collisionPoint(rayA, rayB){
		//returns the collision point of two rays
		//null if no collision
		var intersection = ray.intersect(rayA, rayB);
		if(!intersection) return null;
		if(!rayA.pointInBounds(intersection)) return null;
		if(!rayB.pointInBounds(intersection)) return null;
		return intersection;
	}
	static bodyEdges(body){
		//returns all of the edges of a body in the
		//form of an array of ray objects
		var r = [];
		for (var i = body.parts.length - 1; i >= 0; i--){
			for(var k = body.parts[i].vertices.length - 1; k >= 0; k--){
				var k2 = k + 1;
				if(k2 >= body.parts[i].vertices.length)
					k2 = 0;
				var tray = new ray(
					vec2.fromOther(body.parts[i].vertices[k]) ,
					vec2.fromOther(body.parts[i].vertices[k2]) );

				//stores the vertices inside the edge
				//ray for future reference
				tray.verts = [
					body.parts[i].vertices[k] ,
					body.parts[i].vertices[k2] ];

				r.push(tray);
			}
		}
		return r;
	}
	static bodyCollisions(rayA, body){
		//returns all the collisions between a specified ray
		//and body in the form of an array of 'raycol' objects
		var r = [];

		//gets the edge rays from the body
		var edges = ray.bodyEdges(body);

		//iterates through each edge and tests for collision
		//with 'rayA'
		for(var i = edges.length - 1; i >= 0; i--){
			//gets the collision point
			var colpoint = ray.collisionPoint(rayA, edges[i]);

			//if there is no collision, then go to next edge
			if(!colpoint) continue;

			//calculates the edge's normal
			var normal = edges[i].calculateNormal(rayA.start);

			//adds the ray collision to the return array
			r.push(new raycol(body, colpoint, normal, edges[i].verts));
		}

		return r;
	}
}

//in order to avoid miscalculations due to floating points
//error, which for whatever reason javascript has a ton of
//example:
//var m = 6; m -= 1; m -= 3; m += 4
//now 'm' probably equals 6.0000000008361 or something stupid
function compareNum(a, b, leniency = 0.00001){
	return Math.abs(b - a) <= leniency;
}

//
//included external dependencies:
//
//2d vector data type; contains information and methods for
//2-dimensional vectors
class vec2{
	//initailizes a 'vec2' object with specified values
	constructor(x = 0, y = x){
		this.x = x;
		this.y = y;
	}

	normalized(magnitude = 1){
		//returns a vector 2 with the same direction as this but
		//with a specified magnitude
		return this.multiply(magnitude / this.distance());
	}
	get inverted(){
		//returns the opposite of this vector
		return this.multiply(-1);
	}
	multiply(factor){
		//returns this multiplied by a specified factor
		return new vec2(this.x * factor, this.y * factor);
	}
	plus(vec){
		//returns the result of this added to another
		//specified 'vec2' object
		return new vec2(this.x + vec.x, this.y + vec.y);
	}
	minus(vec){
		//returns the result of this subtracted by another
		//specified 'vec2' object
		return this.plus(vec.inverted);
	}
	rotate(rot){
		//rotates the vector by the specified angle
		var ang = this.direction;
		var mag = this.distance();
		ang += rot;
		return vec2.fromAng(ang, mag)
	}
	toPhysVector(){
		//converts this to a vector compatible with the
		//matter.js physics engine
		return Matter.Vector.create(this.x, this.y);
	}

	get direction(){
		//returns the angle this vector is pointing in radians
		return Math.atan2(this.y, this.x);
	}
	distance(vec = new vec2()){
		//returns the distance between this and a specified
		//'vec2' object
		var d = Math.sqrt(
			Math.pow(this.x - vec.x, 2) +
			Math.pow(this.y - vec.y, 2));
		return d;
	}

	clone(){
		//returns a new instance of a 'vec2' object with the
		//same value
		return new vec2(this.x, this.y);
	}
	static fromAng(angle, magnitude = 1){
		//returns a vector which points in the specified angle
		//and has the specified magnitude
		return new vec2(
			Math.cos(angle) * magnitude,
			Math.sin(angle) * magnitude);
	}
	static fromOther(vector){
		//converts other data types that contain 'x' and 'y'
		//properties to a 'vec2' object type
		return new vec2(vector.x, vector.y);
	}

	toString(){
		return "vector<" + this.x + ", " + this.y + ">";
	}
}

module.exports = { raycast };

});

require.register("renderer.ts", function(exports, require, module) {
/// <reference path="../node_modules/phaser/types/phaser.d.ts" />
"use strict";
var hud_1 = require("./hud");
var music = require("./music");
var save_1 = require("./save");
var scene_1 = require("./scene");
var game = new Phaser.Game({
    parent: 'parent',
    physics: { default: 'matter' },
    scale: { mode: Phaser.Scale.RESIZE },
});
game.registry.values.save = save_1.loadGame();
music.play(game.registry.values.save);
addEventListener('beforeunload', function () {
    save_1.saveGame(game.registry.values.save);
    game.destroy(true, true);
});
game.scene.add('main', scene_1.MainScene, true);
game.scene.add('hud', hud_1.HUD, true);


});

require.register("save.ts", function(exports, require, module) {
"use strict";
var t = require("io-ts");
var seedrandom = require("seedrandom");
var Progress = t.keyof({
    sleeping: null,
    library: null,
    move: null,
    waiting: null,
    book1: null,
    getting1: null,
    found1: null,
    book2: null,
    getting2: null,
    found2: null,
    book3: null,
    getting3: null,
    found3: null,
    book4: null,
    getting4: null,
    found4: null,
    close: null,
    end: null,
});
var Save = t.interface({
    seed: t.number,
    progress: Progress,
    location: t.tuple([t.number, t.number]),
});
var defaultSave = {
    seed: seedrandom().int32(),
    progress: 'sleeping',
    location: [0, 0],
};
function loadGame() {
    var str = localStorage.getItem('babel-forest');
    try {
        var parsed = JSON.parse(str);
        var either = Save.decode(parsed);
        return either.getOrElse(defaultSave);
    }
    catch (e) {
        return defaultSave;
    }
}
exports.loadGame = loadGame;
function saveGame(data) {
    if (data.progress === 'end') {
        data = defaultSave;
    }
    localStorage.setItem('babel-forest', JSON.stringify(data));
}
exports.saveGame = saveGame;


});

require.register("scene.ts", function(exports, require, module) {
/// <reference path="../node_modules/phaser/types/phaser.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
var Matter = Phaser.Physics.Matter.Matter;
var arrow = require("./arrow");
var octopus_1 = require("./octopus");
var world_1 = require("./world");
var MainScene = (function (_super) {
    __extends(MainScene, _super);
    function MainScene() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MainScene.prototype.create = function () {
        var _this = this;
        this.wDown = false;
        this.aDown = false;
        this.sDown = false;
        this.dDown = false;
        this.jump = false;
        this.waiting = false;
        addEventListener('resize', function () {
            _this.cameras.main.setSize(innerWidth, innerHeight);
        });
        this.graphics = this.add.graphics();
        this.world = new world_1.World({
            seed: this.registry.values.save.seed,
            book: 50,
            door: 2,
            gap: 50,
            height: 5,
            shelf: 5,
            trap: 75,
            wall: 25,
            width: 270,
        });
        this.matter.world.add(this.world.comp);
        var _a = this.registry.values.save.location, x = _a[0], y = _a[1];
        this.octopus = new octopus_1.Octopus({
            x: x, y: y,
            headRadius: 20,
            numArms: 8,
            segmentLength: 30,
            segmentRadius: 5,
            segmentsPerArm: 5,
        });
        this.matter.world.add(this.octopus.comp);
        var progress = this.registry.values.save.progress;
        if (progress === 'sleeping') {
            var listener_1 = function (e, a, b) {
                var octobodies = Matter.Composite.allBodies(_this.octopus.comp);
                var hasHead = [a, b].some(function (body) { return body === _this.octopus.head; });
                var hasWall = !([a, b].every(function (body) { return octobodies.includes(body); }));
                if (hasHead && hasWall) {
                    _this.tweens.add({
                        targets: _this.octopus,
                        brightness: 1,
                        delay: 500,
                        duration: 1000,
                        onComplete: function () { _this.events.emit('main-introduction'); },
                    });
                    _this.matter.world.off('collisionstart', listener_1);
                }
            };
            this.matter.world.on('collisionstart', listener_1);
        }
        else {
            this.octopus.brightness = 1;
            this.world.darkness = 0;
            if (progress === 'library') {
                this.time.addEvent({ delay: 250, callback: function () {
                        _this.events.emit('main-library');
                    } });
            }
            else if (progress === 'move') {
                this.time.addEvent({ delay: 250, callback: function () {
                        _this.events.emit('main-move');
                    } });
            }
            else if (progress === 'book1') {
                this.time.addEvent({ delay: 250, callback: function () {
                        _this.events.emit('main-book1');
                    } });
            }
            else if (progress === 'book2') {
                this.time.addEvent({ delay: 250, callback: function () {
                        _this.events.emit('main-book2');
                    } });
            }
            else if (progress === 'book3') {
                this.time.addEvent({ delay: 250, callback: function () {
                        _this.events.emit('main-book3');
                    } });
            }
            else if (progress === 'book4') {
                this.time.addEvent({ delay: 250, callback: function () {
                        _this.events.emit('main-book4');
                    } });
            }
            else if (progress === 'close') {
                this.time.addEvent({ delay: 250, callback: function () {
                        _this.events.emit('main-close');
                    } });
            }
        }
        this.scene.get('hud').events.on('hud-library', function () {
            _this.tweens.add({
                targets: _this.world,
                darkness: 0,
                duration: 1000,
                onComplete: function () { _this.events.emit('main-library'); },
            });
        });
        this.scene.get('hud').events.on('hud-move', function () {
            _this.time.addEvent({ delay: 250, callback: function () {
                    _this.events.emit('main-move');
                } });
        });
        var waitingF = function () { _this.waiting = true; };
        this.scene.get('hud').events.on('hud-waiting', waitingF);
        if (progress === 'waiting') {
            waitingF();
        }
        var getting1F = function () {
            _this.book = _this.world.chooseBook(_this.octopus.head.position, 0);
        };
        this.scene.get('hud').events.on('hud-getting1', getting1F);
        if (progress === 'getting1') {
            getting1F();
        }
        this.scene.get('hud').events.on('hud-book2', function () {
            _this.events.emit('main-book2');
        });
        var getting2F = function () {
            _this.book = _this.world.chooseBook(_this.octopus.head.position, 3);
        };
        this.scene.get('hud').events.on('hud-getting2', getting2F);
        if (progress === 'getting2') {
            getting2F();
        }
        this.scene.get('hud').events.on('hud-book3', function () {
            _this.events.emit('main-book3');
        });
        var getting3F = function () {
            _this.book = _this.world.chooseBook(_this.octopus.head.position, 10);
        };
        this.scene.get('hud').events.on('hud-getting3', getting3F);
        if (progress === 'getting3') {
            getting3F();
        }
        this.scene.get('hud').events.on('hud-book4', function () {
            _this.events.emit('main-book4');
        });
        var getting4F = function () {
            _this.book = _this.world.chooseBook(_this.octopus.head.position, 25);
        };
        this.scene.get('hud').events.on('hud-getting4', getting4F);
        if (progress === 'getting4') {
            getting4F();
        }
        this.scene.get('hud').events.on('hud-close', function () {
            _this.events.emit('main-close');
        });
        this.radius = 0;
        this.scene.get('hud').events.on('hud-end', function () {
            // @ts-ignore: Type 'MatterJS.World' is not assignable to type ...
            var world = _this.matter.world.localWorld;
            world.gravity.y = 0;
            _this.matter.world.remove(_this.world.comp, true);
            _this.tweens.add({
                targets: _this,
                radius: 1000,
                duration: 5000,
            });
        });
        var spacebar = this.input.keyboard.addKey('SPACE');
        spacebar.on('down', function () { _this.jump = true; });
        var _b = ['W', 'A', 'S', 'D'].map(function (k) {
            return _this.input.keyboard.addKey(k);
        }), w = _b[0], a = _b[1], s = _b[2], d = _b[3];
        w.on('down', function () { _this.wDown = true; });
        a.on('down', function () { _this.aDown = true; });
        s.on('down', function () { _this.sDown = true; });
        d.on('down', function () { _this.dDown = true; });
        w.on('up', function () { _this.wDown = false; });
        a.on('up', function () { _this.aDown = false; });
        s.on('up', function () { _this.sDown = false; });
        d.on('up', function () { _this.dDown = false; });
    };
    MainScene.prototype.closeEnough = function () {
        if (this.book) {
            var bookVec = { x: this.book.centerX, y: this.book.centerY };
            var diff = Matter.Vector.sub(this.octopus.head.position, bookVec);
            return Matter.Vector.magnitude(diff) < 40;
        }
        else {
            return false;
        }
    };
    MainScene.prototype.update = function (time, delta) {
        var _this = this;
        var progress = this.registry.values.save.progress;
        if (progress !== 'sleeping') {
            var movingDir = {
                x: this.octopus.head.position.x,
                y: this.octopus.head.position.y,
            };
            // TODO: change these values because I think the vector length does matter
            if (this.wDown) {
                movingDir.y -= 100;
            }
            if (this.aDown) {
                movingDir.x -= 100;
            }
            if (this.sDown) {
                movingDir.y += 100;
            }
            if (this.dDown) {
                movingDir.x += 100;
            }
            if (this.wDown || this.aDown || this.sDown || this.dDown) {
                this.octopus.goal = movingDir;
            }
            else {
                this.octopus.goal = null;
            }
            if (this.jump) {
                var pointer = this.input.activePointer;
                var pointerLocation = { x: pointer.worldX, y: pointer.worldY };
                if (this.waiting && this.octopus.isGrounded()) {
                    this.waiting = false;
                    this.registry.values.save.progress = 'book1';
                    this.events.emit('main-book1');
                }
                this.octopus.jump(pointerLocation);
                this.jump = false;
            }
        }
        // @ts-ignore: Argument of type 'MatterJS.World' is not assignable ...
        this.octopus.update(time, delta, this.matter.world.localWorld);
        this.cameras.main.centerOn(this.octopus.head.position.x, this.octopus.head.position.y);
        this.world.update(this.cameras.main.worldView, function () { return _this.add.graphics(); }, function (key) { return _this.textures.remove(key); });
        if (this.closeEnough()) {
            this.book = null;
            if (progress === 'getting1') {
                this.registry.values.save.progress = 'found1';
                this.events.emit('main-found1');
            }
            else if (progress === 'getting2') {
                this.registry.values.save.progress = 'found2';
                this.events.emit('main-found2');
            }
            else if (progress === 'getting3') {
                this.registry.values.save.progress = 'found3';
                this.events.emit('main-found3');
            }
            else if (progress === 'getting4') {
                this.registry.values.save.progress = 'found4';
                this.events.emit('main-found4');
            }
        }
        if (this.oscillate) {
            this.oscillate += delta / 1000;
            if (this.oscillate > 2) {
                this.oscillate -= 2;
            }
        }
        else {
            this.oscillate = 1;
        }
        var _a = this.octopus.head.position, x = _a.x, y = _a.y;
        this.registry.values.save.location = [x, y];
        this.graphics.clear();
        if (progress !== 'sleeping') {
            this.world.render(this.graphics);
        }
        var _b = this.cameras.main.worldView, left = _b.left, top = _b.top, width = _b.width, height = _b.height;
        this.graphics.fillStyle(0x000000, this.world.darkness);
        this.graphics.fillRect(left, top, width, height);
        if (this.book) {
            this.graphics.fillStyle(0xffffff, Math.abs(1 - this.oscillate));
            this.graphics.fillRectShape(this.book);
        }
        this.graphics.fillStyle(0x0000ff);
        this.graphics.fillCircle(this.octopus.head.position.x, this.octopus.head.position.y, this.radius);
        this.octopus.render(this.graphics, progress);
        if (this.book) {
            var bookVec = { x: this.book.centerX, y: this.book.centerY };
            var diff = Matter.Vector.sub(bookVec, this.octopus.head.position);
            arrow.drawArrow(this.graphics, this.octopus.head.position, diff, arrow.direction, 0xffffff, true);
        }
    };
    return MainScene;
}(Phaser.Scene));
exports.MainScene = MainScene;


});

require.register("story.ts", function(exports, require, module) {
"use strict";
exports.introduction = [
    'Welcome to the world.',
    'Here lies your self, a sleeping octopus.',
    'How peaceful.',
    "But now it's time to wake up.",
];
exports.library = [
    'Oh.',
    'Oh dear.',
    'This is... hm.',
    'This is a library.',
    "Octopuses don't live in libraries.",
    'Octopodes?',
    'Octopi?',
    "In any case, you've gotta get out of here my friend.",
];
exports.move = [
    '(psst)',
    '(hey human controlling the octopus)',
    '(you know video games right?)',
    '(ok well this is sort of like one of those)',
    '(use WASD to crawl around)',
    "(and when you're attached to a surface, use Space to jump off it)",
    '(you always jump in the direction of your cursor)',
    '(👍)',
];
exports.book1 = [
    ['white', 'Sweet, you have control over all your limbs!'],
    ['red', 'Ahem.'],
    ['white', 'Oh shoot what was that?'],
    ['red', 'Hello Toothbrush.'],
    ['white', "Phew, it's talking to someone else."],
    ['red', 'I forget why I chose to name an octopus "Toothbrush", but whatevs.'],
    ['white', "nani"],
    ['red', 'Anyhow, I kidnapped you from your home'],
    ['red', 'and teleported you into this infinite library'],
    ['red', 'because I need an assistant.'],
    ['red', 'You see, I have so many books.'],
    ['red', "I don't have time to romp around in the library myself."],
    ['red', 'I need someone to find them for me.'],
    ['red', "That's where you come in."],
    ['red', "Actually, I happen to need a book from that room you're in."],
    ['red', 'That one over there, can you reach it for me?'],
];
exports.book2 = [
    ['red', 'Impressive... you found it.'],
    ['red', "Hmm... I need another one in a bit, but it's further away..."],
    ['red', 'See if you can find your way over to it while I work on this.'],
];
exports.book3 = [
    ['red', "Oh thanks! ... wait, this is Latin. I don't read Latin."],
    ['white', 'Who the heck is this disembodied voice being anyhow? ridiculous'],
    ['red', 'OK OK'],
    ['red', 'Ummmmmm'],
    ['red', 'Oh!'],
    ['red', 'Hahaha I was reading the bibliography upside down.'],
    ['red', 'The actual book I need is over yonder somewheres.'],
    ['red', 'Pretty please?'],
    ['white', "You'd better find a way out FAST or you'll, idk, suffocate or something."],
    ['white', "Y'know, like, with your gills? Do octofellows have those?"],
];
exports.book4 = [
    ['white', '...'],
    ['red', 'Ha! Hilarious. Ah, what a life. Hum de do da dey...'],
    ['white', "Hey c'mon dude! Stop being such a jerk!"],
    ['red', 'Hrm? Who dat?'],
    ['white', "(wait, I'm the narrator, aren't I? I probably should be quiet)"],
    ['white', '(oh well)'],
    ['white', "Um... *deep voice* it's me, the octopod! I am... um... displeased"],
    ['red', "OK well lodge a complaint and I'll get back to you in 5-7 busi--"],
    ['white', 'NOT A COMPLAINT! um... a proposition'],
    ['red', "...?"],
    ['white', 'yes'],
    ['white', 'Elevator pitch:'],
    ['white', 'Do you like books?'],
    ['white', "Then you'll LOVE... um... A BOOK!"],
    ['white', 'I, the octopus, shall retrieve it for you!'],
    ['white', 'One of your choosing!'],
    ['white', 'For the low, low price of nothing, I just get it for you and go home.'],
    ['red', 'Oh cool, what a sweet deal!'],
    ['red', 'Um... yeah sure'],
    ['red', "You know, I've always wanted to read this one short story"],
    ['red', "It's a bit of a jog to reach, though. But since you asked..."],
];
exports.close = [
    ['red', '*sigh* It seems that you have brought me all the books I could ever want.'],
    ['white', 'Yussss'],
    ['red', "I have grown tired of books. They're just cephalopod juice on tree bread, after all."],
    ['red', 'This library should be destroyed. It can bring no more joy to anyone.'],
    ['red', 'Out of the great benevolence of my heart, I shall free you first.'],
    ['red', 'So long, and thanks for all the büx.'],
];
exports.books = [
    [
        'Find enclosed a recipe for 3 (three) chocolate chip cookies. At *least*. Some people tell me this recipe yields two (2) or fewer cookies, but those people are absolute goobers if you ask me. These cookies should provide a nice ESCAPE (cough cough hint hint) from your otherwise boring existence.',
        'You will need: a) a a a a a a a sorry hold on one second',
        "My cat jumped on the keyboard and I can't find the backspace key. Anyway, you probably need some eggs and stuff, what, do I look like a chef to you? And some chocolate chips. Duh.",
        "Mix them together and you'll have a nice warm batch of chocolate chip cookie dough, except it's not warm yet because you probably forgot to bake it. Do I have to tell you everything? Honestly! It's like typing on a wall.",
        "Oh, and don't plagiarize my recipe. Lots of hours of R&D went into this. Lots.",
        "kthxbai",
    ],
    [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam feugiat libero velit, eu aliquam diam maximus vel. Donec ac lorem quis sem pulvinar vulputate vel nec turpis. Proin ullamcorper turpis eu nisi malesuada, id egestas nulla interdum. Proin aliquam eleifend odio, ac consectetur metus placerat at. Etiam id vulputate justo. Maecenas bibendum metus ac arcu interdum condimentum. Sed a venenatis nisl. Praesent eu rutrum felis. Aenean porta ante volutpat ultricies auctor. Proin placerat gravida ex sit amet auctor. Nulla id pharetra sem, venenatis mattis ligula. Nulla quis velit non neque placerat imperdiet ac in odio.',
        'Nam dictum vel ipsum ut consequat. Maecenas in semper mauris. Cras scelerisque nisi bibendum neque placerat venenatis. Suspendisse bibendum quam nulla, ut pellentesque enim egestas id. Nullam iaculis metus vel nibh tempus, in eleifend massa pulvinar. Ut mollis risus enim, vel auctor ex fringilla sit amet. Donec congue enim mi, sed rhoncus massa aliquet sit amet. Donec non ante sed mauris pharetra hendrerit. In hac habitasse platea dictumst. Morbi dignissim odio eget velit ultricies posuere. Sed consequat viverra tincidunt. Praesent malesuada congue nisl nec elementum. Aenean sollicitudin leo quis hendrerit aliquam.',
        'Cras pulvinar felis in commodo aliquet. Aenean pulvinar ante lacus, in dapibus dolor faucibus sed. Etiam quis rhoncus dui. Nam quis dui dapibus, tempus eros at, faucibus sapien. Nulla congue, arcu vel faucibus ultrices, nunc enim blandit metus, eget elementum augue quam ac purus. Phasellus pulvinar facilisis ligula, vel ullamcorper velit ultricies at. Cras et est vestibulum, finibus justo quis, faucibus diam. Aenean vehicula nunc eget vestibulum convallis. Duis sollicitudin vel urna in rhoncus. Nunc non malesuada dui. Morbi congue augue orci, eu bibendum purus tempus at. Fusce ut nulla suscipit, mollis velit ut, eleifend nisl. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras ullamcorper pellentesque ligula in accumsan.',
        'Integer quis libero vel nunc gravida hendrerit quis congue mi. In mattis lectus et efficitur mattis. Cras ultrices congue tristique. Quisque urna magna, placerat egestas sem eget, finibus sollicitudin orci. Praesent eleifend facilisis augue sit amet gravida. Nulla in ante tortor. Nunc at semper orci, a iaculis dolor. Donec mollis ipsum sed vehicula volutpat.',
        'Praesent laoreet porttitor consequat. Nullam vel nunc vel orci dignissim tincidunt. Nulla egestas mauris quis est tempus, accumsan feugiat ex interdum. Duis eu purus nec magna eleifend malesuada. Nulla mollis lorem id imperdiet sagittis. Fusce venenatis cursus magna, vel consequat nisi blandit sit amet. In suscipit placerat quam id consequat. Mauris lacinia metus fermentum risus blandit, at pharetra quam tempus. Nulla sit amet ex malesuada, mattis mauris ut, pharetra massa. In congue nibh accumsan, hendrerit sem ac, convallis erat. Ut vulputate rutrum tempor.',
    ],
    [
        '... and then, Hardy Baker lifted up his cinnamon stick, crying "Avast ye the bad boy!" and spurted a scientifically propelled bolt of plasma-phase apple juice at his arch enemy, Wall-Wart.',
        '"(Oof!)"',
        "Thankfully, scientific propulsion is nonfatal. Wall-Wart fell back with a thuddish bellow and knocked over several boxes of cereal... including Hardy's platonic friend Flying Bee's favorite, Colonel Mustard. (It's mustard-colored.) She let out a terrific cry of grief and lunged toward the still-perfectly-fine box of cereal to coddle it.",
        '"Hardy, no!"',
        '"Hardy yes," Hardy uttered triumphantly. He strode toward Warty-boi. Drywall-Toad shrunk back and started quivering. Hardy pulled an arrow from his own quiver and loaded it into his sextuple-action compound bow.',
        '"Hardy, no." Weaker punctuation, but a stronger presence. Hardy spun around to see his estranged mentor Fumblyfoot striding toward him even more confidently than Hardy could himself manage. The teacher had once again become the teacher.',
        "Good ol' Fumfum started speaking in several tongues at once (you should have seen it, it was, like, so creepy). Three seconds later, poof! no more Wall-Wart.",
        '"He\'s in a better place now," Fumbly said with a grim on his face.',
        '"Ohohoho! What\'d I miss?"',
        'More spinning. Behold the wondrous Donald Bee. Unlike his sister Flying Bee, he has yet to master the art of flying. Hence the name.',
        '...',
        "It's a different universe, OK?! Their names aren't fixed at birth and such. All that jazz. It's very exciting!?",
        "Anywho, everyone was very annoyed at Don's late appearance to the party, so they proceeded to ...",
    ],
    [
        "\"Be careful what you wish for, you may receive it.\" --Anonymous",
        "Part I",
        "Without, the night was cold and wet, but in the small parlour of Laburnum villa the blinds were drawn and the fire burned brightly. Father and son were at chess; the former, who possessed ideas about the game involving radical chances, putting his king into such sharp and unnecessary perils that it even provoked comment from the white-haired old lady knitting placidly by the fire.",
        "\"Hark at the wind,\" said Mr. White, who, having seen a fatal mistake after it was too late, was amiably desirous of preventing his son from seeing it.",
        "\"I'm listening,\" said the latter grimly surveying the board as he stretched out his hand. \"Check.\"",
        "\"I should hardly think that he's come tonight, \" said his father, with his hand poised over the board.",
        "\"Mate,\" replied the son.",
        "\"That's the worst of living so far out,\" balled Mr. White with sudden and unlooked-for violence; \"Of all the beastly, slushy, out of the way places to live in, this is the worst. Path's a bog, and the road's a torrent. I don't know what people are thinking about. I suppose because only two houses in the road are let, they think it doesn't matter.\"",
        "\"Never mind, dear,\" said his wife soothingly; \"perhaps you'll win the next one.\"",
        "Mr. White looked up sharply, just in time to intercept a knowing glance between mother and son. the words died away on his lips, and he hid a guilty grin in his thin grey beard.",
        "\"There he is,\" said Herbert White as the gate banged to loudly and heavy footsteps came toward the door.",
        "The old man rose with hospitable haste and opening the door, was heard condoling with the new arrival. The new arrival also condoled with himself, so that Mrs. White said, \"Tut, tut!\" and coughed gently as her husband entered the room followed by a tall, burly man, beady of eye and rubicund of visage.",
        "\"Sergeant-Major Morris, \" he said, introducing him.",
        "The Sergeant-Major took hands and taking the proffered seat by the fire, watched contentedly as his host got out whiskey and tumblers and stood a small copper kettle on the fire.",
        "At the third glass his eyes got brighter, and he began to talk, the little family circle regarding with eager interest this visitor from distant parts, as he squared his broad shoulders in the chair and spoke of wild scenes and doughty deeds; of wars and plagues and strange peoples.",
        "\"Twenty-one years of it,\" said Mr. White, nodding at his wife and son. \"When he went away he was a slip of a youth in the warehouse. Now look at him.\"",
        "\"He don't look to have taken much harm.\" said Mrs. White politely.",
        "\"I'd like to go to India myself,\" said the old man, just to look around a bit, you know.\"",
        "\"Better where you are,\" said the Sergeant-Major, shaking his head. He put down the empty glass and sighning softly, shook it again.",
        "\"I should like to see those old temples and fakirs and jugglers,\" said the old man. \"what was that that you started telling me the other day about a monkey's paw or something, Morris?\"",
        "\"Nothing.\" said the soldier hastily. \"Leastways, nothing worth hearing.\"",
        "\"Monkey's paw?\" said Mrs. White curiously.",
        "\"Well, it's just a bit of what you might call magic, perhaps.\" said the Sergeant-Major off-handedly.",
        "His three listeners leaned forward eagerly. The visitor absent-mindedly put his empty glass to his lips and then set it down again. His host filled it for him again.",
        "\"To look at,\" said the Sergeant-Major, fumbling in his pocket, \"it's just an ordinary little paw, dried to a mummy.\"",
        "He took something out of his pocket and proffered it. Mrs. White drew back with a grimace, but her son, taking it, examined it curiously.",
        "\"And what is there special about it?\" inquired Mr. White as he took it from his son, and having examined it, placed it upon the table.",
        "\"It had a spell put on it by an old Fakir,\" said the Sergeant-Major, \"a very holy man. He wanted to show that fate ruled people's lives, and that those who interfered with it did so to their sorrow. He put a spell on it so that three separate men could each have three wishes from it.\"",
        "His manners were so impressive that his hearers were conscious that their light laughter had jarred somewhat.",
        "\"Well, why don't you have three, sir?\" said Herbert White cleverly.",
        "The soldier regarded him the way that middle age is wont to regard presumptuous youth.\"I have,\" he said quietly, and his blotchy face whitened.",
        "\"And did you really have the three wishes granted?\" asked Mrs. White.",
        "\"I did,\" said the sergeant-major, and his glass tapped against his strong teeth.",
        "\"And has anybody else wished?\" persisted the old lady.",
        "\"The first man had his three wishes. Yes,\" was the reply, \"I don't know what the first two were, but the third was for death. That's how I got the paw.\"",
        "His tones were so grave that a hush fell upon the group.",
        "\"If you've had your three wishes it's no good to you now then Morris,\" said the old man at last. \"What do you keep it for?\"",
        "The soldier shook his head. \"Fancy I suppose,\" he said slowly.\" I did have some idea of selling it, but I don't think I will. It has caused me enough mischief already. Besides, people won't buy. They think it's a fairy tale, some of them; and those who do think anything of it want to try it first and pay me afterward.\"",
        "\"If you could have another three wishes,\" said the old man, eyeing him keenly,\" would you have them?\"",
        "\"I don't know,\" said the other. \"I don't know.\"",
        "He took the paw, and dangling it between his forefinger and thumb, suddenly threw it upon the fire. White, with a slight cry, stooped down and snatched it off.",
        "\"Better let it burn,\" said the soldier solemnly.",
        "\"If you don't want it Morris,\" said the other, \"give it to me.\"",
        "\"I won't.\" said his friend doggedly. \"I threw it on the fire. If you keep it, don't blame me for what happens. Pitch it on the fire like a sensible man.\"",
        "The other shook his head and examined his possession closely. \"How do you do it?\" he inquired.",
        "\"Hold it up in your right hand, and wish aloud,\" said the Sergeant-Major, \"But I warn you of the consequences.\"",
        "\"Sounds like the 'Arabian Nights'\", said Mrs. White, as she rose and began to set the supper. \"Don't you think you might wish for four pairs of hands for me.\"",
        "Her husband drew the talisman from his pocket, and all three burst into laughter as the Seargent-Major, with a look of alarm on his face, caught him by the arm.",
        "\"If you must wish,\" he said gruffly, \"Wish for something sensible.\"",
        "Mr. White dropped it back in his pocket, and placing chairs, motioned his friend to the table. In the business of supper the talisman was partly forgotten, and afterward the three sat listening in an enthralled fashion to a second installment of the soldier's adventures in India.",
        "\"If the tale about the monkey's paw is not more truthful than those he has been telling us,\" said Herbert, as the door closed behind their guest, just in time to catch the last train, \"we shan't make much out of it.\"",
        "\"Did you give anything for it, father?\" inquired Mrs. White, regarding her husband closely.",
        "\"A trifle,\" said he, colouring slightly, \"He didn't want it, but I made him take it. And he pressed me again to throw it away.\"",
        "\"Likely,\" said Herbert, with pretended horror. \"Why, we're going to be rich, and famous, and happy. Wish to be an emperor, father, to begin with; then you can't be henpecked.\"",
        "He darted around the table, pursued by the maligned Mrs White armed with an antimacassar.",
        "Mr. White took the paw from his pocket and eyed it dubiously. \"I don't know what to wish for, and that's a fact,\" he said slowly. It seems to me I've got all I want.\"",
        "\"If you only cleared the house, you'd be quite happy, wouldn't you!\" said Herbert, with his hand on his shoulder. \"Well, wish for two hundred pounds, then; that'll just do it.\"",
        "His father, smiling shamefacedly at his own credulity, held up the talisman, as his son, with a solemn face, somewhat marred by a wink at his mother, sat down and struck a few impressive chords.",
        "\"I wish for two hundred pounds,\" said the old man distinctly.",
        "A fine crash from the piano greeted his words, interrupted by a shuddering cry from the old man. His wife and son ran toward him.",
        "\"It moved,\" he cried, with a glance of disgust at the object as it lay on the floor. \"As I wished, it twisted in my hand like a snake.\"",
        "\"Well, I don't see the money,\" said his son, as he picked it up and placed it on the table, \"and I bet I never shall.\"",
        "\"It must have been your fancy, father,\" said his wife, regarding him anxiously.",
        "He shook his head. \"Never mind, though; there's no harm done, but it gave me a shock all the same.\"",
        "They sat down by the fire again while the two men finished their pipes. Outside, the wind was higher than ever, an the old man started nervously at the sound of a door banging upstairs. A silence unusual and depressing settled on all three, which lasted until the old couple rose to retire for the rest of the night.",
        "\"I expect you'll find the cash tied up in a big bag in the middle of your bed,\" said Herbert, as he bade them good night, \" and something horrible squatting on top of your wardrobe watching you as you pocket your ill-gotten gains.\"",
        "He sat alone in the darkness, gazing at the dying fire, and seeing faces in it. The last was so horrible and so simian that he gazed at it in amazement. It got so vivid that, with a little uneasy laugh, he felt on the table for a glass containing a little water to throw over it. His hand grasped the monkey's paw, and with a little shiver he wiped his hand on his coat and went up to bed.",
        "Part II",
        "In the brightness of the wintry sun next morning as it streamed over the breakfast table he laughed at his fears. There was an air of prosaic wholesomeness about the room which it had lacked on the previous night, and the dirty, shriveled little paw was pitched on the side-board with a carelessness which betokened no great belief in its virtues.",
        "\"I suppose all old soldiers are the same,\" said Mrs White. \"The idea of our listening to such nonsense! How could wishes be granted in these days? And if they could, how could two hundred pounds hurt you, father?\"",
        "\"Might drop on his head from the sky,\" said the frivolous Herbert.",
        "\"Morris said the things happened so naturally,\" said his father, \"that you might if you so wished attribute it to coincidence.\"",
        "\"Well don't break into the money before I come back,\" said Herbert as he rose from the table. \"I'm afraid it'll turn you into a mean, avaricious man, and we shall have to disown you.\"",
        "His mother laughed, and following him to the door, watched him down the road; and returning to the breakfast table, was very happy at the expense of her husband's credulity. All of which did not prevent her from scurrying to the door at the postman's knock, nor prevent her from referring somewhat shortly to retired Sergeant-Majors of bibulous habits when she found that the post brought a tailor's bill.",
        "\"Herbert will have some more of his funny remarks, I expect, when he comes home,\" she said as they sat at dinner.",
        "\"I dare say,\" said Mr. White, pouring himself out some beer; \"but for all that, the thing moved in my hand; that I'll swear to.\"",
        "\"You thought it did,\" said the old lady soothingly.",
        "\"I say it did,\" replied the other. \"There was no thought about it; I had just - What's the matter?\"",
        "His wife made no reply. She was watching the mysterious movements of a man outside, who, peering in an undecided fashion at the house, appeared to be trying to make up his mind to enter. In mental connexion with the two hundred pounds, she noticed that the stranger was well dressed, and wore a silk hat of glossy newness. Three times he paused at the gate, and then walked on again. The fourth time he stood with his hand upon it, and then with sudden resolution flung it open and walked up the path. Mrs White at the same moment placed her hands behind her, and hurriedly unfastening the strings of her apron, put that useful article of apparel beneath the cushion of her chair.",
        "She brought the stranger, who seemed ill at ease, into the room. He gazed at her furtively, and listened in a preoccupied fashion as the old lady apologized for the appearance of the room, and her husband's coat, a garment which he usually reserved for the garden. She then waited as patiently as her sex would permit for him to broach his business, but he was at first strangely silent.",
        "\"I - was asked to call,\" he said at last, and stooped and picked a piece of cotton from his trousers. \"I come from 'Maw and Meggins.' \"",
        "The old lady started. \"Is anything the matter?\" she asked breathlessly. \"Has anything happened to Herbert? What is it? What is it?",
        "Her husband interposed. \"There there mother,\" he said hastily. \"Sit down, and don't jump to conclusions. You've not brought bad news, I'm sure sir,\" and eyed the other wistfully.",
        "\"I'm sorry - \" began the visitor.",
        "\"Is he hurt?\" demanded the mother wildly.",
        "The visitor bowed in assent.\"Badly hurt,\" he said quietly, \"but he is not in any pain.\"",
        "\"Oh thank God!\" said the old woman, clasping her hands. \"Thank God for that! Thank - \"",
        "She broke off as the sinister meaning of the assurance dawned on her and she saw the awful confirmation of her fears in the others averted face. She caught her breath, and turning to her slower-witted husband, laid her trembling hand on his. There was a long silence.",
        "\"He was caught in the machinery,\" said the visitor at length in a low voice.",
        "\"Caught in the machinery,\" repeated Mr. White, in a dazed fashion,\"yes.\"",
        "He sat staring out the window, and taking his wife's hand between his own, pressed it as he had been wont to do in their old courting days nearly forty years before.",
        "\"He was the only one left to us,\" he said, turning gently to the visitor. \"It is hard.\"",
        "The other coughed, and rising, walked slowly to the window. \" The firm wishes me to convey their sincere sympathy with you in your great loss,\" he said, without looking round. \"I beg that you will understand I am only their servant and merely obeying orders.\"",
        "There was no reply; the old woman’s face was white, her eyes staring, and her breath inaudible; on the husband's face was a look such as his friend the sergeant might have carried into his first action.",
        "\"I was to say that Maw and Meggins disclaim all responsibility,\" continued the other. \"They admit no liability at all, but in consideration of your son's services, they wish to present you with a certain sum as compensation.\"",
        "Mr. White dropped his wife's hand, and rising to his feet, gazed with a look of horror at his visitor. His dry lips shaped the words, \"How much?\"",
        "\"Two hundred pounds,\" was the answer.",
        "Unconscious of his wife's shriek, the old man smiled faintly, put out his hands like a sightless man, and dropped, a senseless heap, to the floor.",
        "Part III",
        "In the huge new cemetery, some two miles distant, the old people buried their dead, and came back to the house steeped in shadows and silence. It was all over so quickly that at first they could hardly realize it, and remained in a state of expectation as though of something else to happen - something else which was to lighten this load, too heavy for old hearts to bear.",
        "But the days passed, and expectations gave way to resignation - the hopeless resignation of the old, sometimes mis-called apathy. Sometimes they hardly exchanged a word, for now they had nothing to talk about, and their days were long to weariness.",
        "It was about a week after that the old man, waking suddenly in the night, stretched out his hand and found himself alone. The room was in darkness, and the sound of subdued weeping came from the window. He raised himself in bed and listened.",
        "\"Come back,\" he said tenderly. \"You will be cold.\"",
        "\"It is colder for my son,\" said the old woman, and wept afresh.",
        "The sounds of her sobs died away on his ears. The bed was warm, and his eyes heavy with sleep. He dozed fitfully, and then slept until a sudden wild cry from his wife awoke him with a start.",
        "\"THE PAW!\" she cried wildly. \"THE MONKEY'S PAW!\"",
        "He started up in alarm. \"Where? Where is it? What’s the matter?\"",
        "She came stumbling across the room toward him. \"I want it,\" she said quietly. \"You've not destroyed it?\"",
        "\"It's in the parlour, on the bracket,\" he replied, marveling. \"Why?\"",
        "She cried and laughed together, and bending over, kissed his cheek.",
        "\"I only just thought of it,\" she said hysterically. \"Why didn't I think of it before? Why didn't you think of it?\"",
        "\"Think of what?\" he questioned.",
        "\"The other two wishes,\" she replied rapidly. \"We've only had one.\"",
        "\"Was not that enough?\" he demanded fiercely.",
        "\"No,\" she cried triumphantly; \"We'll have one more. Go down and get it quickly, and wish our boy alive again.\"",
        "The man sat in bed and flung the bedclothes from his quaking limbs.\"Good God, you are mad!\" he cried aghast. \"Get it,\" she panted; \"get it quickly, and wish - Oh my boy, my boy!\"",
        "Her husband struck a match and lit the candle. \"Get back to bed he said unsteadily. \"You don't know what you are saying.\"",
        "\"We had the first wish granted,\" said the old woman, feverishly; \"why not the second?\"",
        "\"A coincidence,\" stammered the old man.",
        "\"Go get it and wish,\" cried his wife, quivering with excitement.",
        "The old man turned and regarded her, and his voice shook. \"He has been dead ten days, and besides he - I would not tell you else, but - I could only recognize him by his clothing. If he was too terrible for you to see then, how now?\"",
        "\"Bring him back,\" cried the old woman, and dragged him towards the door. \"Do you think I fear the child I have nursed?\"",
        "He went down in the darkness, and felt his way to the parlour, and then to the mantlepiece. The talisman was in its place, and a horrible fear that the unspoken wish might bring his mutilated son before him ere he could escape from the room seized up on him, and he caught his breath as he found that he had lost the direction of the door. His brow cold with sweat, he felt his way round the table, and groped along the wall until he found himself in the small passage with the unwholesome thing in his hand.",
        "Even his wife's face seemed changed as he entered the room. It was white and expectant, and to his fears seemed to have an unnatural look upon it. He was afraid of her.",
        "\"WISH!\" she cried in a strong voice.",
        "\"It is foolish and wicked,\" he faltered.",
        "\"WISH!\" repeated his wife.",
        "He raised his hand. \"I wish my son alive again.\"",
        "The talisman fell to the floor, and he regarded it fearfully. Then he sank trembling into a chair as the old woman, with burning eyes, walked to the window and raised the blind.",
        "He sat until he was chilled with the cold, glancing occasionally at the figure of the old woman peering through the window. The candle-end, which had burned below the rim of the china candlestick, was throwing pulsating shadows on the ceiling and walls, until with a flicker larger than the rest, it expired. The old man, with an unspeakable sense of relief at the failure of the talisman, crept back back to his bed, and a minute afterward the old woman came silently and apathetically beside him.",
        "Neither spoke, but sat silently listening to the ticking of the clock. A stair creaked, and a squeaky mouse scurried noisily through the wall. The darkness was oppressive, and after lying for some time screwing up his courage, he took the box of matches, and striking one, went downstairs for a candle.",
        "At the foot of the stairs the match went out, and he paused to strike another; and at the same moment a knock came so quiet and stealthy as to be scarcely audible, sounded on the front door.",
        "The matches fell from his hand and spilled in the passage. He stood motionless, his breath suspended until the knock was repeated. Then he turned and fled swiftly back to his room, and closed the door behind him. A third knock sounded through the house.",
        "\"WHAT’S THAT?\" cried the old woman, starting up.",
        "\"A rat,\" said the old man in shaking tones - \"a rat. It passed me on the stairs.\"",
        "His wife sat up in bed listening. A loud knock resounded through the house.",
        "\"It's Herbert!\"",
        "She ran to the door, but her husband was before her, and catching her by the arm, held her tightly.",
        "\"What are you going to do?\" he whispered hoarsely.",
        "\"It's my boy; it's Herbert!\" she cried, struggling mechanically. \"I forgot it was two miles away. What are you holding me for? Let go. I must open the door.\"",
        "\"For God's sake don't let it in,\" cried the old man, trembling.",
        "\"You're afraid of your own son,\" she cried struggling. \"Let me go. I'm coming, Herbert; I'm coming.\"",
        "There was another knock, and another. The old woman with a sudden wrench broke free and ran from the room. Her husband followed to the landing, and called after her appealingly as she hurried downstairs. He heard the chain rattle back and the bolt drawn slowly and stiffly from the socket. Then the old woman’s voice, strained and panting.",
        "\"The bolt,\" she cried loudly. \"Come down. I can't reach it.\"",
        "But her husband was on his hands and knees groping wildly on the floor in search of the paw. If only he could find it before the thing outside got in. A perfect fusillade of knocks reverberated through the house, and he heard the scraping of a chair as his wife put it down in the passage against the door. He heard the creaking of the bolt as it came slowly back, and at the same moment he found the monkey's paw, and frantically breathed his third and last wish.",
        "The knocking ceased suddenly, although the echoes of it were still in the house. He heard the chair drawn back, and the door opened. A cold wind rushed up the staircase, and a long loud wail of disappointment and misery from his wife gave him the courage to run down to her side, and then to the gate beyond. The street lamp flickering opposite shone on a quiet and deserted road.\n"
    ],
];
exports.credits = [
    'Thanks for playing!',
    '',
    'books 2 and 4:',
    'Lorem Ipsum - Cicero',
    "The Monkey's Paw - W. W. Jacobs",
    '',
    'this game:',
    'design - Sam Estep',
    'code - Sam Estep',
    'art - Sam Estep',
    'story - Sam Estep',
    'music - Sam Estep',
    '',
    'special thanks:',
    'ESLint, GitHub, Phaser,',
    'Travis CI, TypeScript, Yarn',
];


});

require.register("text.ts", function(exports, require, module) {
/// <reference path="../node_modules/phaser/types/phaser.d.ts" />
"use strict";
var Text = (function () {
    function Text(pText) {
        this.inner = pText;
        this.line = '';
        this.progCounter = 0;
    }
    Text.prototype.reveal = function (delay, color, line, onComplete) {
        this.inner.setColor(color);
        this.line = line;
        this.progress = 0;
        return {
            targets: this,
            progress: line.length,
            duration: delay * line.length,
            onComplete: onComplete,
        };
    };
    Object.defineProperty(Text.prototype, "progress", {
        get: function () {
            return this.progCounter;
        },
        set: function (value) {
            this.progCounter = value;
            this.inner.setText(this.line.substring(0, Math.round(value)));
        },
        enumerable: true,
        configurable: true
    });
    Text.prototype.update = function (worldView) {
        this.inner.setWordWrapWidth(worldView.width);
    };
    return Text;
}());
exports.Text = Text;


});

require.register("world.ts", function(exports, require, module) {
/// <reference path="../node_modules/phaser/types/phaser.d.ts" />
"use strict";
// @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
var Matter = Phaser.Physics.Matter.Matter;
var seedrandom = require("seedrandom");
var book_1 = require("./book");
var graph_1 = require("./graph");
var map_1 = require("./map");
var random = require("./random");
function worldHeight(config) {
    return config.height * (config.book + config.shelf) - config.shelf;
}
function innerCorner(config) {
    return [-config.width / 2, -worldHeight(config) / 2];
}
function outerCorner(config) {
    var _a = innerCorner(config), x = _a[0], y = _a[1];
    return [x - config.wall, y - config.wall];
}
function fullSize(config) {
    return [config.wall + config.width, config.wall + worldHeight(config)];
}
function shelfWidth(config) {
    return (config.width - config.trap) / 2;
}
function ceilPartWidth(config) {
    return shelfWidth(config) + config.wall;
}
function worldDoor(config) {
    return config.door * (config.book + config.shelf) - config.shelf;
}
function wallPartHeight(config) {
    return config.wall + worldHeight(config) - worldDoor(config);
}
var wallColor = 0x5c4019;
var ladderColor = 0xa88a62;
var shelfColor = 0xa87632;
var World = (function () {
    function World(config) {
        this.config = config;
        this.comp = Matter.Composite.create();
        this.rooms = new map_1.JSONMap();
        this.darkness = 1;
    }
    World.prototype.query = function (col, row) {
        var rng = seedrandom(JSON.stringify([this.config.seed, col, row]));
        var n = rng.int32();
        var trap = (n & 1) > 0;
        n = n >> 1;
        var door = (n & 1) > 0;
        if (row === 1) {
            return { trap: true, door: door };
        }
        else if (row === 0) {
            return { trap: trap, door: false };
        }
        else {
            return { trap: trap, door: door };
        }
    };
    World.prototype.closestRoom = function (v) {
        var _a = fullSize(this.config), w = _a[0], h = _a[1];
        return [Math.round(v.x / w), Math.round(v.y / h)];
    };
    World.prototype.roomCenter = function (col, row) {
        var _a = fullSize(this.config), w = _a[0], h = _a[1];
        return { x: col * w, y: row * h };
    };
    World.prototype.rects = function (col, row) {
        var _a = this.query(col, row), trap = _a.trap, door = _a.door;
        var _b = this.roomCenter(col, row), x = _b.x, y = _b.y;
        var _c = outerCorner(this.config), outerX = _c[0], outerY = _c[1];
        if (row > 0) {
            var _d = fullSize(this.config), width = _d[0], height = _d[1];
            return [new Phaser.Geom.Rectangle(x + outerX, y + outerY, width, height)];
        }
        var rects = [
            // left ceiling
            new Phaser.Geom.Rectangle(x + outerX, y + outerY, ceilPartWidth(this.config), this.config.wall),
            // right ceiling
            new Phaser.Geom.Rectangle(x + this.config.trap / 2, y + outerY, ceilPartWidth(this.config), this.config.wall),
            // left wall part
            new Phaser.Geom.Rectangle(x + outerX, y + outerY, this.config.wall, wallPartHeight(this.config)),
        ];
        if (trap) {
            rects.push(new Phaser.Geom.Rectangle(x - this.config.trap / 2, y + outerY, this.config.trap, this.config.wall));
        }
        if (door) {
            rects.push(new Phaser.Geom.Rectangle(x + outerX, y + worldHeight(this.config) / 2 - worldDoor(this.config), this.config.wall, worldDoor(this.config)));
        }
        return rects;
    };
    World.prototype.roomShelves = function (col, row) {
        var trap = this.query(col, row).trap;
        var trapBelow = this.query(col, row + 1).trap;
        var shelves = [];
        for (var i = 1; i < this.config.height; i++) {
            var y = this.config.wall + i * (this.config.book + this.config.shelf) - this.config.shelf;
            if (!trap || (!trapBelow && i >= this.config.height - 1)) {
                shelves.push([
                    new Phaser.Geom.Rectangle(this.config.wall, y - this.config.book, shelfWidth(this.config), this.config.book),
                    JSON.stringify([this.config.seed, col, row, i, 'left']),
                ]);
                shelves.push([
                    new Phaser.Geom.Rectangle(this.config.wall + this.config.width - shelfWidth(this.config), y - this.config.book, shelfWidth(this.config), this.config.book),
                    JSON.stringify([this.config.seed, col, row, i, 'right']),
                ]);
            }
            else {
                shelves.push([
                    new Phaser.Geom.Rectangle(this.config.wall, y - this.config.book, this.config.width, this.config.book),
                    JSON.stringify([this.config.seed, col, row, i]),
                ]);
            }
        }
        return shelves;
    };
    World.prototype.drawRoom = function (col, row, graphics) {
        var _a = this.query(col, row), trap = _a.trap, door = _a.door;
        graphics.fillStyle(wallColor);
        if (!trap) {
            graphics.fillRect(ceilPartWidth(this.config), 0, this.config.trap, this.config.wall);
        }
        if (!door) {
            graphics.fillRect(0, wallPartHeight(this.config), this.config.wall, worldDoor(this.config));
        }
        graphics.fillRect(this.config.wall, this.config.wall, this.config.width, worldHeight(this.config));
        var trapBelow = this.query(col, row + 1).trap;
        for (var i = 1; i < this.config.height; i++) {
            var y = this.config.wall + i * (this.config.book + this.config.shelf) - this.config.shelf;
            graphics.fillStyle(shelfColor);
            graphics.fillRect(this.config.wall, y, shelfWidth(this.config), this.config.shelf);
            graphics.fillRect(this.config.wall + this.config.width - shelfWidth(this.config), y, shelfWidth(this.config), this.config.shelf);
            if (!trap || (!trapBelow && i >= this.config.height - 1)) {
                graphics.fillStyle(ladderColor);
            }
            else {
                graphics.fillStyle(shelfColor);
            }
            graphics.fillRect(ceilPartWidth(this.config), y, this.config.trap, this.config.shelf);
        }
        this.roomShelves(col, row).forEach(function (_a) {
            var rect = _a[0], seed = _a[1];
            book_1.drawBooks(rect, graphics, seedrandom(seed));
        });
        graphics.fillStyle(ladderColor);
        if (!trap) {
            graphics.fillRect(this.config.wall + this.config.width / 2 - this.config.trap / 2, this.config.wall / 2 - this.config.shelf / 2, this.config.trap, this.config.shelf);
        }
        if (!(trap && trapBelow)) {
            var fullHeight = void 0;
            if (!trap) {
                fullHeight = fullSize(this.config)[1];
            }
            else {
                fullHeight = 1.5 * this.config.book + this.config.shelf;
            }
            graphics.fillRect(this.config.wall + this.config.width / 2 - this.config.gap / 2, this.config.wall + worldHeight(this.config) - fullHeight, this.config.shelf, fullHeight);
            graphics.fillRect(this.config.wall + this.config.width / 2 + this.config.gap / 2 - this.config.shelf, this.config.wall + worldHeight(this.config) - fullHeight, this.config.shelf, fullHeight);
        }
    };
    World.prototype.roomBooks = function (col, row) {
        return [].concat.apply([], (this.roomShelves(col, row).map(function (_a) {
            var rect = _a[0], seed = _a[1];
            return book_1.generateBooks(rect, seedrandom(seed)).map(function (book) { return book.rect; });
        })));
    };
    World.prototype.chooseBookFromRoom = function (col, row) {
        var rect = random.choose(this.roomBooks(col, row));
        var _a = this.roomCenter(col, row), centerX = _a.x, centerY = _a.y;
        var _b = outerCorner(this.config), cornerX = _b[0], cornerY = _b[1];
        rect.x += centerX + cornerX;
        rect.y += centerY + cornerY;
        return rect;
    };
    World.prototype.graph = function () {
        var self = this;
        return {
            neighbors: function (_a) {
                var col = _a[0], row = _a[1];
                var arr = [];
                var _b = self.query(col, row), up = _b.trap, left = _b.door;
                var right = self.query(col + 1, row).door;
                var down = self.query(col, row + 1).trap;
                if (!up) {
                    arr.push([col, row - 1]);
                }
                if (!left) {
                    arr.push([col - 1, row]);
                }
                if (!right) {
                    arr.push([col + 1, row]);
                }
                if (!down) {
                    arr.push([col, row + 1]);
                }
                return arr;
            }
        };
    };
    World.prototype.chooseBook = function (pos, depth) {
        var start = this.closestRoom(pos);
        var graph = this.graph();
        var rooms = graph_1.bfs(graph, start, depth);
        var distTo = function (_a) {
            var col = _a[0], row = _a[1];
            var col0 = start[0], row0 = start[1];
            return Math.pow(col - col0, 2) + Math.pow(row - row0, 2);
        };
        var dist = Math.min.apply(Math, (rooms.map(distTo)));
        var close = rooms.filter(function (room) { return distTo(room) === dist; });
        var _a = random.choose(close), col = _a[0], row = _a[1];
        return this.chooseBookFromRoom(col, row);
    };
    World.prototype.update = function (worldView, makeGraphics, destroyTexture) {
        var _this = this;
        var corner1 = { x: worldView.left, y: worldView.top };
        var corner2 = { x: worldView.right, y: worldView.bottom };
        var _a = [corner1, corner2].map(function (corner) {
            return _this.closestRoom(corner);
        }), tileCorner1 = _a[0], tileCorner2 = _a[1];
        var colMin = tileCorner1[0] - 1;
        var colMax = tileCorner2[0] + 1;
        var rowMin = tileCorner1[1] - 1;
        var rowMax = tileCorner2[1] + 1;
        this.rooms.forEach(function (key, room) {
            var x = key[0], y = key[1];
            if (x < colMin || colMax < x || y < rowMin || rowMax < y) {
                room.forEach(function (body) { return Matter.Composite.remove(_this.comp, body); });
                _this.rooms.delete(key);
                destroyTexture(JSON.stringify(key));
            }
        });
        for (var col = colMin; col <= colMax; col++) {
            for (var row = rowMin; row <= rowMax; row++) {
                if (this.query(col, row) && !(this.rooms.has([col, row]))) {
                    var room = this.rects(col, row).map(function (rect) {
                        var body = Matter.Bodies.rectangle(rect.centerX, rect.centerY, rect.width, rect.height, { isStatic: true });
                        Matter.Composite.add(_this.comp, body);
                        return body;
                    });
                    this.rooms.set([col, row], room);
                    var _b = fullSize(this.config), w = _b[0], h = _b[1];
                    var g = makeGraphics();
                    this.drawRoom(col, row, g);
                    g.generateTexture(JSON.stringify([col, row]), w, h);
                    g.destroy();
                }
            }
        }
    };
    World.prototype.render = function (graphics) {
        var _this = this;
        this.rooms.keys().forEach(function (_a) {
            var col = _a[0], row = _a[1];
            if (row <= 0) {
                var _b = _this.roomCenter(col, row), x = _b.x, y = _b.y;
                var _c = outerCorner(_this.config), outerX = _c[0], outerY = _c[1];
                var _d = fullSize(_this.config), width = _d[0], height = _d[1];
                graphics.fillStyle(0xffffff);
                graphics.setTexture(JSON.stringify([col, row]));
                graphics.fillRect(x + outerX, y + outerY, width, height);
                graphics.setTexture();
            }
        });
    };
    return World;
}());
exports.World = World;


});

require.alias("process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

require('renderer');