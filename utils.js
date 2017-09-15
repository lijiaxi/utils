//自定义tap事件
function Tap( options ){
    this.options = {
        el: options.el,
        fn: options.fn,
        startPoint : {}
    }
    this.init()
}
Tap.prototype = {
    constructor: Tap,
    init: function(){
        this._touchstart();
        this._touchend()
    },
    _touchstart: function(){
        var $this = this;
        this.options.el.addEventListener('touchstart', function (e) {
            var touches = e.changedTouches[0];
            $this.options.startPoint = {
                x: touches.pageX,
                y: touches.pageY
            }
        }); 
    },
    _touchend: function(){
        var $this = this;
        this.options.el.addEventListener('touchend', function (e) {
            var touches = e.changedTouches[0];
            var nowPoint = {
                x: touches.pageX,
                y: touches.pageY 
            }
            var dis = {
                x: $this.options.startPoint.x - nowPoint.x,
                y: $this.options.startPoint.y - nowPoint.y,
            }
            if( Math.abs( dis.x ) < 5 && Math.abs( dis.y ) < 5 ){
                $this.options.fn && $this.options.fn.call( this, e )
            }
        });
    }

}

//幻灯片
function Silder( options ){
    this.options = {
        el: options.el,
        direction : {
            x :'translateX',
            y: 'translateY'
        },
        startPoint : {},
        elPostion: { },
        axis: options['axis'] || 'x',
        start: options.start,
        end: options.end,
        imgs:[],
        indicator:null,
        imgW: 0,
        isDir: {
            x:false,
            y:false
        },
        isFirst: true,
        currentPage: 0,
    }
    this.render()
}
Silder.prototype = {
    constructor: Silder,
    render:function(){
        this.init();
        this._touchstart();
        this._touchmove();
        this._touchend();
    },
    init: function(){
        var el = this.options.el;
        el.innerHTML += el.innerHTML
        var pageWidth = el.clientWidth;
        var items = el.children;
        for( var i = 0, len = items.length; i < len ;i ++ ){
            items[i].style.width = pageWidth + 'px';
            this.options.imgs.push( items[i] )
        }
        el.style.width = items.length*pageWidth + 'px';
        this.options.imgW = pageWidth;
        this.options.indicator = document.querySelector('.nav').children;
    },
    _touchstart:function(){
        var el = this.options.el;
        var that = this;
        el.addEventListener('touchstart', function (e) {
    
            if( that.options.currentPage == 0 ){
                that.options.currentPage = that.options.imgs.length/2;   
            }else if( that.options.currentPage == that.options.imgs.length - 1 ){
                that.options.currentPage = that.options.imgs.length/2 - 1;                
            }
            css( el,that.options.direction[that.options.axis],-that.options.currentPage*that.options.imgW);
            that.options.start && that.options.start.call( el, e )
            var ev = e.changedTouches[0];
            that.options.elPostion = {
                x: css( el,'translateX'),
                y: css( el,'translateY'),
            }
            that.options.startPoint = {
                x: ev.pageX,
                y: ev.pageY,
            }
        
        });
    },
    _touchmove: function(){
        var that = this;
        var el = that.options.el;
        el.addEventListener('touchmove', function (e) {
            var ev = e.changedTouches[0];
            var nowPoint = {
                x: ev.pageX,
                y: ev.pageY,
            }
            var dis = {
                x: nowPoint.x - that.options.startPoint.x ,
                y:nowPoint.y - that.options.startPoint.y 
            }
            if( dis.x == 0 && dis.y ){
                return;
            }
            var target = {
                x : dis.x + that.options.elPostion.x,
                y : dis.y + that.options.elPostion.y,
            }
            if( that.options.isFirst ){
                if( Math.abs( dis.x ) > Math.abs( dis.y ) ){
                    that.options.isDir.x = true;
                    that.options.isFirst = false
                }else{
                    that.options.isDir.y = true;
                    that.options.isFirst = false
                }
            }
            if( that.options.isDir[that.options.axis]){
                css( el,that.options.direction[that.options.axis],target[that.options.axis]);
                e.preventDefault();        
            }           
        });
    },
    _touchend: function(){
        var that = this;
        var el = this.options.el;
        el.addEventListener('touchend', function (e) {

            that.options.end && that.options.end.call( el, e );
            that.getCurrentPage();
            that._end( -that.options.currentPage*that.options.imgW );
            that.setIndicator();
            that.options.isFirst = true;
            that.options.isDir = {
                x: false,
                y: false
            }
        });
    }
    ,
    _end :function(target){
        var el = this.options.el;
        var start = css(el,'translateX');
        var target = target;
        function animate(){
            start = start + ( target - start ) / 7;
            if( Math.abs( target - start ) <  1 ){
                css(el,'translateX',target);
                return
            }
            css(el,'translateX',start);
            requestAnimationFrame( animate )
        }
        animate()
    },
    getCurrentPage(){
        var el = this.options.el;
        var nowPosition = css( el,this.options.direction[this.options.axis])
        var currentPage = Math.round( Math.abs( nowPosition/this.options.imgW ));
        this.options.currentPage = currentPage;
    },
    setIndicator(){
        for( var i = 0,len = this.options.indicator.length ; i < len ;i++ ){
            this.options.indicator[i].classList.remove('focus')
        }
        this.options.indicator[this.options.currentPage%this.options.indicator.length].classList.add('focus')
    }

         
}
//滑动，原理就是拖拽？
function Swiper( options ){
    this.options = {
        el: options.el,
        direction : {
            x :'translateX',
            y: 'translateY'
        },
        startPoint : {},
        elPostion: {},
        axis: options['axis'] || 'x',

        isDir: {
            x:false,
            y:false
        },
        isFirst: true,
        lastTime:0,
        lastPoint:{},
        lastTimeDis:0,
        lastDis:0,
        scroll:options.el.parentNode,
        min:{
            x:0,
            y:0
        },
        backOut:options.backOut || 'none' ,// 'none','out',
        F:0.5,
        start: options.start,
        move: options.move,
        end: options.end,
        over: options.over,

  
    }
    this.init()
}
Swiper.prototype = {
    constructor: Swiper,
    init:function(){
        this._touchstart();
        this._touchmove();
        this._touchend();
    },
    _touchstart:function(){
        var el = this.options.el;
        var that = this;
        this.options.scroll.addEventListener('touchstart', function (e) {

            cancelAnimationFrame( el.timer );
            that.options.start && that.options.start.call( el, e )
            var ev = e.changedTouches[0];
            that.options.elPostion = {
                x: css( el,'translateX'),
                y: css( el,'translateY'),
            }
            that.options.startPoint = {
                x: ev.pageX,
                y: ev.pageY,
            }
            that.options.min = {
                x:that.options.scroll.clientWidth - el.offsetWidth,
                y:that.options.scroll.clientHeight - el.offsetHeight,
            }
            that.options.lastTime = Date.now();
            that.options.lastTimeDis = 0;
            that.options.lastDis = 0;
        
        });
    },
    _touchmove: function(){
        var that = this;
        var el = that.options.el;
        this.options.scroll.addEventListener('touchmove', function (e) {
            that.options.move && that.options.move.call( el, e )
            var ev = e.changedTouches[0];
            var nowPoint = {
                x: ev.pageX,
                y: ev.pageY,
            }
            var dis = {
                x: nowPoint.x - that.options.startPoint.x ,
                y:nowPoint.y - that.options.startPoint.y 
            }
            if( dis.x == 0 && dis.y ){
                return;
            }
            var target = {
                x : dis.x + that.options.elPostion.x,
                y : dis.y + that.options.elPostion.y,
            }
            if( that.options.isFirst ){
                if( Math.abs( dis.x ) > Math.abs( dis.y ) ){
                    that.options.isDir.x = true;
                    that.options.isFirst = false
                }else{
                    that.options.isDir.y = true;
                    that.options.isFirst = false
                }
            }
            if( that.options.isDir[that.options.axis]){
                if( that.options.backOut == 'none'){
                    target[that.options.axis] = target[that.options.axis] > 0 ? 0 : target[that.options.axis];
                    target[that.options.axis] = target[that.options.axis] < that.options.min[that.options.axis] ? that.options.min[that.options.axis] : target[that.options.axis];
                }else if( that.options.backOut == 'out' ){

                    if( target[that.options.axis] > 0 ){
                        var over = target[that.options.axis];
                        over *= that.options.F;
                        that.options.F *= 0.99
                        that.options.F = that.options.F <= 0.32 ? 0.32 :that.options.F
                        target[that.options.axis] = over;
                    }else if( target[that.options.axis] < that.options.min[that.options.axis]){
                        var over =  that.options.min[that.options.axis] - target[that.options.axis];
                        over *= 0.5;
                        that.options.F *= 0.99;
                        that.options.F = that.options.F <= 0.32 ? 0.32 :that.options.F
                        target[that.options.axis] = that.options.min[that.options.axis] - over;
                    }
                }
           
                css( el,that.options.direction[that.options.axis],target[that.options.axis]);
                e.preventDefault(); 
                that.options.lastTimeDis = Date.now() - that.options.lastTime;
                that.options.lastDis = nowPoint[that.options.axis] - that.options.lastPoint[that.options.axis];
            } 
            that.options.lastPoint = {
                x: nowPoint.x,
                y: nowPoint.y
            } 
            that.options.lastTime = Date.now();    
        });
    },
    _touchend: function(){
        var that = this;
        var el = this.options.el;
        this.options.scroll.addEventListener('touchend', function (e) { 
            that.options.end && that.options.end.call( el, e )
            var ev = e.changedTouches[0];
            if( that.options.isDir[that.options.axis]){
                if( Date.now() - that.options.lastTime >= 100  ){
                    that.options.lastDis = 0;
                }
                var lastSpeed = that.options.lastDis/that.options.lastTimeDis;
                lastSpeed = lastSpeed?lastSpeed:0;
                var s = lastSpeed*120;
                var now  = css( el,that.options.direction[that.options.axis]);
                s = Math.round( now + s );
                if( s > 0){
                    s = 0;
                }else if( s < that.options.min[that.options.axis] ){
                    s = that.options.min[that.options.axis]
                }
                var time = Math.abs( s - now )*2;
                var target = that.options.axis == 'x' ? { translateX : s } : {  translateY : s};

                _animate({
                    el:el,
                    mode:'quintOut',
                    time:time,
                    target:target,
                    move:function(){
                        that.options.move && that.options.move.call( el, e )
                    
                    },
                    over:function(){
                        that.options.over && that.options.over.call( el, e );
                        if( now < that.options.min[that.options.axis] ){
                            console.log(22 );
                        }
                    }
                })
            }
           
            that.options.F = 0.5
            that.options.isFirst = true;
            that.options.isDir = {
                x: false,
                y: false
            }
  
        });
    }        
}
function _animate ( options ) {
    var t = 0;
    var b = {};
    var c = {};
    var target = options.target;
    var mode = options.mode;
    var el = options.el;
    var time = options.time;
    var d = Math.ceil(time/16.7);

    cancelAnimationFrame( el.timer );
    for(var v in target) {
        b[v] = css( el, v );
        c[v] = target[v] - b[v]
    }
    el.timer = requestAnimationFrame( move );

    function move(){
        if( t >= d  ){
            cancelAnimationFrame( el.timer );   
            options.over && options.over.call( el )
        }else{

            t++;
            for( var s in target ){
                var val = Math.tween[mode]( t,b[s],c[s],d);
                css(el,s,val)
            }
            el.timer = requestAnimationFrame( move );
            options.move && options.move.call( el )
        }
        
    }

}
function css( el, attr, val ){
    var transformAttr = ["rotate","rotateX","rotateY","rotateZ","skewX","skewY","scale","scaleX","scaleY","translateX","translateY","translateZ"];
    transformAttr.forEach( function( atr ){
       if( attr == atr ){
  
            return transform( el, attr, val);
       }
    })
    for( var i = 0; i < transformAttr.length;i++){
        if( attr == transformAttr[i]){
            return transform( el, attr, val);
        }
    }
    if( attr == 'opacity' ){
        el.style[attr] = val;
    }else{
        el.style[attr] = val + 'px';
    }
    if( val === undefined ){
        return getComputedStyle( el )[attr]
    }
    
}

function transform( el, attr, val ){

    if( !el.transform ){
        el.transform = {
            
        }
    }
    if( val === undefined ){

        if( !el.transform[attr] ){
            return 0 ;
        }
        return el.transform[attr]
    }
    el.transform[attr] = val;

    var str = '';
    for( var s in el.transform ){
        switch(s){
			case "rotate":
			case "rotateX":
			case "rotateY":
			case "rotateZ":
			case "skewX":
			case "skewY":
                str += s +"("+el.transform[s]+"deg) ";
				break;
			case "scale":
			case "scaleX":
			case "scaleY":
                str += s +"("+el.transform[s]+") ";
				break;
			case "translateX":
			case "translateY":
			case "translateZ":
                str += s +"("+el.transform[s]+"px) ";
				break;	
        }
        el.style.WebkitTransform = el.style.transform = str;
    }
   
}

(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||  
                                      window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());