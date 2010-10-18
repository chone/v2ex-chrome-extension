(function(){

/**
 * 滚动条组件
 * 
 * @class ScrollBar
 * @namespace mem.ui
 * @constructor
 * @param {object} options 滚动条设置参数
 */

/**
 * 竖直方向
 * 
 * @property VERTICAL
 * @type String
 * @static
 * @final
 */
var VERTICAL = 'vertical';

/**
 * 水平方向
 * 
 * @property HORIZONTAL
 * @type String
 * @static
 * @final
 */
var	HORIZONTAL = 'horizontal';

var ScrollBar = {
	
	Implements: Options,
	
	/**
	 * 配置参数
	 * 
	 * @property options
	 * @type object
	 * @private
	 */
	options: {
		/**
		 * 组件ID
		 * 
		 * @attribute id
		 * @type String
		 */
		id: null,
		
		/**
		 * 滚动条的容器，滚动条将被加入到其中，其第一个DIV子节点为滚动内容面板
		 * 
		 * @attribute container
		 * @type Element
		 */
		container: null,
		
		/**
		 * 滚动条宽度
		 * 
		 * @attribute width
		 * @type Number
		 * @default Theme.panel.scrollWidth
		 */
		width: 10,
		
		/**
		 * 滚动条高度
		 * 
		 * @attribute height
		 * @type Number
		 */
		height: null,
		
		/**
		 * 滚动条方向，默认为竖直方向
		 * 
		 * @attribute orientation
		 * @type String
		 * @default PLU.ui.ScrollBar.VERTICAL
		 */
		orientation: VERTICAL
		
		},

	/**
	 * 该组件的DOM元素是否已被创建
	 * 
	 * @property _created
	 * @type boolean
	 * @default false
	 * @private
	 */
	_created: false,
	
	/**
	 * 滚动条的滚动量
	 * 
	 * @property _offset
	 * @type Number
	 * @default 0
	 * @private
	 */
	_offset: 0,
	
	/**
	 * 鼠标在页面中位置的缓存(用于计算偏移量)
	 * 
	 * @property _pagePos
	 * @type Number
	 * @private
	 */
	_pagePos: null,

	initialize: function(options){
		this.setOptions(options);
		var op = this.options;

		this._width = op.width;
		this._height = op.height; 
		this._orientation = op.orientation;

	},

	/**
	 * 将滚动条加入到容器
	 * 
	 * @method render
	 * @param {String | Element} param 容器的ID或者DOM元素
	 */
	render: function(param){
		if (typeOf(param) === 'string') this._container = $(param);
		else if (typeOf(param)==='element') this._container = param;

		if (this._container) {
			var container = this._container;
			this._contentEl = container.getFirst('div');
			this.paint();
		}
	},

	/**
	 * 将滚动条移动到指定偏移量
	 * 
	 * @method moveTo
	 * @param {Number} offset 偏移量
	 */
	moveTo: function(offset){
		var max, pos, contentMax, contentPos;
		if (this._orientation == VERTICAL) {
			max = this._height - this._thumbHeight;
			contentMax = this._contentHeight - this._containerHeight;
			pos = 'top';
			contentPos = 'margin-top';
		} else {
			max = this._width - this._thumbWidth;
			contentMax = this._contentWidth - this._containerWidth;
			pos = 'left';
			contentPos = 'margin-left';
		}
		
		if (offset < 0) offset = 0;
		else if (offset > max) offset = max; 
		
		if (this._thumbEl) this._thumbEl.setStyle(pos, offset);
		this._offset = offset;
		var margin = offset / max * contentMax; 
		this._contentEl.setStyle(contentPos, -margin);
		
	},
	
	/**
	 * 创建该组件
	 * 
	 * @method _createElement
	 * @private
	 */
	_createElement: function(){
		var scrollStyle, thumbStyle;
		if (this._orientation == VERTICAL) {
			scrollStyle = {
				'position': 'absolute',
				'right': 0,
				'top': 0,
				'height': '100%'
			};
			thumbStyle = {
				'position': 'absolute',
				'right': 1,
				'top': 1,
			 	'z-index': 10
			};	
			
		} else {
			scrollStyle = {
				'position': 'absolute',
				'bottom': 0,
				'left': 0,
				'width': '100%'
			};
			thumbStyle = {
				'position': 'absolute',
				'bottom': 1,
				'left': 1,
			 	'z-index': 10
			};
		}
		
		var scrollEl = new Element('div', {'class': 'ui-scrollbar', 'styles': scrollStyle});
		var thumbEl = new Element('div', {'class': 'ui-scrollbar-thumb', 'styles': thumbStyle});
		
		scrollEl.grab(thumbEl);

		var container = this._container;
		container.grab(scrollEl);
		if (container.getStyle('position') != 'absolute') {
			container.setStyle('position', 'relative');
		}
		
		this._scrollEl = scrollEl;
		this._thumbEl = thumbEl;
		this._created = true;
		
		this._initHandler();

	},
	
	/**
	 * 设置监听器
	 * 
	 * @method _initHandler
	 * @private
	 */
	_initHandler: function(){
		var container = this._container,
			thumbEl = this._thumbEl;
		// mousedown event	
		var onMouseDown;
		if (this._orientation == VERTICAL) {
			onMouseDown = function(e){
				e.preventDefault();
				this._pagePos = e.page.y;
			}.bind(this);
		} else {
			onMouseDown = function(e){
				e.preventDefault();
				this._pagePos = e.page.x;
			}.bind(this);
		}
		thumbEl.addEvent('mousedown', onMouseDown);	
	
		// mousemove event
		var w = Browser.ie ? document : window;
		var onMouseMove;
		if (this._orientation == VERTICAL) {
			onMouseMove = function(e){
				e.preventDefault();
				if (this._pagePos) {
					this.moveTo(e.page.y - this._pagePos + this._offset);
					this._pagePos = e.page.y;
				}
			}.bind(this);
		} else {
			onMouseMove = function(e){
				e.preventDefault();
				if (this._pagePos) {
					this.moveTo(e.page.x - this._pagePos + this._offset);
					this._pagePos = e.page.x;
				}
			}.bind(this);
		}
		w.addEvent('mousemove', onMouseMove);

		// mouseup event
		w.addEvent('mouseup', function(){
			this._pagePos = null;
		}.bind(this));
	
		// mousewheel event
		var onMouseWheel;
		if (this._orientation == VERTICAL) {
			onMouseWheel = function(e){
				if (!this._enableWheel) return;
				var offset = 25 * (this._height-this._thumbHeight) / (this._contentHeight-this._containerHeight);
				this.moveTo(this._offset-e.wheel*offset);
			}.bind(this);
		} else {
			onMouseWheel = function(e){
				if (!this._enableWheel) return;
				var offset = 25 * (this._width-this._thumbWidth) / (this._contentWidth-this._containerWidth);
				this.moveTo(this._offset-e.wheel*offset);
			}.bind(this);
		}
		container.addEvent('mousewheel', onMouseWheel);
		
		// mouseenter event
		container.addEvent('mouseenter', function(e){
			this._enter = true;
		}.bind(this));
		// mouseleave event
		container.addEvent('mouseleave', function(e){
			this._enter = false;
		}.bind(this));
		
		// keydown event
		var onKeyDown;
		if (this._orientation == VERTICAL) {
			onKeyDown = function(e){
				if (!this._enter) return;
				if (e.key == 'up' || e.key == 'down') {
					var or = e.key == 'up' ? 1 : -1;
					var offset = 25 * (this._height - this._thumbHeight) / (this._contentHeight - this._containerHeight);
					this.moveTo(this._offset - or * offset);
				}
			}.bind(this);
		} else {
			onKeyDown = function(e){
				if (!this._enter) return;
				if (e.key == 'left' || e.key == 'right') {
					var or = e.key == 'left' ? 1 : -1;
					var offset = 25 * (this._width - this._thumbWidth) / (this._contentWidth - this._containerWidth);
					this.moveTo(this._offset - or * offset);
				}
			}.bind(this);
		}
		w.addEvent('keydown', onKeyDown);
	},

	/**
	 * 绘制滚动条(cavans)
	 * 
	 * @method paint
	 */
	paint: function(){
		var	contentEl = this._contentEl;
		if (!contentEl) return;	
		
		var size = this._container.getCoordinates();
		var	contentSize = contentEl.getCoordinates();
		var	marginPos;
		var	visible;
			
		if (this._orientation == VERTICAL) {
			this._containerHeight = this._height = size.height;
			this._contentHeight = contentSize.height;
			visible = this._contentHeight > this._containerHeight;
		} else {
			this._containerWidth = this._width = size.width;
			this._contentWidth = contentSize.width;
			visible = this._contentWidth > this._containerWidth;
		}
	
		var margin;
		if (visible) {
			if (!this._created) this._createElement();
			//console.log('method _createElement est function')
			if (this._orientation == VERTICAL) {
				contentEl.setStyle('margin-right', this._width+1);
				this._thumbHeight =  this._containerHeight/this._contentHeight * this._height - 2;
				this._thumbEl.setStyles({
					width: this._width - 2,
					height: this._thumbHeight, 
					display: 'block'
				});
				
				margin = -this._contentEl.getStyle('margin-top').toFloat();
				if (this._contentHeight-margin < this._containerHeight) {
					margin = this._contentHeight - this._containerHeight;
				}
				this._offset = margin / (this._contentHeight-this._containerHeight) * (this._height-this._thumbHeight);
				
			} else {
				contentEl.setStyle('margin-bottom', this._height + 3);
				this._thumbWidth =  this._containerWidth/this._contentWidth * this._width - 2;
				this._thumbEl.setStyles({
					width: this._thumbWidth,
					height: this._height - 2, 
					display: 'block'
				});
				
				margin = -this._contentEl.getStyle('margin-left').toFloat();
				if (this._contentWidth-margin < this._containerWidth) {
					margin = this._contentWidth - this._containerWidth;
				}
				this._offset = margin / (this._contentWidth-this._containerWidth) * (this._width-this._thumbWidth);
			}
			
			this._scrollEl.setStyles({
				width: this._width, 
				height: this._height,
				display: 'block',
				'z-index': 100
			});
			
			/*
			if (this._scroll) {
				this._scroll.repaint();
			
			} else {
				this._scroll = new RoundedRect({
					'container': this._scrollEl,
					'background-color': this._scrollBgColor,
					'border-color': this._scrollBorderColor,
					'opacity': this._scrollOpacity,
					'radius': this._radius,
					'border-width': 1
			
				});
			}
			
			if (this._thumb) {
				this._thumb.repaint();
			} else {
				this._thumb = new RoundedRect({
					'container': this._thumbEl,
					'background-color': this._thumbBgColor,
					'border-color': this._thumbBorderColor,
					'opacity': this._thumbOpacity,
					'radius': this._radius,
					'border-width': 1,
					'cursor': 'pointer'
				});
			}
			*/
			
			this.moveTo(this._offset);
			this._enableWheel = true;
		}
		else {
			var scrollEl = this._scrollEl;
			if (scrollEl) {
				scrollEl.setStyle('display', 'none');
			}
			if (contentEl) {
				contentEl.setStyle('margin', 0);
				
			}
			this._enableWheel = false;
		}
	},

	reset: function(){
		this.moveTo(0);
		this.paint();
	},

	/**
	 * 隐藏滚动条
	 * 
	 * @method hide
	 */
	hide: function(){
		var scrollEl = this._scrollEl;
		if (scrollEl) scrollEl.setStyle('display', 'none');
	},

	/**
	 * 显示滚动条
	 * 
	 * @method show
	 */
	show: function(){
		var scrollEl = this._scrollEl;
		if (scrollEl) scrollEl.setStyle('display', 'block');
		var contentEl = this._contentEl;
		/*
		if (this._orientation == VERTICAL) {
			contentEl.setStyle('margin-right', this._width + 3);
		} else {
			contentEl.setStyle('margin-bottom', this._height + 3);
		}*/
	}		
	
};

	mem.ui.ScrollBar = new Class(ScrollBar);

	mem.ui.ScrollBar.VERTICAL = VERTICAL;
	mem.ui.ScrollBar.HORIZONTAL = HORIZONTAL;

})();
