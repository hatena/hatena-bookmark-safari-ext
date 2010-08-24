var RectUtils = {
    rectContains:
    // rectangle が (a, b) を含んでいる場合 true を返す
    function rectContains(rect, a, b) {
        var xL = rect.left;
        var yL = rect.top;
        var xR = xL + rect.width;
        var yR = yL + rect.height;

        return (a >= xL && a <= xR) && (b >= yL && b <= yR);
    },

    isInView:
    function isInView(elem) {
        var rect = elem.getBoundingClientRect();
        var ws = [1, rect.width-1];
        var hs = [1, rect.height-1];
        for (var w in ws ) for (var h in hs)
            if (document.elementFromPoint(rect.left + ws[w], rect.top + hs[h]) === elem) return true;
        return false;
    },

    rectOverlapsRect:
    function rectOverlapsRect(rect1, rect2) {
        var xs = [rect1.left, rect1.left + rect1.width];
        var ys = [rect1.top, rect1.top + rect1.height];

        return xs.some(function (x) {
            return ys.some(function (y) {
                if (RectUtils.rectContains(rect2, x, y))
                    return true;
            });
        });
    }
};
