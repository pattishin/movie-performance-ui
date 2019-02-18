/**
 * Modified debounce function from
 * https://davidwalsh.name/javascript-debounce-function
 * @helper debounce
 * @param func
 * @param wait
 */
function debounce(func, wait) {
  var timeout;

  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (!timeout) func.apply(context, args);
  };
}

module.exports = debounce;
