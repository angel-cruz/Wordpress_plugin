AmCharts.AmDSet = AmCharts.Class({
    construct: function (arr) {
        var _this = this;
        var group = _this.create("g");
    },

    attr: function (attributes) {
        this.R.attr(this.node, attributes);
    },

    move: function (x, y) {
        this.R.move(this.node, x, y);
    }
});