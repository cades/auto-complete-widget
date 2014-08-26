// YUI3 Sandbox pattern variant
// It's more like AngularJS' DI mechanism
var Sandbox = (function(){

  var modules = {};

  function reset() {
    modules = {};
  }

  function lookup(name) {
    if (typeof modules[name] === "undefined")
      throw 'module `' + name + '` is not defined';
    return modules[name];
  }

  function module(name, rest) {
    var callback;
    if (Array.isArray(rest)) {
      callback = rest.pop();
      modules[name] = callback.apply(callback, rest.map(lookup));
    } else {
      callback = rest;
      modules[name] = callback();
    }
  }

  function use() {
    var args = Array.prototype.slice.call(arguments),
        callback = args.pop(),
        askedForModules = args.map(lookup);
    callback.apply(callback, askedForModules);
  }

  return {
    reset: reset,
    module: module,
    use: use
  };

}());

// function utilities
function nodeList2array(list) {
  return Array.prototype.slice.call(list);
}

function insertAfter(newNode, refNode){
  refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
}

function html2elem(html) {
  var div = document.createElement('div');
  div.innerHTML = html;
  var elem = div.firstChild;
  return elem;
}

function createInputWidget() {
  var div = document.createElement('div'),
      widgetHTML =
'<div class="ac widget">' +
'  <span class="ac tags">' +
'  </span>' +
'  <div class="ac input">' +
'    <input class="ac text-field" type="text">' +
'    <div class="ac menu">' +
'    </div>' +
'  </div>' +
'</div>';

  return html2elem(widgetHTML);
}

function createTag(text) {
  var tagHTML =
'<span class="ac tag">' + text +
'<span class="ac close">&times</span>' +
'</span>';
  return html2elem(tagHTML);
}

function createMenuItem(text) {
  var itemHTML = '<div class="ac menu-item">' + text + '</div>';
  return html2elem(itemHTML);
}

function addClass(elem, className) {
  if (elem.className.indexOf(className) === -1) {
    elem.className += ' ' + className;
  }
}

function removeClass(elem, className) {
  if (elem.className.indexOf(className) !== -1) {
    elem.className = elem.className.replace(className, '').trim();
  }
}


// use Sandbox to tackle the problem
Sandbox.module('TextField', function(){
  return function(elem){
    function value(){
      if (arguments.length === 0) {
        return elem.value;
      }
      return elem.value = arguments[0];
    }
    return {
      value: value,
      clear: function(){ elem.value = ''; }
    };
  };
});

Sandbox.module('Tags', function(util){
  return function(container, closeClickHandler){
    var tags = [],
        inputDiv = container.querySelector('.ac.input');
    function contains(text) {
      return function(tag){
        return tag.text === text;
      };
    }
    function add(text) {
      if (tags.some(contains(text))) // Don't allow duplicate tag
        return;
      var tagElem = createTag(text);
      tagElem.querySelector('.ac.close').onclick = function(e){
        remove(text);
        closeClickHandler(e);
      };
      container.insertBefore(tagElem, inputDiv);
      tags.push({
        text: text,
        elem: tagElem
      });
    }
    function remove(text) {
      if (!tags.some(contains(text)))
        return;
      var tag = tags.filter(contains(text))[0];
      container.removeChild(tag.elem);
      tags.splice( tags.indexOf(tag), 1 );
    }
    function data() {
      return tags.map(function(tag){ return tag.text; });
    }
    return {
      add: add,
      remove: remove,
      data: data
    };
  };
});

Sandbox.module('Menu', function(){
  return function(container, items, itemClickHandler){
    function hideMenu() {
      addClass(container, 'hide');
    }
    function showMenu() {
      removeClass(container, 'hide');
    }
    function update(text) {
      removeMenuItems();
      items.filter(function(d){ return d.search(new RegExp(text, 'i')) !== -1; })
        .slice(0,6)
        .map(createMenuItem)
        .map(function(item){
          item.onclick = itemClickHandler;
          container.appendChild(item);
        });
    }
    function removeMenuItems() {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }
    function hasItems() {
      return container.hasChildNodes();
    }
    return {
      hide: hideMenu,
      show: showMenu,
      update: update,
      hasItems: hasItems
    };
  };
});

// Put modules together. Wire them up. Bind event handlers.
Sandbox.module('Widget', ['TextField', 'Tags', 'Menu', function(TextField, Tags, Menu) {
  return function(origInputElem, items){
    var widgetElem = createInputWidget(),
        menuElem = widgetElem.querySelector('.ac.menu'),
        textFieldElem = widgetElem.querySelector('.ac.text-field'),
        tagsElem = widgetElem.querySelector('.ac.tags'),

        origInput = TextField( origInputElem ),
        textField = TextField( textFieldElem ),
        tags = Tags( tagsElem, closeClicked ),
        menu = Menu( menuElem, items, menuItemClicked );

    function updateOriginalInputValue() {
      origInput.value( tags.data().join(',') );
    }

    function closeClicked(e) {
      updateOriginalInputValue();
    }

    function menuItemClicked(e) {
      tags.add(e.target.innerText);
      updateOriginalInputValue();
      menu.hide();
      textField.clear();
      textFieldElem.focus();
    }

    function keyup(e) {
      var input = e.target.value;
      if (input === '') {
        menu.hide();
      } else {
        menu.update(input);
        if (menu.hasItems()) {
          menu.show();
        } else {
          menu.hide();
        }
      }
    }

    // initialization
    var self = this;
    origInputElem.type = 'hidden';
    insertAfter(widgetElem, origInputElem);
    menu.hide();
    textFieldElem.onkeyup = keyup;

    return {};
  };
}]);


function bind(elem, data) {
  if (!data || !Array.isArray(data))
    throw 'Data should be an array of string';

  if (elem.tagName !== 'INPUT')
    throw 'AutoComplete can only bind to an input element';

  Sandbox.use('Widget', function(Widget){
    Widget(elem, data);
  });
}

// Programmatically create a style sheet in <head> on plugin load
(function() {
  var head = document.head,
      style = document.createElement('style'),
      css = ".ac.widget{border-radius:4px;border:1px solid #CCC;padding:3px 0 4px 5px}.ac.tag{background-color:#EEE;border-radius:3px;border:1px solid #CCC;padding:1px 0 1px 4px;margin-right:4px}.ac.tag.focus{background-color:#FEFBC6}.ac.close{font-size:20px;font-weight:700;line-height:18px;color:#000;text-shadow:0 1px 0 #fff;opacity:.2;filter:alpha(opacity=20);text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}.ac.close:hover{opacity:.4;filter:alpha(opacity=40);cursor:pointer}.ac.input{display:inline-block;position:relative}.ac.text-field{border:none;font-size:16px}.ac.text-field:focus{outline:0}.ac.menu{display:inline-block;border-radius:6px;border:1px solid #CCC;padding:4px 0;position:absolute;left:2px;top:22px;background-color:#fff}.ac.menu-item{padding:4px 8px;font-weight:700}.ac.menu-item:hover{Background-color:#DDD}.ac.hide{display:none}";
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);
}());

// public API
var AutoComplete = window.AutoComplete || (window.AutoComplete = {});
AutoComplete.bind = bind;
