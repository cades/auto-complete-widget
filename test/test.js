describe('TextField', function(){
  it('wraps a DOM element', function(){
    var input = document.createElement('input'),
        tf = makeTextField(input);
    tf.value('mozilla rocks');
    expect(input.value).to.equal('mozilla rocks');
    expect(tf.value()).to.equal(input.value);
    tf.clear();
    expect(input.value).to.be.empty;
  });
});

describe('Tags', function(){
  beforeEach(function(){
    var self = this;
    this.container = document.createElement('div');
    self.tags = makeTags(self.container);
  });

  it('can add tag element on container', function(){
    expect(this.container.querySelectorAll('.ac.tag').length).to.equal(0);
    this.tags.add('test');
    expect(this.container.querySelectorAll('.ac.tag').length).to.equal(1);
    expect(this.container.querySelector('.ac.tag').innerHTML.match(/(.*)<span.*<\/span>/)[1]).to.equal('test');
  });

  it('can remove tag element from container', function(){
    this.tags.add('a');
    this.tags.add('b');
    expect(this.container.querySelectorAll('.ac.tag').length).to.equal(2);
    this.tags.remove('a');
    expect(this.container.querySelectorAll('.ac.tag').length).to.equal(1);
  });

  it('can give you data as array of string', function(){
    this.tags.add('a');
    this.tags.add('b');
    expect(this.tags.data()).to.eql(["a", "b"]);
  });
});

describe('Menu', function(){
  beforeEach(function(){
    var self = this,
        items = ['a', 'b', 'tag1', 'tag2'],
        callback = function(e){
          self.called = true;
        };
    this.called = false;
    this.menuElem = document.createElement('div');
    self.menu = makeMenu(self.menuElem, items, callback);
  });

  describe('#hide', function(){
    it('should add `hide` class to DOM', function(){
      expect(this.menuElem.className).to.not.have.string('hide');
      this.menu.hide();
      expect(this.menuElem.className).to.have.string('hide');
    });
  });

  describe('#show', function(){
    it('should remove `hide` class from DOM', function(){
      this.menu.hide();
      this.menu.show();
      expect(this.menuElem.className).to.not.have.string('hide');
    });
  });

  describe('#update', function(){
    it('should update menu items with input', function(){
      this.menu.update('tag');
      expect(this.menuElem.childNodes.length).to.equal(2);
    });

    it('should call the callback when click item', function(){
      var evt = document.createEvent('MouseEvents');
      evt.initMouseEvent('click', true, true, document.defaultView, 0,0,0,0,0,false,false,false,0,null,null);
    
      this.menu.update('tag');
      expect(this.called).to.equal(false);
//      this.menuElem.firstChild.onclick();
      this.menuElem.dispatchEvent(evt);
      expect(this.called).to.equal(true);
    });
  });

  describe('#hasItems', function(){
    it('should tell us if menu has items', function() {
      expect(this.menu.hasItems()).to.equal(false);
      this.menu.update('tag');
      expect(this.menu.hasItems()).to.equal(true);
    });
  });
});
