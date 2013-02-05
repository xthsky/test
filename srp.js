
/* source from: >> components/allcat/index.js */
KISSY.add("components/allcat/index", function(S, Brick) {
    var $ = S.all;

    //定义类目浮层显示隐藏（宽屏和窄屏）的位置：padding和高度值
    var CATEGORY_HEIGHT = {
            'SHOW': {
                "height": 470
            },
            'HIDE': {
                "height": 0
            }
        },
        SHOW_TIMEOUT = 0.2, //浮层展开收缩的速度
        OP_TIMEOUT = 100;//浮层操作延迟

    function Category() {
        Category.superclass.constructor.apply(this, arguments);
    }
    Category.EVENTS = {
        '.J_PCItem': {
            'mouseenter': function(ev){
                this.openTimer && this.openTimer.cancel();  //取消关闭类目的定时器
                this.showCategory(ev);    // 显示子类目浮层
            },
            'mouseleave': function(ev){
                this.hiddenCategory(ev);
                this.close();         //窄屏下还有隐藏类目
            }
        },
        '#J_SubCategory': {
            'mouseenter': function(ev){
                this.openTimer && this.openTimer.cancel();
                this.timer && this.timer.cancel();
            },
            'mouseleave': function(ev){
                this.close();
                this.hiddenCategory(ev);
            }
        },
        '.pc-title': {
            'mouseenter': function(ev){
                this.open();
            },
            'mouseleave': function(ev){
                this.close();
            } ,
            'touchstart': function(ev){
                if($('.J_PCMain').css('display') === 'none' ){
                    this.open();
                } else {
                    this.close();
                }

            }
        }
    };
    S.extend(Category, Brick, {
        lastElem: null,
        initialize: function() {
            this.height = 526;
        },
        open: function(){
            var that = this;

            var elem = this.elem;
            this.openTimer && this.openTimer.cancel();
            that.openTimer = S.later(function(){
                $('.J_PCMain').show().stop().animate({height: that.height+'px'}, SHOW_TIMEOUT, 'easeIn', function(){
                    $(".J_PCMain").css(CATEGORY_HEIGHT.SHOW);
                });
            }, OP_TIMEOUT);
        },
        close: function(){
            var that = this;

            var elem = this.elem;
            this.openTimer && this.openTimer.cancel();
            that.hiddenCategory();
            that.openTimer = S.later(function(){
                $('.J_PCMain').stop().animate({height:0}, SHOW_TIMEOUT, 'easeIn', function(){
                    $(".J_PCMain").css(CATEGORY_HEIGHT.HIDE).hide();
                });
            }, OP_TIMEOUT);

        },
        showCategory: function(ev){
            var that = this;
            this.showTimer && this.showTimer.cancel();
            this.showTimer = S.later(function(){
                that.showDetail(ev);
            }, OP_TIMEOUT);
        },
        showDetail: function(ev){
            var that = this,
                target = $(ev.target);
            if(!target.hasClass('.J_PCItem')) {
                target = $($(ev.target).parent('.J_PCItem'));
            }
            if(target.length === 0 )  return;

            this.lastElem && this.lastElem.addClass('hidden');//隐藏上次显示的子类目
            $('.J_PCItem').removeClass('pc-item-hover');//去掉上次选项的背景
            target.addClass('pc-item-hover'); //为当前选中的li添加背景色

            var index = S.indexOf(target[0], $( '.J_PCItem')),
                elem = $($('.category-detail', '#J_SubCategory')[index]),
                width = 640; //子类目的宽度

            S.use('datalazyload', function(S, DataLazyload) {
                DataLazyload.loadCustomLazyData(elem);
                elem.removeClass('hidden').css({'width': width}); //设置当前显示类目的宽度
                $('#J_SubCategory').css({'top': that.getPosition(target)}).animate({'width': width+5}, 0.3);
                that.lastElem = $($('.category-detail', '#J_SubCategory')[index]);
            });
        },
        //隐藏子类目
        hiddenCategory: function(ev){
            this.timer && this.timer.cancel();
            this.timer = S.later(function(){
                $('.category-detail', '#J_SubCategory').addClass('hidden');  //隐藏所有类目
                $('.J_PCItem').removeClass('pc-item-hover');  //去掉当前hover类目的hover效果
                $('#J_SubCategory').width(0);
            }, OP_TIMEOUT);
        },
        getPosition: function(elem){
            //计算子类目浮层的绝对定位的位置
            var winHeight = S.DOM.viewportHeight(),
                height = $('#J_SubCategory').height(), //子类目的高度
                targetTop =  elem.offset().top,      // 类目
                containerTop = $('.product-category').offset().top,
                scrollTop = $(document).scrollTop(),
                offsetHeight = height + targetTop - scrollTop,
            //某一具体类目在其容器的位置, 减去10是因为浮层有阴影部分，可以在视觉上让浮层和相应的类目对齐
                elemTop = targetTop - containerTop - 10;
            if ( offsetHeight > winHeight ) {        //如果子类目浮层的高度比窗口高，计算子类目的top
                var tmp = elemTop-(offsetHeight-winHeight);
                return  tmp+targetTop  < scrollTop+115 ? 20: tmp;
            } else {
                return elemTop;
            }

        },

        destructor:function(){
        }
    });
    return Category;
}, {
    requires: ["brix/core/brick"]
});

/* source from: >> components/bubble/index.js */
KISSY.add('components/bubble/index', function(S, Brick) {
	var DOM = S.DOM;
	var Cookie = S.Cookie;

	function bubbleTip() {
		bubbleTip.superclass.constructor.apply(this, arguments);
	}

	bubbleTip.METHODS = {
		show: function(pNode, config) {
			var index, node, href;
            var bVal = this.get('bVal');

			for (index in config) {
				// condition: Cookie
				if (! (bVal & Math.pow(2, index - 1))) continue;

				// condition: DOM
				node = config[index];
				href = node.href;
				if (href) {
					node = node.node;
				}
				node = S.one(node);
				if (!node) continue;

				// action
				node.parent(pNode).prepend('<div class="bubble bubble-' + index + '">' +
				// 不同标签是为了让ie6区分是否有链接，来改变cursor
				(href ? '<a href="' + href + '" class="fuckie6"></a>': '<s class="fuckie6"></s>') + '<a class="bubble-close"></a></div>');

				/**
             * 2012.11.08 气泡的展示逻辑改为只要出现过就不再展现，不管用户有没有点击 by hubo.hb@taobao.com
             */
				bVal &= ~Math.pow(2, index - 1);
				// Cookie 默认保留365天.
				Cookie.set('bubble', bVal, 365, '.s.etao.com', '/');
				Cookie.set('bubble', bVal, 365, '.product.etao.com', '/');
			}
		}
	};

	bubbleTip.EVENTS = {
		'.bubble-close': {
			click: function(e) {
				var node = S.one(e.currentTarget).parent('.bubble');
				node.remove();
			}
		}
	};

	S.extend(bubbleTip, Brick, {
		initialize: function() {
			var bVal = Cookie.get('bubble') || 7;
			// condition: Cookie
			bVal = parseInt(bVal, 10);

			//都展示过了
			if (bVal === 0) {
				return;
			}

			this.set('bVal', bVal);

			// add dom node
			if (S.one('.gridview')) {
				this.show('.griditem', {
					1: {
						node: '.polytag',
						href: 'http://s.etao.com/help.php?forhelp=save'
					}, 2: '.btn-compare',
					3: '.promotion-text'
				});
			} else if (S.one('.listview')) {
				this.show('.listitem', {
					1: '.popup-promotion',
					2: '.btn-compare',
					3: '.promotion-text'
				});
			}
		}
	});

	S.augment(bubbleTip, bubbleTip.METHODS);
	return bubbleTip;
}, {
	requires: ['brix/core/brick']
});


/* source from: >> components/c-4/index.js */
KISSY.add('components/c-4/index', function(S, Brick) {
    function comboRecommend() {
        comboRecommend.superclass.constructor.apply(this, arguments);
    }
    comboRecommend.METHODS = {
        showAndHide: function(){
            var self=this;
            KISSY.ready(function(S) {
                var D = S.DOM,
                    context = self.get('el'),
                    griditem = context.all('.griditem');
                
                //显示隐藏商家信息和收藏按钮
                griditem.on('mouseenter mouseleave',function(e){
                    var item = D.parent(e.target,'.griditem')|| e.target,
                        pic_panel = D.children(item,'.pic-panel'),
                        overlay = D.children(pic_panel,'.compare-overlay'),
                        fav_panel= D.children(pic_panel,'.hover-panel');
                        
                    if(e.type==='mouseenter'){
                        S.one(this).addClass('griditem-hover');
                        if(D.hasClass(item,'product-item')){
                            if(S.one(overlay)) {
                                S.one(overlay).stop().animate({bottom:0}, 0.5, 'easeOutStrong');
                            }
                        }
                        if(S.one(fav_panel)) {
                            S.one(fav_panel).stop().animate({top:0}, 0.5, 'easeOutStrong');
                        }
                    }
                    else {
                        S.one(this).removeClass('griditem-hover');
                        if(D.hasClass(item,'product-item')){
                            if(S.one(overlay)) {
                                S.one(overlay).stop().animate({bottom:'-200px'}, 0.5, 'easeOutStrong');
                            }
                        }
                        if(S.one(fav_panel)) {
                            S.one(fav_panel).stop().animate({top:'-20px'}, 0.5, 'easeOutStrong');
                        }
                    }
                });
            });
        },
        hideCombo:function(){
            var self=this;
            KISSY.ready(function(S) {
                var $ = S.all,
                    D = S.DOM,
                    E = S.Event,
                    context = self.get('el'),
                    griditem = context.all('.griditem'),
                    len = griditem.length;
                    
                //适应四种宽度990 1200 1400 1600
                var viewportWidth=D.viewportWidth();
                var count = viewportWidth>=1660 ? 6 : (viewportWidth>=1440 ? 5 :(viewportWidth>=1220 ? 4 :3));
                
                griditem.removeClass('need-hidden');
                if (len/count>1) {
                    griditem.slice(len-len%count, len).addClass('need-hidden');
                }
                        
                var winResizeBinded = false,
                    winResizeBindObjs = [],
                    winResizeBindTimer = null,
                    win = S.one(window),
                    lastWinHeight = win.height(),
                    lastWinWidth = win.width();
                
                //高效的监听resize函数
                function bindWinResizeEvents(func, funcHost, beforeFunc ){
                    if( !winResizeBinded ) {
                        E.on(window, 'resize', function(){

                            //IE下resize无限loop了，这样解决一下
                            if( win.height() == lastWinHeight && win.width() == lastWinWidth ) {
                                return false;
                            }

                            lastWinHeight = win.height();
                            lastWinWidth = win.width();

                            S.each( winResizeBindObjs, function(v){
                                if( v.bf ) { 
                                    v.bf.call(v.funcHost);
                                }
                            });

                            window.clearTimeout( winResizeBindTimer );

                            winResizeBindTimer = setTimeout(function(){
                                S.each( winResizeBindObjs, function(v){
                                    try{
                                        v.func.call( v.funcHost );
                                    } catch(e){}
                                });
                            }, 50);

                        });
                        winResizeBinded = true;
                        bindWinResizeEvents(func, funcHost, beforeFunc);
                    } else {
                       winResizeBindObjs.push({
                             bf : beforeFunc,
                             func : func,
                             funcHost : funcHost
                       }); 
                    }
                }
                
                //页面宽度变化
                bindWinResizeEvents(function(){
                    viewportWidth=D.viewportWidth();
                    count = viewportWidth>=1660 ? 6 : (viewportWidth>=1440 ? 5 :(viewportWidth>=1220 ? 4 :3));
                    
                    // 用于隐藏不整齐的combo 
                    griditem.removeClass('need-hidden');
                    if (len/count>1) {
                        griditem.slice(len-len%count, len).addClass('need-hidden');
                    }
                });
            });
        },
        imgCarousel: function(){
            var self = this,
                context = self.get('el');
                
            S.use("switchable", function(S, Switchable) {   
                var Carousel = Switchable.Carousel;
                context.all('.carousel-wrap').each(function(item, index){
                    var prev = item.one('.prev'),
                        next = item.one('.next');
                    if(prev) {
                        prev.addClass('ks-switchable-disable-btn');
                    }
                    item.parent('.griditem').on('mouseenter mouseleave', function(e){
                        if(e.type == "mouseenter") {
                            if(prev && next) {
                                item.css('z-index', 1);
                                prev.add(next).show();
                            }
                        }
                        else {
                            if(prev && next) {
                                item.css('z-index', 0);
                                prev.add(next).hide();
                            }
                        }
                    });
                    
                    item.all('.carousel-item').on('mouseenter mouseleave', function(e){
                        if(e.type == 'mouseenter') {
                            var _this = this;
                            mouseenterTimer = setTimeout(function(){
                                item.all('.carousel-item').removeClass('active');
                                S.one(_this).addClass('active');
                                var href = S.one(_this).attr('href');
                                var src = S.one('img', _this).attr('src');
                                var imgWrap = S.one('.img-wrap', item.prev());
                                if(href && imgWrap) {
                                    imgWrap.attr('href', href);
                                }
                                if(src && imgWrap) {
                                    src = src.replace('32x32', '200x200');
                                    S.one('img', imgWrap).attr('src', src);
                                }
                            },250);
                        }
                        else {
                            clearTimeout(mouseenterTimer);
                        }
                    });
                    
                    var carousel = new Carousel(item, {
                        effect: 'scrollx',
                        easing: 'easeOutStrong',
                        steps: 5,
                        viewSize: [210],
                        circular: false,
                        prevBtnCls: 'prev',
                        nextBtnCls: 'next'
                    });
                });
            });
        }
    }
    S.extend(comboRecommend, Brick, {
        initialize: function() {
            this.showAndHide();
            this.hideCombo();
            this.imgCarousel();
        }
    });
    S.augment(comboRecommend, comboRecommend.METHODS);
    return comboRecommend;
}, {
    requires: ['brix/core/brick']
});

/* source from: >> components/category/index.js */
KISSY.add('components/category/index', function(S, Brick) {
	var DOM = S.DOM;
	function category() {
		category.superclass.constructor.apply(this, arguments);
	}

	category.ATTRS = {
		state: {
			value: 0
		},

		morePanelWidth: {
			value: 0
		}
	};

	category.METHODS = {
		//重新渲染更多面板，只渲染一次
		//forceElInListCount  强制一个纵向列表中有几个行
		rePaintMorepanel: function(forceElInListCount) {
			if (this.isMorePanelPainted) {
				return false;
			}

			var el = this.get('el'),
			morePanel = el.one('.more-panel'),
			allListEls = morePanel.all('li'),

			listPadingTop = 20,
			listPaddingLeft = 20,
			listPaddingBottom = 18,

			oneListEl = this.get('el').one('li'),
			oneListElHeight = 22,
			oneListElWidth = oneListEl.width(),

			ulEls = el.one('.panel').all('ul'),
            elInListlCount,
            listCount;

			//取左侧列表中的最后一个ul中的li数量作为行数
            //有可能出现只有更多的情况，行数置为1
            if( ulEls.length == 0 ) {
                elInListlCount = forceElInListCount || 1; 
            } else {
			    elInListlCount = forceElInListCount || S.one(ulEls[ulEls.length - 1]).all('li').length;
            }

			listCount = Math.ceil(allListEls.length / elInListlCount);

			//如果更多里的li的数量小于左侧菜单里的li行数
			if (allListEls.length < elInListlCount) {
				this.rePaintMorepanel(allListEls.length);
				return false;
			}

			//限制最多3列
			if (listCount > 3) {
				this.rePaintMorepanel(++elInListlCount);
				return false;
			}

			//设置更多容器的宽度
			var morePanelWidth = listCount * oneListElWidth + listPaddingLeft,

			/* IE下没有背景色的bug修复*/
			morePanelHeight = elInListlCount * oneListElHeight + listPadingTop + listPaddingBottom;

			//如果弹出菜单可能超出屏幕外, 把一列的行数+1，然后重新计算
			var viewportWidth = DOM.viewportWidth();
			if (viewportWidth < morePanelWidth + oneListElWidth + listPaddingLeft) {
				this.rePaintMorepanel(++elInListlCount);
				return false;
			}

			this.set('morePanelWidth', morePanelWidth);
			this.set('morePanelInnerHeight', morePanelHeight + listPadingTop);

			morePanel.css({
				width: morePanelWidth,
				height: morePanelHeight
			});

			//取出一些li并且重新构建ul
			var uls = [];

			for (var listIndex = 1; listIndex < listCount; listIndex++) {
				uls[listIndex] = document.createElement('ul');
				for (var startIndex = elInListlCount * listIndex, endIndex = startIndex + elInListlCount * (listIndex + 1); startIndex < endIndex; startIndex++) {
					if (allListEls[startIndex]) {
						uls[listIndex].appendChild(allListEls[startIndex]);
					} else {
						break;
					}
				}

				morePanel.append(uls[listIndex]);
			}

			uls = null;

			morePanel.all('ul').each(function(v, i) {
				v.css('top', listPadingTop);
				v.css('left', i * oneListElWidth + listPaddingLeft);
			});

			this.isMorePanelPainted = true;
		},

		//动画显示更多面板
		showPanel: function() {
			var el = this.get('el'),
			animEl = el.one('.more-panel');

			el.css({
				'height': el.height(),
				'width': el.width()
			});

			el.addClass('category-opened');

			this.rePaintMorepanel();

			//每次重置一下面板的位置
			//及宽度，为动画准备
			animEl.css({
				top: 0,
				width: 0
			});

			var animTo = this.get('morePanelWidth'),
			animElOffset = animEl.offset(),
			animElInnerHeight = this.get('morePanelInnerHeight'),

			elOffset = el.offset(),

			moreBtn = el.one('.toggle-more'),
			moreBtnOffset = moreBtn.offset(),
			scrollTop = DOM.scrollTop(window),
			viewHeight = DOM.viewportHeight();

			//保证整个面板始终显示在屏幕区域，且优先与更多按钮的底部对齐
			if (moreBtnOffset.top - scrollTop > animEl.height()) {
				animEl.css({
					top: moreBtnOffset.top + moreBtn.innerHeight() - animElOffset.top - animElInnerHeight
				});
				//这时与更多按钮的顶部对齐
			} else {
				animEl.css({
					top: moreBtnOffset.top - animElOffset.top
					//注释的语句是在距离视窗上边缘10px
					//top: scrollTop + 10 - elOffset.top  
				});
			}

			animEl.stop().animate({
				width: animTo
			}, {
				duration: 0.5,
				easing: "easeOutStrong",
				complete: function() {}
			});

			this.set('state', 1);
		},

		//动画隐藏更多面板
		hidePanel: function() {
			var el = this.get('el'),
			animEl = el.one('.more-panel');

			var that = this;
			this.closeTimer = setTimeout(function() {
				//这里是因为异步刷新模块后，元素可能不存在
				try {
					animEl.stop().animate({
						width: 0
					}, {
						duration: 0.5,
						easing: "easeOutStrong",
						complete: function() {
							el.removeClass('category-opened');
						}
					});

					that.set('state', 0);
				} catch(e) {}

			}, 250)
		},

		//清除收起更多面板的定时器
		clearHideTimer: function() {
			clearTimeout(this.closeTimer);
		}
	};

	category.EVENTS = {
		'.toggle-more a': {
			click: function(e) {
                e.preventDefault();
			},

			mouseenter: function() {
				if (this.get('state')) {
					this.clearHideTimer();
				} else {
					this.showPanel();
				}
			},

			mouseleave: function() {
				this.hidePanel();
			}
		},

		'.more-panel': {
			mouseenter: function() {
				this.clearHideTimer();
			},

			mouseleave: function() {
				this.hidePanel();
			}
		}
	};

	S.augment(category, category.METHODS);

	S.extend(category, Brick, {
		initialize: function() {}
	});
	return category;
}, {
	requires: ["brix/core/brick"]
});


/* source from: >> components/charts/index.js */
KISSY.add("components/charts/index",function(a,b,c){function f(){var b=this;f.superclass.constructor.apply(b,arguments),a.one(window).on("resize",function(a){b.resize()}),b.init()}var d=c.all,e=0;return f.ATTRS={w:{value:100},h:{value:100},mainDiv:{value:null},url_svg:{value:"brix/gallery/charts/js/case"},url_swf:{value:"brix/gallery/charts/as/case"},path_swf:{value:Brix.basePath+"brix/"+Brix.fixed+"gallery/charts/as/case.swf"},mainDiv_id:{value:"J_Charts_"},swfDiv:{value:null},swfDiv_id:{value:"J_SWF_"},_case:{value:null},_resize_index:{value:0}},a.extend(f,b,{init:function(){var b=this;window.SVGAngle||document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1")?e=0:e=1;if(a.UA.shell=="maxthon"||a.UA.shell=="ie")e=1;b.set("w",d("#"+b.get("parent_id")).width()),b.set("h",d("#"+b.get("parent_id")).height()),b.set("mainDiv",d("<div></div>")),b.set("mainDiv_id",b.get("mainDiv_id")+b.get("parent_id")),b.get("mainDiv").attr("id",b.get("mainDiv_id"));var c={width:b.get("w"),height:b.get("h"),position:"relative"};b.get("mainDiv").css(c),d("#"+b.get("parent_id")).append(b.get("mainDiv"));if(e){b.set("swfDiv",d("<div></div>")),b.set("swfDiv_id",b.get("swfDiv_id")+b.get("parent_id")),b.get("swfDiv").attr("id",b.get("swfDiv_id"));var c={width:b.get("w"),height:b.get("h")};b.get("swfDiv").css(c),b.get("mainDiv").append(b.get("swfDiv")),a.use(b.get("url_swf"),function(a,c){b.set("_case",new c({path:b.get("path_swf"),parent_id:b.get("swfDiv_id"),config:b.get("config")}))})}else a.use(b.get("url_svg"),function(a,c){b.set("_case",new c({parent_id:b.get("mainDiv_id"),configData:b.get("config").configData,chartData:b.get("config").chartData}))})},actions:function(a,b){var c=this;c.get("_case").actions(a,b)},resize:function(){var a=this;a.set("_resize_index",a.get("_resize_index")+1);if(a.get("_resize_index")%2==0){a.set("w",d("#"+a.get("parent_id")).width()),a.set("h",d("#"+a.get("parent_id")).height());var b={width:a.get("w"),height:a.get("h"),position:"relative"};a.get("mainDiv").css(b);if(e){var b={width:a.get("w"),height:a.get("h")};a.get("swfDiv").css(b)}else a.get("_case").actions("reset")}}}),f},{requires:["base","node"]});

/* source from: >> components/c-onebox/index.js */
KISSY.add('components/c-onebox/index', function(S, Brick, Switchable) {
    function Onebox() {
        Onebox.superclass.constructor.apply(this, arguments);
    }
    Onebox.METHODS = {
        switchable: function(){
            var node = this.el.get('.scroller');

            //閫氳繃DOM鍏冪礌鏂板缓鏃嬭浆鏈ㄩ┈
            var carousel = new Switchable.Carousel(node, {
                effect: 'scrollx',
                easing: 'easeOutStrong',
                steps: 1,
                viewSize: [680],
                circular: false,
                prevBtnCls: 'ext-prev',
                nextBtnCls: 'ext-next',
                disableBtnCls: 'disable',
                lazyDataType: 'img-src'
            });
        },
        mask: function(){
        }
    }
    S.extend(Onebox, Brick, {
        initialize: function() {
            this.switchable();
            this.mask();
        }
    });
    S.augment(Onebox, Onebox.METHODS);
    return Onebox;
}, {
    requires: ['brix/core/brick', 'switchable']
});

/* source from: >> components/filterbar/index.js */
KISSY.add('components/filterbar/index', function(S, Brick, Router ) {
	function filterBar() {
		filterBar.superclass.constructor.apply(this, arguments);
	}

	filterBar.ATTRS = { 
        //排序类型
		sortingType: {
			value: 0
			/* 0 默认排序
             * 1 销量
             * 2 最新
             * 3 价格从高到低，降序
             * 4 价格从低到高, 升序，默认
             */
        }
	}; 

	filterBar.METHODS = {
        //主动调用Router方法，异步刷新页面
        navigate : function( url ){
            Router.navigate( url );
        },

        //url转换
        //url 一个正常的url, 例如：http://test.com?zk=1&usearch=2#promotionbar
        //输出格式 
        //{
        //     location:'http://test.com',
        //     hash : 'promotionbar',
        //     querys : {
        //         zk: 1,
        //         usearch : 2
        //     }
        //}
        urlParse : function(url){
           //IE下使用#!serarch?sjdlfjslfs这种形式开做opoa，所以要再处理一次
		   if (S.UA.ie && url.match(/#!/) ) {
               return this.urlParse( url.split(/#!/)[1] );     
		   }

           var hashReg = /#([^?&]*)/,
               result = {};

           result.hash = url.match( hashReg ) && url.match( hashReg )[1];


           url = url.replace(hashReg, ''); //去掉hash

           var urlNoHashArry =  url.split('?');

           result.location = urlNoHashArry[0];
           result.querys = {};

           var queryArry = [], i = 0, tmpKeyVal;

           if( urlNoHashArry[1] ) {
                queryArry = urlNoHashArry[1].split('&');
                while( queryArry[i] ) {
                    tmpKeyVal =  queryArry[i].split('='); 
                    result.querys[ tmpKeyVal[0] ] = tmpKeyVal[1];
                    i++;
                }
           }

           return result;
        },

        //通过url对象构建出一个url
        //urlObj格式和urlParse的输出一致
        urlBuild: function( urlObj ){
           var url = urlObj.location;
           if( urlObj.hash != null ) {
             url +=  '#' + urlObj.hash;
           }

           url += '?';

           S.each( urlObj.querys, function(v,i){
              url += i + '=' + v + '&';
           });

           return  url;
        },

        //设置一个url的query参数
        //url 正常的url
        //p   参数名
        //v   参数值
        urlSetParam : function(url, p, v){
            var urlObj = this.urlParse( url );
            urlObj.querys[ p ] = v;
            return this.urlBuild( urlObj );
        },

        //返回一个url中的参数为p的值
        //url 正常的url
        //p   参数名
        urlGetParam : function(url, p){
            var urlObj = this.urlParse( url );
            return urlObj.querys[ p ];
        },

        //返回触发事件的元素
        //e  事件对象
        eEl : function( e ){
            return S.one(e.currentTarget || e);
        },

        //按钮式的排序事件处理
		selectBtnSort: function(e) { 
			var el = this.eEl(e);

			el.parent().all('a').removeClass('selected');
			el.addClass('selected');

            this.navigate( el.attr('href') );
		}, 

        //列表和大图模式切换的按钮事件代理
		viewToggle: function(e) { 
			var el = this.eEl(e);

			el.parent().all('a').removeClass('selected');
			el.addClass('selected');

            //TODO 异步刷新的时候，修改一下左上角搜索里的style的值
            if( S.one('input[name=style]') ) {
                S.one('input[name=style]').val( el.hasClass('grid') ? 'grid' : 'list' );
            }

            this.navigate( el.attr('href') );
		}, 

        //切换下拉面板的状态
		togglePanel: function(e) { 
			var el = this.eEl(e),
			conEl = el.parent('div');

            //如果是发货地，初始化一下
			if (el.parent().hasClass('from-area')) {
				this.renderFromArea();
			}

			if (conEl.hasClass('menu-open')) {
				this.closePanel(conEl);
			} else {
				this.openPanel(conEl);
			}
		}, 

        //展开下拉面板
		openPanel: function(pan) {
			pan.addClass('menu-open');
			var panContent = pan.one('.panel-content'),
			height = panContent.height();

			panContent.css('height', 0);
            panContent.stop().animate({
				height: height
			}, 0.5, 'easeOutStrong', function() {
				panContent.css('height', 'auto');
			});
		},

        //关闭下拉面板
		closePanel: function(pan) { 
			var panContent = pan.one('.panel-content'),
			height = panContent.height();

            panContent.stop().animate({
				height: 0
			}, 0.5, 'easeInStrong', function() {
				pan.removeClass('menu-open');
				panContent.css('height', 'auto');
			});
		}, 

        //滑动按钮的事件处理
		toggleSlide: function(e) { 
            var evtEl = this.eEl( e ),
			el = evtEl.parent().one('.toggle-icon'),

			slider = el.one('.slider'),
			self = this;

			if (el.hasClass('on')) {
                slider.stop().animate({
					left: 1
				}, 0.3, 'easeIn', function() {
					el.removeClass('on');
					//促销商品的单独设置
					if (el.parent('.onsale') && el.parent('.onsale').length > 0 ) {
						self.hideSalePanel();
                        self.navigate( el.parent().attr('href') );
                    } else {
                    //优惠购的链接切换
                        self.setDiscountBtnUrl( el.parent() );
                    }
				});
			} else {
                slider.stop().animate({
					left: 20
				}, 0.3, 'easeIn', function() {
					el.addClass('on');
					//促销商品的单独设置
					if (el.parent('.onsale') && el.parent('.onsale').length > 0 ) {
						//self.showSalePanel();
                        //后端不再默认输出分类
                        self.navigate( el.parent().attr('href') );
                    } else {
                    //优惠购的链接切换
                        self.setDiscountBtnUrl( el.parent() );
                    }
				});
			}
		}, 

		showSalePanel: function() { 
            var panel = this.get('el').one('.on-sale-panel'); 
            if( !panel ) {
                return false;
            }


            var animTo = panel.height();
            panel.css({
                'height': 0, 
                'display':'block'
            });

            panel.show();

            //kissy自带的动画函数导致有小数高度出现，动画效果有问题
            var start = 0, timer = null, 
            totalTime = 500, 
            animPerTime = 50,
            step = animTo/( totalTime / animPerTime );

            //保证动画步进值为整数
            while( animTo % step != 0 ) {
                step = Math.ceil( step );
                step +=1;
            }

            timer = setInterval(function(){
                if( start == animTo )  {
                    clearInterval( timer );
                    panel.css('height', 'auto' );
                    return false;
                }
                panel.css('height', start+=step);
            }, animPerTime);
		}, 

		hideSalePanel: function() { 
            var panel = this.get('el').one('.on-sale-panel'); 

            var start = panel.height();
            //kissy自带的动画函数导致有多位小数高度出现，动画效果有问题
            var animTo = 0, timer = null, 
            totalTime = 500, 
            animPerTime = 50,
            step = start/( totalTime / animPerTime );

            //保证动画步进值为整数
            while( start % step != 0 ) {
                step = Math.ceil( step );
                step +=1;
            }

            timer = setInterval(function(){
                if( start == animTo )  {
                    clearInterval( timer );
                    panel.hide().css('height', 'auto' );
                    return false;
                }
                panel.css('height', start-=step );
            }, animPerTime);
		}, 

		isFromAreaRendered: false,
		renderFromArea: function() { 
			if (this.isFromAreaRendered) {
				return false;
			}

			this.isFromAreaRendered = true;
			this.buildTabs();
		}, 

		buildTabs: function() {
			var self = this;
			S.use("switchable", function(S, Switchable) {
				var Tabs = Switchable.Tabs;
				var tabs = new Tabs(self.get('el'), {
					switchTo: 0,
					markupType: 1,
					triggerCls: 'ks-switchable-trigger',
					panelCls: 'ks-switchable-panel',
					activeTriggerCls: 'selected'
				});
			});
		}, 

		selectArea: function(e) { 
			var el = S.one(e.currentTarget),
			pan = el.parent('.block'),
			text = this.get('el').one('.from-area').one('h3 span.text');

			if (this.lastSelectAreaEl) {
				this.lastSelectAreaEl.removeClass('selected');
			}

			el.addClass('selected');
			this.lastSelectAreaEl = el;

			text.html(el.html() > 5 ? el.html().slice(0, 5) + '...': el.html());
            this.doAreaFilter( el );
			this.closePanel(pan);
		}, 

        doAreaFilter: function( el ){
           var baseUrl = this.get('el').one('.from-area').one('h3 a').attr('href');
           //主动异步
           this.navigate( this.urlSetParam(baseUrl,'loc', el.attr('data-loc') ) );
        },

        //改变排序的状态
		changeSortType: function(e) {
			var el = this.eEl(e),
			pan = el.parent('.block.sorting'),
			narrowPan = el.parent('.block.sorting-narrow'),
			dataAttr = 'data-sorting-type',
			attr = el.attr(dataAttr);

			switch (attr) {
			case '0':
			case '1':
			case '2':
				this.clearPriceState(el); //非价格排序时清除一下价格排序的状态
				break;
			case '3':
			case '4':
				this.detectPriceClick(el); //价格排序时检查一下几次点击
				break;
			}

			//再取一次
			attr = el.attr(dataAttr);
			this.linkedSortChange(attr); //同步按钮和下拉的状态
		}, 

		clearPriceState: function(el) { 
			this.lastPriceSorting = -1;
            //默认恢复升序状态
			this.get('el').one('.sorting').one('a span.icon').removeClass('icon-arrow-down').addClass('icon-arrow-up');
		}, 

		detectPriceClick: function(el) { 
			//处理一下价格按钮可以两次点击
			if (!this.lastPriceSorting) {
				this.lastPriceSorting = -1;
			}

			var dataAttr = 'data-sorting-type';

			var iconEl = this.get('el').one('.sorting').one('a span.icon'),
			priceEl = iconEl.parent('a'),
			self = this,
			setAsc = function() { //升序,价格由低到高
				priceEl.attr(dataAttr, 4);
				iconEl.addClass('icon-arrow-up');
				iconEl.removeClass('icon-arrow-down');
				self.lastPriceSorting = 4;
			},

			setDesc = function() { //降序,价格由高到低
				priceEl.attr(dataAttr, 3);
				iconEl.removeClass('icon-arrow-up');
				iconEl.addClass('icon-arrow-down');
				self.lastPriceSorting = 3;
			};

			if (el.one('span.icon')) {
				if (this.lastPriceSorting == - 1) { //第一次点击
					this.lastPriceSorting = el.attr(dataAttr);
				} else if (this.lastPriceSorting == 3) { //第二次
					setAsc();
				} else if (this.lastPriceSorting == 4) { //第二次
					setDesc();
				}
			} else {
				if (el.attr(dataAttr) == 3) {
					setDesc();
				} else {
					setAsc();
				}
			}
		}, 

		dropMenuSingleSelect: function(el) { 
			var el = S.one(el),
			pan = el.parent('.block'),
			btn = pan.one('h3 a'),
			text = pan.one('h3 span.text');

			if (!pan || ! text) {
				return false;
			}

			//清除选中的
			el.parent('ul').all('a').removeClass('selected');

			el.addClass('selected');
			btn.attr('href', el.attr('href'));

			text.html(el.html());
		}, 

        //同步排序筛选按钮式和下拉式的状态
		linkedSortChange: function(type) { 
			var self = this;
			S.all('a[data-sorting-type=' + type + ']').each(function(v, i) {
				S.one(v).parent().all('a').removeClass('selected');
			}).addClass('selected').each(function(v, i) {
				self.dropMenuSingleSelect(v);
			});
		}, 

        //下拉式的筛选点击事件
		selectNarrowSortType: function(e) { 
			var el = this.eEl(e),
			pan = el.parent('.block');

			this.dropMenuSingleSelect(el);

			this.closePanel(pan);

            this.navigate( el.attr('href') );
		}, 

        //价格小面板展开
		pricePanelShow: function() {
            clearTimeout( this.hidePricePanelTimer );
			this.get('el').one('.price-panel').removeClass('normal').addClass('focus');
		},

        //价格小面板隐藏
		pricePanelHide: function() {
            var self = this;
            this.hidePricePanelTimer = setTimeout(function(){
                self.get('el').one('.price-panel').removeClass('focus').addClass('normal');
            }, 200);
		},

        //价格小面板上的input的事件处理
        //如果是回车键，触发跳转
        setPriceBtnUrl : function( e ){
            var el = this.eEl(e),
            key = el.attr('name'),
            val = el.val(),
            self = this,
            btn = this.get('el').one('.price .custom-btn'),
            baseUrl = btn.attr('href') != 'javascript:;' ? btn.attr('href') : location.href;

            //两个input都要取值
            var url = baseUrl;
            this.get('el').all('.price input').each(function(v, i){
                url = self.urlSetParam(url, v.attr('name'), v.val() );     
            });

            btn.attr('href', url);

            if( e.keyCode == 13 ) {
               btn.fire('click');  
            }
        },

        //商品类型和优惠购的参数要合并起来
        //url 正常的url
        //qserviceVal qservice的值， 商品类型和优惠购的参数是一样的，都是qservice
        //delTag  是否删除某个值，默认为false
        combineQServiceParam : function( url, qserviceVal, delTag ){
            var qservice = this.urlGetParam(url, 'qservice'),
                val = '';

            //已经有值, 去重合并
            if( qservice ) {
                qservice = decodeURIComponent(qservice);
                var qarry = qservice.split(','), 
                    newQarry = [];

                S.each(qarry, function(v, i){
                    if( v != qserviceVal ) {
                        newQarry.push( v );
                    }
                });

                if( !delTag ) {
                    newQarry.push( qserviceVal );
                }

                val = newQarry.join(',');
            } else {
                //没有值直接加上
                if( !delTag ) {
                    val = qserviceVal;
                }
            }

            return encodeURIComponent(val);
        },

        //商品服务的事件处理
        //这是一个多选
		selectCategory: function(e) { 
			var el = this.eEl(e),
			pan = el.parent('.block'),
			btn = pan.one('h3 a'),
			text = pan.one('h3 span.text');

			if (!pan || !text) {
				return false;
			}

            el.toggleClass('selected');
            this.setCategoryTitle();

            this.navigate( el.attr('href') );
		}, 

        //设置商品类型的文字, 多余7个加省略号
        setCategoryTitle : function(){
            var selectedItems = this.get('el').all('.category li a.selected'),
                textArry = [];

            selectedItems.each(function(v, i){
                textArry.push(  v.text().replace(/^\s+|\s+$/, '') );
            });

            if( textArry.length == 0 ) {
                textArry.push( '商家服务' ); 
            }

            var text = textArry.join(',');

            if( text.length > 7 ) {
                text = text.slice(0, 7) + '...';
            }

            this.get('el').one('.category h3 .custom-btn .text').html( text );

            //面板的宽度调整
            var titleEl = this.get('el').one('.category h3'),
            panelEl = this.get('el').one('.category .panel-content'), 
            panelWidth = 100;

            if( titleEl.width() > panelEl.width() + 20  || panelEl.width() > panelWidth) {
                panelWidth = titleEl.width() + 20;
            }

            panelEl.css('width', panelWidth);
        },

        //设置优惠购的链接
        //e 可以是点击事件，也可以是直接传入的el
        setDiscountBtnUrl : function( e ){
            var el = S.one( e.currentTarget || e ),
            delTag = false, 
            //这是因为后端这个参数和商品类型的参数是一样的
            val =  el.attr('data-cat-param'),
            url = location.href;

            if( !el.one('.toggle-icon').hasClass('on') ) {
               delTag = true;
            }

            val = this.combineQServiceParam(url, val, delTag);

            url = this.urlSetParam(url, 'qservice', val);

            el.attr('href', url);
            //主动异步
            this.navigate( url );
        },

        checkShowSalePanel : function(){
            var panel = this.get('el').one('.on-sale-panel'); 
            if( panel ) {
                this.showSalePanel();                
            }
        },

		preloadIcons: function() {
			//只处理IE6
			if (!S.UA.ie || S.UA.ie != 6) {
				return false;
			}

            //这里看readme.md
            var iconsUrl = [
                'http://img01.taobaocdn.com/tps/i1/T1lKAiXfXiXXb38KzX-15-13.png', 
                'http://img04.taobaocdn.com/tps/i4/T1sTczXeVXXXb38KzX-15-13.png', 
                'http://img01.taobaocdn.com/tps/i1/T1aysyXoddXXc2_.7.-14-13.png',
                'http://img03.taobaocdn.com/tps/i3/T1niszXdhaXXc2_.7.-14-13.png',
                'http://img04.taobaocdn.com/tps/i4/T1_eIzXcpaXXXeCKDX-15-15.png', 
                'http://img04.taobaocdn.com/tps/i4/T1VCwyXaJcXXckVA6a-7-10.png', 
                'http://img03.taobaocdn.com/tps/i3/T1dXwAXaJXXXckVA6a-7-10.png', 
                'http://img02.taobaocdn.com/tps/i2/T1GB7zXh0XXXbW6mDe-37-19.png',
                'http://img01.taobaocdn.com/tps/i1/T1TwZyXd8eXXbW6mDe-37-19.png', 
                'http://img04.taobaocdn.com/tps/i4/T13ZAyXgXfXXckVA6a-7-10.png', 
                'http://img03.taobaocdn.com/tps/i3/T1AnEyXhxcXXcdXhPr-7-4.png', 
                'http://img02.taobaocdn.com/tps/i2/T1UVsyXi8fXXcdXhPr-7-4.png'];

			S.each(iconsUrl, function(v, i) {
				var img = new Image();
				img.onload = img.onerror = function() {
					img = null;
				};

				img.src = v;
			});
        },

        hidePanelTimer : null //用来延时展开面板的定时器
	};

    //事件阻止都写在这里
	filterBar.EVENTS = {
		'.sorting a': {
			click: function(e) {
                e.preventDefault();
				this.selectBtnSort(e);
				this.changeSortType(e);
			}
		},

		'.sorting-narrow li a': {
			click: function(e) {
                e.preventDefault();
				this.selectNarrowSortType(e);
				this.changeSortType(e);
			}
		},

		'.view-toggle a': {
			click: function(e) {
                e.preventDefault(); 
				this.viewToggle(e);
			}
		},

		'.block h3': {
			click: function(e) {
                e.preventDefault(); 
			},
			mouseenter: function(e) {
                var self = this;
                //e.preventDefault(); 
                var el = this.eEl(e);
                this.hidePanelTimer = setTimeout(function(){
                    self.togglePanel(el);
                }, 250);
			}
		},

		'.block': {
			mouseleave: function(e) {
                clearTimeout( this.hidePanelTimer );
				var el = this.eEl(e);
				if (el.one('.panel')) {
					this.closePanel(el);
				}
			}
		},

		'.category .panel-content li a': {
			click: function(e) {
                e.preventDefault();
				this.selectCategory(e);
			}
		},

		'.discount a,.onsale a': {
            click: function(e){
                e.preventDefault();
				this.toggleSlide(e);
            },    

			mousedown: function(e) {
                e.preventDefault();
				this.toggleSlide(e);
			}
		},


		'.from-area .ks-switchable-panel li a': {
			click: function(e) {
                e.preventDefault();
				this.selectArea(e);
			}
		},

		'.price input': {
			focus: function(e) {
				this.pricePanelShow();
            },
            blur: function(e) {
				this.pricePanelHide();
            },
            keyup : function( e ){
                this.setPriceBtnUrl( e ); 
            }
        },

        '.price .custom-btn' : {
            click : function( e ){
                e.preventDefault();
                var url = this.eEl(e).attr('href');
                if( url != 'javascript:;' ) {
                    this.navigate( url );
                }
            }
        },

        '.on-sale-panel a':{
            click : function( e ){
                e.preventDefault();
                var url = this.eEl(e).attr('href');
                if( url != '' ) {
                    this.navigate( url );
                }
            }
        }
	};

	S.augment(filterBar, filterBar.METHODS);

	S.extend(filterBar, Brick, {
		initialize: function() {
			this.preloadIcons();

            //初始化的时候，后端通过类选中某几个类别, 前端处理一下选中的类型
            this.setCategoryTitle(); 
            this.checkShowSalePanel();
		}
	});

	return filterBar;
}, {
	requires: ['brix/core/brick','magix/router']
});


/* source from: >> components/gridview/index.js */
KISSY.add('components/gridview/index', function(S, Brick) {
    function GridView() {
        GridView.superclass.constructor.apply(this, arguments);
    }
    GridView.METHODS = {
        showAndHide: function(){
            var self=this;
            KISSY.ready(function(S) {
                var D = S.DOM,
                    context = self.get('el'),
                    griditem = context.all('.griditem');
                    
                //显示隐藏商家信息和收藏按钮
                griditem.on('mouseenter mouseleave',function(e){
                    var item = D.parent(e.target,'.griditem')|| e.target,
                        pic_panel = D.children(item,'.pic-panel'),
                        overlay = D.children(pic_panel,'.compare-overlay'),
                        fav_panel= D.children(pic_panel,'.hover-panel');
                        
                    if(e.type==='mouseenter'){
                        S.one(this).addClass('griditem-hover');
                        if(D.hasClass(item,'product-item')){
                            if(S.one(overlay)) {
                                S.one(overlay).stop().animate({bottom:0}, 1, 'easeOutStrong');
                            }
                        }
                        if(S.one(fav_panel)) {
                            S.one(fav_panel).stop().animate({top:0}, 1, 'easeOutStrong');
                        }
                    }
                    else {
                        S.one(this).removeClass('griditem-hover');
                        if(D.hasClass(item,'product-item')){
                            if(S.one(overlay)) {
                                S.one(overlay).stop().animate({bottom:'-200px'}, 1, 'easeOutStrong');
                            }
                        }
                        if(S.one(fav_panel)) {
                            S.one(fav_panel).stop().animate({top:'-20px'}, 1, 'easeOutStrong');
                        }
                    }
                });
            });
        },
        spliter: function(){
            var self=this;
            KISSY.ready(function(S) {
                /* 各种JS实现分隔线的逻辑 
                 * hubo.hb@taobao.com 2012.11.12
                */
                S.use("sizzle", function(S) {
                    var D = S.DOM,
                        $ = S.all,
                        $$ = S.one,
                        E = S.Event,
                        context = self.get('el'),
                        griditem = context.all('.griditem');
                    
                    if( !$$('.J-srp-content') ) {
                        return false;
                    }
                    
                    //适应四种宽度990 1200 1600
                    var viewportWidth = document.documentElement.offsetWidth;
                    var listConWidth = viewportWidth > 1660 ? 1600 : (viewportWidth > 1220 ? 1200 :990);
                            
                    var winResizeBinded = false,
                        winResizeBindObjs = [],
                        winResizeBindTimer = null,
                        win = S.one(window),
                        lastWinHeight = win.height(),
                        lastWinWidth = win.width();
                    
                    //高效的监听resize函数
                    function bindWinResizeEvents(func, funcHost, beforeFunc ){
                        if( !winResizeBinded ) {
                            E.on(window, 'resize', function(){

                                //IE下resize无限loop了，这样解决一下
                                if( win.height() == lastWinHeight && win.width() == lastWinWidth ) {
                                    return false;
                                }

                                lastWinHeight = win.height();
                                lastWinWidth = win.width();

                                S.each( winResizeBindObjs, function(v){
                                    if( v.bf ) { 
                                        v.bf.call(v.funcHost);
                                    }
                                });

                                window.clearTimeout( winResizeBindTimer );

                                winResizeBindTimer = setTimeout(function(){
                                    S.each( winResizeBindObjs, function(v){
                                        try{
                                            v.func.call( v.funcHost );
                                        } catch(e){}
                                    });
                                }, 50);

                            });
                            winResizeBinded = true;
                            bindWinResizeEvents(func, funcHost, beforeFunc);
                        } else {
                           winResizeBindObjs.push({
                                 bf : beforeFunc,
                                 func : func,
                                 funcHost : funcHost
                           }); 
                        }
                    }
                    
                    //页面宽度变化
                    bindWinResizeEvents(function(){
                        viewportWidth = document.documentElement.offsetWidth;
                        listConWidth = viewportWidth > 1660 ? 1600 : (viewportWidth > 1220 ? 1200 :990);
                    });
                    
                    //分隔线的逻辑
                    //大图 : 产品标题分隔线, data-spliter = { type:'s-t'}
                    //大图 : 产品与商品之间的分隔线, data-spliter = { type:'p-g'}    
                    //大图 : 相关与不相关的商品的分隔线, data-spliter = { type:'r-v'}
                    
                    function Spliter( data, el ){
                        this.init( data, el );
                    }

                    Spliter.prototype = {
                        dom : null,
                        init : function( data, el ){
                            this.data = data;
                            this.posRefEl = el;

                            if( !this.dom ) {
                                this.dom =  $$(D.create('<div style="position:absolute">'));
                                this.posRefEl.append( this.dom[0] );
                            }
                            this.showOrHide();
                            this.bindEvents();
                        },

                        showOrHide :function(){
                            if( this.isToBeShow() ) {
                                this.renderTpl();
                                this.setDomPos();
                                this.dom.show();
                            } else {
                                this.dom.hide(); 
                            }
                        },

                        setDomPos : function(){
                            var style = this.getStyle(); 
                            D.css(this.content, style);
                        },

                        renderTpl : function(){
                            var html = this.tpl;
                            for( var key in this.data ){
                               html = html.replace(new RegExp('{{' + key + '}}', 'gi'), this.data[key]); 
                            }

                            this.dom.html( html );
                            this.content = this.dom.one('div');
                        },

                        bindEvents : function(){
                            bindWinResizeEvents( function(){
                               this.dom.show();
                               this.onResize();
                            },
                            this, 
                            function(){
                              // this.dom.hide();
                            });
                        },
                        //子类实现
                        onResize : function(){},
                        tpl : '',
                        isToBeShow : function(){
                            var index = S.indexOf( this.posRefEl[0], griditem ),
                                count; 
                            switch(listConWidth){
                                case 990:
                                    count=3;
                                    break;
                                case 1200:
                                    count=4;
                                    break;
                                case 1600:
                                    count=6;
                                    break;
                                default:
                                    break;
                            }
                            if( index % count == 0 ) { return false; }
                            return true;
                        },

                        getStyle : function(){
                            //var pos = this.posRefEl.offset();
                            var pos = {
                                top : -this.posRefEl.outerHeight()-15,
                                left : -17 
                            };

                            S.mix(pos, {position:'absolute', height: this.posRefEl.outerHeight() + 30});
                            return pos;
                        }
                    };
                    
                    //产品标题分隔线 
                    function titleSpliter( data, el ){
                        titleSpliter.superclass.constructor.call(this, data, el);
                    }

                    S.extend(titleSpliter, Spliter, {
                        isToBeShow : function(){
                            return true;
                        },
                        showOrHide :function(){
                            this.renderTpl();

                            //spliter所在行所有元素加类
                            var index = S.indexOf( this.posRefEl[0], griditem ),
                                len =  griditem.length,
                                count; 
                                
                            switch(listConWidth){
                                case 990:
                                    count=3;
                                    break;
                                case 1200:
                                    count=4;
                                    break;
                                case 1600:
                                    count=6;
                                    break;
                                default:
                                    break;
                            }
                            context.all('.griditem.srp-spliter-padding').removeClass('srp-spliter-padding');

                            var lineNum = Math.ceil( (index + 1) / count );
                            for( var start =  (lineNum - 1) * count, end = lineNum * count; start < end; start++){
                                if(griditem && griditem[ start ]) {
                                    $$(griditem[ start ]).addClass('srp-spliter-padding');
                                }
                            } 

                            this.setDomPos();
                            this.dom.show();
                        },
                        onResize : function(){
                            this.showOrHide();
                        },
                        tpl : '<div>\
                                    <div class="srp-spliter-title">\
                                        快速比较产品<span>（共{{count}}件）</span>\
                                    </div>\
                               </div>'
                    });

                    //产品和商品的分隔线
                    function PGSpliter( data, el ){
                        PGSpliter.superclass.constructor.call(this, data, el);
                    }

                    S.extend(PGSpliter, Spliter, {
                        showOrHide :function(){
                            this.renderTpl();

                            if( this.isToBeShow() ) {
                                this.dom.removeClass('noborder');
                            } else {
                                this.dom.addClass('noborder');
                            }

                            //spliter所在行所有元素加类
                            var index = S.indexOf( this.posRefEl[0], griditem ),
                                len =  griditem.length,
                                count; 
                                
                            switch(listConWidth){
                                case 990:
                                    count=3;
                                    break;
                                case 1200:
                                    count=4;
                                    break;
                                case 1600:
                                    count=6;
                                    break;
                                default:
                                    break;
                            }

                            context.all('.griditem.padd-spliter').removeClass('padd-spliter');

                            var lineNum = Math.ceil( (index + 1) / count );
                            for( var start =  (lineNum - 1) * count, end = lineNum * count; start < end; start++){
                                if( griditem && griditem[start] ) {
                                    $$(griditem[ start ]).addClass('srp-spliter-padding');
                                }
                            } 

                            this.setDomPos();
                            this.dom.show();
                        },

                        onResize : function(){
                            this.showOrHide();
                        },

                        tpl : '<div class="srp-spliter">\
                                    <div class="srp-spliter-title">\
                                        直接选购商品<span>（共{{count}}件）</span>\
                                    </div>\
                               </div>'
                    });
                     
                    //相关与不相关的商品的分隔线 
                    function verRSpliter( data, el ){
                        verRSpliter.superclass.constructor.call(this, data, el);
                    }

                    S.extend(verRSpliter, Spliter, {
                        isToBeShow : function(){
                            return true;
                        },
                        tpl : '<div class="srp-spliter-r-v">\
                                    <div class="srp-spliter-title">\
                                        后续宝贝相关度较低，另起排序\
                                    </div>\
                               </div>'
                    });

                    setTimeout(function(){
                        $('[data-spliter]').each(function(v,i){
                            var data =  S.JSON.parse( v.attr('data-spliter').replace(/'/g, '"') );
                            switch( data.type ) {
                                case 's-t' : 
                                    new titleSpliter(data, v);
                                    break;
                                case 'p-g' : 
                                    new PGSpliter(data, v);
                                    break;
                                case 'r-v' : 
                                    new verRSpliter(data, v);
                                    break;
                            }
                        });
                    }, 250);
                });
            });
        },
        imgCarousel: function(){
            var self = this,
                context = self.get('el'),
                mouseenterTimer;
                
            S.use("switchable", function(S, Switchable) {   
                var Carousel = Switchable.Carousel;
                context.all('.carousel-wrap').each(function(item, index){
                    var prev = item.one('.prev'),
                        next = item.one('.next');
                    if(prev) {
                        prev.addClass('ks-switchable-disable-btn');
                    }
                    item.parent('.griditem').on('mouseenter mouseleave', function(e){
                        if(e.type == "mouseenter") {
                            if(prev && next) {
                                item.css('z-index', 1);
                                prev.add(next).show();
                            }
                        }
                        else {
                            if(prev && next) {
                                item.css('z-index', 0);
                                prev.add(next).hide();
                            }
                        }
                    });
                    
                    item.all('.carousel-item').on('mouseenter mouseleave', function(e){
                        if(e.type == 'mouseenter') {
                            var _this = this;
                            mouseenterTimer = setTimeout(function(){
                                item.all('.carousel-item').removeClass('active');
                                S.one(_this).addClass('active');
                                var href = S.one(_this).attr('href');
                                var src = S.one('img', _this).attr('src');
                                var imgWrap = S.one('.img-wrap', item.prev());
                                if(href && imgWrap) {
                                    imgWrap.attr('href', href);
                                }
                                if(src && imgWrap) {
                                    src = src.replace('32x32', '200x200');
                                    S.one('img', imgWrap).attr('src', src);
                                }
                            },250);
                        }
                        else {
                            clearTimeout(mouseenterTimer);
                        }
                    });
                    
                    var carousel = new Carousel(item, {
                        effect: 'scrollx',
                        easing: 'easeOutStrong',
                        steps: 5,
                        viewSize: [210],
                        circular: false,
                        prevBtnCls: 'prev',
                        nextBtnCls: 'next'
                    });
                });
            });
        }
    };
    S.extend(GridView, Brick, {
        initialize: function() {
            this.showAndHide();
            this.spliter();
            this.imgCarousel();
        }
    });
    S.augment(GridView, GridView.METHODS);
    return GridView;
}, {
    requires: ['brix/core/brick']
});

/* source from: >> components/listview/index.js */
KISSY.add('components/listview/index', function(S, Brick) {
    function listView() {
        listView.superclass.constructor.apply(this, arguments);
    }
    listView.METHODS = {
        showAndHide: function(){
            var self=this;
            KISSY.ready(function(S) {
                var context = self.get('el'),
                    listitem = context.all('.listitem');
                    
                //显示隐藏商家信息和收藏按钮
                listitem.on('mouseenter mouseleave',function(e){
                    var listitem = S.one(S.DOM.parent(e.target,'.listitem') || e.target),
                        pic_panel = S.one('.pic-panel', listitem),
                        fav_panel= S.one('.hover-panel', pic_panel);
                    if(e.type==='mouseenter'){
                        S.one(this).addClass('listitem-hover');
                        if(fav_panel) {
                            fav_panel.stop().animate({top:0}, 0.5, 'easeOutStrong');
                        }
                    }
                    else {
                        S.one(this).removeClass('listitem-hover');
                        if(fav_panel) {
                            S.one(fav_panel).stop().animate({top:'-20px'}, 0.5, 'easeOutStrong');
                        }
                    }
                });
            });
        },
        spliter: function(){
            var self=this;
            KISSY.ready(function(S) {
                var D = S.DOM;
                
                S.use("sizzle", function(S) {
                    var context = self.get('el'),
                        dataSpliter = context.all('[data-spliter]');
                        
                    if(!S.one('.J-srp-content')) {
                        return false;
                    }
                        
                    //分隔线的逻辑
                    //列表 : 产品标题分隔线, data-spliter = { type:'s-t-h'} 
                    //列表 : 产品与商品之间的分隔线, data-spliter = { type:'p-g-h'}    
                    //列表 : 相关与不相关的商品的分隔线, data-spliter = { type:'r-h'}
                    function Spliter(el){
                        this.insertToDom(el);
                    }
                    Spliter.prototype = {
                        insertToDom: function(el){
                            var html = this.tpl,
                                htmlObj = D.create(html);
                            D.insertBefore(htmlObj, el);
                        },
                        tpl : ''
                    }
                    
                    //产品标题分隔线 
                    function titleHSpliter(el){
                        titleHSpliter.superclass.constructor.call(this,el);
                    }

                    S.extend(titleHSpliter, Spliter, {
                        tpl : '<tr class="node-title-wrap">\
                                   <td colspan="5">\
                                       <div class="node-title product-node-title">快速比较产品</div>\
                                   </td>\
                               </tr>'
                    });
                    
                    //产品与商品之间的分隔线 
                    function PGHSpliter(el){
                        PGHSpliter.superclass.constructor.call(this,el);
                    }

                    S.extend(PGHSpliter, Spliter, {
                        tpl : '<tr class="node-title-wrap">\
                                   <td colspan="5">\
                                       <div class="node-title merchandise-node-title">直接选购</div>\
                                   </td>\
                               </tr>'
                    });
                    
                    //相关与不相关的商品的分隔线 
                    function horRSpliter(el){
                        horRSpliter.superclass.constructor.call(this,el);
                    }

                    S.extend(horRSpliter, Spliter, {
                        tpl : '<tr class="srp-spliter-list">\
                                    <td colspan="5">\
                                        <div class="srp-spliter-list-box">\
                                            <div class="srp-spliter-list-title">后续宝贝相关度较低，另起排序</div>\
                                        </div>\
                                    </td>\
                               </tr>'
                    });
                    
                    dataSpliter.each(function(item, index){
                        var data = S.JSON.parse(item.attr('data-spliter').replace(/'/g, '"'));
                        switch( data.type ) {
                            case 's-t-h' : 
                                new titleHSpliter(item);
                                break;
                            case 'p-g-h' : 
                                new PGHSpliter(item);
                                break;
                            case 'r-h' : 
                                new horRSpliter(item);
                                break;
                        }
                    });
                });
            });
        }
    }
    S.extend(listView, Brick, {
        initialize: function() {
            this.showAndHide();
            this.spliter();
        }
    });
    S.augment(listView, listView.METHODS);
    return listView;
}, {
    requires: ['brix/core/brick']
});

/* source from: >> components/noresult-filter/index.js */
KISSY.add('components/noresult-filter/index', function(S, Brick) {
    function noresultFilter() {
        noresultFilter.superclass.constructor.apply(this, arguments);
    }
    noresultFilter.METHODS = {
        historyBack: function(){
            var self=this;
            KISSY.ready(function(S) {
                var context = self.get('el'),
                    historyBtn = context.one('.history');
                    
                //显示隐藏商家信息和收藏按钮
                historyBtn.on('click',function(e){
                    history.back();
                    return false;
                });
            });
        }
    };
    S.extend(noresultFilter, Brick, {
        initialize: function() {
            this.historyBack();
        }
    });
    S.augment(noresultFilter, noresultFilter.METHODS);
    return noresultFilter;
}, {
    requires: ['brix/core/brick']
});

/* source from: >> components/p4pleft/index.js */
KISSY.use('srp/local',function(S,Local){
	if(!KISSY.Env.mods['etao/component/RecommendForSRP']){
         S.add('etao/component/RecommendForSRP', {
             fullpath: 'http://a.tbcdn.cn/apps/e/component/120918/recommend/recommendforsrp.js',
             cssfullpath:'http://a.tbcdn.cn/apps/e/component/120918/recommend/recommendforsrp.css'
         });
    }
    Local.bind('dataLoaded',function(e){
        /*
            假数据
         */
        if(e.isSuccess){//显示浏览推荐
            S.one('#J_srp_recommend').html('<div id="J_RecommendSRP"></div>');
            S.use('etao/component/RecommendForSRP', function (RecommendForSRP) {
                var config = {
                    container: '#J_RecommendSRP',//脠脻脝梅id
                    req: 'browse:record',
                    moduleSpm:  'gxh_srp_llss:1',
                    data_spm: '1002.8.23',
                    track_info: "&track_info_browse=srp_gxh_llss",
                    click: 'etao.etao_srp.llss_lltj.tab',
                    appName: "&appName=etao-srp"
                };
                new S.RecommendForSRP(config);
            });
        }else{//显示
            /*
                data-catid=""
                data-query=""
                需要替换
             */
            S.one('#J_srp_recommend').html('<div id="J_RecommendQuery" data-catid="0" data-query="abc"></div>');
            S.use('etao/component/RecommendForSRP', function (RecommendForSRP) {
                var config = {
                    container: '#J_RecommendQuery',//
                    queryRecommend: true,  //
                    req: 'browse',//
                    moduleSpm:  'gxh_srp_cx:1',//
                    data_spm: '1002.8.24',
                    track_info: "&track_info_browse=srp_gxh_cx" ,
                    click: 'etao.etao_srp.cx.tab',
                    appName: "&appName=etao-srp"
                };
               new S.RecommendForSRP(config);
            });
        }
    });
});
/* source from: >> components/pagination/index.js */
KISSY.add('components/pagination/index', function(S, Brick) {

    function param(o) {
        if (!S.isPlainObject(o)) {
            return '';
        }
        var sep = '&',eq = '=';
        var buf = [], key, val;
        for (key in o) {
            if (o.hasOwnProperty(key)) {
                val = o[key];
                if (!S.isArray(val)) {
                    buf.push(key, eq, val, sep);
                }
                else if (S.isArray(val) && val.length) {
                    for (var i = 0, len = val.length; i < len; ++i) {
                        buf.push(key,eq,val[i], sep);
                    }
                }
            }
        }
        buf.pop();
        return buf.join('');
    }
    function unparam(str) {
        if (typeof str !== 'string'
            || (str = S.trim(str)).length === 0) {
            return {};
        }
        var sep = '&',eq = '=';
        var ret = {},
            pairs = str.split(sep),
            pair, key, val,
            i = 0, len = pairs.length;

        for (; i < len; ++i) {
            pair = pairs[i].split(eq);
            key = pair[0];
            val = pair[1] || '';
            if (Object.prototype.hasOwnProperty.call(ret, key)) {
                if (S.isArray(ret[key])) {
                    ret[key].push(val);
                } else {
                    ret[key] = [ret[key], val];
                }
            } else {
                ret[key] = val;
            }
        }
        return ret;
    }
    /**
     * Pagination 鍒嗛〉
     * <br><a href="../demo/gallery/pagination/pagination.html" target="_blank">Demo</a>
     * @class Brix.Gallery.Pagination
     * @extends Brix.Brick
     */
    function Pagination() {
        Pagination.superclass.constructor.apply(this, arguments);
    }
    Pagination.ATTRS = {
        /**
         * 妯″紡锛屼紶缁熺殑绗嚑椤碉紝杩樻槸璁板綍鏉℃暟,
         * 鍒嗕负p 鍜宻锛宲鏄紶缁熸ā寮忥紝s鏄痵ize鎬诲拰妯″紡
         * @cfg {Object}
         */
        mode: {
            value: 'p'
        },
        /**
         * 椤垫暟鏄剧ず鍋忕Щ锛岄粯璁�0锛�
         * @cfg {Number}
         */
        offset:{
            value:0
        },
        /**
         * 鏄惁绮剧畝妯″紡
         * @cfg {Boolean}
         */
        simplify: {
            value: false
        },
        /**
         * 姝ラ暱
         * @cfg {Number}
         */
        step: {
            value: 7
        },
        /**
         * 绗嚑椤�
         * @cfg {Number}
         */
        index: {
            value: 1
        },
        /**
         * 姣忛〉鐨勮褰曟暟
         * @cfg {Number}
         */
        size: {
            value: 15
        },
        /**
         * 鏄惁鍙互淇敼姣忛〉璁板綍鏁�
         * @cfg {Boolean}
         */
        sizeChange: {
            value: false
        },
        /**
         * 鎬昏褰曟暟
         * @cfg {Number}
         */
        count: {
            value: 350
        },
        /**
         * 鏄惁鏈夋�昏褰曟暟
         * @cfg {Boolean}
         */
        hascount: {
            value: true
        },
        /**
         * 鏈�澶氶〉鏁�
         * @cfg {Number}
         */
        max: {
            value: false
        },
        /**
         * 鏄惁璁や负闄愬畾鏈�澶氶〉鏁�
         * @cfg {Boolean}
         */
        hasmax: {
            value: false
        },
        /**
         * 鏄惁鏄剧ず缁熻淇℃伅
         * @cfg {Boolean}
         */
        statistics: {
            value: false
        },
        /**
         * 鏄惁鏄剧ず鎬婚〉鏁�
         * @cfg {Boolean}
         */
        pageCount: {
            value: true
        },
        /**
         * 鏄惁鏈夎烦杞�
         * @cfg {Boolean}
         */
        jump: {
            value: false
        },
        /**
         * 鏄惁鐩存帴璺宠浆
         * @cfg {Boolean}
         */
        goTo: {
            value: true
        },
        /**
         * 璺宠浆URL
         * @cfg {String}
         */
        goToUrl: {
            value: null
        },
        /**
         * 鍒嗛〉鍙傛暟鍚�
         * @cfg {String}
         */
        pageName: {
            value: 'page'
        },
        /**
         * 姣忛〉璁板綍鏁板弬鏁板悕
         * @cfg {String}
         */
        pageSizeName: {
            value: 'pagesize'
        },
        /**
         * 杩炴帴璺宠浆鐨勯澶栧弬鏁�
         * @cfg {Object}
         */
        params: {
            value: false
        },
        /**
         * 鏄惁鐢ㄩ粯璁I,澶氬湪seo涓噰鐢�
         * @cfg {Boolean}
         */
        defaultUI: {
            value: true
        },
        /**
         * 姣忛〉璁板綍鏁伴泦鍚�
         * @cfg {Array}
         */
        sizes: {
            value: [10, 15, 20, 25, 30]
        },
        //url淇℃伅
        urlInfo: {
            value: {}
        },
        //鏍煎紡鍖杣rl瀛楃锛屽唴閮ㄥ弬鏁�
        formatUrl: {
            value: false
        },
        /**
         * 鏄惁鏄剧ず涓婁竴椤碉紝涓嬩竴椤电殑鏂囧瓧
         * @cfg {Boolean}
         */
        isText:{
            value:false,
        }
    };

    Pagination.EVENTS = {
        '.page-num': {
            keydown: function(e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    this._jumpPage();
                }
            }
        },
        '.btn-jump': {
            click: function(e) {
                e.preventDefault();
                this._jumpPage();
            }
        },
        'a': {
            'click': function(e) {
                var self = this,
                    target = S.one(e.currentTarget);
                if (target.hasClass('page')) {
                    e.preventDefault();
                    self.goToPage(parseInt(target.html(), 10));
                } else if (target.hasClass('page-prev')) {
                    e.preventDefault();
                    var index = self.get('index');
                    self.goToPage(index - 1);
                } else if (target.hasClass('page-next')) {
                    e.preventDefault();
                    var index = self.get('index');
                    self.goToPage(index + 1);
                }
            }
        }
    };
    Pagination.FIRES = {
        /**
         * @event beforeGotoPage
         * 璺宠浆鍓嶈Е鍙� return false 闃绘璺宠浆
         * @param {Object} e 
         * @param {Number} e.newIndex 鏂扮殑椤垫暟
         * @param {Number} e.prevIndex 鍘熼〉鏁�
         * @type {String}
         */
        beforeGotoPage:'beforeGotoPage',
        /**
         * @event goToPage
         * 璺宠浆瑙﹀彂
         * @param {Object} e 
         * @param {Number} e.index 鏂扮殑椤垫暟
         * @type {String}
         */
        goToPage:'goToPage',
        /**
         * @event gotoPage
         * 璺宠浆瑙﹀彂
         * @param {Object} e 
         * @param {Number} e.index 鏂扮殑椤垫暟
         * @type {String}
         */
        gotoPage:'gotoPage',
        /**
         * @event sizeChange
         * 姣忛〉鏄剧ず璁板綍鏁版敼鍙� 
         * @param {Object} e 
         * @param {Number} e.size 璁板綍鏁�
         * @type {String}
         */
        sizeChange:'sizeChange'
    };

    Pagination.METHODS = {
        /**
         * 椤甸潰璺宠浆鎴栬�呰Е鍙慻oToPage浜嬩欢
         * @param  {Number} page 瑕佽烦杞殑椤�
         */
        goToPage: function(page) {
            var self = this,
                ret;
            ret = self.fire('beforeGotoPage', {
                newIndex: page,
                prevIndex: self.get('index')
            });

            if (ret === false) {
                //濡傛灉杩斿洖榛樿false锛屽垯鍙栨秷鍚庣画浜嬩欢
                return;
            }

            self.set('index', page);

            if(self.setConfig({index:page})){
                return;
            }

            self.fire('goToPage', {
                index: page
            });
            self.fire('gotoPage', {
                index: page
            });
        },
        /**
         * 閰嶇疆閲嶇疆
         * @param {Object} config 閰嶇疆瀵硅薄
         * @return {Boolean} 鏄惁璺宠浆
         */
        setConfig: function(config) {
            var self = this,
                size = self.get('size');

            for (var key in config) {
                self.set(key, config[key]);
            }

            if (config.goToUrl) {
                self._setUrlInfo();
            }
            if (self.get('goTo')) {
                var url = self.doUrl();
                location.href = url;
                return true;
            }
            if (config.size && config.size != size) {
                self.fire('sizeChange', {
                    size: config.size
                });
            }
            self._destroyDropdown();
            self._resizeConfig();
            self.renderUI();
            self._getDropDown();
            return false;
        },
        /**
         * 瑙ｆ瀽url
         * @param  {String} url url瀛楃涓�
         * @return {Object}     瑙ｆ瀽鍚庣殑URL瀵硅薄
         */
        parseUrl: function(url) {
            var a = document.createElement('a');
            a.href = url;
            return {
                source: url,
                protocol: a.protocol.replace(':', ''),
                host: a.hostname,
                port: a.port,
                query: a.search,
                params: (function() { 
                    return unparam(a.search.replace(/^\?/, ''));
                })(),
                file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
                hash: a.hash.replace('#', ''),
                path: a.pathname.replace(/^([^\/])/, '/$1'),
                relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
                segments: a.pathname.replace(/^\//, '').split('/')
            };
        },
        /**
         * 鏋勫缓url
         * @return {String} url
         */
        doUrl: function() {
            var self = this,
                urlInfo = self.get('urlInfo'),
                index = self.get('index'),
                size = self.get('size'),
                pageName = self.get('pageName'),
                pageSizeName = self.get('pageSizeName'),
                returnUrl='';
            urlInfo.params[pageName] = self._offset(index);
            if (pageSizeName) {
                urlInfo.params[pageSizeName] = size;
            } else if (urlInfo.params[pageSizeName]) {
                delete urlInfo.params[pageSizeName];
            }

            if(urlInfo.protocol){
                returnUrl = urlInfo.protocol + '://' + urlInfo.host;
                if (urlInfo.port != 0 && urlInfo.port != 80) {
                    returnUrl += ':' + urlInfo.port;
                }
            }
            returnUrl += urlInfo.path + '?';
            returnUrl += param(urlInfo.params);
            if (urlInfo.hash != '') {
                returnUrl += '#' + urlInfo.hash;
            }
            return returnUrl;
        }
    };

    S.extend(Pagination, Brick, {
        initialize: function() {
            var self = this;
            self._setUrlInfo();
            //浠巙rl淇℃伅涓垵濮嬮厤缃弬鏁�
            var urlInfo = self.get('urlInfo');
            var mode = self.get('mode'),
                offset = self.get('offset'),
                pageName = self.get('pageName'),
                pageSizeName = self.get('pageSizeName');

            if (pageSizeName && urlInfo.params[pageSizeName]) {
                self.set('size', parseInt(urlInfo.params[pageSizeName], 10));
            }
            if (urlInfo.params[pageName]) {
                switch (mode) {
                case 'p':
                    self.set('index', parseInt(urlInfo.params[pageName], 10)-offset);
                    break;
                case 's':
                    var size = self.get('size');
                    self.set('index', (parseInt(urlInfo.params[pageName], 10)-(offset*size)) / size);
                    break;
                }
            }
            //瀵归厤缃弬鏁板閿�
            self._resizeConfig();
            if (self.get('defaultUI')) {
                self.renderUI();
            }
            self._getDropDown();
        },
        destructor: function() {
            this._destroyDropdown();
        },
        renderUI: function() {
            var self = this,
                mode = self.get('mode'),
                formatUrl = self.get('formatUrl'),
                index = self.get('index'),
                max = self.get('max'),
                step = Math.min(self.get('step'),max),
                size = self.get('size'),
                count = self.get('count'),
                hascount = self.get('hascount'),
                pageCount = self.get('pageCount'),
                isText = self.get('isText');
            var arrHTML = [];

            //render statistics
            if (self.get('statistics')) {
                arrHTML.push('<div class="pagination-info"><span>褰撳墠</span><span class="b">' + (count == 0 ? 0 : ((index - 1) * size + 1)) + '-' + Math.min(index * size, count) + '</span><span>鏉�</span><span class="mr">鍏�</span><span class="b">' + count + '</span><span>鏉�</span><span class="mr">姣忛〉灞曠幇</span>');
                if (self.get('sizeChange')) {
                    var sizes = self.get('sizes');
                    arrHTML.push('<div class="dropdown">' + '<span class="dropdown-hd">' + '<span class="dropdown-text" value="' + S.indexOf(size, sizes) + '">' + size + '</span>' + '</span>' + '<ul class="dropdown-list dropdown-list-noicon">');
                    S.each(sizes, function(s, i) {
                        arrHTML.push('<li class="dropdown-item' + (s == size ? ' dropdown-itemselected' : '') + '"><span value="' + i + '">' + s + '</span></li>');
                    });
                    arrHTML.push('</ul></div>');
                } else {
                    arrHTML.push('<span class="b">' + size + '</span>')
                }
                arrHTML.push('<span>鏉�</span></div>');
            }

            //pages
            arrHTML.push('<div class="pagination-pages"><div class="pagination-page">');

            if (index > 1) {
                arrHTML.push('<a title="涓婁竴椤�" href="' + formatUrl.replace('{$p}',  self._offset(index - 1)) + '" class="page-prev"><i class="iconfont">&#403</i>'+(isText?'<span>涓婁竴椤�</span>':'')+'</a>');
            }
            if (self.get('simplify')) {
                arrHTML.push('<span class="page-simply">' + index + '/' + max + '</span>');
            } else {
                var start = Math.max(1, index - parseInt(step / 2));
                var end = Math.min(max, start + step - 1);
                start = Math.max(1, end - step + 1);

                if (start >= 3) {
                    arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', self._offset(1)) + '" title="绗�1椤�">1</a>');
                    arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', self._offset(2)) + '" title="绗�2椤�">2</a>');
                    if (start > 3) {
                        arrHTML.push('<span class="page-split">...</span>');
                    }
                } else if (start == 2) {
                    arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', self._offset(1)) + '" title="绗�1椤�">1</a>');
                }

                for (var i = start; i <= end; i++) {
                    if (i === index) {
                        arrHTML.push('<span class="page-cur">' + i + '</span>');
                    } else {
                        arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', self._offset(i)) + '" title="绗�' + i + '椤�">' + i + '</a>');
                    }
                }
                if (end + 2 <= max) {
                    arrHTML.push('<span class="page-split">...</span>');
                    if (hascount) {
                        arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', self._offset(max)) + '" title="绗�' + max + '椤�">' + max + '</a>');
                    }
                } else if (end < max) {
                    arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', self._offset(max)) + '" title="绗�' + max + '椤�">' + max + '</a>');
                }
            }

            if (index != max) {
                arrHTML.push('<a title="涓嬩竴椤�" href="' + formatUrl.replace('{$p}', self._offset(index + 1)) + '" class="page-next">'+(isText?'<span>涓嬩竴椤�</span>':'')+'<i class="iconfont">&#402</i></a>');
            }
            arrHTML.push('</div>');
            if (hascount && pageCount) {
                arrHTML.push('<div class="pagination-count"><span>鍏�</span><span class="b">' + max + '</span><span>椤�</span></div>');
            }
            //render Jump
            if (self.get('jump')) {
                arrHTML.push('<div class="pagination-form"><span>鍚戠</span><input class="page-num" value="' + Math.min(max, index + 1) + '" name="page" type="text"><span>椤�</span><a class="btn-jump btn btn-size25">璺宠浆</a></div>');
            }

            arrHTML.push('</div>');

            self.get('el').html(arrHTML.join(''));

        },
        /**
         * 璁＄畻椤垫暟鐨勫亸绉�
         * @param  {Number} index 椤垫暟
         * @return {Number} 鍋忕Щ鍚庣殑鍊�
         * @private
         */
        _offset:function(index){
            var self = this,
                mode = self.get('mode'),
                offset = self.get('offset');
            switch(mode){
                case 'p':
                    return index+offset;
                case 's':
                    var size = self.get('size');
                    return size*(index+offset);
                default:
                    return index+offset;
            }
        },
        _getDropDown: function() {
            var self = this;
            if (self.get('sizeChange') && self.get('statistics')) {
                var dropdownNode = self.get('el').one('.dropdown');
                if (dropdownNode) {
                    var id = dropdownNode ? dropdownNode.attr('id') : false;
                    if (id && self.pagelet) {
                        self.pagelet.ready(function(){
                            self.dropdown = self.pagelet.getBrick(id);
                            if(self.dropdown){
                                self._bindDropdownSizeChange();
                            }
                            else{
                                self._createDropdown();
                            }
                        }); 
                    }else{
                        self._createDropdown();
                    }
                }
            }

        },
        _createDropdown: function() {
            var self = this;
            S.use('brix/gallery/dropdown/', function(S, Dropdown) {
                self.dropdown = new Dropdown({
                    tmpl: self.get('el').one('.dropdown')
                });
                self._bindDropdownSizeChange();
            });
        },
        _bindDropdownSizeChange:function(){
            var self = this;
            self.dropdown.on('selected', function(ev) {
                self.setConfig({
                    index:1,
                    size: ev.text
                });
            });
        },
        _destroyDropdown: function() {
            var self = this;
            if (self.dropdown) {
                self.dropdown.destroy();
                self.dropdown = null;
            }
        },
        /**
         * 璺宠浆
         * @private
         */
        _jumpPage: function() {
            var self = this,
                pageNumNode = this.get('el').one('.page-num'),
                page = parseInt(pageNumNode.val(), 10),
                max = self.get('max'),
                index = self.get('index');
            if (isNaN(page) || page < 1 || page > max || page == index) {
                pageNumNode[0].select();
                return;
            }
            this.goToPage(page);
        },
        /**
         * 璁剧疆urlInfo
         * @private
         */
        _setUrlInfo: function() {
            var self = this,
                params = self.get('params');
            if (!self.get('goToUrl')) {
                self.set('goToUrl', location.href);
            }

            var urlInfo = self.parseUrl(self.get('goToUrl'));

            //鍚堝苟澶栭儴鍙傛暟
            if (params) {
                S.each(params, function(v, k) {
                    urlInfo.params[k] = v;
                });
            }
            S.log(urlInfo.params.s);
            self.set('urlInfo', urlInfo);
            S.log(urlInfo.params.s);
        },
        /**
         * 閰嶇疆绾犻敊锛屽浼犲叆鐨勯厤缃繘琛屽閿欏鐞�
         * @private
         */
        _resizeConfig: function() {
            var self = this,
                index = self.get('index'),
                hascount = self.get('hascount'),
                
                size = self.get('size'),
                count = self.get('count'),
                max = self.get('max'),
                hasmax = self.get('hasmax'),
                pageName = self.get('pageName'),
                pageSizeName = self.get('pageSizeName');

            if (!hascount) {
                var step = self.get('step');
                if (index >= step) {
                    count = size * (index + 1);
                } else {
                    count = size * step;
                }
                self.set('count', count);
            }
            if (!hasmax) {
                max = Math.ceil(count / size);
            } else {
                max = Math.min(Math.ceil(count / size), max);
            }

            self.set('max', max);
            index = Math.min(index, max);
            self.set('index', index);

            if (count === 0) {
                self.set('max', 1);
                self.set('index', 1);
            }
            self.set('formatUrl', self.doUrl().replace(pageName + '=' + self._offset(index), pageName + '={$p}'));
        }
    });
    S.augment(Pagination, Pagination.METHODS);
    return Pagination;
}, {
    requires: ["brix/core/brick"]
});

/* source from: >> components/popup/index.js */
KISSY.add('components/popup/index', function(S, Brick){
    function Popup() {
        Popup.superclass.constructor.apply(this, arguments);
    }

    Popup.ATTRS = {
        name : {
            value : 'Popup'    
        },
        activeClass :  {
            value : 'module-popup-active'
        },
        delay : {
            value : 0
        },
        triggerType :  {
            value : 'hover'
        },
        effect :  {
            value : 'fade'
        },
        duration : {
            value : 0.3
        },
        dataUrl : {
            varlue : ''
        },
        dataType : {
            value : 'json'
        },
        dataFormat : {
            value : 'json'
        },
        dataKey : {
            value : 'panel'
        },
        angleType : {
            value : ''
        }
    };

    Popup.METHODS = {
        removeTimer : function(){
            if(this.timer)
                clearTimeout(this.timer);
            this.timer = 0;
        },
        hide : function(delay, effect){
            var module = this,
                modulePopup = this.modulePopup,
                panelPopup = modulePopup.children('.panel-popup'),
                activeClass = this.get('activeClass'),
                delay = this.get('delay'),
                duration = this.get('duration');

            delay = delay || 0;
            this.removeTimer();
            this.timer = setTimeout(function(){

                panelPopup[effect](duration, function(){
                    if(modulePopup.hasClass(activeClass))
                        modulePopup.removeClass(activeClass);                        
                });

            },delay);
        },
        show : function(delay, effect){
            var module = this,
                modulePopup = this.modulePopup,
                panelPopup = modulePopup.children('.panel-popup'),
                activeClass = this.get('activeClass'),
                delay = this.get('delay'),
                duration = this.get('duration');

            delay = delay || 0;
            this.removeTimer();
            this.timer = setTimeout(function(){
                if(!modulePopup.hasClass(activeClass))
                    modulePopup.addClass(activeClass);
                    panelPopup[effect](duration, function(){
                        if(panelPopup.css('display'))
                            panelPopup.css('display','');  
                    });
            },delay);
        },
        createPanelAndShow : function(delay, effect){
             var $ = S.all, D = S.DOM,
                module = this,
                modulePopup = module.modulePopup,
                labelPopup = modulePopup.children('.label-popup'),
                panelPopup = $('<div class="panel-popup" style="display:none;"></div>'),
                angle = {
                    up : '<i class="angle angle-up"><i class="angle-outer"></i><i class="angle-inner"></i></i>',
                    down : '<i class="angle angle-down"><i class="angle-outer"></i><i class="angle-inner"></i></i>',
                    right : '<i class="angle angle-right"><i class="angle-outer"></i><i class="angle-inner"></i></i>',
                    left : '<i class="angle angle-left"><i class="angle-outer"></i><i class="angle-inner"></i></i>'
                },
                _dataUrl = module.get('dataUrl'),
                _dataType = module.get('dataType'),
                _dataKey = module.get('dataKey'),
                _dataFormat = module.get('dataFormat'),
                _angleType = module.get('angleType');

            if(_dataUrl)
                S.io({
                    url : _dataUrl,
                    dataType : _dataType,
                    success : function(data){
                        var _html = '';
                        
                        if(_dataFormat == 'script' && eval(_dataKey) && eval(_dataKey) !== 'error')
                            _html += eval(_dataKey);  
                        
                        if(data){
                             if(_dataFormat == 'html')
                                _html += data;  

                            if(_dataFormat == 'json' && data[_dataKey])
                                _html += data[_dataKey];
                        }
                       
                        if(_html){
                            if(_angleType) _html = angle[_angleType] + _html;
                            panelPopup.html(_html);
                            modulePopup.append(panelPopup);
                            module.show(delay, effect);
                            S.modulePopup = module;
                        } 
                    }             
                });
        }
    };

    Popup.EVENTS = {
        '.module-popup' : {
            mouseenter : function(e){
                var module = this,
                    panelPopup = module.modulePopup.children('.panel-popup'),
                    triggerType = module.get('triggerType'),
                    effect = module.effects[module.get('effect')][0],
                    delay = module.get('delay');

                if(triggerType === 'hover'){
                    if(S.modulePopup){
                        S.modulePopup.hide(0, 'hide');
                        S.modulePopup = null;
                    }
                    if(!panelPopup.length) {
                        module.createPanelAndShow(delay, effect);
                    }else{
                        module.show(delay, effect);
                        S.modulePopup = module;
                    }
                }
            },
            mouseleave : function(e){
                var module = this,
                    triggerType = module.get('triggerType'),
                    effect = module.effects[module.get('effect')][1],
                    delay = module.get('delay');

                if(triggerType === 'hover'){
                    module.hide(delay, effect);
                    S.modulePopup = null;
                }
            }
        },
        '.label-popup' : {
            click :function(e){
                var module = this,
                    panelPopup = module.modulePopup.children('.panel-popup'),
                    triggerType = module.get('triggerType'),
                    effects = module.effects[module.get('effect')],
                    effect = effects[1],
                    delay = module.get('delay');

                if(triggerType === 'click'){
                    if(S.modulePopup){
                        S.modulePopup.hide(0, 'hide');
                        S.modulePopup = null;
                    }
                    if(!panelPopup.length) {
                        module.createPanelAndShow(delay, effect);
                    }else{
                        if(panelPopup.css('display') == 'none'){
                            effect = effects[0];
                            module.show(delay, effect);
                            S.modulePopup = module;
                        }else{
                            module.hide(delay, effect);
                            S.modulePopup = null;
                        }
                    }

                }
            }
        }
    };

    S.extend(Popup, Brick, {
        initialize: function() {
            var $ = S.all, D = S.DOM,
                module = this.get('el');
            this.timer = 0;
            this.effects = {
                'normal' : ['show', 'hide'],
                'fade':['fadeIn', 'fadeOut'],
                'slide':['slideDown', 'slideUp']
            };
            this.modulePopup = module.children('.module-popup');
        }
    });
    S.augment(Popup, Popup.METHODS);
    return Popup;
    
}, {
    requires: ['brix/core/brick']
});

/* source from: >> components/pricetrends/index.js */
// 生成价格曲线
KISSY.add('components/pricetrends/index', function(S, Popup, JSON, Charts) {
    function PriceTrends() {
        PriceTrends.superclass.constructor.apply(this, arguments);
    }
    PriceTrends.ATTRS = {
        delay: {
            value: 500
        }
    };

    function timeToStr(time) {
        var date, year, month, day;

        date = new Date(time);
        year = date.getFullYear();
        month = date.getMonth() + 1;
        day = date.getDate();

        return year + '.' +
            (month > 9 ? '' : '0') + month + '.' +
            (day > 9 ? '' : '0') + day;
    }
    function formatDate(data) {
        var i, strs;
        for(i=0; i<data.length; i++) {
            strs = data[i][0].split('-');

            if (strs.length !== 3) {
                data.splice(i--, 1);
            } else {
                data[i][0] = new Date(
                    parseInt(strs[0], 10),
                    parseInt(strs[1], 10) - 1,
                    parseInt(strs[2], 10)
                ).getTime();
            }
        }
    }
    function tidyData(data) {
        var i, ret, len, today, last60, pTime;

        formatDate(data);

        len = data.length;
        if (!len) return;

        today = data[len-1][0];
        last60 = today - 60 * 24 * 3600 * 1000;

        // find start point
        for (i=0; i<data.length; i++) {
            pTime = data[i][0];

            if (pTime < last60) {
                continue;
            }
            if (pTime > last60 && i !== 0) {
                pTime = last60;
                ret = [[timeToStr(last60)], [data[i-1][1]]];
                break;
            }
            ret = [[timeToStr(data[i][0])], [data[i][1]]];
            i++;
            break;
        }

        // complete xAxis
        for (; i<data.length; i++) {
            pTime += 24 * 3600 * 1000;

            if (data[i][0] !== pTime) {
                ret[1].push(data[--i][1]);
            } else {
                ret[1].push(data[i][1]);
            }

            ret[0].push(timeToStr(pTime));
        }

        return ret;
    }
    function addChart(panel, data) {
        var id, node;

        node = panel.one('.panel-popup');
        id = S.guid('J_PT');
        node.one('.panel-chart').attr('id', id);

        new Charts({
            parent_id: id,
            config: {
                configData: '<chart v="1.0" type="line"><data shape="0" node="1" area="0"><colors normals="0xF93715" overs="0xF93715"/><node mode="1"><normal radius="2" thickness="1"/><over min_radius="0" max_radius="4" max_thickness="1"/></node></data></chart>',
                chartData: '<chart><data><indexAxis labels="' + data[0].join(',') + '" name="日期："/><sets name="价格："><set values="' + data[1].join(',') + '"></set></sets></data></chart>'
            }
        });

        var prices, max, min;
        prices = data[1];
        max = Math.max.apply(Math, prices);
        min = Math.min.apply(Math, prices);
        node.append('<p class="tips">最高价：' + max + '元，最低价：' + min + '元</p>');
    }

    S.extend(PriceTrends, Popup, {
        createPanelAndShow: function(delay, effect){
            var data = this.get('el').attr('bx-data');
            if (!data) return;

            var left = this.modulePopup.offset().left + 380 - RP.pageWidth;
            var style = left > 200 ? ' style="margin-left: -' + left + 'px"' : '';
            this.modulePopup.append('<div class="panel-popup"' + style + '><i class="angle angle-up"><i class="angle-outer"></i><i class="angle-inner"></i></i><div class="panel-chart"></div></div>');

            data = tidyData(S.JSON.parse(data.replace(/'/g, '"')));
            addChart(this.modulePopup, data);
            this.show(delay, effect);
            S.modulePopup = this;
        }
    });
    return PriceTrends;
}, {
    requires: ['components/popup/index', 'json', 'components/charts/index']
});

/* source from: >> components/property/index.js */
/**
 * 从下面的jquery插件移植过来
 * jQuery Plugin to obtain touch gestures from iPhone, iPod Touch and iPad, should also work with Android mobile phones (not tested yet!)
 * Common usage: wipe images (left and right to show the previous or next image)
 * 
 * @author Andreas Waltl, netCU Internetagentur (http://www.netcu.de)
 * @version 1.1.1 (9th December 2010) - fix bug (older IE's had problems)
 * @version 1.1 (1st September 2010) - support wipe up and wipe down
 * @version 1.0 (15th July 2010)
 */

KISSY.add("touchswip", function(S, Event) {
    function main(el, settings) {
        var config = {
            min_move_x : 20,
            min_move_y : 20,
            wipeLeft : function() {
            },
            wipeRight : function() {
            },
            wipeUp : function() {
            },
            wipeDown : function() {
            },
            preventDefaultEvents : true
        };
        if (settings) {
            config = KISSY.merge(config, settings);
        }
        
        el.each(function(v, k) {
            var obj = this[0];
            var startX;
            var startY;
            var isMoving = false;

            function cancelTouch() {
                obj.removeEventListener('touchmove', onTouchMove);
                startX = null;
                isMoving = false;
            }

            function onTouchMove(e) {
                if (config.preventDefaultEvents) {
                    e.preventDefault();
                }
                if (isMoving) {
                    var x = e.touches[0].pageX;
                    var y = e.touches[0].pageY;
                    var dx = startX - x;
                    var dy = startY - y;
                    if (Math.abs(dx) >= config.min_move_x) {
                        cancelTouch();
                        if (dx > 0) {
                            config.wipeLeft(e, obj);
                        } else {
                            config.wipeRight(e, obj);
                        }
                    } else if (Math.abs(dy) >= config.min_move_y) {
                        cancelTouch();
                        if (dy > 0) {
                            config.wipeDown(e, obj);
                        } else {
                            config.wipeUp(e, obj);
                        }
                    }
                }
            }

            function onTouchStart(e) {
                if (e.touches.length == 1) {
                    startX = e.touches[0].pageX;
                    startY = e.touches[0].pageY;
                    isMoving = true;
                    obj.addEventListener('touchmove', onTouchMove, false);
                }
            }

            if ('ontouchstart' in document.documentElement) {
                obj.addEventListener('touchstart', onTouchStart, false);
            }
        });
    }

    return main;
}, {
    requires : ["event"]
});

KISSY.add('components/property/index', function(S, Brick, Switchable, Mustache, Touchswip, Router) {
    var DOM = S.DOM;
    
    var cateTemplate  = "";
    cateTemplate += "<li class='pf-slide-item pf-slide-item-{{id}}' filterid='{{id}}' filtertype='pf-{{id}}' filtername='{{name}}'>";
    cateTemplate += "    <div class='pf-content'>";
    cateTemplate += "        <div class='filter-title'>{{name}}</div>";
    cateTemplate += "        {{#hasImage}}";
    cateTemplate += "        <div class='filter-items pf-image pf-fixed-height clear-fix'>";
    cateTemplate += "            {{#imgitems}}";
    cateTemplate += "            <a data-stat='{{stat}}' href='{{url}}' class='filter-item fp-item-{{id}} pf-image-item' filterid='{{id}}' filtername='{{name}}' title='{{name}}'>";
    cateTemplate += "                <img src='{{image}}'>";
    cateTemplate += "            </a>";
    cateTemplate += "            {{/imgitems}}";
    cateTemplate += "        </div>";
    cateTemplate += "        {{/hasImage}}";
    cateTemplate += "        {{#hasGroupNoImage}}";
    cateTemplate += "        <div class='filter-items pf-fixed-height clear-fix pf-itemcotainer-{{id}}'>";
    cateTemplate += "            {{#items}}";
    cateTemplate += "                <a data-stat='{{stat}}' href='{{url}}' class='filter-item fp-item-{{id}}' filterid='{{id}}' filtername='{{name}}' title='{{name}}'>{{name}}</a>";
    cateTemplate += "            {{/items}}";
    cateTemplate += "        </div>";
    cateTemplate += "        {{/hasGroupNoImage}}";
    cateTemplate += "        {{#hasgroup}}";
    cateTemplate += "        <div id='pf-band-cate' class='pf-band-more pf-switch'>";
    cateTemplate += "            <ul class='ks-switchable-nav'>";
    cateTemplate += "                {{#cate}}";
    cateTemplate += "                <li>{{group_name}}<i class='iconfont'>&#404;</i></li>";
    cateTemplate += "                {{/cate}}";
    cateTemplate += "            </ul>";
    cateTemplate += "           <div class='ks-switchable-content'>";
    cateTemplate += "               {{#cate}}";
    cateTemplate += "               <div style='display: none'>";
    cateTemplate += "                   <div class='pf-switch-ul clear-fix pf-itemcotainer-{{id}}'>";
    cateTemplate += "                       {{#items}}";
    cateTemplate += "                           <a data-stat='{{stat}}' href='{{url}}' class='filter-item fp-item-{{id}}' filterid='{{id}}' filtername='{{name}}' title='{{name}}'>{{name}}</a>";
    cateTemplate += "                       {{/items}}";
    cateTemplate += "                   </div>";
    cateTemplate += "               </div>";
    cateTemplate += "               {{/cate}}";
    cateTemplate += "            </div>";
    cateTemplate += "        </div>";
    cateTemplate += "        {{/hasgroup}}";
    cateTemplate += "        {{^hasgroup}}";
    cateTemplate += "        <div class='filter-items clear-fix pf-itemcotainer-{{id}}'>";
    cateTemplate += "            {{#items}}";
    cateTemplate += "                <a data-stat='{{stat}}' href='{{url}}' class='filter-item fp-item-{{id}}' filterid='{{id}}' filtername='{{name}}' title='{{name}}'>{{name}}</a>";
    cateTemplate += "            {{/items}}";
    cateTemplate += "        </div>";
    cateTemplate += "        {{/hasgroup}}";
    cateTemplate += "    </div>";
    cateTemplate += "</li>";

    
    var itemTemplate  = "";
    itemTemplate += "{{#items}}";
    itemTemplate += "    <a data-stat='{{stat}}' href='{{url}}' class='filter-item newadded fp-item-{{id}}' filterid='{{id}}' filtername='{{name}}' title='{{name}}'>{{name}}</a>";
    itemTemplate += "{{/items}}";
    
    var selectedTemplate  = "";
    selectedTemplate += "    <div class='pf-st-slide'>";
    selectedTemplate += "        <div class='pf-st-wrap'>";
    selectedTemplate += "            {{#fp_cate}}";
    selectedTemplate += "            <span class='pf-st-item pf-{{id}}' filterid='{{id}}'>";
    selectedTemplate += "                {{#selectlist}}";
    selectedTemplate += "                <a href='{{url}}' class='selected-item pf-selid-{{id}}' filterid='{{id}}' filtername='{{name}}'>{{name}}<span class='del-btn'></span></a>";
    selectedTemplate += "                {{/selectlist}}";
    selectedTemplate += "            </span>";
    selectedTemplate += "            {{/fp_cate}}";
    selectedTemplate += "            {{#otherSelect}}";
    selectedTemplate += "            <span class='pf-st-item pf-other' filterid='other'>";
    selectedTemplate += "                <a href='{{url}}' class='selected-item pf-selid-{{type}} {{type}}-item' filterid='{{type}}' filtername='{{name}}'>{{name}}<span class='del-btn'></span></a>";
    selectedTemplate += "            </span>";
    selectedTemplate += "            {{/otherSelect}}";
    selectedTemplate += "            <a href='{{allurl}}' class='pf-st-clearall'><span>清除全部</span></a>";
    selectedTemplate += "        </div>";
    selectedTemplate += "    </div>";
    selectedTemplate += "    <a href='#' class='pf-st-indicator pf-st-prev'></a>";
    selectedTemplate += "    <a href='#' class='pf-st-indicator pf-st-next'></a>";


    function propertyFilter() {
        propertyFilter.superclass.constructor.apply(this, arguments);
    }
    
    propertyFilter.ATTRS = {
        mode:{
            value:1
        },
        templatePath:{
            cate: "components/property/template-cate.html",
            item: "components/property/template-item.html"
        },
        template:{
            cate: "",
            item: ""
        },
        isCssAnim: false,
        objMap:null,
        ajaxtimeout: null,
        data: {},
        curLink: "",
        containerWidth: 0,
        minHeight:105,
        maxHeight:280,
        slideNum: 0,
        slidePageNum: 0,
        slidePerPage: 0,
        slideDefaultWidth: 280
    }
    
    propertyFilter.METHODS = {
        getTemplate:function(){
            propertyFilter.ATTRS.template.cate = cateTemplate;
            propertyFilter.ATTRS.template.item = itemTemplate;
            propertyFilter.ATTRS.template.selected = selectedTemplate;
            return;
            /*
            S.io({
                url: propertyFilter.ATTRS.templatePath.cate,
                cache: false,
                success: function(html){
                    propertyFilter.ATTRS.template.cate = html;
                }
            });
            S.io({
                url: propertyFilter.ATTRS.templatePath.item,
                cache: false,
                success: function(html){
                    propertyFilter.ATTRS.template.item = html;
                }
            });*/
        },
        updateUrl: function(data) {
            var newData =  KISSY.clone(data.fp_cate);
            for( var i in newData){
                var cateItem = newData[i];
                for( var j in cateItem.items){
                    var item = cateItem.items[j];
                    var updateItem = S.one(".fp-item-" + item.id);
                    if(updateItem && updateItem.length > 0){
                        updateItem.attr("href", item.url).attr("data-stat", item.stat);
                    }
                }
                for( var k in cateItem.selectlist){
                    var selecteditem = cateItem.selectlist[k];
                    var updateItem = S.one(".pf-selid-" + selecteditem.id);
                    if(updateItem && updateItem.length > 0){
                        updateItem.attr("href", selecteditem.url);
                    }
                }
            }
        },
        mergeData: function(data) {
            var me = this;
            var newData =  KISSY.clone(data.fp_cate);
            
            var restructData = {};
            for( var i in newData){
                restructData[newData[i].id] = newData[i];
            }
            
            function getAddSlide(){
                var returnData = {};
                for( var k in restructData){
                    var slideitem = S.one(".pf-slide-item-" + restructData[k].id);
                    if(slideitem == null || slideitem.length == 0){
                        returnData[restructData[k].sort] = restructData[k];
                        delete restructData[k];
                    }
                }
                return returnData;
            }
            function getDeleteSlide(){
                var objMap = me.getObjMap();
                var slideItems = objMap.pfSlideItem;
                for( var j = 0 ; j < slideItems.length ; j++ ){
                    var item = S.one(slideItems[j]);
                    if(restructData[item.attr("filterid")] == undefined){
                        item.addClass("pf-deleteCate");
                        delete restructData[item.attr("filterid")];
                    }
                }
                return "";
            }
            function getAddItems(){
                var addArray = {};
                function judgeAdd(containerObj){
                    var containerid = containerObj.id;
                    addArray[containerid] = {"items":[]};
                    for(var n in containerObj.items){
                        var curitem = containerObj.items[n];
                        var obj = S.one("#J_propertyFilter .pf-itemcotainer-" + containerid + " .fp-item-" + curitem.id);
                        if(obj == null){
                            addArray[containerid].items.push(curitem);
                        }
                    }
                }
                for(var i in restructData){
                    var curslide = restructData[i];
                    if(curslide["cate"]){
                        for(var k in curslide.cate){
                            judgeAdd(curslide.cate[k]);
                        }
                    }
                    if(curslide["items"]){
                        judgeAdd(curslide);
                    }
                }
                return addArray;
            }
            function getDeleteItems(){
                var newData = {};
                for(var i in restructData){
                    var curslide = restructData[i];
                    if(curslide["cate"]){
                        for(var k in curslide.cate){
                            var curitems = curslide.cate[k].items;
                            for(var m in curitems){
                                var curitem = curitems[m];
                                newData[curitem.id] = curitem;
                            }
                        }
                    }
                    if(curslide["imgitems"]){
                        for(var s in curslide.imgitems){
                            var curitem = curslide.imgitems[s];
                            newData[curitem.id] = curitem;
                        }
                    }
                    if(curslide["items"]){
                        for(var n in curslide.items){
                            var curitem = curslide.items[n];
                            newData[curitem.id] = curitem;
                        }
                    }
                }
                var items = S.all(".filter-item");
                for( var j = 0 ; j < items.length ; j++ ){
                    var item = S.one(items[j]);
                    if(newData[item.attr("filterid")] == undefined){
                        item.addClass("pf-deleteItem");
                    }
                }
                return "";
            }
            
            var returnData = {
                "addCate":{"fp_cate": getAddSlide()},
                "deleteCate":getDeleteSlide(),
                "additem":getAddItems(),
                "deleteitem":getDeleteItems()
            }
            
            return returnData;
        },
        getQueryParam: function(){
            var locationObj = Router.pathToObject(window.location.href);
            locationObj.params.ppath = this.getPPath();
            if(locationObj.params.ppath == ""){
                delete locationObj.params.ppath;
            }
            var priceitem = S.one(".priceRange-item");
            if(priceitem && priceitem.length > 0){
                if(priceitem.attr("link")){
                    var priceLink = priceitem.attr("link");
                    var priceObj = Router.pathToObject(priceLink);
                    if(priceObj.params.start_price){
                        locationObj.params.start_price = priceObj.params.start_price;
                    }
                    if(priceObj.params.end_price){
                        locationObj.params.end_price = priceObj.params.end_price;
                    }
                }
            }else{
                delete locationObj.params.start_price;
                delete locationObj.params.end_price;
            }
            return Router.objectToPath(locationObj);
        },
        getPPath: function(){
            var selectedList = S.all("#J_propertyFilter .filter-item.selected");
            var query = {};
            selectedList.each(function(){
                var filterName = S.one(S.DOM.parent(this, ".pf-slide-item")).attr("filterid");
                if(filterName == 30000){
                }else if(query[filterName] == undefined){
                    query[filterName] = this.attr("filterid");
                }else{
                    query[filterName] += "," + this.attr("filterid");
                }
            });
            var ppath = "";
            for(var i in query ){
                ppath += i + ":" + query[i] + ";";
            }
            return ppath.substring(0, ppath.length - 1);
        },
        sendAjax: function() {
            this.setAnchor();
            
            if(true){
                Router.navigate(this.getQueryParam());
            }else{
                var localhost = window.location.origin;
                var suburl = propertyFilter.ATTRS.curLink.replace(localhost, "");
                var url = "http://fashion.s.etao.com" + suburl;
                var param = {
                    ppath:this.getPPath(),
                    from:"srpAjax",
                    renderType:"json",
                    fromscombo:"yes",
                    mdList:"compass,compass_json",
                    tbpm:"t"
                };
                var debug = false;
                if(debug == true){
                    param.q = "女装";
                    param.start_price=300;
                    param.end_price=900;
                    delete param.ppath;
                    url = "http://fashion.s.etao.com/search";
                }
                var me = this;
                S.io({
                    type:"get",
                    url: url,
                    data: param,
                    success: function(data){
                        if(data.status == "1"){
                            console.log(data.resultList.compass_json.html);
                            me.setData(data.resultList.compass_json.html);
                        }
                    },
                    dataType: "jsonp"
                })
            }
        },
        setData: function(dataString) {
            var me = this;
            var data = KISSY.JSON.parse(dataString);
            
            if(data.fp_cate.length == 0){
                return;
            }
            this.updateUrl(data);
            var filterData = this.mergeData(data);
            
            function addSlide(filterData){
                if(filterData && filterData.addCate && filterData.addCate.fp_cate){
                    var initBandCate = true;
                    if(S.one("#pf-band-cate") && S.one("#pf-band-cate").length > 0){
                        initBandCate = false;
                    }
                    var cate = filterData.addCate.fp_cate;
                    for(var k in cate){
                        var html = Mustache.to_html(propertyFilter.ATTRS.template.cate, cate[k]);
                        var insertObj = S.one("#J_propertyFilter .pf-slide-item:eq(" + (k-1) + ")");
                        if(insertObj){
                            var ST = DOM.create(html);
                            S.one(ST).addClass("new-slide-item");
                            S.DOM.insertBefore(ST,insertObj[0]);
                        }else{
                            S.one(".pf-slide").append(html);
                        }
                    }
                    
                    var newCate = S.all(".pf-slide-item");
                    newCate.removeClass("new-slide-item");
                    me.animateFunc(newCate, {
                        "margin-left":0
                    }, function(obj){});
                    me.calWidth();
                    
                    if(initBandCate && S.one("#pf-band-cate") && S.one("#pf-band-cate").length > 0){
                        var Tabs = Switchable.Tabs;
                        var tabs = new Tabs('#pf-band-cate', {
                            triggerType: "click",
                            switchTo : 0
                        });
                    }
                }
            }
            function removeSlide(){
                me.animateFunc(S.all(".pf-deleteCate"), {
                    opacity:0,
                    "margin-left":-S.all(".pf-deleteCate").width()
                }, function(obj){
                    obj.remove();
                    me.calWidth();
                });
            }
            function addItems(filterData){
                for(var i in filterData.additem){
                    if(filterData.additem[i].items.length != 0){
                        var html = Mustache.to_html(propertyFilter.ATTRS.template.item, filterData.additem[i]);
                        S.one(".pf-itemcotainer-" + i).append(html);
                    }
                }
                var addLength = S.all(".filter-item.newadded").length;
                me.animateFunc(S.all(".filter-item.newadded"), {
                    "margin-left":20
                }, function(obj){
                    obj.removeClass("newadded");
                    if(--addLength == 0){
                        var curSlideMore = S.one(".pf-slide-item.norelative");
                        if(curSlideMore && curSlideMore[0]){
                            me.showMore(curSlideMore[0]);
                        }
                    }
                });
                return;
            }
            function removeItems(){
                me.animateFunc(S.all(".pf-deleteItem:not(.pf-image-item)"), {
                    opacity:0,
                    "margin-left":-50
                }, function(obj){
                    obj.remove();
                    var curSlideMore = S.one(".pf-slide-item.norelative");
                    if(curSlideMore && curSlideMore[0]){
                        me.showMore(curSlideMore[0]);
                    }
                });
            }
            function resetSelected(){
                var html = Mustache.to_html(propertyFilter.ATTRS.template.selected, data);
                S.one(".pf-selected").html(html);
                var objMap = me.getObjMap(true);
                S.one(".pf-st-slide").css("width", objMap.pfPanel.width() - 100);
                me.checkSelectedStatus(true);
            }
            addSlide(filterData);
            removeSlide();
            addItems(filterData);
            removeItems();
            resetSelected();
        },
        setAnchor: function(){
            var mainTop = S.one(".main").offset().top;
            var winScrollTop = S.one(window).scrollTop();

            if(winScrollTop > mainTop){
                this.animateFunc(S.one(window), {
                    scrollTop: mainTop + 1
                }, function(){});
            }
        },
        getPfHeight: function (){
            var returnHeight = propertyFilter.ATTRS.minHeight;
            var objMap = this.getObjMap();
            if(objMap.pfSelected.css("display") != "none"){
                returnHeight +=  objMap.pfSelected.outerHeight() + parseInt(objMap.pfSelected.css("padding-top"));
            }
            return returnHeight;
        },
        getObjMap: function(force){
            if(propertyFilter.ATTRS.objMap == null || force){
                propertyFilter.ATTRS.objMap = {
                    pfObj : S.one("#J_propertyFilter"),
                    pfSlideItem: S.all(".pf-slide-item"),
                    pfSelectedItem: S.all(".selected-item"),
                    pfReplaceObj : S.one(".pf-replace"),
                    pfWrapObj : S.one("#J_propertyFilter .contentwrap"),
                    flushingSlide : S.one("#J_propertyFilter .flushingSlide"),
                    pfPanelWrap : S.one("#J_propertyFilter .pf-panel-wrap"),
                    pfPanel: S.one("#J_propertyFilter .pf-panel"),
                    pfSelected : S.one("#J_propertyFilter .pf-selected"),
                    pfclearAll : S.one("#J_propertyFilter .pf-st-clearall"),
                    pfPagination : S.one("#J_propertyFilter .pf-pagination"),
                    pfShadow : S.one("#J_propertyFilter .pf-shadow"),
                    indicator : S.all("#J_propertyFilter .pagi-indicator")
                };
            }
            return propertyFilter.ATTRS.objMap;
        },
        bindFixedEvent: function(){
            var me = this;
            function checkisFixed(){
                if(S.one('#J_propertyFilter').hasClass("property-fixed")){
                    return true;
                }
                return false;
            }
            S.Event.delegate('#J_propertyFilter','mouseenter','.pf-selected',function(e){
                if(checkisFixed() && !S.one('#J_propertyFilter').hasClass("hover")){
                    me.fixedMouseEnter();
                }
            });
            S.Event.delegate('#J_propertyFilter','mouseenter','.flushingSlide',function(e){
                if(checkisFixed()){
                    me.fixedMouseEnter();
                }
            });
            S.Event.on('#J_propertyFilter', 'mouseleave', function(e){
                if(checkisFixed()){
                    me.fixedMouseLeave();
                }
            });
        },
        fixedShow: function(){
            var me = this;
            var objMap = this.getObjMap();
            function changeDom(){
                var pfObjLeft = objMap.pfObj.offset().left;
                objMap.pfReplaceObj.height(parseInt(objMap.pfObj.height()) + parseInt(objMap.pfObj.css("margin-bottom"))).show();
                objMap.pfObj.css({"width": S.one(".wrap").width() - pfObjLeft + S.one(".wrap").offset().left});
                objMap.pfObj.addClass("property-fixed");
                if (S.UA.ie && S.UA.ie == 6) {
                    objMap.pfObj.css("top", S.one(window).scrollTop());
                }
                if(propertyFilter.ATTRS.isCssAnim){
                    objMap.pfWrapObj.css("overflow", "hidden");
                }
                me.animateFunc(objMap.pfWrapObj, {
                    height : 24
                }, function(){
                    afterAnim();
                });
            }
            
            function afterAnim(){
                
                objMap.pfPanel.hide();
                objMap.indicator.addClass("hide");
                
                var selecteditems = objMap.pfSelectedItem;
                if(selecteditems.length > 0){
                    objMap.pfPagination.show();
                    objMap.pfSelected.addClass("show");
                    objMap.flushingSlide.hide();
                }else{
                    objMap.pfPagination.hide();
                    objMap.pfSelected.removeClass("show");
                    objMap.flushingSlide.show();
                }
                objMap.pfObj.removeClass("hover");
                objMap.pfShadow.show();
                var flushingItems = S.all("#J_propertyFilter .pf-flush-item");
                me.animateFunc(flushingItems, {
                    "width" : flushingItems.attr("oriwidth")
                }, function(){
                }, .05);
            }
            
            changeDom();
        },
        fixedHide: function(){
            var me = this;
            var objMap = this.getObjMap();
            
            objMap.pfObj.stop(true);
            objMap.pfWrapObj.stop(true);
            if(!objMap.pfObj.hasClass("property-fixed")){
                return;
            }
            
            function changeDom(){
                objMap.pfReplaceObj.hide();
                objMap.pfObj.removeClass("property-fixed");
                objMap.pfObj.css({"left": "auto", "width": "auto"});
                
                if (S.UA.ie && S.UA.ie == 6) {
                    objMap.pfObj.css("top", 0);
                    objMap.pfObj[0].offsetLeft;
                }
                
                if(objMap.pfSelectedItem.length == 0) {
                    objMap.pfSelected.removeClass("show");
                }
                me.animateFunc(objMap.pfWrapObj, {
                    height : me.getPfHeight()
                }, function(){
                    objMap.pfPanel.show();
                    //objMap.pfPagination.show();
                    objMap.indicator.removeClass("hide");
                    objMap.flushingSlide.hide();
                });
            }
            changeDom();
        },
        fixedMouseEnter: function(){
            var me = this;
            var objMap = this.getObjMap();
            var flushingItems = S.all("#J_propertyFilter .pf-flush-item");
            this.animateFunc(flushingItems, {
                "width" : parseInt(flushingItems.attr("oriwidth")) + 100
            }, function(){
                objMap.pfObj.addClass("hover");
                objMap.flushingSlide.hide();
                objMap.indicator.removeClass("hide");
                objMap.pfShadow.hide();
                objMap.pfPanel.show();
                if(objMap.pfSelected.css("display") == "block"){
                    objMap.pfPagination.show();
                }
                me.animateFunc(objMap.pfWrapObj, {
                    height : me.getPfHeight()
                }, function(){
                    objMap.pfWrapObj.css("overflow", "visible");
                });
            }, .05);
        },
        fixedMouseLeave: function(){
            //return;
            this.fixedShow();
        },
        selfAnimateHeight: function(obj, targetHeight, duration, callback) {
            var useCssAnim = false;
            if(propertyFilter.ATTRS.isCssAnim && obj[0] && obj[0].style && 'webkitTransition' in obj[0].style){
                useCssAnim = true;
            }
            var useDefaultAnim = false;
            var me = this;
            if(S.UA.ie && S.UA.ie == 6){
                obj.height(targetHeight);
                callback(obj);
            }else if(useCssAnim){
                S.Event.detach(obj, "webkitTransitionEnd");
                S.Event.on(obj, "webkitTransitionEnd", function(e) {
                    callback(obj);
                    S.Event.detach(obj, "webkitTransitionEnd");
                    return false;
                });
                obj.height(targetHeight);
            }else{
                if(useDefaultAnim){
                    var delay = 20, timer;
                    var heighFall =  targetHeight - obj.height();
                    var step = heighFall / duration;
                    timer = setInterval(function() {
                        var afterHeight = obj.height() + step * delay;
                        if(heighFall > 0 && afterHeight < targetHeight){
                            obj.height(afterHeight);
                        }else if(heighFall < 0 && afterHeight > targetHeight){
                            obj.height(afterHeight);
                        }else{
                            obj.height(targetHeight);
                            clearInterval(timer);
                            callback(obj);
                        }
                    }, delay);
                }else{
                    me.animateFunc(obj, {
                        "height": targetHeight
                    }, function(){
                        callback(obj);
                    }, (duration / 1000));
                }
            }
        },
        checkSelectedStatus: function(noAjax){
            var me = this;
            var objMap = me.getObjMap(true);
            
            if(objMap.pfSelectedItem.length > 0){
                if(objMap.pfSelected.css("display") == "none"){
                    objMap.pfSelected.addClass("show");
                    objMap.pfclearAll.addClass("show");
                    objMap.pfPagination.show();
                    me.selfAnimateHeight(objMap.pfSelected, 34, 200, function(obj){
                    });
                    me.selfAnimateHeight(objMap.pfWrapObj, propertyFilter.ATTRS.minHeight + 34, 200, function(){
                    });
                }else{
                    objMap.pfclearAll.addClass("show");
                    objMap.pfPagination.show();
                }
                me.setSelIndicatorSt();
            }else{
                objMap.pfclearAll.removeClass("show");
                objMap.pfPagination.hide();
                me.selfAnimateHeight(objMap.pfWrapObj, propertyFilter.ATTRS.minHeight, 200, function(){
                    objMap.pfSelected.removeClass("show");
                });
                me.selfAnimateHeight(objMap.pfSelected, 0, 200, function(){
                    objMap.pfSelected.removeClass("show");
                });
            }
            if(!noAjax){
                var isDelay = false;
                if(isDelay){
                    clearTimeout(propertyFilter.ATTRS.ajaxtimeout);
                    propertyFilter.ATTRS.ajaxtimeout = setTimeout(function(){
                        me.sendAjax();
                    }, 300);
                }else{
                    me.sendAjax();
                }
            }
        },
        setSelectedStyle:function(){
            var selectedList = S.all("#J_propertyFilter .selected-item");
            if(selectedList.length > 0){
                for(var i = 0 ; i < selectedList.length ; i++){
                    var itemid = S.one(selectedList[i]).attr("filterid");
                    S.all("#J_propertyFilter .fp-item-" + itemid).addClass("selected");
                }
            }
        },
        setSelIndicatorSt:function(){
            var slideObj = S.one(".pf-st-slide");
            var pfClearAllObj = S.one(".pf-st-clearall");
            
            var maxLeft = slideObj.offset().left + slideObj.width();
            var scrollLeft = slideObj.scrollLeft();
            var clearAllRight = pfClearAllObj.width() + pfClearAllObj.offset().left;
            
            if(clearAllRight > maxLeft){
                S.one(".pf-st-next").show();
            }else{
                S.one(".pf-st-next").hide();
            }
            
            if(scrollLeft > 0){
                S.one(".pf-st-prev").show();
            }else{
                S.one(".pf-st-prev").hide();
            }
        },
        getCurSelWidth: function(){
            var me = this;
            var objMap = me.getObjMap();
            var selItems = objMap.pfSelectedItem;
            var returnWidth = 0;
            selItems.each(function(){
                returnWidth += this[0].offsetWidth + 10;
            });
            return returnWidth + 150;
        },
        initSelected: function(){
            var me = this;
            var objMap = me.getObjMap();
            
            function addSelectedItem(filterType, filterId, filterName, filteritem){
                var objMap = me.getObjMap();
                var selectedPF = DOM.children(".pf-st-wrap", "." + filterType);
                S.all(".fp-item-" + filterId).addClass("selected");
                var html = '<a href="#" style="margin-left:-50px;" class="selected-item pf-selid-' + filterId + '" filterid="' + filterId + '" filtername="' + filterName + '" title="' + filterName + '">' + filterName + '<span class="del-btn"></span></a>';
                if(filterType == "pf-30000"){
                    html = '<a href="#" link="' + filteritem.attr("href") + '" style="margin-left:-50px;" class="selected-item priceRange-item pf-selid-' + filterId + '" filterid="' + filterId + '" filtername="' + filterName + '" title="' + filterName + '">' + filterName + '<span class="del-btn"></span></a>';''
                }
                S.one(".pf-st-wrap").width(me.getCurSelWidth()+ (filterName.length * 30));
                S.one(selectedPF).prepend(html);
                
                me.getObjMap(true);
                me.checkSelectedStatus(true);
                me.animateFunc(S.one('.pf-selid-' + filterId), {
                    "margin-left": 0
                }, function(obj){
                    obj.css({"opacity":1});
                    me.checkSelectedStatus();
                    S.one(".pf-st-wrap").width(me.getCurSelWidth());
                });
            }
            function delSelectedItem(filterId){
                S.all(".fp-item-" + filterId).removeClass("selected");
                
                var obj = S.one(".pf-selid-" + filterId);
                obj.css("z-index", 0);
                me.animateFunc(obj, {
                    "margin-left":-(obj.width() + 35)
                }, function(obj){
                    obj.remove();
                    me.getObjMap(true);
                    S.one(".pf-st-wrap").width(me.getCurSelWidth());
                    me.checkSelectedStatus();
                }, .3);
            }
            S.Event.delegate('#J_propertyFilter', 'click', '.filter-item', function(e){
                var filteritem = S.one(e.target);
                var slideItem = DOM.parent(e.target, ".pf-slide-item");
                
                if(!filteritem.hasClass("filter-item")){
                    filteritem = filteritem.parent(".filter-item");
                }
                propertyFilter.ATTRS.curLink = filteritem.attr("href");
                
                var filterType = S.one(slideItem).attr("filtertype");
                var filterTypeId = S.one(slideItem).attr("filterid");
                var filterId = filteritem.attr("filterid");
                var filterName = filteritem.attr("filtername");
                    
                if(filteritem.hasClass("selected")){
                    delSelectedItem(filterId);
                }else{
                    addSelectedItem(filterType, filterId, filterName, filteritem);
                    if(filterTypeId == "30000"){
                        me.animateFunc(S.one(".pf-slide-item-30000"), {
                            opacity:0,
                            "margin-left":-S.all(".pf-slide-item-30000").width()
                        }, function(obj){
                            obj.remove();
                            me.calWidth();
                        }, .3);
                    }
                }
                return false;
            });
            //点击已选项删除
            S.Event.delegate('#J_propertyFilter', 'click', '.selected-item', function(e){
                propertyFilter.ATTRS.curLink = e.target.href;
                var selObj = S.one(e.target);
                if(!selObj.hasClass("selected-item")){
                    selObj = S.one(DOM.parent(e.target, ".selected-item"));
                }
                var filterid = selObj.attr("filterid");
                delSelectedItem(filterid);
                return false;
            });
            //hover已选项删除
            S.Event.delegate('#J_propertyFilter', 'mouseenter', '.selected-item', function(e){
                objMap.pfSelectedItem.removeClass("hover");
                S.one(e.target).addClass("hover");
            });
            //hover已选项删除
            S.Event.delegate('#J_propertyFilter', 'mouseleave', '.selected-item', function(e){
                S.one(e.target).removeClass("hover");
            });
            //删除全部
            S.Event.delegate('#J_propertyFilter', 'click', '.pf-st-clearall', function(e){
                var clearallObj = S.one(e.target);
                if(!clearallObj.hasClass("pf-st-clearall")){
                    clearallObj = clearallObj.parent(".pf-st-clearall");
                }
                propertyFilter.ATTRS.curLink = clearallObj.attr("href");
                S.all(".filter-item").removeClass("selected");
                
                me.animateFunc(S.all(".selected-item"), {
                    "margin-left":-70
                }, function(obj){
                    obj.remove();
                    me.checkSelectedStatus();
                }, .3);
                return false;
            });
            
            S.Event.delegate('#J_propertyFilter', 'click', '.pf-st-prev', function(e){
                var slideObj = S.one(".pf-st-slide");
                var outerWidth = slideObj.width();
                S.one(".pf-st-wrap").width(me.getCurSelWidth());
                me.animateFunc(slideObj, {
                    scrollLeft : slideObj.scrollLeft() - outerWidth
                }, function(){
                    me.setSelIndicatorSt();
                }, .6);
                return false;
            });
            S.Event.delegate('#J_propertyFilter', 'click', '.pf-st-next', function(e){
                var slideObj = S.one(".pf-st-slide");
                var outerWidth = slideObj.width();
                
                S.one(".pf-st-wrap").width(me.getCurSelWidth());
                me.animateFunc(slideObj, {
                    scrollLeft : slideObj.scrollLeft() + outerWidth
                }, function(){
                    me.setSelIndicatorSt();
                }, .6);
                return false;
            });
            me.setSelectedStyle();
            me.checkSelectedStatus(true);
        },
        removeDuplicate: function(){
            var visibleItems = S.all("#J_propertyFilter .pf-fixed-height:not(.pf-image) .filter-item");
            if(visibleItems){
                for(var i = 0 ; i < visibleItems.length ; i++){
                    if(visibleItems[i].offsetTop > 100){
                        continue;
                    }
                    var filterid = S.one(visibleItems[i]).attr("filterid");
                    var cateTabItem = S.one("#pf-band-cate .fp-item-" + filterid);
                    if(cateTabItem){
                        cateTabItem.addClass("hidden");
                    }
                }
            }
        },
        initSlide: function() {
            if( 'webkitTransition' in S.DOM.get("#J_propertyFilter").style ){
                propertyFilter.ATTRS.isCssAnim = true;
            }
            if(propertyFilter.ATTRS.isCssAnim){
                S.one("#J_propertyFilter").addClass("useCssAnimate");
            }else{
                S.one("#J_propertyFilter").removeClass("useCssAnimate");
            }
            
            if(S.one("#pf-band-cate") && S.one("#pf-band-cate").length > 0){
                var Tabs = Switchable.Tabs;
                var tabs = new Tabs('#pf-band-cate', {
                    triggerType: "click",
                    switchTo : 0
                });
            }
            
            var me = this;
            this.calWidth();
            //注册监听页面宽度改变，不用resize是因为做了特殊处理，有延时
            RP.listen('J_propertyFilter', function(width) {
                me.calWidth();
            });
            
            var timer = null;
            S.Event.on(window, "scroll", function(e) {
                clearTimeout(timer);
                timer = setTimeout(function(){
                    var showFixedTop = S.one(".main").offset().top;
                    var scrollTop = S.one(window).scrollTop();
                    if(scrollTop > showFixedTop){
                        var objMap = me.getObjMap();
                        if(S.UA.ie && S.UA.ie == 6){
                        }else if(objMap.pfObj.hasClass("property-fixed")){
                            return;
                        }
                        var curLi = S.DOM.get(".pf-slide-item.norelative");
                        if(curLi){
                            me.hideMore(curLi);
                        }
                        me.fixedShow();
                    }else{
                        var objMap = me.getObjMap();
                        if(objMap.pfObj.hasClass("property-fixed")){
                            me.fixedHide();
                        }
                    }
                }, 50);
            });
            
            me.bindFixedEvent();
            
            S.Event.delegate('#J_propertyFilter','click','.pf-pg-link',function(e){
                S.one(e.target).addClass("active").siblings().removeClass("active");
                var objMap = me.getObjMap();
                var pfPanel = objMap.pfPanel;
                var visibleSlideWidth = objMap.pfSlideItem.width() * propertyFilter.ATTRS.slidePerPage;
                var firstLeftNum = visibleSlideWidth - (pfPanel.width() - visibleSlideWidth) / 2;
                
                me.animateFunc(pfPanel, {
                    scrollLeft : firstLeftNum + visibleSlideWidth * (parseInt(S.one(e.target).attr("num")) - 1)
                }, function(){
                });
                if(S.one(e.target).attr("num") == 0){
                    S.one(".pagi-prev").removeClass("show");
                    S.one(".pagi-next").addClass("show");
                }else if(S.one(e.target).attr("num") == (propertyFilter.ATTRS.slidePageNum - 1)){
                    S.one(".pagi-prev").addClass("show");
                    S.one(".pagi-next").removeClass("show");
                }else{
                    S.one(".pagi-prev").addClass("show");
                    S.one(".pagi-next").addClass("show");
                }
                return false;
            });
            S.Event.delegate('#J_propertyFilter','click','.pagi-prev',function(e){
                var curActive = S.one(".pf-pg-link.active");
                if(curActive.prev()){
                    curActive.prev().fire("click");
                }
            });
            S.Event.delegate('#J_propertyFilter','click','.pagi-next',function(e){
                var curActive = S.one(".pf-pg-link.active");
                if(curActive.next()){
                    curActive.next().fire("click");
                }
            });
            S.Event.on('.pf-content','click',function(e){
                return;
                var obj = S.one(this);
                var slideItem = obj.parent(".pf-slide-item");
                if(slideItem.hasClass("norelative")){
                    obj.fire("mouseleave");
                }else{
                    obj.fire("mouseenter");
                }
            });
            S.Event.delegate('#J_propertyFilter','mouseenter','.pf-content',function(e){
                var slideItem = DOM.parent(e.target, ".pf-slide-item");
                var slidePanel = DOM.parent(e.target, ".pf-panel");
                
                if(S.one(slideItem).hasClass("no-slidedown")){
                    return;
                }

                var itemLeft = slideItem.offsetLeft;
                var itemRigth = slideItem.offsetLeft + slideItem.offsetWidth;
                var visibleLeft =  slidePanel.scrollLeft;
                var visibleRight =  slidePanel.scrollLeft + slidePanel.offsetWidth;
                
                if(itemLeft >= visibleLeft && itemRigth <= visibleRight){
                    me.showMore(slideItem);
                }
            });
            S.Event.delegate('#J_propertyFilter','mouseleave','.pf-content',function(e){
                me.hideMore(DOM.parent(e.target, ".pf-slide-item"));
            });
            S.Event.delegate('#J_propertyFilter','mouseenter','.ks-switchable-nav li',function(e){
                S.one(e.target).fire("click");
            });
            me.removeDuplicate();
        },
        getpfContentHeight: function(pfContentObj, adjust){
            var titleHeight = pfContentObj.children(".filter-title").height();
            var filterUleHeight = 0;
            pfContentObj.children(".filter-items").each(function(){
                filterUleHeight += this.height();
            });
            var totalHeight = titleHeight + filterUleHeight + adjust;
            if(totalHeight <= propertyFilter.ATTRS.minHeight){
                return propertyFilter.ATTRS.minHeight;
            }else if(totalHeight >= propertyFilter.ATTRS.maxHeight){
                return propertyFilter.ATTRS.maxHeight;
            }else{
                return totalHeight;
            }
        },
        animateFunc: function(obj, cssObj, callback, duration){
            var useCssAnim = false;
            if(propertyFilter.ATTRS.isCssAnim){
                //if(cssObj["width"] == undefined && cssObj["scrollLeft"] == undefined && cssObj["margin-left"] == undefined){
                if(cssObj["width"] == undefined && cssObj["scrollLeft"] == undefined){
                    useCssAnim = true;
                }
            }
            
            if(S.UA.ie && S.UA.ie == 6){
                if(cssObj.scrollLeft){
                    obj.scrollLeft(cssObj.scrollLeft);
                    delete cssObj.scrollLeft;
                }
                obj.css(cssObj);
                callback(obj);
            }else if(useCssAnim){
                S.Event.detach(obj, "webkitTransitionEnd");
                S.Event.on(obj, "webkitTransitionEnd", function(e) {
                    S.Event.detach(obj, "webkitTransitionEnd");
                    callback(obj);
                    return false;
                });
                obj.css(cssObj);
            }else{
                if(obj.hasClass("property-fixed")){
                    obj.stop(true);
                }else{
                    obj.stop(false);
                }
                obj.animate(cssObj, {
                    duration : duration || .5,
                    easing : "easeOutStrong",
                    complete : function() {
                        callback(obj);
                    }
                });
            }
        },
        showMore: function(liObj){
            var objMap = this.getObjMap();
            var pfSlide = S.one(".pf-slide");
            var pfLiContent = S.one(DOM.children(liObj, ".pf-content"));
            var pfFilterUl = pfLiContent.children(".filter-items:not(.pf-fixed-height)");
            var pfFilterImage = pfLiContent.children(".filter-items.pf-fixed-height");
            var pfFilterHeight = pfFilterUl.height();
            var pfSwitch = pfLiContent.children(".pf-switch");
            
            pfFilterUl.removeClass("maxheight");
            var adjustHeight = 14;
            
            var hasSwitch = pfSwitch && pfSwitch.length > 0;
            var hasImage = pfFilterImage && pfFilterImage.length > 0;
            
            if(hasSwitch && hasImage){
                adjustHeight = 300;
            }else if(!hasSwitch && hasImage){
                if(pfFilterHeight <= 150){
                    pfFilterUl.css({"height":"auto"});
                }else{
                    adjustHeight = 300;
                    pfFilterUl.css({"overflow":"auto", "height":"158"});
                }
            }else{
                if(pfFilterHeight <= 80){
                    return;
                }else if(pfFilterHeight > 244){
                    pfFilterUl.addClass("maxheight");
                }
            }
            objMap.pfWrapObj.css("overflow", "visible");
            pfLiContent.css({"width": S.one(liObj).width()-1,"overflow": "hidden", "left":parseInt(liObj.offsetLeft)});
            S.one(liObj).addClass("norelative");
            
            var listHeight = this.getpfContentHeight(pfLiContent, adjustHeight);
            
            objMap.pfPanelWrap.css("border-bottom", "none");
            this.animateFunc(pfSlide, {
                height : listHeight + 5
            }, function(){});
            if(propertyFilter.ATTRS.isCssAnim){
                pfLiContent.height(listHeight - 3);
            }else{
                this.animateFunc(pfLiContent, {
                    height : listHeight - 3
                }, function(){});
            }
        },
        hideMore: function(liObj){
            if(!S.one(liObj).hasClass("norelative")){
                return;
            }
            var pfSlide = S.one(".pf-slide");
            var pfLiContent = S.one(DOM.children(liObj, ".pf-content"));
            var pfFilterUl = pfLiContent.children(".filter-items");
            
            pfFilterUl.removeClass("maxheight");
            pfLiContent.scrollTop(0);

            this.animateFunc(pfLiContent, {
                height : propertyFilter.ATTRS.minHeight
            }, function(){
                pfLiContent.css({"width": "100%","overflow": "hidden","height": propertyFilter.ATTRS.minHeight, "left":0});
                S.one(liObj).removeClass("norelative");
            });
            this.animateFunc(pfSlide, {
                height : propertyFilter.ATTRS.minHeight
            }, function(){
            });
        },
        calWidth: function(){
            var objMap = this.getObjMap(true);
            var pfPanel = objMap.pfPanel; 
            var slideItems = objMap.pfSlideItem;
            var pfSlide = S.one(".pf-slide");
            var pfSelected = S.one(".pf-st-slide");
            pfSelected.css("width", pfPanel.width() - 100);
            
            var slidePerPage = Math.floor(pfPanel.width() / propertyFilter.ATTRS.slideDefaultWidth);
            slidePerPage = slidePerPage < slideItems.length ? slidePerPage : slideItems.length;
            var paginationNum = Math.ceil(slideItems.length / slidePerPage);
            
            if(pfPanel.width() != propertyFilter.ATTRS.containerWidth || slideItems.length != propertyFilter.ATTRS.slideNum){
                propertyFilter.ATTRS.slideNum = slideItems.length;
                propertyFilter.ATTRS.containerWidth = pfPanel.width();
                //只有一页，则将内容平分
                if(paginationNum == 1){
                    pfSlide.width(pfPanel.width());
                    var width = parseInt(pfPanel.width() / slidePerPage);
                    slideItems.width(width);
                    slideItems.children(".pf-content").width(width);
                    if(S.one("#pf-band-cate") && S.one("#pf-band-cate").length > 0){
                        this.hideMore(DOM.parent("#pf-band-cate", ".pf-slide-item"));
                    }
                    if(width > 450){
                        if(S.one("#pf-band-cate") && S.one("#pf-band-cate").parent(".pf-slide-item")){
                            S.one("#pf-band-cate").parent(".pf-slide-item").addClass("no-slidedown");
                        }
                    }
                }else{
                    pfSlide.width(slideItems.length * propertyFilter.ATTRS.slideDefaultWidth);
                    slideItems.width(propertyFilter.ATTRS.slideDefaultWidth);
                    slideItems.removeClass("no-slidedown");
                }
                propertyFilter.ATTRS.slidePageNum = paginationNum;
                propertyFilter.ATTRS.slidePerPage = slidePerPage;
                
                this.animateFunc(pfPanel, {
                    scrollLeft : 0
                }, function(){}, 1);
                
                this.generatePagition(paginationNum);
            }
            this.generateFlushItem();
            return;
        },
        generateFlushItem: function(){
            var objMap = this.getObjMap();
            var pHtml = "";
            
            objMap.pfSlideItem.each(function(i, k){
                if(k < 5){
                    var id = S.one(this).attr("filterid");
                    var name = S.one(this).attr("filtername");
                    pHtml += '<span class="pf-flush-item pf-flush-item-' + id + '" filterid="' + id + '" filtertype="pf-' + id + '">' + name + '</span>';
                }
            });
            objMap.flushingSlide.html(pHtml);

            var flushItems = S.all(".pf-flush-item");
            var itemwidth = parseInt((objMap.pfPanel.width() - 30) / flushItems.length);
            flushItems.width(itemwidth);
            flushItems.attr("oriwidth", itemwidth);
        },
        generatePagition: function(num){
            var objMap = this.getObjMap();
            objMap.indicator.removeClass("show");
            if(num <= 1){
                objMap.pfPagination.html("");
            }else{
                S.one(".pagi-next").addClass("show");
                var pHtml = "";
                for(var i = 0 ; i < num ; i++){
                    pHtml += '<a href="#" class="pf-pg-link ' + (i==0 ? "active" : "") + '" num="' + i + '">' + i + '</a>';
                }
                objMap.pfPagination.html(pHtml);
            }
        },
        registerTouchEvent: function(){
            if (S.UA.ie && S.UA.ie == 6) {
                return;
            }
            var objMap = this.getObjMap();
            Touchswip(objMap.pfPanel, {
                wipeLeft : function() {
                    KISSY.one("#J_propertyFilter .pagi-next").fire("click");
                },
                wipeRight : function() {
                    KISSY.one("#J_propertyFilter .pagi-prev").fire("click");
                },
                wipeUp : function() {
                },
                wipeDown : function() {
                },
                min_move_x : 20,
                min_move_y : 20,
                preventDefaultEvents : true
            });
            
            /*
            return;
            Touchswip(S.all("#J_propertyFilter .pf-slide-item"), {
                wipeLeft : function() {
                },
                wipeRight : function() {
                },
                wipeUp : function(e, obj) {
                    S.one(obj).children(".pf-content").fire("mouseenter");
                },
                wipeDown : function(e, obj) {
                    S.one(obj).children(".pf-content").fire("mouseleave");
                },
                min_move_x : 20,
                min_move_y : 20,
                preventDefaultEvents : true
            });*/
        }
    };
    
    propertyFilter.EVENTS = {
        '#J_unfold': {
            click: function(e){
            }
        }
    };
    
    S.extend(propertyFilter, Brick, {
        initialize: function() {
            this.initSlide();
            this.initSelected();
            this.registerTouchEvent();
            this.getTemplate();
        },
        setAjaxData: function(data){
            this.setData(data);
        }
    });

    S.augment(propertyFilter, propertyFilter.METHODS);
    return propertyFilter;
}, {
    requires: ['brix/core/brick',"switchable",'brix/core/mustache', "touchswip", "magix/router"]
});

/* source from: >> components/recommend/index.js */
KISSY.use('srp/local',function(S,Local){
	if(!KISSY.Env.mods['etao/component/RecommendForSRP']){
         S.add('etao/component/RecommendForSRP', {
             fullpath: 'http://a.tbcdn.cn/apps/e/component/120918/recommend/recommendforsrp.js',
             cssfullpath:'http://a.tbcdn.cn/apps/e/component/120918/recommend/recommendforsrp.css'
         });
    }
    Local.bind('dataLoaded',function(e){
        /*
            假数据
         */
        if(e.isSuccess){//显示浏览推荐
            S.one('#J_srp_recommend').html('<div id="J_RecommendSRP"></div>');
            S.use('etao/component/RecommendForSRP', function (RecommendForSRP) {
                var config = {
                    container: '#J_RecommendSRP',//脠脻脝梅id
                    req: 'browse:record',
                    moduleSpm:  'gxh_srp_llss:1',
                    data_spm: '1002.8.23',
                    track_info: "&track_info_browse=srp_gxh_llss",                    click: 'etao.etao_srp.llss_lltj.tab',
                    appName: "&appName=etao-srp"
                };
                new S.RecommendForSRP(config);
            });
        }else{//显示
            /*
                data-catid=""
                data-query=""
                需要替换
             */
            S.one('#J_srp_recommend').html('<div id="J_RecommendQuery" data-catid="0" data-query="abc"></div>');
            S.use('etao/component/RecommendForSRP', function (RecommendForSRP) {
                var config = {
                    container: '#J_RecommendQuery',//
                    queryRecommend: true,  //
                    req: 'browse',//
                    moduleSpm:  'gxh_srp_cx:1',//
                    data_spm: '1002.8.24',
                    track_info: "&track_info_browse=srp_gxh_cx" ,
                    click: 'etao.etao_srp.cx.tab',
                    appName: "&appName=etao-srp"
                };
               new S.RecommendForSRP(config);
            });
        }
    });
});
/* source from: >> components/salelist/index.js */
KISSY.add('components/salelist/index', function(S, Brick) {
    function saleListView() {
        saleListView.superclass.constructor.apply(this, arguments);
    }
    saleListView.METHODS = {
        showAndHide: function(){
            var self=this;
            KISSY.ready(function(S) {
                var context = self.get('el'),
                    saleListitem = context.all('.sale-listitem');
                    
                //显示隐藏商家信息和收藏按钮
                saleListitem.on('mouseenter mouseleave',function(e){
                    var listitem = S.one(S.DOM.parent(e.target,'.sale-listitem') || e.target),
                        pic_panel = S.one('.pic-panel', listitem),
                        fav_panel= S.one('.hover-panel', pic_panel);
                    if(e.type==='mouseenter'){
                        S.one(this).addClass('sale-listitem-hover');
                        if(fav_panel) {
                            fav_panel.stop().animate({top:0}, 0.5, 'easeOutStrong');
                        }
                    }
                    else {
                        S.one(this).removeClass('sale-listitem-hover');
                        if(fav_panel) {
                            S.one(fav_panel).stop().animate({top:'-20px'}, 0.5, 'easeOutStrong');
                        }
                    }
                });
            });
        }
    }
    S.extend(saleListView, Brick, {
        initialize: function() {
            this.showAndHide();
        }
    });
    S.augment(saleListView, saleListView.METHODS);
    return saleListView;
}, {
    requires: ['brix/core/brick']
});

/* source from: >> components/simpleproperty/index.js */
KISSY.add('components/simpleproperty/index', function(S, Brick, Switchable, Mustache, Router) {

    function propertyFilter() {
        propertyFilter.superclass.constructor.apply(this, arguments);
    }
    
    var cateTemplate  = "";
    cateTemplate += "    <div class='charactor-panel border-none fold'>";
    cateTemplate += "        {{#fp_cate}}";
    cateTemplate += "            <dl class='filter-cate clearfix pf-dl pf-dl-{{id}} isEngineRec-{{isEngine}}' filterid='{{id}}' filtertype='pf-{{id}}' filtername='{{name}}'>";
    cateTemplate += "                <div id='inner-more-{{id}}' class='show-more inner-more items-more'>";
    cateTemplate += "                    <div class='inner'>";
    cateTemplate += "                        <a class='fold'><span>更多</span><b><b></b></b></a>";
    cateTemplate += "                    </div>";
    cateTemplate += "                </div>";
    cateTemplate += "                <dt title='{{name}}' class='filter-title'>{{name}}：</dt>";
    cateTemplate += "                <dd class='filter-items'>";
    cateTemplate += "                    {{#hasgroup}}";
    cateTemplate += "                        <div id='pf-band-cate' class='pf-band-more pf-switch'>";
    cateTemplate += "                            <ul class='ks-switchable-nav'>";
    cateTemplate += "                                {{#cate}}";
    cateTemplate += "                                <li groupid='{{id}}' groupname='{{group_name}}' class='switch-nav-item switch-nav-{{id}}'>{{group_name}}<i class='iconfont'>&#404;</i></li>";
    cateTemplate += "                                {{/cate}}";
    cateTemplate += "                            </ul>";
    cateTemplate += "                           <div class='ks-switchable-content'>";
    cateTemplate += "                               {{#cate}}";
    cateTemplate += "                               <div style='display: none'>";
    cateTemplate += "                                   <div groupid='{{id}}' groupname='{{group_name}}' class='pf-switch-ul clear-fix pf-itemcotainer-{{id}}'>";
    cateTemplate += "                                       {{#items}}";
    cateTemplate += "                                           <a data-stat='{{stat}}' href='{{url}}' class='filter-item fp-item-{{id}}' filterid='{{id}}' filtername='{{name}}' title='{{name}}'>{{nameShow}}</a>";
    cateTemplate += "                                       {{/items}}";
    cateTemplate += "                                   </div>";
    cateTemplate += "                                    <div class='show-more inner-more switch-more'>";
    cateTemplate += "                                        <div class='inner'>";
    cateTemplate += "                                            <a class='fold'><span>更多</span><b><b></b></b></a>";
    cateTemplate += "                                        </div>";
    cateTemplate += "                                    </div>";
    cateTemplate += "                               </div>";
    cateTemplate += "                               {{/cate}}";
    cateTemplate += "                            </div>";
    cateTemplate += "                        </div>";
    cateTemplate += "                    {{/hasgroup}}";
    cateTemplate += "                    {{^hasgroup}}";
    cateTemplate += "                    <div class='pf-wrapper clearfix'>";
    cateTemplate += "                        {{#items}}";
    cateTemplate += "                            <a data-stat='{{stat}}' href='{{url}}' class='filter-item fp-item-{{id}}' filterid='{{id}}' filtername='{{name}}' title='{{name}}'>{{nameShow}}</a>";
    cateTemplate += "                        {{/items}}";
    cateTemplate += "                    </div>";
    cateTemplate += "                    {{/hasgroup}}";
    cateTemplate += "                </dd>";
    cateTemplate += "            </dl>";
    cateTemplate += "        {{/fp_cate}}";
    cateTemplate += "    </div>";

    var selectedTemplate  = "";
    selectedTemplate += "    <div class='pf-st-slide'>";
    selectedTemplate += "        <div class='pf-st-wrap'>";
    selectedTemplate += "            {{#fp_cate}}";
    selectedTemplate += "            <span class='pf-st-item pf-{{id}}' filterid='{{id}}'>";
    selectedTemplate += "                {{#selectlist}}";
    selectedTemplate += "                <a href='{{url}}' class='selected-item pf-selid-{{id}}' filterid='{{id}}' filtername='{{name}}'>{{name}}<span class='del-btn'></span></a>";
    selectedTemplate += "                {{/selectlist}}";
    selectedTemplate += "            </span>";
    selectedTemplate += "            {{/fp_cate}}";
    selectedTemplate += "            {{#otherSelect}}";
    selectedTemplate += "            <span class='pf-st-item pf-other' filterid='other'>";
    selectedTemplate += "                <a href='{{url}}' class='selected-item pf-selid-{{type}} {{type}}-item' filterid='{{type}}' filtername='{{name}}'>{{name}}<span class='del-btn'></span></a>";
    selectedTemplate += "            </span>";
    selectedTemplate += "            {{/otherSelect}}";
    selectedTemplate += "            <a href='{{allurl}}' class='pf-st-clearall'><span>清除全部</span></a>";
    selectedTemplate += "        </div>";
    selectedTemplate += "    </div>";
    selectedTemplate += "    <a href='#' class='pf-st-indicator pf-st-prev'></a>";
    selectedTemplate += "    <a href='#' class='pf-st-indicator pf-st-next'></a>";
    
    propertyFilter.ATTRS = {
        mode:{
            value:1
        },
        template: {
            cate: cateTemplate,
            selected: selectedTemplate
        },
        curLink: "",
        userShowMore: {},
        userSwitchMore: {},
        curSwitchId: 0,
        maxShowCate: 3,
        slideDefaultWidth: 280
    }
    
    propertyFilter.METHODS = {
        setData: function(dataString) {
            var me = this;
            var data = KISSY.JSON.parse(dataString);
            
            if(data.fp_cate.length == 0){
                return;
            }
            
            function resetCateList(){
                var html = Mustache.to_html(propertyFilter.ATTRS.template.cate, data);
                S.one(".filter-panel").html(html);
                me.initCate();
            }
            function resetSelected(){
                var html = Mustache.to_html(propertyFilter.ATTRS.template.selected, data);
                S.one(".pf-selected").html(html);
                me.checkSelectedStatus(true);
                me.setSelectedStyle();
            }
            resetCateList();
            resetSelected();
        },
        //重置showmore
        resetShowMore: function(obj){
            var foldLink = obj.one("a");
            var spanNode = obj.one("span");
            if(obj.attr("id") == "J_ShowMore1"){
                spanNode.text("展开更多");
            }else{
                spanNode.text("更多");
            }
            foldLink.addClass("fold");
        },
        //初始化各个分类状态，是否显示隐藏，如果是品牌需显示两行
        initStatus: function(){
            var me = this;
            //已选择区域跨度设定
            function setSelectWidth(){
                var pfSelected = S.one(".pf-st-slide");
                pfSelected.css("width", S.one(".simpleproperty").width() - 50);
                me.initCateMore();
            }
            //注册监听页面宽度改变，不用resize是因为做了特殊处理，有延时
            RP.listen('J_propertyFilter', function(width) {
                setSelectWidth();
            });
            setSelectWidth();
            me.initCate();
        },
        //初始化筛选项状态，包括ajax回调后重新初始化都要调用
        initCate: function(){
            var me = this;
            var filterCate = S.all("#J_propertyFilter .filter-cate");
            var filterMore = S.one("#J_ShowMore1");
            filterCate.each(function(v, k) {
                if(v.attr("filterid") == "20000"){
                    v.addClass("brand");
                    if(v.one("#pf-band-cate")){
                        S.DOM.remove(v.one("> .inner-more")[0]);
                        v.addClass("brand-switch");
                        var Tabs = Switchable.Tabs;
                        var tabs = new Tabs('#pf-band-cate', {
                            triggerType: "click",
                            switchTo : 1
                        });
                        tabs.on('switch', function(ev) {
                            var index = ev.currentIndex;
                            var curShowMore = S.one("#pf-band-cate .switch-more:eq(" + index + ")");
                            var switchItem = curShowMore.parent("div");
                            var panelContainer = curShowMore.parent(".brand-switch");
                            if(curShowMore.attr("showMoreStatus") && curShowMore.attr("showMoreStatus") == "show"){
                                 panelContainer.height("auto");
                            }else{
                                 panelContainer.height(panelContainer.attr("defaultHeight"));
                            }
                            if(switchItem.height() > (v.height() - 30) || !curShowMore.one(".fold")){
                                curShowMore.show();
                            }else{
                                curShowMore.hide();
                            }
                        });
                        var curSwitch = S.one("#pf-band-cate .switch-nav-" + propertyFilter.ATTRS.curSwitchId);
                        if(curSwitch){
                            S.all("#pf-band-cate .switch-nav-item").each(function(v, k){
                                if(v.attr("groupid") == curSwitch.attr("groupid")){
                                    tabs.switchTo(k);
                                }
                            });
                        }else{
                            tabs.switchTo(0);
                        }
                    }
                }
                if(k > propertyFilter.ATTRS.maxShowCate || v.hasClass("isEngineRec-true")){
                    v.addClass("defaultHidden");
                }
                if(filterMore && filterMore.attr("isshow") && filterMore.attr("isshow") == "true"){
                    v.addClass("userOperateShow");
                }else{
                    v.removeClass("userOperateShow");
                }
            });
            //if(filterCate.length > propertyFilter.ATTRS.maxShowCate + 1){
            if(S.all(".defaultHidden").length > 0){
                S.one("#J_ShowMore1").show();
            }else{
                S.one("#J_ShowMore1").hide();
                me.resetShowMore(S.one("#J_ShowMore1"));
            }
            me.initCateMore();
        },
        //绑定事件，只绑定页面加载后只需绑定一次的事件，使用事件代理
        initEvent: function(){
            var me = this;
            //绑定整个分类显示更多事件
            function initShowMore(){
                var foldBtn = S.one("#J_ShowMore1 a");
                if(!foldBtn) return;
                foldBtn.on("click",function(){
                    var self = S.one(this),
                            spanNode = self.one("span"),
                            defalutHidden = S.all(".defaultHidden"),
                            showMore = self.parent(".show-more");
                            panel = S.one("#J_RecommendProp .charactor-panel");
                    if(defalutHidden.css("display") == "none"){
                        self.removeClass("fold");
                        spanNode.text("收起");
                        showMore.attr("isshow","true");
                        if(defalutHidden) defalutHidden.show();
                    }else{
                        self.addClass("fold");
                        spanNode.text("展开更多");
                        showMore.attr("isshow","false");
                        if(defalutHidden) defalutHidden.hide();
                    }
                    me.initCateMore();
                })
            }
            //绑定每个分类中更多的事件
            function initItemsMore(){
                S.Event.delegate('#J_propertyFilter','click','.items-more',function(e){
                     var moreObj = S.one(e.target);
                     if(!moreObj.hasClass("inner-more")){
                        moreObj = moreObj.parent(".inner-more");
                     }
                     var aBtn = moreObj.one("a");
                     var spanNode = moreObj.one("span");
                     var panelContainer = moreObj.parent(".filter-cate");
                     var panel = panelContainer.one(".pf-wrapper");
                     if(aBtn.hasClass("fold")){
                         propertyFilter.ATTRS.userShowMore[panelContainer.attr("filterid")] = true;
                         moreObj.attr("isshow", "true");
                         aBtn.removeClass("fold");
                         spanNode.text("收起");
                         if(panel.height() >= 200){
                             panel.height(200);
                             panel.addClass("show-overflow");
                         }else{
                             panel.removeClass("show-overflow");
                         }
                         panelContainer.attr("defaultHeight", panelContainer.height());
                         if(panelContainer.height() < panel.height()){
                             panelContainer.height(panel.height() + 6);
                         }
                     }else{
                         propertyFilter.ATTRS.userShowMore[panelContainer.attr("filterid")] = false;
                         moreObj.attr("isshow", "false");
                         aBtn.addClass("fold");
                         spanNode.text("更多");
                         panel.removeClass("show-overflow");
                         panelContainer.height(panelContainer.attr("defaultHeight"));
                    }
                });
            }
            //绑定品牌分类每个switch中更多的事件
            function initSwitchMore(){
                S.Event.delegate('#J_propertyFilter','click','.switch-more',function(e){
                     var moreObj = S.one(e.target);
                     if(!moreObj.hasClass("inner-more")){
                        moreObj = moreObj.parent(".switch-more");
                     }
                     var aBtn = moreObj.one("a");
                     var spanNode = moreObj.one("span");
                     var panelContainer = moreObj.parent(".brand-switch");
                     var panel = moreObj.siblings(".pf-switch-ul");
                     
                     if(aBtn.hasClass("fold")){
                         //haven userSwitchMore
                         aBtn.removeClass("fold");
                         spanNode.text("收起");
                         if(panel.height() >= 200){
                             panel.height(200);
                             panel.addClass("show-overflow");
                         }else{
                             panel.removeClass("show-overflow");
                         }
                         panelContainer.attr("defaultHeight", panelContainer.height());
                         if(panelContainer.height() < panel.height() + 30){
                             panelContainer.height("auto");
                         }
                         moreObj.attr("showMoreStatus", "show");
                     }else{
                         aBtn.addClass("fold");
                         spanNode.text("更多");
                         panel.removeClass("show-overflow");
                         panelContainer.height(panelContainer.attr("defaultHeight"));
                         moreObj.attr("showMoreStatus", "hide");
                    }
                });
            }
            initShowMore();
            initItemsMore();
            initSwitchMore();
        },
        //初始化各个分类中是否显示更多
        initCateMore: function(){
            var filterCate = S.all("#J_propertyFilter .filter-cate");
            filterCate.each(function(v, k) {
                if(!v.one(".inner-more")){
                    return;
                }
                var fpItems = v.one(".filter-items");
                if(v.attr("filterid") == "20000"){
                    if(v.one("#pf-band-cate")){
                        //单独处理
                        return;
                    }else{
                        if(fpItems.height() < 30){
                            v.removeClass("brand");
                        }else{
                            v.addClass("brand");
                        }
                    }
                }
                if(fpItems.height() > v.height() || v.attr("defaultHeight")){
                    v.one(".inner-more").show();
                }else{
                    v.one(".inner-more").hide();
                }
                if(propertyFilter.ATTRS.userShowMore[v.attr("filterid")] == true){
                    v.one(".inner-more").fire("click");
                }
            });
        },
        getQueryParam: function(){
            var locationObj = Router.pathToObject(window.location.href);
            
            if(propertyFilter.ATTRS.curLink && propertyFilter.ATTRS.curLink != ""){
                var curLinkObj = Router.pathToObject(propertyFilter.ATTRS.curLink);
                if(curLinkObj && curLinkObj.params && curLinkObj.params.navlog){
                    locationObj.params.navlog = curLinkObj.params.navlog;
                }
            }
            
            locationObj.params.ppath = this.getPPath();
            if(locationObj.params.ppath == ""){
                delete locationObj.params.ppath;
            }
            var priceitem = S.one(".priceRange-item");
            if(priceitem && priceitem.length > 0){
                if(priceitem.attr("link")){
                    var priceLink = priceitem.attr("link");
                    var priceObj = Router.pathToObject(priceLink);
                    if(priceObj.params.start_price){
                        locationObj.params.start_price = priceObj.params.start_price;
                    }
                    if(priceObj.params.end_price){
                        locationObj.params.end_price = priceObj.params.end_price;
                    }
                }
            }else{
                delete locationObj.params.start_price;
                delete locationObj.params.end_price;
            }
            if(locationObj.params.s){
                locationObj.params.s = 0;
            }
            return Router.objectToPath(locationObj);
        },
        getPPath: function(){
            var selectedList = S.all("#J_propertyFilter .filter-item.selected");
            var query = {};
            selectedList.each(function(){
                var filterName = this.parent(".filter-cate").attr("filterid");
                if(filterName == 30000){
                }else if(query[filterName] == undefined){
                    query[filterName] = this.attr("filterid");
                }else{
                    query[filterName] += "," + this.attr("filterid");
                }
            });
            var ppath = "";
            for(var i in query ){
                ppath += i + ":" + query[i] + ";";
            }
            return ppath.substring(0, ppath.length - 1);
        },
        //封装动画
        animateFunc: function(obj, cssObj, callback, duration){
            if(obj == null){
                return;
            }
            if(S.UA.ie && S.UA.ie == 6){
                if(cssObj.scrollLeft){
                    obj.scrollLeft(cssObj.scrollLeft);
                    delete cssObj.scrollLeft;
                }
                obj.css(cssObj);
                callback(obj);
            }else{
                if(obj.hasClass("property-fixed")){
                    obj.stop(true);
                }else{
                    obj.stop(false);
                }
                obj.animate(cssObj, {
                    duration : duration || .5,
                    easing : "easeOutStrong",
                    complete : function() {
                        callback(obj);
                    }
                });
            }
        },
        //初始化已选择项的显示状态，以及绑定事件
        initSelected: function(){
            var me = this;
            var objMap = me.getObjMap();
            
            function addSelectedItem(filterType, filterId, filterName, filteritem){
                var objMap = me.getObjMap();
                var selectedPF = S.one(".pf-st-wrap ." + filterType);
                S.all(".fp-item-" + filterId).addClass("selected");
                var html = '<a href="#" style="margin-left:-50px;" class="selected-item pf-selid-' + filterId + '" filterid="' + filterId + '" filtername="' + filterName + '" title="' + filterName + '">' + filterName + '<span class="del-btn"></span></a>';
                if(filterType == "pf-30000"){
                    html = '<a href="#" link="' + filteritem.attr("href") + '" style="margin-left:-50px;" class="selected-item priceRange-item pf-selid-' + filterId + '" filterid="' + filterId + '" filtername="' + filterName + '" title="' + filterName + '">' + filterName + '<span class="del-btn"></span></a>';''
                }
                S.one(".pf-st-wrap").width(me.getCurSelWidth()+ (filterName.length * 30));
                selectedPF.prepend(html);
                
                me.getObjMap(true);
                me.checkSelectedStatus(true);
                me.animateFunc(S.one('.pf-selid-' + filterId), {
                    "margin-left": 0
                }, function(obj){
                    obj.css({"opacity":1});
                    me.checkSelectedStatus();
                    S.one(".pf-st-wrap").width(me.getCurSelWidth());
                });
            }
            function delSelectedItem(filterId){
                S.all(".fp-item-" + filterId).removeClass("selected");
                
                var obj = S.one(".pf-selid-" + filterId);
                obj.css("z-index", 0);
                me.animateFunc(obj, {
                    "margin-left":-(obj.width() + 35)
                }, function(obj){
                    obj.remove();
                    me.getObjMap(true);
                    S.one(".pf-st-wrap").width(me.getCurSelWidth());
                    me.checkSelectedStatus();
                }, .3);
            }
            S.Event.delegate('#J_propertyFilter', 'click', '.filter-item', function(e){
                var filteritem = S.one(e.target);
                var slideItem = filteritem.parent(".filter-cate");
                
                if(!filteritem.hasClass("filter-item")){
                    filteritem = filteritem.parent(".filter-item");
                }
                propertyFilter.ATTRS.curLink = filteritem.attr("href");
                
                var filterType = slideItem.attr("filtertype");
                var filterTypeId = slideItem.attr("filterid");
                var filterId = filteritem.attr("filterid");
                var filterName = filteritem.attr("filtername");
                
                var switchUl = filteritem.parent(".pf-switch-ul");
                if(switchUl){
                    propertyFilter.ATTRS.curSwitchId = switchUl.attr("groupid");
                }
                
                if(filteritem.hasClass("selected")){
                    delSelectedItem(filterId);
                }else{
                    addSelectedItem(filterType, filterId, filterName, filteritem);
                    if(filterTypeId == "30000"){
                        me.animateFunc(S.one(".pf-slide-item-30000"), {
                            opacity:0,
                            "margin-left":-S.all(".pf-slide-item-30000").width()
                        }, function(obj){
                            obj.remove();
                            me.calWidth();
                        }, .3);
                    }
                }
                e.preventDefault();
            });
            //点击已选项删除
            S.Event.delegate('#J_propertyFilter', 'click', '.selected-item', function(e){
                propertyFilter.ATTRS.curLink = e.target.href;
                var selObj = S.one(e.target);
                if(!selObj.hasClass("selected-item")){
                    selObj = selObj.parent(".selected-item");
                }
                var filterid = selObj.attr("filterid");
                delSelectedItem(filterid);
                e.preventDefault();
            });
            //hover已选项删除
            S.Event.delegate('#J_propertyFilter', 'mouseenter', '.selected-item', function(e){
                objMap.pfSelectedItem.removeClass("hover");
                S.one(e.target).addClass("hover");
            });
            //hover已选项删除
            S.Event.delegate('#J_propertyFilter', 'mouseleave', '.selected-item', function(e){
                S.one(e.target).removeClass("hover");
            });
            //删除全部
            S.Event.delegate('#J_propertyFilter', 'click', '.pf-st-clearall', function(e){
                propertyFilter.ATTRS.curSwitchId = 0;
                var clearallObj = S.one(e.target);
                if(!clearallObj.hasClass("pf-st-clearall")){
                    clearallObj = clearallObj.parent(".pf-st-clearall");
                }
                propertyFilter.ATTRS.curLink = clearallObj.attr("href");
                S.all(".filter-item").removeClass("selected");
                
                me.animateFunc(S.all(".selected-item"), {
                    "margin-left":-70
                }, function(obj){
                    obj.remove();
                    me.checkSelectedStatus();
                }, .3);
                e.preventDefault();
            });
            
            S.Event.delegate('#J_propertyFilter', 'click', '.pf-st-prev', function(e){
                var slideObj = S.one(".pf-st-slide");
                var outerWidth = slideObj.width();
                S.one(".pf-st-wrap").width(me.getCurSelWidth());
                me.animateFunc(slideObj, {
                    scrollLeft : slideObj.scrollLeft() - outerWidth
                }, function(){
                    me.setSelIndicatorSt();
                }, .6);
                e.preventDefault();
            });
            S.Event.delegate('#J_propertyFilter', 'click', '.pf-st-next', function(e){
                var slideObj = S.one(".pf-st-slide");
                var outerWidth = slideObj.width();
                
                S.one(".pf-st-wrap").width(me.getCurSelWidth());
                me.animateFunc(slideObj, {
                    scrollLeft : slideObj.scrollLeft() + outerWidth
                }, function(){
                    me.setSelIndicatorSt();
                }, .6);
                e.preventDefault();
            });
            me.setSelectedStyle();
            me.checkSelectedStatus(true);
        },
        setSelectedStyle:function(){
            var selectedList = S.all("#J_propertyFilter .selected-item");
            if(selectedList.length > 0){
                for(var i = 0 ; i < selectedList.length ; i++){
                    var itemid = S.one(selectedList[i]).attr("filterid");
                    S.all("#J_propertyFilter .fp-item-" + itemid).addClass("selected");
                }
            }
        },
        checkSelectedStatus: function(noAjax){
            var me = this;
            var objMap = me.getObjMap(true);
            
            if(objMap.pfSelectedItem.length > 0){
                objMap.pfCharactor.addClass("topborder");
                if(objMap.pfSelected.css("display") == "none"){
                    objMap.pfSelected.addClass("show");
                    objMap.pfclearAll.addClass("show");
                    me.animateFunc(objMap.pfSelected, {
                        "height": 24
                    }, function(){
                    }, .2);
                }else{
                    objMap.pfclearAll.addClass("show");
                }
                me.setSelIndicatorSt();
            }else{
                objMap.pfCharactor.removeClass("topborder");
                objMap.pfclearAll.removeClass("show");
                me.animateFunc(objMap.pfSelected, {
                    "height": 0
                }, function(){
                    objMap.pfSelected.removeClass("show");
                }, .2);
            }
            if(!noAjax){
                me.sendAjax();
            }
        },
        sendAjax: function() {
            if(true){
                Router.navigate(this.getQueryParam());
            }else{
                var localhost = window.location.origin;
                var suburl = propertyFilter.ATTRS.curLink.replace(localhost, "");
                var url = "http://fashion.s.etao.com" + suburl;
                var param = {
                    ppath:this.getPPath(),
                    from:"srpAjax",
                    renderType:"json",
                    fromscombo:"yes",
                    mdList:"compass,compass_json",
                    tbpm:"t"
                };
                var debug = false;
                if(debug == true){
                    param.q = "女装";
                    param.start_price=300;
                    param.end_price=900;
                    delete param.ppath;
                    url = "http://fashion.s.etao.com/search";
                }
                var me = this;
                S.io({
                    type:"get",
                    url: url,
                    data: param,
                    success: function(data){
                        if(data.status == "1"){
                            console.log(data.resultList.compass_json.html);
                            me.setData(data.resultList.compass_json.html);
                        }
                    },
                    dataType: "jsonp"
                })
            }
        },
        setSelIndicatorSt:function(){
            var slideObj = S.one(".pf-st-slide");
            var pfClearAllObj = S.one(".pf-st-clearall");
            
            var maxLeft = slideObj.offset().left + slideObj.width();
            var scrollLeft = slideObj.scrollLeft();
            var clearAllRight = pfClearAllObj.width() + pfClearAllObj.offset().left;
            
            if(clearAllRight > maxLeft){
                S.one(".pf-st-next").show();
            }else{
                S.one(".pf-st-next").hide();
            }
            
            if(scrollLeft > 0){
                S.one(".pf-st-prev").show();
            }else{
                S.one(".pf-st-prev").hide();
            }
        },
        getCurSelWidth: function(){
            var me = this;
            var objMap = me.getObjMap();
            var selItems = objMap.pfSelectedItem;
            var returnWidth = 0;
            selItems.each(function(){
                returnWidth += this[0].offsetWidth + 10;
            });
            return returnWidth + 150;
        },
        getObjMap: function(force){
            if(propertyFilter.ATTRS.objMap == null || force){
                propertyFilter.ATTRS.objMap = {
                    pfObj : S.one("#J_propertyFilter"),
                    pfCharactor: S.all(".charactor-panel"),
                    pfSelectedItem: S.all(".selected-item"),
                    pfSelected : S.one("#J_propertyFilter .pf-selected"),
                    pfclearAll : S.one("#J_propertyFilter .pf-st-clearall")
                };
            }
            return propertyFilter.ATTRS.objMap;
        }
    };
    
    propertyFilter.EVENTS = {
    };
    
    S.extend(propertyFilter, Brick, {
        initialize: function() {
            this.initEvent();
            this.initStatus();
            this.initSelected();
        },
        setAjaxData: function(data){
            this.setData(data);
        }
    });

    S.augment(propertyFilter, propertyFilter.METHODS);
    return propertyFilter;
}, {
    requires: ['brix/core/brick',"switchable",'brix/core/mustache', "magix/router"]
});

/* source from: >> components/storelist/index.js */
KISSY.add('components/storelist/index', function(S, Brick) {
	var DOM = S.DOM;
	function storeList() {
		storeList.superclass.constructor.apply(this, arguments);
	}

	storeList.ATTRS = {
		state: {
			value: 0
		},

		morePanelWidth: {
			value: 0
		}
	};

	storeList.METHODS = {
		//重新渲染更多面板，只渲染一次
		//forceElInListCount  强制一个纵向列表中有几个行
		rePaintMorepanel: function(forceElInListCount) {
			if (this.isMorePanelPainted) {
				return false;
			}

			var el = this.get('el'),
			morePanel = el.one('.more-panel'),
			allListEls = morePanel.all('li'),

			listPadingTop = 20,
			listPaddingLeft = 20,
			listPaddingBottom = 18,

			oneListEl = this.get('el').one('li'),
			oneListElHeight = oneListEl.height(),
			oneListElWidth = oneListEl.width(),

			//取左侧列表中li数量作为行数
			elInListlCount = forceElInListCount || el.one('.panel').all('li').length,
			listCount = Math.ceil(allListEls.length / elInListlCount);

			//如果更多里的li的数量小于左侧菜单里的li行数
			if (allListEls.length < elInListlCount) {
				this.rePaintMorepanel(allListEls.length);
				return false;
			}

			//限制最多3列
			if (listCount > 3) {
				this.rePaintMorepanel(++elInListlCount);
				return false;
			}

			//设置更多容器的宽度
			var morePanelWidth = listCount * oneListElWidth + listPaddingLeft,
			/* IE下没有背景色的bug修复*/
			morePanelHeight = elInListlCount * oneListElHeight + listPadingTop + listPaddingBottom;

			//如果弹出菜单可能超出屏幕外, 把一列的行数+1，然后重新计算
			var viewportWidth = DOM.viewportWidth;
			if (viewportWidth < morePanelWidth + oneListElWidth + listPaddingLeft) {
				this.rePaintMorepanel(++elInListlCount);
			}

			this.set('morePanelWidth', morePanelWidth);
			this.set('morePanelInnerHeight', morePanelHeight + listPadingTop);

			morePanel.css({
				width: morePanelWidth,
				height: morePanelHeight
			});

			//取出一些li并且重新构建ul
			var uls = [];

			for (var listIndex = 1; listIndex < listCount; listIndex++) {
				uls[listIndex] = document.createElement('ul');

				for (var startIndex = elInListlCount * listIndex, endIndex = startIndex + elInListlCount * (listIndex + 1); startIndex < endIndex; startIndex++) {
					if (allListEls[startIndex]) {
						uls[listIndex].appendChild(allListEls[startIndex]);
					} else {
						break;
					}
				}

				morePanel.append(uls[listIndex]);
			}

			uls = null;

			morePanel.all('ul').each(function(v, i) {
				v.css('top', listPadingTop);
				v.css('left', i * oneListElWidth + listPaddingLeft);
			});

			this.isMorePanelPainted = true;
		},

		//没有动画展示面板
        //为了实现点击storelist时保持面板展开状态
		showPanelNoAnim: function() {
			var el = this.get('el'),
			animEl = el.one('.more-panel');

			el.css({
				'height': el.height(),
				'width': el.width()
			});

			el.addClass('storelist-opened');

			this.rePaintMorepanel();

			var animTo = this.get('morePanelWidth'),
			animElOffset = animEl.offset(),
			animElInnerHeight = this.get('morePanelInnerHeight'),

			moreBtn = el.one('.toggle-more'),
			moreBtnOffset = moreBtn.offset(),
			scrollTop = DOM.scrollTop(window),
			viewHeight = DOM.viewportHeight();

			//保证整个面板始终显示在屏幕区域，且优先与更多按钮的底部对齐
			if (moreBtnOffset.top - scrollTop > animEl.height()) {
				animEl.css({
					top: moreBtnOffset.top + moreBtn.innerHeight() - animElOffset.top - animElInnerHeight,
                    width:animTo
				})
			} else {
				animEl.css({
					top: moreBtnOffset.top - animElOffset.top,
                    width:animTo
				})
			}

			this.set('state', 1);
        },

		//动画显示更多面板
		showPanel: function() {
			var el = this.get('el'),
			animEl = el.one('.more-panel');

			el.css({
				'height': el.height(),
				'width': el.width()
			});

			el.addClass('storelist-opened');

			this.rePaintMorepanel();

			//每次重置一下面板的位置
			//及宽度，为动画准备
			animEl.css({
				top: 0,
				width: 0
			});

			var animTo = this.get('morePanelWidth'),
			animElOffset = animEl.offset(),
			animElInnerHeight = this.get('morePanelInnerHeight'),

			moreBtn = el.one('.toggle-more'),
			moreBtnOffset = moreBtn.offset(),
			scrollTop = DOM.scrollTop(window),
			viewHeight = DOM.viewportHeight();

			//保证整个面板始终显示在屏幕区域，且优先与更多按钮的底部对齐
			if (moreBtnOffset.top - scrollTop > animEl.height()) {
				animEl.css({
					top: moreBtnOffset.top + moreBtn.innerHeight() - animElOffset.top - animElInnerHeight
				})
			} else {
				animEl.css({
					top: moreBtnOffset.top - animElOffset.top
				})
			}

			animEl.stop().animate({
				width: animTo
			}, {
				duration: 0.5,
				easing: "easeOutStrong",
				complete: function() {}
			});

			this.set('state', 1);
		},

		//动画隐藏更多面板
		hidePanel: function() {
			var el = this.get('el'),
			animEl = el.one('.more-panel'),

			self = this;

			this.closeTimer = setTimeout(function() {
				try {
					animEl.stop().animate({
						width: 0
					}, {
						duration: 0.5,
						easing: "easeOutStrong",
						complete: function() {
							el.removeClass('storelist-opened');
						}
					});

					self.set('state', 0);
				} catch(e) {}

			}, 250)
		},

		toggleCheckbox: function(e) {
			var el = S.one(e.currentTarget);
			el.toggleClass('checkbox-checked');
		},

		//清除收起更多面板的定时器
		clearHideTimer: function() {
			clearTimeout(this.closeTimer);
		}
	};

	storeList.EVENTS = {
		'li a': {
			click: function(e) {
				this.toggleCheckbox(e);
			}
		},

		'.toggle-more a': {
			click: function(e) {
                e.preventDefault()
			},

			mouseenter: function() {
				if (this.get('state')) {
					this.clearHideTimer();
				} else {
					this.showPanel();
				}
			}, mouseleave: function() {
				this.hidePanel();
			}
		},

		'.more-panel': {
			mouseenter: function() {
				this.clearHideTimer();
			}, mouseleave: function() {
				this.hidePanel();
			}
		}
	};

	S.extend(storeList, Brick, {
		initialize: function() {}
	});

	S.augment(storeList, storeList.METHODS);
	return storeList;
}, {
	requires: ['brix/core/brick']
});


/* source from: >> src/magix/layouts_default.js */
KISSY.add("app/views/layouts/default",function(S,MXView){
	return MXView.extend({
		hasTemplate:false,
        init: function() {
        }
	})
},{
	requires:["magix/view"]
});

/* source from: >> src/magix/views_header.js */
KISSY.add("app/views/header", function(S,View,Router,Pagelet,Local){
	return View.extend({
		hasTemplate: false,
		init: function() {
            var me = this;
			this.$pagelet = new Pagelet({
				tmpl: '#' + this.id
			});

            if (!_srp_profile.async) {
                me.pv(Magix.$pageData);
            } else if (_srp_profile.async.status) {
                me.pv(Local.$data.data.resultList);
            }

			var dataLoaded = function(e) {
			    if (e.isSuccess) {
                    me.pv(e.data.resultList);
                    me.render();
                }

                _srp_profile.timing.viewsHeaderDone = +new Date;
			};
			Local.bind('dataLoaded', dataLoaded);
			me.bind('destroy', function() {//在创建完成后才绑定destroy
				Local.unbind('dataLoaded', dataLoaded);
			});

            _srp_profile.timing.viewsHeaderDone = +new Date;
		},
		pv: function(resultList) {
            if (!resultList.appStatistic) return;

            var pv_img_src = resultList.appStatistic.html;
            if(pv_img_src.indexOf('"') == 0){
                pv_img_src = pv_img_src.substring(1, pv_img_src.length - 1);
            }
            pv_img_src += window.etao_onebox_type_stats === undefined ? '' : window.etao_onebox_type_stats;
            pv_img_src += '&searchurl=' + encodeURIComponent(location.href);
            pv_img_src += '&pre=' + encodeURIComponent(document.referrer);
            pv_img_src += '&t=' + parseInt(Math.random() * 100000 + 1);

            var me = this;
            (window.goldlog_queue || (window.goldlog_queue = [])).push({
                action: "goldlog.record",
                arguments: ['/search', 'etao_search', pv_img_src, 'H51884969']
            });
            
            me._atpstat = new Image();
            me._atpstat.onload = (me._atpstat.onerror = function() {me._atpstat = null;});
            me._atpstat.src = 'http://www.atpanel.com/search?' + pv_img_src;
		},
        render: function(){
            var me=this;
            Local.getData(function(data){
                //在x个商家中找到y个商品
                var resultList=data.data.resultList;
                var statisticHtml = resultList.statInfo.html;
                var statisticObj = KISSY.one(".header .statistic");
                var domHtml = KISSY.DOM.create(statisticHtml);
                KISSY.DOM.html(statisticObj[0], domHtml.innerHTML);
            });
        }
	})
},{
	requires:["magix/view","magix/router","brix/core/pagelet",'srp/local']
});

/* source from: >> src/magix/views_main.js */
KISSY.add("app/views/main",function(S, View, Local, Pagelet, Router, Datalazyload){
	return View.extend({
		hasTemplate: false,
		buildPagelet: function(){
			var self=this;
			self.$pagelet=new Pagelet({
				tmpl:'#'+self.id,
				isRemoveEl:false
			});
            _srp_profile.timing.viewsMainPagelet = +new Date;
		},
		destroyPagelet: function(){
			var self=this;
			if(self.$pagelet){
				self.$pagelet.destroy();
			}
		},
        datalazyload: function() {
            var lazy = new Datalazyload('.J-srp-content');

            // 元素渐显，ie9以下取消此效果
            if (!(S.UA.ie < 9)) {
                S.each(lazy.images, function(v, i) {
                    lazy.addCallback(v, function() {
                        var el = S.one(v).parent('.griditem');
                        if (el) {

                            el.css('opacity', 0);
                            S.Anim(el, {
                                opacity: 1
                            }, 1, 'easeIn').run()
                        }
                    });
                });
            }
            _srp_profile.timing.viewsMainDone = _srp_profile.timing.viewsMainLazyload = +new Date;
            if (_srp_profile.logType === 2 || _srp_profile.logType === 3 && _srp_profile.timing.onload) {
                _srp_profiler();
            }
        },
        mask: function() {
            S.one('.main').append('<div id="main-mask" style="display:none"><div id="main-mask-bg"></div><div class="loading"><img src="http://img01.taobaocdn.com/tps/i1/T1UWkNXhXcXXc.LCDe-40-18.gif" />加载中</div></div>');
            
            mask.one('.loading').css('left', S.one('.main').offset().left + S.one('.main').outerWidth()/2);
            S.one(window).on('resize', function(){
                setTimeout(function(){
                    mask.one('.loading').css('left', S.one('.main').offset().left + S.one('.main').outerWidth()/2);
                }, 200);
            });

            if (S.UA.ie === 6) {
                S.one('#main-mask').css('height', S.one('.main').height());
            }
        },
		init:function(){
			var me =this;

			var dataLoaded=function(e){
				me.render();
			};
			Local.bind('dataLoaded',dataLoaded);
			me.bind('destroy',function(e){
				Local.unbind('dataLoaded',dataLoaded);
			});

		},
		render:function(){
			var me=this;
            if (!_srp_profile.async) {
                me.mask();
                me.buildPagelet();
                me.datalazyload();
                return;
            }
			Local.getData(function(data){
				me.destroyPagelet();
                var mask = S.one('#main-mask');
                if (mask) { mask.hide(); }
				var resultList=data.data.resultList;
				var html=[
					resultList.refine.html,//filter bar
					resultList.result.html,//grid view
					resultList.structCombo.html,
					resultList.pagination.html,//分页
					resultList.taobaInfo.html,//淘吧
					resultList.relatesearch.html//相关搜索
				].join('');
				me.setViewHTML(html);
				me.buildPagelet();

                me.datalazyload();
			});
		}
	});
},{
    requires:["magix/view","srp/local","brix/core/pagelet", "magix/router", 'datalazyload']
});

/* source from: >> src/magix/views_nav.js */
KISSY.add("app/views/nav",function(S,View,Router,Pagelet,Local){
    return View.extend({
        hasTemplate:false,
        buildPagelet: function(){
            var self=this;
            self.$pagelet=new Pagelet({
                tmpl:'#'+self.id
            });
        },
        destroyPagelet: function(){
            var self=this;
            if(self.$pagelet){
                self.$pagelet.destroy();
            }
        },
        init:function(){
            var self=this;
            
            var dataLoaded=function(e){
                self.render();
            };
            Local.bind('dataLoaded',dataLoaded);
            self.bind('destroy',function(){//在创建完成后才绑定destroy
                Local.unbind('dataLoaded',dataLoaded);
            });
        },
        render:function(){
            var self=this;
            if (!_srp_profile.async) {
                self.buildPagelet();
                _srp_profile.timing.viewsNavDone = +new Date;
                return;
            }

            Local.getData(function(data){
                if(data && data.data && data.data.resultList){
                    //onebox
                    var navVfram = KISSY.one("#magix_vf_1");
                    var oneBox = KISSY.one(".onebox-box");
                    var oneboxHtml = data.data.resultList.onebox.html;
                    if(oneboxHtml == ""){
                        if(oneBox){
                            KISSY.DOM.remove(oneBox[0]);
                        }
                    }else{
                        if(navVfram){
                            if(oneBox){
                                var domHtml = KISSY.DOM.create(oneboxHtml);
                                KISSY.DOM.html(oneBox[0], domHtml.innerHTML);
                            }else{
                                navVfram.prepend(oneboxHtml);
                            }
                        }
                    }
                    
                    //property filter
                    var properFilter = KISSY.one("#J_propertyFilter");
                    var htmlStr = data.data.resultList.compass.html;
                    var jsonStr = data.data.resultList.compass_json.html;
                    var returnJson = KISSY.JSON.parse(jsonStr);
                    if(properFilter){
                        if(returnJson.hiddenCompass){
                            properFilter.hide();
                        }else{
                            properFilter.show();
                            self.$pagelet.getBrick("J_propertyFilter").setAjaxData(jsonStr);
                        }
                    }else{
                        self.setViewHTML(htmlStr);
                        self.buildPagelet();
                    }
                }
                _srp_profile.timing.viewsNavDone = +new Date;
            });
        }
    })
},{
    requires:["magix/view","magix/router","brix/core/pagelet","srp/local"]
});

/* source from: >> src/magix/views_sidebar.js */
KISSY.add("app/views/sidebar",function(S,MxView,Router,Pagelet,Local){
	return MxView.extend({
		hasTemplate:false,
		buildPagelet:function(){
			var self=this;
			self.$pagelet=new Pagelet({
				tmpl:'#'+self.id,
				isRemoveEl:false
			});

			var delegateClick=function(e){
				e.preventDefault();
				Router.navigate(e.currentTarget.href);
			};

			S.one('#' + self.id).delegate('click','a',self.$dc=delegateClick);

            if( self.storeListState ) {
                self.$pagelet.getBrick('J_StoreList').showPanelNoAnim();
            }

            _srp_profile.timing.viewsSidebarDone = +new Date;
		},
		destroyPagelet:function(){
			var self=this;
			if(self.$pagelet){
				S.one('#' + self.id).undelegate('click','a',self.$dc);

                //保存storelist的状态
                self.storeListState = self.$pagelet.getBrick('J_StoreList').get('state');

				self.$pagelet.destroy();
			}
		},
		init:function(){
			var me = this;

			var dataLoaded=function(e){
				me.render();
			};
			Local.bind('dataLoaded',dataLoaded);			
			me.bind('destroy',function(){//在创建完成后才绑定destroy
				Local.unbind('dataLoaded',dataLoaded);
			});
		},
		render:function(){
			var me=this;
            if (!_srp_profile.async) {
                me.buildPagelet();
                return;
            }

			Local.getData(function(data){
				me.destroyPagelet();
				var resultList=data.data.resultList;
				me.setViewHTML(resultList.category.html+resultList.seller.html);
				me.buildPagelet();
			});
		}
	})
},{
	requires:["magix/view","magix/router","brix/core/pagelet","srp/local"]
});

/* source from: >> src/srp/datalazyload-min.js */
/*
Copyright 2012, KISSY UI Library v1.20
MIT Licensed
build time: Mar 29 13:31
*/
//havne update _loadImg function add try catch
KISSY.add("datalazyload/impl",function(f,c,k,m){function i(a,b){if(!(this instanceof i))return new i(a,b);if(b===m){b=a;a=[n]}f.isArray(a)||(a=[c.get(a)||n]);this.containers=a;this.config=f.merge(s,b);this.callbacks={els:[],fns:[]};this._init();return m}var l=window,t=0.1,n=document,o="scroll",p="resize",s={mod:"manual",diff:"default",placeholder:"none",execScript:true};f.augment(i,{_init:function(){this.threshold=this._getThreshold();this._filterItems();this._initLoadEvent()},_filterItems:function(){var a=
this.containers,b,d,e,h=[],g=[];b=0;for(d=a.length;b<d;++b){e=c.query("img",a[b]);h=h.concat(f.filter(e,this._filterImg,this));e=c.query("textarea",a[b]);g=g.concat(f.filter(e,this._filterArea,this))}this.images=h;this.areaes=g},_filterImg:function(a){var b=a.getAttribute("data-ks-lazyload"),d=this.threshold,e=this.config.placeholder;if(this.config.mod==="manual"){if(b){if(e!=="none")a.src=e;return true}}else if(c.offset(a).top>d&&!b){c.attr(a,"data-ks-lazyload",a.src);if(e!=="none")a.src=e;else a.removeAttribute("src");
return true}},_filterArea:function(a){return c.hasClass(a,"ks-datalazyload")},_initLoadEvent:function(){function a(){d||(d=f.later(function(){b();d=null},t))}function b(){e._loadItems();if(e._getItemsLength()===0){k.remove(l,o,a);k.remove(l,p,h)}}var d,e=this,h;k.on(l,o,a);k.on(l,p,h=function(){e.threshold=e._getThreshold();a()});e._getItemsLength()&&f.ready(function(){b()})},_loadItems:function(){this._loadImgs();this._loadAreas();this._fireCallbacks()},_loadImgs:function(){this.images=f.filter(this.images,
this._loadImg,this)},_loadImg:function(a){var b=this.threshold+c.scrollTop();try{if(c.offset(a).top<=b)this._loadImgSrc(a);else return true}catch(e){}},_loadImgSrc:function(a,b){b=b||"data-ks-lazyload";var d=a.getAttribute(b);if(d&&a.src!=d){a.src=d;a.removeAttribute(b)}},_loadAreas:function(){this.areaes=f.filter(this.areaes,this._loadArea,this)},_loadArea:function(a){var b=c.css(a,"display")==="none";if(c.offset(b?a.parentNode:a).top<=this.threshold+c.scrollTop())this._loadAreaData(a.parentNode,a,this.config.execScript);
else return true},_loadAreaData:function(a,b,d){b.style.display="none";b.className="";a=c.create("<div>");b.parentNode.insertBefore(a,b);c.html(a,b.value,d===m?true:d)},_fireCallbacks:function(){var a=this.callbacks,b=a.els,d=a.fns,e=this.threshold+c.scrollTop(),h,g,j,q=[],r=[];for(h=0;(g=b[h])&&(j=d[h++]);)if(c.offset(g).top<=e)j.call(g);else{q.push(g);r.push(j)}a.els=q;a.fns=r},addCallback:function(a,b){var d=this.callbacks;if((a=c.get(a))&&f.isFunction(b)){d.els.push(a);d.fns.push(b)}this._fireCallbacks()},
_getThreshold:function(){var a=this.config.diff,b=c.viewportHeight();return a==="default"?2*b:b+ +a},_getItemsLength:function(){return this.images.length+this.areaes.length+this.callbacks.els.length},loadCustomLazyData:function(a,b){var d=this,e,h;if(b==="img-src")b="img";f.isArray(a)||(a=[c.get(a)]);f.each(a,function(g){switch(b){case "img":h=g.nodeName==="IMG"?[g]:c.query("img",g);f.each(h,function(j){d._loadImgSrc(j,"data-ks-lazyload-custom")});break;default:(e=c.get("textarea",g))&&c.hasClass(e,
"ks-datalazyload-custom")&&d._loadAreaData(g,e)}})}});f.mix(i,i.prototype,true,["loadCustomLazyData","_loadImgSrc","_loadAreaData"]);return i},{requires:["dom","event"]});KISSY.add("datalazyload",function(f,c){return f.DataLazyload=c},{requires:["datalazyload/impl"]});
/* source from: >> src/srp/data_stat.js */
//埋点请求发送代码
KISSY.ready(function(S) {
    var D = S.DOM, E = S.Event, $ = S.all;

    $('body').delegate('click', 'a[data-stat]', function(ev) {
        var target = ev.target;

        function getCookie(Name) {
            var search = Name + "="
            if(document.cookie.length > 0) {
                offset = document.cookie.indexOf(search)
                if(offset != -1) {
                    offset += search.length
                    end = document.cookie.indexOf(";", offset)
                    if(end == -1)
                        end = document.cookie.length
                    return unescape(document.cookie.substring(offset, end))
                } else
                    return ""
            }
        }

        if(target.tagName.toUpperCase() != 'A') {
            target = D.parent(target, 'a');
            if(!target)
                return;
        }

        var statStr = D.attr(target, 'data-stat');
        if(statStr && S.Stat) {
            statStr += ['&time=', (new Date()).getTime()].join('');
            statStr += ['&cna=', getCookie("cna")].join('');
            statStr += ['&pre=', encodeURIComponent(document.referrer)].join('');
            S.Stat(statStr, true);

            goldlog.record('/search', 'etao_search', statStr, 'H51884969');
        }
    });
});

/* source from: >> src/srp/retina.js */
// retina 支持
KISSY.ready(function(S) {
    if(window.devicePixelRatio){
        S.Cookie.set("devicePixelRatio", window.devicePixelRatio, undefined);
        //S.Cookie.set("devicePixelRatio", 2, undefined);
    }
});

/* source from: >> src/srp/srp_login.js */
// 全局变量，给淘宝机票等合作的iframe嵌入页面调用.
function srpLogin(successUrl) {
    KISSY.use('LoginPopup', function(S) {
        var login = S.LoginPopup();
        login.init({
            loginType: 'taobao',
            redirect_url: successUrl
        });

        if (login.checkTrueLogin()) {
            // 已登录直接跳转.
            location = successUrl;
        } else {
            // 未登录显示mini登陆.
            login.showLoginPopup();
        }
    });
}

/* source from: >> src/srp/switchable-min.js */
/*
Copyright 2012, KISSY UI Library v1.20
MIT Licensed
build time: Jun 6 13:51
*/
KISSY.add("switchable/base",function(c,d,g,j){function e(b,a){a=a||{};"markupType"in a||(a.panelCls?a.markupType=1:a.panels&&(a.markupType=2));for(var m=this.constructor;m;)a=c.merge(m.Config,a),m=m.superclass?m.superclass.constructor:null;this.container=d.get(b);this.config=a;this.activeIndex=this.completedIndex=a.activeIndex;!(-1<this.activeIndex)&&"number"!=typeof a.switchTo&&(this.completedIndex=this.activeIndex=0);this._init();this._initPlugins();this.fire(l);-1<this.activeIndex||"number"==typeof a.switchTo&&
this.switchTo(a.switchTo)}function k(b){var a={};a.type=b.originalEvent.type;a.target=b.originalEvent.target||b.originalEvent.srcElement;return{originalEvent:a}}var h=c.makeArray,f=g.Target,l="init";e.getDomEvent=k;e.Config={markupType:0,navCls:"ks-switchable-nav",contentCls:"ks-switchable-content",triggerCls:"ks-switchable-trigger",panelCls:"ks-switchable-panel",triggers:[],panels:[],hasTriggers:!0,triggerType:"mouse",delay:0.1,activeIndex:-1,activeTriggerCls:"ks-active",steps:1,viewSize:[]};e.Plugins=
[];c.augment(e,f,{_initPlugins:function(){for(var b=this,a=b.constructor;a;)c.each(a.Plugins,function(a){a.init&&a.init(b)}),a=a.superclass?a.superclass.constructor:null},_init:function(){var b=this.config;this._parseMarkup();b.hasTriggers&&this._bindTriggers()},_parseMarkup:function(){var b=this.container,a=this.config,m,f,i=[],c=[];switch(a.markupType){case 0:(m=d.get("."+a.navCls,b))&&(i=d.children(m));f=d.get("."+a.contentCls,b);c=d.children(f);break;case 1:i=d.query("."+a.triggerCls,b);c=d.query("."+
a.panelCls,b);break;case 2:i=a.triggers,c=a.panels}b=c.length;this.length=Math.ceil(b/a.steps);a.hasTriggers&&0<b&&0===i.length&&(i=this._generateTriggersMarkup(this.length));this.triggers=h(i);this.panels=h(c);this.content=f||c[0].parentNode;this.nav=m||a.hasTriggers&&i[0].parentNode},_generateTriggersMarkup:function(b){var a=this.config,c=d.create("<ul>"),f,i;c.className=a.navCls;for(i=0;i<b;i++)f=d.create("<li>"),i===this.activeIndex&&(f.className=a.activeTriggerCls),f.innerHTML=i+1,c.appendChild(f);
this.container.appendChild(c);return d.children(c)},_bindTriggers:function(){var b=this,a=b.config,d=b.triggers,c,f,e=d.length;for(f=0;f<e;f++)(function(f){c=d[f];g.on(c,"click",function(a){b._onFocusTrigger(f,a)});"mouse"===a.triggerType&&(g.on(c,"mouseenter",function(a){b._onMouseEnterTrigger(f,a)}),g.on(c,"mouseleave",function(){b._onMouseLeaveTrigger(f)}))})(f)},_onFocusTrigger:function(b,a){this._triggerIsValid(b)&&(this._cancelSwitchTimer(),this.switchTo(b,j,k(a)))},_onMouseEnterTrigger:function(b,
a){var f=this;if(f._triggerIsValid(b)){var d=k(a);f.switchTimer=c.later(function(){f.switchTo(b,j,d)},1E3*f.config.delay)}},_onMouseLeaveTrigger:function(){this._cancelSwitchTimer()},_triggerIsValid:function(b){return this.activeIndex!==b},_cancelSwitchTimer:function(){this.switchTimer&&(this.switchTimer.cancel(),this.switchTimer=j)},switchTo:function(b,a,f,d){var c=this,e=c.config,l=c.triggers,g=c.panels,n=c.activeIndex,h=e.steps,p=n*h,k=b*h;if(!c._triggerIsValid(b)||!1===c.fire("beforeSwitch",{toIndex:b}))return c;
e.hasTriggers&&c._switchTrigger(-1<n?l[n]:null,l[b]);a===j&&(a=b>n?"forward":"backward");c._switchView(-1<n?g.slice(p,p+h):null,g.slice(k,k+h),b,a,f,function(){d&&d.call(c,b);c.completedIndex=b});c.activeIndex=b;return c},_switchTrigger:function(b,a){var c=this.config.activeTriggerCls;b&&d.removeClass(b,c);d.addClass(a,c)},_switchView:function(b,a,c,f,e,l){b&&d.css(b,"display","none");d.css(a,"display","block");this._fireOnSwitch(c,e);l&&l.call(this)},_fireOnSwitch:function(b,a){this.fire("switch",
c.mix(a||{},{currentIndex:b}))},prev:function(c){var a=this.activeIndex;this.switchTo(0<a?a-1:this.length-1,"backward",c)},next:function(c){var a=this.activeIndex;this.switchTo(a<this.length-1?a+1:0,"forward",c)}});return e},{requires:["dom","event"]});
KISSY.add("switchable/aria",function(c,d,g,j){function e(){this.stop&&this.stop()}function k(){this.start&&this.start()}j.Plugins.push({name:"aria",init:function(c){if(c.config.aria){var d=c.container;g.on(d,"focusin",e,c);g.on(d,"focusout",k,c)}}});var h=["a","input","button","object"];return{setTabIndex:function(f,e){f.tabIndex=e;d.query("*",f).each(function(b){var a=b.nodeName.toLowerCase();c.inArray(a,h)&&(d.hasAttr(b,"oriTabIndex")||d.attr(b,"oriTabIndex",b.tabIndex),b.tabIndex=-1!=e?d.attr(b,
"oriTabIndex"):e)})}}},{requires:["dom","event","./base"]});
KISSY.add("switchable/accordion/base",function(c,d,g){function j(c,d){if(!(this instanceof j))return new j(c,d);j.superclass.constructor.apply(this,arguments)}c.extend(j,g,{_switchTrigger:function(c,g){var h=this.config;h.multiple?d.toggleClass(g,h.activeTriggerCls):j.superclass._switchTrigger.apply(this,arguments)},_triggerIsValid:function(c){return this.config.multiple||j.superclass._triggerIsValid.call(this,c)},_switchView:function(c,g,h,f,l,b){var a=g[0];this.config.multiple?(d.toggle(a),this._fireOnSwitch(h,
l),b&&b.call(this)):j.superclass._switchView.apply(this,arguments)}});j.Plugins=[];j.Config={markupType:1,triggerType:"click",multiple:!1};return j},{requires:["dom","../base"]});
KISSY.add("switchable/accordion/aria",function(c,d,g,j,e){function k(a){var b;c.each(this.triggers,function(c){if(c==a||d.contains(c,a))b=c});return b}function h(a){var b;c.each(this.panels,function(c){if(c==a||d.contains(c,a))b=c});return b}function f(a){var b=k.call(this,a);b||(a=h.call(this,a),b=this.triggers[c.indexOf(a,this.panels)]);return b}function l(a){switch(a.keyCode){case u:case q:a.ctrlKey&&!a.altKey&&!a.shiftKey&&a.halt();break;case v:a.ctrlKey&&!a.altKey&&a.halt()}}function b(b){var d=
b.target,e=this.triggers,g=!b.ctrlKey&&!b.shiftKey&&!b.altKey,l=b.ctrlKey&&!b.shiftKey&&!b.altKey;switch(b.keyCode){case x:case D:if((d=k.call(this,d))&&g)this.switchTo(c.indexOf(d,this.triggers)),b.halt();break;case t:case p:if(d=k.call(this,d))m.call(this,d),b.halt();break;case z:case o:if(d=k.call(this,d))r.call(this,d),b.halt();break;case q:l&&(b.halt(),d=f.call(this,d),r.call(this,d));break;case u:l&&(b.halt(),d=f.call(this,d),m.call(this,d));break;case n:g&&(f.call(this,d),a.call(this,0,!0),
b.halt());break;case s:g&&(f.call(this,d),a.call(this,e.length-1,!0),b.halt());break;case v:b.ctrlKey&&!b.altKey&&(b.halt(),d=f.call(this,d),b.shiftKey?m.call(this,d):r.call(this,d))}}function a(a,b){var f=this.triggers,o=f[a];c.each(f,function(a){a!==o&&(w(a,"-1"),d.removeClass(a,"ks-switchable-select"),a.setAttribute("aria-selected","false"))});b&&o.focus();w(o,"0");d.addClass(o,"ks-switchable-select");o.setAttribute("aria-selected","true")}function m(b){var d=this.triggers,b=c.indexOf(b,d);a.call(this,
0==b?d.length-1:b-1,!0)}function r(b){var d=this.triggers,b=c.indexOf(b,d);a.call(this,b==d.length-1?0:b+1,!0)}function i(b){var d=!(!b.originalEvent.target&&!b.originalEvent.srcElement),b=b.currentIndex,f=this.panels,o=this.triggers,e=o[b],p=f[b];this.config.multiple||(c.each(f,function(a){a!==p&&a.setAttribute("aria-hidden","true")}),c.each(o,function(a){a!==e&&a.setAttribute("aria-hidden","true")}));f=p.getAttribute("aria-hidden");p.setAttribute("aria-hidden","false"==f?"true":"false");e.setAttribute("aria-expanded",
"false"==f?"false":"true");a.call(this,b,d)}var u=33,q=34,s=35,n=36,t=37,p=38,z=39,o=40,v=9,D=32,x=13;c.mix(e.Config,{aria:!0});e.Plugins.push({name:"aria",init:function(a){if(a.config.aria){var f=a.container,o=a.activeIndex;d.attr(f,"aria-multiselectable",a.config.multiple?"true":"false");a.nav&&d.attr(a.nav,"role","tablist");var e=a.triggers,p=a.panels,v=0;c.each(p,function(a){a.id||(a.id=c.guid("ks-accordion-tab-panel"))});c.each(e,function(a){a.id||(a.id=c.guid("ks-accordion-tab"))});c.each(e,
function(a){a.setAttribute("role","tab");a.setAttribute("aria-expanded",o==v?"true":"false");a.setAttribute("aria-selected",o==v?"true":"false");a.setAttribute("aria-controls",p[v].id);w(a,o==v?"0":"-1");v++});v=0;c.each(p,function(a){var b=e[v];a.setAttribute("role","tabpanel");a.setAttribute("aria-hidden",o==v?"false":"true");a.setAttribute("aria-labelledby",b.id);v++});a.on("switch",i,a);g.on(f,"keydown",b,a);g.on(f,"keypress",l,a)}}});var w=j.setTabIndex},{requires:["dom","event","../aria","./base"]});
KISSY.add("switchable/autoplay",function(c,d,g,j){c.mix(g.Config,{autoplay:!1,interval:5,pauseOnHover:!0});g.Plugins.push({name:"autoplay",init:function(e){function g(){l=c.later(function(){e.paused||e.switchTo(e.activeIndex<e.length-1?e.activeIndex+1:0,"forward")},f,!0)}var h=e.config,f=1E3*h.interval,l;h.autoplay&&(g(),e.stop=function(){l&&(l.cancel(),l=j);e.paused=!0},e.start=function(){l&&(l.cancel(),l=j);e.paused=!1;g()},h.pauseOnHover&&(d.on(e.container,"mouseenter",e.stop,e),d.on(e.container,
"mouseleave",e.start,e)))}});return g},{requires:["event","./base"]});KISSY.add("switchable/autorender",function(c,d,g,j){j.autoRender=function(e,j){d.query("."+(e||"KS_Widget"),j).each(function(d){var f=d.getAttribute("data-widget-type"),e;if(f&&-1<"Switchable Tabs Slide Carousel Accordion".indexOf(f))try{(e=d.getAttribute("data-widget-config"))&&(e=e.replace(/'/g,'"')),new c[f](d,g.parse(e))}catch(b){}})}},{requires:["dom","json","switchable/base"]});
KISSY.add("switchable/carousel/base",function(c,d,g,j,e){function k(d,c){if(!(this instanceof k))return new k(d,c);k.superclass.constructor.apply(this,arguments)}var h={originalEvent:{target:1}};k.Config={circular:!0,prevBtnCls:"ks-switchable-prev-btn",nextBtnCls:"ks-switchable-next-btn",disableBtnCls:"ks-switchable-disable-btn"};k.Plugins=[];c.extend(k,j,{_init:function(){var f=this;k.superclass._init.call(f);var l=f.config,b=l.disableBtnCls;c.each(["prev","next"],function(a){var b=f[a+"Btn"]=d.get("."+
l[a+"BtnCls"],f.container);g.on(b,"mousedown",function(b){b.preventDefault();b=f.activeIndex;if("prev"==a&&(0!=b||l.circular))f[a](h);if("next"==a&&(b!=f.length-1||l.circular))f[a](h)})});if(!l.circular)f.on("switch",function(a){a=a.currentIndex;a=0===a?f.prevBtn:a===f.length-1?f.nextBtn:e;d.removeClass([f.prevBtn,f.nextBtn],b);a&&d.addClass(a,b)});g.on(f.panels,"click",function(){f.fire("itemSelected",{item:this})})}});return k},{requires:["dom","event","../base"]});
KISSY.add("switchable/carousel/aria",function(c,d,g,j,e){function k(a){var b=a.currentIndex,d=this.activeIndex,f=this.panels,e=f[b*this.config.steps],p=this.triggers,b=p[b];if((a=!(!a.originalEvent.target&&!a.originalEvent.srcElement))||-1==d)c.each(p,function(a){n(a,-1)}),c.each(f,function(a){n(a,-1)}),b&&n(b,0),n(e,0),a&&e.focus()}function h(a){var b;c.each(this.triggers,function(c){if(c==a||d.contains(c,a))return b=c,!1});return b}function f(a){var b=a.target;switch(a.keyCode){case u:case i:if(b=
h.call(this,b)){var f=d.next(b),e=this.triggers;f||(f=e[0]);n(b,-1);f&&(n(f,0),f.focus());a.halt()}break;case r:case m:if(b=h.call(this,b))f=d.prev(b),e=this.triggers,f||(f=e[e.length-1]),n(b,-1),f&&(n(f,0),f.focus()),a.halt();break;case s:case q:if(b=h.call(this,b))this.switchTo(c.indexOf(b,this.triggers),void 0,t),a.halt()}}function l(a){var b;c.each(this.panels,function(c){if(c==a||d.contains(c,a))return b=c,!1});return b}function b(a,b){var d=c.indexOf(a,this.panels),f=this.config.steps,e=Math.floor(d/
f);return e==this.activeIndex?1:0==d%f||d%f==f-1?(this.switchTo(e,b,t),0):1}function a(a){var c=a.target;switch(a.keyCode){case u:case i:if(c=l.call(this,c)){var f=d.next(c),e=this.panels;f||(f=e[0]);n(c,-1);n(f,0);b.call(this,f,p)&&f.focus();a.halt()}break;case r:case m:if(c=l.call(this,c))f=d.prev(c),e=this.panels,f||(f=e[e.length-1]),n(c,-1),n(f,0),b.call(this,f,z)&&f.focus(),a.halt();break;case s:case q:if(c=l.call(this,c))this.fire("itemSelected",{item:c}),a.halt()}}var m=37,r=38,i=39,u=40,q=
32,s=13,n=j.setTabIndex,t={originalEvent:{target:1}},p="forward",z="backward";c.mix(e.Config,{aria:!1});e.Plugins.push({name:"aria",init:function(b){if(b.config.aria){var d=b.triggers,e=b.panels,p=b.content,l=b.activeIndex;p.id||(p.id=c.guid("ks-switchbale-content"));p.setAttribute("role","listbox");var i=0;c.each(d,function(a){n(a,l==i?"0":"-1");a.setAttribute("role","button");a.setAttribute("aria-controls",p.id);i++});i=0;c.each(e,function(a){n(a,"-1");a.setAttribute("role","option");i++});b.on("switch",
k,b);if(d=b.nav)g.on(d,"keydown",f,b);g.on(p,"keydown",a,b);d=b.prevBtn;e=b.nextBtn;d&&(n(d,0),d.setAttribute("role","button"),g.on(d,"keydown",function(a){if(a.keyCode==s||a.keyCode==q){b.prev(t);a.preventDefault()}}));e&&(n(e,0),e.setAttribute("role","button"),g.on(e,"keydown",function(a){if(a.keyCode==s||a.keyCode==q){b.next(t);a.preventDefault()}}))}}})},{requires:["dom","event","../aria","./base"]});
KISSY.add("switchable/effect",function(c,d,g,j,e,k){var h;c.mix(e.Config,{effect:"none",duration:0.5,easing:"easeNone"});e.Effects={none:function(c,e,b){c&&d.css(c,"display","none");d.css(e,"display","block");b&&b()},fade:function(c,e,b){var a=this,g=a.config,h=c?c[0]:null,i=e[0];a.anim&&(a.anim.stop(),d.css(a.anim.fromEl,{zIndex:1,opacity:0}),d.css(a.anim.toEl,"zIndex",9));d.css(i,"opacity",1);h?(a.anim=(new j(h,{opacity:0},g.duration,g.easing,function(){a.anim=k;d.css(i,"z-index",9);d.css(h,"z-index",
1);b&&b()})).run(),a.anim.toEl=i,a.anim.fromEl=h):(d.css(i,"z-index",9),b&&b())},scroll:function(c,e,b,a){var g=this,e=g.config,h="scrollx"===e.effect,i={};i[h?"left":"top"]=-(g.viewSize[h?0:1]*a)+"px";g.anim&&g.anim.stop();c?g.anim=(new j(g.content,i,e.duration,e.easing,function(){g.anim=k;b&&b()})).run():(d.css(g.content,i),b&&b())}};h=e.Effects;h.scrollx=h.scrolly=h.scroll;e.Plugins.push({name:"effect",init:function(f){var e=f.config,b=e.effect,a=f.panels,g=f.content,h=e.steps,i=f.activeIndex,
j=a.length;f.viewSize=[e.viewSize[0]||a[0].offsetWidth*h,e.viewSize[1]||a[0].offsetHeight*h];if("none"!==b)switch(d.css(a,"display","block"),b){case "scrollx":case "scrolly":d.css(g,"position","absolute");"static"==d.css(g.parentNode,"position")&&d.css(g.parentNode,"position","relative");"scrollx"===b&&(d.css(a,"float","left"),d.width(g,f.viewSize[0]*(j/h)));break;case "fade":var k=i*h,s=k+h-1,n;c.each(a,function(a,b){n=b>=k&&b<=s;d.css(a,{opacity:n?1:0,position:"absolute",zIndex:n?9:1})})}}});c.augment(e,
{_switchView:function(d,e,b,a,g,j){var i=this,k=i.config.effect;(c.isFunction(k)?k:h[k]).call(i,d,e,function(){i._fireOnSwitch(b,g);j&&j.call(i)},b,a)}});return e},{requires:["dom","event","anim","switchable/base"]});
KISSY.add("switchable/circular",function(c,d,g,j){function e(c,f,e,p,j){var o=this,f=o.config,l=o.length,m=o.activeIndex,x=f.scrollType===q,w=x?b:a,y=o.viewSize[x?0:1],x=-y*p,A={},C,B=j===u;(C=B&&0===m&&p===l-1||j===i&&m===l-1&&0===p)&&(x=k.call(o,o.panels,p,B,w,y));A[w]=x+r;o.anim&&(o.anim.stop(),"relative"==o.panels[m*f.steps].style.position&&h.call(o,o.panels,m,m,w,y));c?o.anim=(new g(o.content,A,f.duration,f.easing,function(){C&&h.call(o,o.panels,p,B,w,y);o.anim=void 0;e&&e()})).run():(d.css(o.content,
A),e&&e())}function k(a,b,c,e,g){var h=this.config.steps,b=this.length,i=c?b-1:0,a=a.slice(i*h,(i+1)*h);d.css(a,f,l);d.css(a,e,(c?-1:1)*g*b);return c?g:-g*b}function h(a,b,c,e,g){var h=this.config.steps,b=this.length,i=c?b-1:0,a=a.slice(i*h,(i+1)*h);d.css(a,f,m);d.css(a,e,m);d.css(this.content,e,c?-g*(b-1):m)}var f="position",l="relative",b="left",a="top",m="",r="px",i="forward",u="backward",q="scrollx";c.mix(j.Config,{circular:!1});j.Plugins.push({name:"circular",init:function(a){a=a.config;if(a.circular&&
(a.effect===q||"scrolly"===a.effect))a.scrollType=a.effect,a.effect=e}})},{requires:["dom","anim","./base","./effect"]});
KISSY.add("switchable/countdown",function(c,d,g,j,e,k){c.mix(e.Config,{countdown:!1,countdownFromStyle:"",countdownToStyle:"width: 0"});e.Plugins.push({name:"countdown",init:function(e){function f(a){l();q=(new j(r[a],u,m-1)).run()}function l(){a&&(clearTimeout(a),a=null);q&&(q.stop(),q=k)}var b=e.config,a,m=b.interval,r=[],i=b.countdownFromStyle,u=b.countdownToStyle,q;b.autoplay&&b.hasTriggers&&b.countdown&&(c.each(e.triggers,function(a,b){a.innerHTML='<div class="ks-switchable-trigger-mask"></div><div class="ks-switchable-trigger-content">'+
a.innerHTML+"</div>";r[b]=a.firstChild}),b.pauseOnHover&&(g.on(e.container,"mouseenter",function(){l();var a=r[e.activeIndex];i?q=(new j(a,i,0.2,"easeOut")).run():d.attr(a,"style","")}),g.on(e.container,"mouseleave",function(){l();var b=e.activeIndex;d.attr(r[b],"style",i);a=setTimeout(function(){f(b)},200)})),e.on("beforeSwitch",function(){l();r[e.activeIndex]&&d.attr(r[e.activeIndex],"style",i||"")}),e.on("switch",function(a){e.paused||f(a.currentIndex)}),-1<e.activeIndex&&f(e.activeIndex))}});
return e},{requires:["dom","event","anim","./base"]});
KISSY.add("switchable/lazyload",function(c,d,g){var j="beforeSwitch",e="img",k="textarea",h={};h[e]="data-ks-lazyload-custom";h[k]="ks-datalazyload-custom";c.mix(g.Config,{lazyDataType:k});g.Plugins.push({name:"lazyload",init:function(f){function g(c){var h=a.steps,c=c.toIndex*h;b.loadCustomLazyData(f.panels.slice(c,c+h),m);a:{if(c=(h=m===e)?"img":m===k?"textarea":"")for(var c=d.query(c,f.container),q=0,s=c.length;q<s;q++){var n=c[q];if(h?d.attr(n,r):d.hasClass(n,r)){h=!1;break a}}h=!0}h&&f.detach(j,
g)}var b=c.require("datalazyload"),a=f.config,m,r;"img-src"===a.lazyDataType&&(a.lazyDataType=e);"area-data"===a.lazyDataType&&(a.lazyDataType=k);m=a.lazyDataType;r=h[m];if(b&&m&&r)f.on(j,g)}});return g},{requires:["dom","./base"]});KISSY.add("switchable/slide/base",function(c,d){function g(c,d){if(!(this instanceof g))return new g(c,d);g.superclass.constructor.apply(this,arguments)}g.Config={autoplay:!0,circular:!0};g.Plugins=[];c.extend(g,d);return g},{requires:["../base"]});
KISSY.add("switchable/slide/aria",function(c,d,g,j,e){function k(c){switch(c.keyCode){case b:case l:this.next(a);c.halt();break;case f:case h:this.prev(a),c.halt()}}var h=37,f=38,l=39,b=40;c.mix(e.Config,{aria:!1});var a={originalEvent:{target:1}},m=j.setTabIndex;e.Plugins.push({name:"aria",init:function(a){if(a.config.aria){var b=a.panels,e=0,f=a.activeIndex;c.each(a.triggers,function(a){m(a,"-1");e++});e=0;c.each(b,function(a){m(a,f==e?"0":"-1");d.attr(a,"role","option");e++});var h=a.content;d.attr(h,
"role","listbox");g.on(h,"keydown",k,a);m(b[0],0);a.on("switch",function(c){var d=c.currentIndex,c=!(!c.originalEvent.target&&!c.originalEvent.srcElement),e=a.completedIndex;-1<e&&m(b[e],-1);m(b[d],0);c&&b[d].focus()})}}})},{requires:["dom","event","../aria","./base"]});KISSY.add("switchable/tabs/base",function(c,d){function g(c,d){if(!(this instanceof g))return new g(c,d);g.superclass.constructor.call(this,c,d);return 0}c.extend(g,d);g.Config={};g.Plugins=[];return g},{requires:["../base"]});
KISSY.add("switchable/tabs/aria",function(c,d,g,j,e,k){function h(a){var b;c.each(this.triggers,function(c){if(c==a||d.contains(c,a))b=c});return b}function f(b){switch(b.keyCode){case a:case m:b.ctrlKey&&!b.altKey&&!b.shiftKey&&b.halt();break;case s:b.ctrlKey&&!b.altKey&&b.halt()}}function l(b){var c=b.target,d=b.ctrlKey&&!b.shiftKey&&!b.altKey;switch(b.keyCode){case r:case i:h.call(this,c)&&(this.prev(t(b)),b.halt());break;case u:case q:h.call(this,c)&&(this.next(t(b)),b.halt());break;case m:d&&
(b.halt(),this.next(t(b)));break;case a:d&&(b.halt(),this.prev(t(b)));break;case s:b.ctrlKey&&!b.altKey&&(b.halt(),b.shiftKey?this.prev(t(b)):this.next(t(b)))}}function b(a){var b=!(!a.originalEvent.target&&!a.originalEvent.srcElement),c=this.completedIndex,d=a.currentIndex;if(c!=d){var a=this.triggers[c],e=this.triggers[d],c=this.panels[c],d=this.panels[d];a&&n(a,"-1");n(e,"0");b&&e.focus();c&&c.setAttribute("aria-hidden","true");d.setAttribute("aria-hidden","false")}}var a=33,m=34,r=37,i=38,u=39,
q=40,s=9;c.mix(k.Config,{aria:!0});k.Plugins.push({name:"aria",init:function(a){if(a.config.aria){var e=a.triggers,h=a.activeIndex,j=a.panels,i=a.container;a.nav&&d.attr(a.nav,"role","tablist");var k=0;c.each(e,function(a){a.setAttribute("role","tab");n(a,h==k?"0":"-1");a.id||(a.id=c.guid("ks-switchable"));k++});k=0;c.each(j,function(a){var b=e[k];a.setAttribute("role","tabpanel");a.setAttribute("aria-hidden",h==k?"false":"true");a.setAttribute("aria-labelledby",b.id);k++});a.on("switch",b,a);g.on(i,
"keydown",l,a);g.on(i,"keypress",f,a)}}});var n=e.setTabIndex,t=j.getDomEvent},{requires:["dom","event","../base","../aria","./base"]});KISSY.add("switchable",function(c,d,g,j,e,k,h,f,l,b,a,m,r,i,u,q){c.Switchable=d;g={Accordion:j,Carousel:f,Slide:i,Tabs:q};c.mix(c,g);c.mix(d,g);return d},{requires:"switchable/base,switchable/aria,switchable/accordion/base,switchable/accordion/aria,switchable/autoplay,switchable/autorender,switchable/carousel/base,switchable/carousel/aria,switchable/circular,switchable/countdown,switchable/effect,switchable/lazyload,switchable/slide/base,switchable/slide/aria,switchable/tabs/base,switchable/tabs/aria".split(",")});
/* source from: >> src/srp/want.js */
KISSY.ready(function (S) {
    S.add('brix/gallery/popupwant/index', {
        fullpath:'http://a.tbcdn.cn/apps/e/component/121224/brix-popupwant.js',
        cssfullpath:'http://a.tbcdn.cn/apps/e/component/121224/brix-popupwant.css'
    });
    S.use('brix/gallery/popupwant/', function (S, PopWant) {
        var p = new PopWant({
            canCancel: false,
            isPara: true
        });
    });
});

/* source from: >> src/srp/z.magix_init.js */
(function(){
	var pn=location.pathname.replace(/\/[^\/]*$/,'/');

    _srp_profile.timing.magixStart = +new Date;
	Magix.start({
		appHome:'src/srp',
		release:false,
		useHistoryState:true,
		pathCfg:{
			defaultView:'app/views/layouts/default',
			map:{
				'app/views/layouts/default':[pn,pn+'index.php']
			}
		}
	});
})();
