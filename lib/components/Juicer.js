"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var index_1 = require("./index");
var react_modal_1 = __importDefault(require("react-modal"));
var react_bottom_scroll_listener_1 = __importDefault(require("react-bottom-scroll-listener"));
var styled_components_1 = require("styled-components");
var defaultsDeep_1 = __importDefault(require("lodash/defaultsDeep"));
var styles = __importStar(require("../styles"));
var Juicer = /** @class */ (function (_super) {
    __extends(Juicer, _super);
    function Juicer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            activeIndex: undefined,
            afterInitialLimit: false,
            currentPage: 1,
            isOpen: false,
            juicerFeed: undefined,
            loading: true,
            loadingMore: false,
            loadedAll: false,
        };
        _this.addJuicerPage = function () {
            var _a = _this.props, feedId = _a.feedId, imagesPer = _a.imagesPer;
            var _b = _this.state, juicerFeed = _b.juicerFeed, currentPage = _b.currentPage;
            fetch("https://www.juicer.io/api/feeds/" + feedId + "?per=" + imagesPer + "&page=" + currentPage)
                .then(function (response) { return response.json(); })
                .then(function (response) {
                console.log(response.posts.items);
                _this.setState({
                    juicerFeed: juicerFeed &&
                        juicerFeed.concat(response.posts.items.filter(function (item) { return item.height !== null && item.image !== null; })),
                    loadingMore: false,
                    loadedAll: response.posts.items.length > 0 ? false : true,
                });
            })
                .then(function () {
                if (juicerFeed) {
                    juicerFeed.slice(imagesPer * currentPage).forEach(function (item, index) {
                        _this.checkIfImageExists(item.image, imagesPer * currentPage + index);
                    });
                }
            });
        };
        _this.handleLoadMore = function () {
            var _a = _this.state, juicerFeed = _a.juicerFeed, currentPage = _a.currentPage, loadingMore = _a.loadingMore;
            if (!loadingMore) {
                _this.setState({
                    afterInitialLimit: true,
                    currentPage: currentPage + 1,
                    loadingMore: true,
                }, function () {
                    if (juicerFeed) {
                        _this.addJuicerPage();
                    }
                });
            }
        };
        return _this;
    }
    Juicer.prototype.componentDidMount = function () {
        var _this = this;
        var _a = this.props, feedId = _a.feedId, imagesPer = _a.imagesPer;
        var currentPage = this.state.currentPage;
        fetch("https://www.juicer.io/api/feeds/" + feedId + "?per=" + imagesPer + "&page=" + currentPage)
            .then(function (response) { return response.json(); })
            .then(function (response) {
            console.log(response.posts.items);
            _this.setState({ loading: false, juicerFeed: response.posts.items });
        })
            .then(function () {
            var juicerFeed = _this.state.juicerFeed;
            if (juicerFeed) {
                juicerFeed.forEach(function (item, index) {
                    _this.checkIfImageExists(item.image, index);
                });
            }
        });
    };
    Juicer.prototype.checkIfImageExists = function (imageURL, index) {
        var _this = this;
        var image = new window.Image();
        image.onerror = function () {
            var juicerFeed = _this.state.juicerFeed;
            if (juicerFeed) {
                juicerFeed[index].image = undefined;
            }
            _this.forceUpdate();
        };
        image.src = imageURL;
    };
    Juicer.prototype.render = function () {
        var _this = this;
        var _a = this.state, activeIndex = _a.activeIndex, afterInitialLimit = _a.afterInitialLimit, isOpen = _a.isOpen, juicerFeed = _a.juicerFeed, loading = _a.loading, loadingMore = _a.loadingMore, loadedAll = _a.loadedAll;
        var _b = this.props, hideLoadMore = _b.hideLoadMore, initialLimit = _b.initialLimit, theme = _b.theme, disableOnScroll = _b.disableOnScroll;
        if (loading) {
            return React.createElement("div", null, "loading");
        }
        if (!juicerFeed) {
            return React.createElement("div", null, "could not load feed");
        }
        var filteredJuicer = (function () {
            return juicerFeed
                .filter(function (item) { return item.image !== undefined; })
                .filter(function (item, index) {
                return afterInitialLimit || !initialLimit || index < initialLimit;
            });
        })();
        var activeJuice = (function () {
            return activeIndex ? filteredJuicer[activeIndex] : undefined;
        })();
        return (React.createElement(styled_components_1.ThemeProvider, { theme: defaultsDeep_1.default(__assign({}, theme), styles.defaultTheme) },
            React.createElement(React.Fragment, null,
                React.createElement(index_1.FeedWrapper, null,
                    filteredJuicer.map(function (_a, index) {
                        var comment_count = _a.comment_count, id = _a.id, image = _a.image, like_count = _a.like_count;
                        return (React.createElement(index_1.FeedItem, { key: id, style: { backgroundImage: "url(" + image + ")" }, onClick: function () {
                                return _this.setState({ isOpen: true, activeIndex: index });
                            } },
                            React.createElement("img", { src: image, alt: "" }),
                            React.createElement(index_1.FeedItemHover, null,
                                React.createElement("span", null, comment_count),
                                React.createElement("span", null, like_count))));
                    }),
                    React.createElement(react_bottom_scroll_listener_1.default, { onBottom: disableOnScroll ? function () { } : this.handleLoadMore })),
                !hideLoadMore && !loadedAll && (React.createElement(index_1.LoadMoreContainer, null,
                    React.createElement(index_1.LoadMoreButton, { className: "button large", onClick: function () {
                            _this.handleLoadMore();
                        } }, loadingMore ? 'Loading...' : 'Load more'))),
                activeJuice && (React.createElement(react_modal_1.default, { isOpen: isOpen, onRequestClose: function () {
                        return _this.setState({ isOpen: false, activeIndex: undefined });
                    } },
                    React.createElement("img", { src: activeJuice.image, alt: "" }))))));
    };
    Juicer.defaultProps = {
        hideLoadMore: false,
    };
    return Juicer;
}(React.Component));
exports.default = Juicer;