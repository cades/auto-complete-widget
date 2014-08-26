Auto Complete Plugin
====================

This plugin is an answer to Mozilla's F2E Pre-test, written by Hong-Ken Kao (cades).

The plugin is under `dist/` folder.

Usage
=====

```js
AutoComplete.bind(elem, items);
```

- `elem` is an input DOM element.
	- This element's type will be changed to `hidden`.  
	- When a tag is added or removed, this element's value would be updated accordingly. 
- `items` is an array of string.

Open example.html to 

Build
=====

Make sure npm and gulp are globally available on your machine, then run the following command:

```
npm install
gulp
```

That generates 3 files:

- dist/auto-complete.js
- dist/auto-complete.min.js
- test/auto-complete.js

Test
====

Mocha and chai are used as unit testing framework. Simply run `npm install` to install them. Then open test.html to see the result.
