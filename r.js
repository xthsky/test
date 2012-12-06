// 如何处理页面闪的问题?
// 1. release   布局工具给每组区块分配一个class，编译生成对应关系 .vw990 .div-cls <=> .w180{} .w220{}
// 2. dev       无视此问题
(function (S) {
    var ids = {},
        resolution = [990, 1220, 1200, 1440, 1400, 1660, 1600],
        dev,
        ATTR_NAME = 'r-name';
        ATTR_RES = 'r-width';

    function clsReplace(cls, reg, val) {
        cls = cls.split(/\s+/);

        for (var i=0; i<cls.length; ) {
            if (cls[i].match(reg)) {
                cls.splice(i, 1);
            } else {
                ++i;
            }
        }
        cls.push(val);

        return cls.join(' ');
    }

    function resizeId(id, callback) {
        var node, res;

        node = S.one('#' + id);
        res = node.attr(ATTR_RES).split(',');
        for (i=1; i<res.length && R.pageWidth>parseInt(res[i], 10); i+=2);
        callback(parseInt(res[i-1], 10));
    }

    function resize() {
        var vw, id, i;

        vw = S.DOM.viewportWidth();
        for (i=1; i<resolution.length && vw>resolution[i]; i+=2);
        R.pageWidth = resolution[i-1];
        document.documentElement.className = clsReplace(document.documentElement.className, /vw\d+/, 'vw'+R.pageWidth);

        for (id in ids) {
            resizeId(id, ids[id]);
        }

        if (dev) {
            S.use('sizzle', function(S) {
                S.ready(function (S) {
                    S.all('[' + ATTR_RES + ']').each(function(node) {
                        var res, pre, i;

                        pre = node.attr(ATTR_NAME);
                        if (pre) {
                            pre = pre.split(',');
                            for (i=0; i<pre.length; i++) {
                                pre[i] += '-';
                            }
                        } else {
                            pre = ['w'];
                        }
                        res = node.attr(ATTR_RES).split(',');
                        for (i=1; i<res.length && R.pageWidth>parseInt(res[i], 10); i+=2);
                        S.each(pre, function(p) {
                            node.attr('class', clsReplace(node.attr('class'), new RegExp('('+p+'|w)\\d+'), res[i-1] !== '0' ? p+res[i-1] : 'w0') );
                        });
                    });
                });
            });
        }

        resize.defer = null;
    }

    function R(cfg) {
        resolution = cfg.resolution || resolution;
        dev = cfg.dev;
        resize();

        S.Event.on(window, 'resize', function() {
            if (resize.defer) {
                clearTimeout(resize.defer);
            }
            resize.defer = setTimeout(resize, 80);
        });
    };
    R.listen = function(id, callback) {
        ids[id] = callback;
        resizeId(id, callback);
    };
    this.R = R;
})(KISSY);
