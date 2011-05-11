var Log;
Log = module.exports = function() {};
Log.colorize = function(text, color) {
  return text = color + text + Log.GRAY;
};
Log.GREEN = "\033[1;32m";
Log.GRAY = "\033[0;37m";
Log.RED = "\033[0;31m";
Log.info = function(title, text) {
  if (Log.enabled) {
    return console.log(Log.colorize(title, Log.GREEN) + ' ' + text);
  }
};
Log.error = function(title, text) {
  if (Log.enabled) {
    return console.log(Log.colorize(title, Log.RED) + ' ' + text);
  }
};
Log.enabled = false;