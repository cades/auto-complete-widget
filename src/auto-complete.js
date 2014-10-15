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
'<span class="ac rm">&times</span>' +
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


// modules
function makeTextField(elem){
  function value(){
    if (arguments.length === 0) {
      return elem.value;
    }
    return (elem.value = arguments[0]);
  }
  return {
    value: value,
    clear: function(){ elem.value = ''; }
  };
}

function makeTags(container, closeClickHandler){
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
    var tagElem = createTag(text),
        closeElem = tagElem.querySelector('.ac.rm');
    closeElem.addEventListener('click', function(e){
      remove(text);
      closeClickHandler(e);
    });
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
}

function makeMenu(container, items, itemClickHandler){
  var focusedItem;
  function hideMenu() {
    addClass(container, 'hide');
  }
  function showMenu() {
    removeClass(container, 'hide');
  }
  function update(text) {
    function containsText(s) {
      return s.search(new RegExp(text, 'i')) !== -1;
    }
    function mouseover(item) {
      return function() {
        if (focusedItem)
          defocus();
        focus(item);
      };
    }
    removeMenuItems();
    items.filter(containsText)
      .slice(0,6)
      .map(createMenuItem)
      .map(function(item){
        item.addEventListener('click', itemClickHandler);
        item.addEventListener('mouseover', mouseover(item));
        item.addEventListener('mouseout', defocus);
        container.appendChild(item);
      });
    focusedItem = null;
  }
  function removeMenuItems() {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }
  function hasItems() {
    return container.hasChildNodes();
  }

  function focus(elem) {
    addClass(elem, 'focus');
    focusedItem = elem;
  }
  function defocus() {
    if (focusedItem)
      removeClass(focusedItem, 'focus');
    focusedItem = null;
  }
  function focusDown() {
    if (!container.hasChildNodes()) return;
    if (!focusedItem) {
      focus(container.firstChild);
      return;
    }
    if (focusedItem.nextSibling) {
      var elem = focusedItem.nextSibling;
      defocus();
      focus(elem);
      return;
    }
  }
  function focusUp() {
    if (focusedItem && !focusedItem.previousSibling) {
      defocus();
      return;
    }
    if (focusedItem && focusedItem.previousSibling) {
      var elem = focusedItem.previousSibling;
      defocus();
      focus(elem);
      return;
    }
  }
  function hasFocusedItem() {
    return !!focusedItem;
  }
  function focusedItemText() {
    return focusedItem.innerText;
  }
  return {
    hide: hideMenu,
    show: showMenu,
    update: update,
    hasItems: hasItems,
    focusDown: focusDown,
    focusUp: focusUp,
    hasFocusedItem: hasFocusedItem,
    focusedItemText: focusedItemText
  };
}

// Put modules together. Wire them up. Bind event handlers.
function makeWidget(origInputElem, items){
  var widgetElem = createInputWidget(),
      menuElem = widgetElem.querySelector('.ac.menu'),
      textFieldElem = widgetElem.querySelector('.ac.text-field'),
      tagsElem = widgetElem.querySelector('.ac.tags'),

      origInput = makeTextField( origInputElem ),
      textField = makeTextField( textFieldElem ),
      tags = makeTags( tagsElem, closeClicked ),
      menu = makeMenu( menuElem, items, menuItemClicked ),

      CODE_DOWN = 40,
      CODE_UP = 38,
      CODE_RETURN = 13,
      special_keys = [CODE_DOWN, CODE_UP, CODE_RETURN];

  function updateOriginalInputValue() {
    origInput.value( tags.data().join(',') );
  }

  function closeClicked(e) {
    updateOriginalInputValue();
  }

  function addTagWorkflow(text) {
    tags.add(text);
    updateOriginalInputValue();
    menu.hide();
    textField.clear();
    textFieldElem.focus();
  }

  function menuItemClicked(e) {
    addTagWorkflow(e.target.innerText);
  }

  // initialization
  origInputElem.type = 'hidden';
  insertAfter(widgetElem, origInputElem);
  menu.hide();

  textFieldElem.addEventListener('keydown', function(e){
    if (e.keyCode === CODE_DOWN)
      menu.focusDown();
  });
  textFieldElem.addEventListener('keydown', function(e){
    if (e.keyCode === CODE_UP)
      menu.focusUp();
  });
  textFieldElem.addEventListener('keydown', function(e){
    if (e.keyCode === CODE_RETURN && menu.hasFocusedItem())
      addTagWorkflow(menu.focusedItemText());
  });
  textFieldElem.addEventListener('keyup', function(e){
    var input = textField.value();
    if (input === '') {
      // if input is empty string, we do not update menu,
      // because this will generate alot of invisible DOM nodes
      // And they will be discard on next update.
      return;
    }
    if (special_keys.indexOf(e.keyCode) === -1)
      menu.update(input);
  });
  textFieldElem.addEventListener('keyup', function(){
    if (!menu.hasItems() || textField.value() === '')
      menu.hide();
    else
      menu.show();
  });
  return {};
}


function bind(elem, data) {
  if (!data || !Array.isArray(data))
    throw 'Data should be an array of string';

  if (elem.tagName !== 'INPUT')
    throw 'AutoComplete can only bind to an input element';

  makeWidget(elem, data);
}

// Programmatically create a style sheet in <head> on plugin load
(function() {
  var head = document.head,
      style = document.createElement('style'),
      css = "{inject css here}";
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);
}());

// public API
var AutoComplete = window.AutoComplete || (window.AutoComplete = {});
AutoComplete.bind = bind;
