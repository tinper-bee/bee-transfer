'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _search = require('./search');

var _search2 = _interopRequireDefault(_search);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _beeAnimate = require('bee-animate');

var _beeAnimate2 = _interopRequireDefault(_beeAnimate);

var _PureRenderMixin = require('./PureRenderMixin');

var _PureRenderMixin2 = _interopRequireDefault(_PureRenderMixin);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _index = require('./index');

var _item = require('./item');

var _item2 = _interopRequireDefault(_item);

var _beeCheckbox = require('bee-checkbox');

var _beeCheckbox2 = _interopRequireDefault(_beeCheckbox);

var _beeIcon = require('bee-icon');

var _beeIcon2 = _interopRequireDefault(_beeIcon);

var _beeFormControl = require('bee-form-control');

var _beeFormControl2 = _interopRequireDefault(_beeFormControl);

var _reactBeautifulDnd = require('react-beautiful-dnd');

var _tinperBeeCore = require('tinper-bee-core');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

function noop() {}

var defaultProps = {
  dataSource: [],
  titleText: '',
  showSearch: false,
  render: noop,
  pagination: false
};
function isRenderResultPlainObject(result) {
  return result && !_react2["default"].isValidElement(result) && Object.prototype.toString.call(result) === '[object Object]';
}

var TransferList = function (_React$Component) {
  _inherits(TransferList, _React$Component);

  function TransferList(props) {
    _classCallCheck(this, TransferList);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

    _initialiseProps.call(_this);

    var pagination = props.pagination,
        dataSource = props.dataSource;

    var totalPages = Math.ceil(dataSource.length / 10);
    var paginationInfo = pagination ? {
      currentPage: 1,
      totalPages: totalPages === 0 ? 1 : totalPages
    } : {};
    _this.state = {
      mounted: false,
      paginationInfo: paginationInfo
    };
    return _this;
  }

  TransferList.prototype.componentDidMount = function componentDidMount() {
    var _this2 = this;

    this.timer = setTimeout(function () {
      _this2.setState({
        mounted: true
      });
    }, 0);
  };

  TransferList.getDerivedStateFromProps = function getDerivedStateFromProps(nextProps, prevState) {
    var paginationInfo = prevState.paginationInfo;
    var pagination = nextProps.pagination,
        dataSource = nextProps.dataSource;

    if (pagination) {
      var totalPages = Math.ceil(dataSource.length / 10);
      var currentPage = paginationInfo.currentPage;
      console.log('walieva', currentPage, totalPages);
      return {
        paginationInfo: {
          totalPages: totalPages === 0 ? 1 : totalPages,
          currentPage: totalPages === 0 ? 1 : currentPage && totalPages && totalPages < currentPage ? totalPages : currentPage // 在最后一页移除元素之后，当前页设置为最后一页
        }
      };
    }
    return {};
  };

  TransferList.prototype.componentWillUnmount = function componentWillUnmount() {
    clearTimeout(this.timer);
  };

  TransferList.prototype.shouldComponentUpdate = function shouldComponentUpdate() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _PureRenderMixin2["default"].shouldComponentUpdate.apply(this, args);
  };

  /**
   * 获取Checkbox状态
   * @param {*} filteredDataSource dataSource中刨去设置为disabled的部分
   */
  TransferList.prototype.getCheckStatus = function getCheckStatus(filteredDataSource) {
    var checkedKeys = this.props.checkedKeys;

    if (checkedKeys.length === 0) {
      return 'none'; //全部未选
    } else if (filteredDataSource.every(function (item) {
      return checkedKeys.indexOf(item.key) >= 0;
    })) {
      return 'all'; //全部已选
    }
    return 'part'; //部分已选
  };

  /**
   * 点击list item，选中或取消选中
   * @param selectedItem 选中的item的信息，和dataSource数据源中的item信息一致
   */


  TransferList.prototype.renderCheckbox = function renderCheckbox(_ref) {
    var _classNames,
        _this3 = this;

    var prefixCls = _ref.prefixCls,
        filteredDataSource = _ref.filteredDataSource,
        checked = _ref.checked,
        checkPart = _ref.checkPart,
        disabled = _ref.disabled,
        checkable = _ref.checkable;

    var checkAll = !checkPart && checked; //非半选 && 全选
    prefixCls = "u";
    var checkboxCls = (0, _classnames2["default"])((_classNames = {}, _defineProperty(_classNames, prefixCls + '-checkbox-indeterminate', checkPart), _defineProperty(_classNames, prefixCls + '-checkbox-disabled', disabled), _classNames));
    return _react2["default"].createElement(
      'span',
      {
        className: 'u-checkbox-wrapper'
      },
      _react2["default"].createElement(_beeCheckbox2["default"], {
        onChange: function onChange() {
          return _this3.props.handleSelectAll(filteredDataSource, checkAll);
        },
        className: checkboxCls,
        checked: checkAll
      })
    );
  };

  TransferList.prototype.render = function render() {
    var _classNames2,
        _this4 = this;

    var _props = this.props,
        prefixCls = _props.prefixCls,
        dataSource = _props.dataSource,
        titleText = _props.titleText,
        filter = _props.filter,
        checkedKeys = _props.checkedKeys,
        lazy = _props.lazy,
        filterOption = _props.filterOption,
        pagination = _props.pagination,
        _props$body = _props.body,
        body = _props$body === undefined ? noop : _props$body,
        _props$footer = _props.footer,
        footer = _props$footer === undefined ? noop : _props$footer,
        showSearch = _props.showSearch,
        _props$render = _props.render,
        render = _props$render === undefined ? noop : _props$render,
        style = _props.style,
        id = _props.id,
        showCheckbox = _props.showCheckbox,
        draggable = _props.draggable,
        droppableId = _props.droppableId,
        draggingItemId = _props.draggingItemId;
    var _props2 = this.props,
        searchPlaceholder = _props2.searchPlaceholder,
        notFoundContent = _props2.notFoundContent;

    // Custom Layout

    var paginationInfo = this.state.paginationInfo;

    var footerDom = footer((0, _objectAssign2["default"])({}, this.props));
    var bodyDom = body((0, _objectAssign2["default"])({}, this.props));

    var listCls = (0, _classnames2["default"])(prefixCls, (_classNames2 = {}, _defineProperty(_classNames2, prefixCls + '-with-footer', !!footerDom), _defineProperty(_classNames2, prefixCls + '-draggable', !!draggable), _defineProperty(_classNames2, prefixCls + '-with-pagination', !!pagination), _classNames2));

    var filteredDataSource = [];
    var totalDataSource = pagination ? dataSource : [];
    var splitedDataSource = !pagination ? dataSource.concat() : dataSource.slice(10 * (paginationInfo.currentPage - 1), 10 * paginationInfo.currentPage);
    if (pagination) {
      filteredDataSource = dataSource.filter(function (item) {
        return !item.disabled;
      });
    }
    var showItems = splitedDataSource.map(function (item, index) {
      if (!item) {
        return;
      }

      var _renderItem = _this4.renderItem(item),
          renderedText = _renderItem.renderedText,
          renderedEl = _renderItem.renderedEl;

      if (filter && filter.trim() && !_this4.matchFilter(renderedText, item)) {
        return null;
      }

      // all show items
      if (!pagination) {
        totalDataSource.push(item);
      }

      if (!item.disabled && !pagination) {
        filteredDataSource.push(item);
      }

      var checked = checkedKeys.indexOf(item.key) >= 0;
      return _react2["default"].createElement(
        _reactBeautifulDnd.Draggable,
        { key: item.key, index: index, draggableId: '' + item.key, isDragDisabled: draggable ? item.disabled : !draggable },
        function (provided, snapshot) {
          return _react2["default"].createElement(
            'div',
            _extends({
              ref: provided.innerRef
            }, provided.draggableProps, provided.dragHandleProps, {
              // onClick={(event) =>this.handleDrag(event, provided, snapshot, item)}
              onKeyDown: function onKeyDown(event) {
                return _this4.onKeyDown(event, provided, snapshot, item);
              }
              // className={classnames({
              //     ...getClass(this.props,snapshot.isDragging).drag
              //   })}
              , style: _extends({}, provided.draggableProps.style) }),
            _react2["default"].createElement(_item2["default"]
            // ref={provided.innerRef} //Error: provided.innerRef has not been provided with a HTMLElement
            // key={item.key}
            , { item: item,
              lazy: lazy,
              render: render,
              renderedText: renderedText,
              renderedEl: renderedEl,
              filter: filter,
              filterOption: filterOption,
              checked: checked,
              checkedKeys: checkedKeys,
              prefixCls: prefixCls,
              onClick: _this4.handleSelect,
              showCheckbox: showCheckbox,
              isMultiDragSource: draggingItemId === item.key,
              draggingItemId: draggingItemId
            })
          );
        }
      );
    });

    var unit = '';
    var antLocale = this.context.antLocale;
    if (antLocale && antLocale.Transfer) {
      var transferLocale = antLocale.Transfer;
      unit = dataSource.length > 1 ? transferLocale.itemsUnit : transferLocale.itemUnit;
      searchPlaceholder = searchPlaceholder || transferLocale.searchPlaceholder;
      notFoundContent = notFoundContent || transferLocale.notFoundContent;
    }

    var checkStatus = this.getCheckStatus(filteredDataSource);
    var outerPrefixCls = prefixCls.replace('-list', '');
    var search = showSearch ? _react2["default"].createElement(
      'div',
      { className: prefixCls + '-body-search-wrapper' },
      _react2["default"].createElement(_search2["default"], {
        prefixCls: prefixCls + '-search',
        onChange: this.handleFilter,
        handleClear: this.handleClear,
        placeholder: searchPlaceholder,
        value: filter
      })
    ) : null;

    var listBody = bodyDom || _react2["default"].createElement(
      'div',
      { className: showSearch ? prefixCls + '-body ' + prefixCls + '-body-with-search' : prefixCls + '-body' },
      search,
      _react2["default"].createElement(
        _reactBeautifulDnd.Droppable,
        { droppableId: 'droppable_' + id, direction: 'vertical', isDropDisabled: !draggable },
        function (provided, snapshot) {
          return _react2["default"].createElement(
            'div',
            { ref: provided.innerRef, key: id, className: prefixCls + '-content' },
            _react2["default"].createElement(
              'div',
              { style: { display: 'none' } },
              provided.placeholder
            ),
            _react2["default"].createElement(
              _beeAnimate2["default"],
              {
                component: 'ul',
                transitionName: _this4.state.mounted ? prefixCls + '-content-item-highlight' : '',
                transitionLeave: false
              },
              showItems
            ),
            _react2["default"].createElement(
              'div',
              { className: prefixCls + '-delete-selected ' + (snapshot.isDraggingOver && droppableId === 'droppable_2' ? 'show' : '') },
              _react2["default"].createElement(
                'div',
                { className: prefixCls + '-del-btn' },
                _react2["default"].createElement(_beeIcon2["default"], { type: 'uf-arrow-down-2' }),
                _react2["default"].createElement(
                  'span',
                  null,
                  '\u79FB\u9664\u5DF2\u9009'
                )
              )
            )
          );
        }
      ),
      pagination ? this.createListPagination() : null,
      _react2["default"].createElement(
        'div',
        { className: prefixCls + '-body-not-found ' + (dataSource.length == 0 ? "show" : "") },
        notFoundContent
      )
    );

    var listFooter = footerDom ? _react2["default"].createElement(
      'div',
      { className: prefixCls + '-footer' },
      footerDom
    ) : null;

    var renderedCheckbox = this.renderCheckbox({
      prefixCls: outerPrefixCls,
      checked: checkStatus === 'all',
      checkPart: checkStatus === 'part',
      checkable: _react2["default"].createElement('span', { className: outerPrefixCls + '-checkbox-inner' }),
      filteredDataSource: filteredDataSource,
      disabled: false
    });

    return _react2["default"].createElement(
      'div',
      { className: listCls, style: style },
      _react2["default"].createElement(
        'div',
        { className: prefixCls + '-header' },
        showCheckbox ? renderedCheckbox : '',
        _react2["default"].createElement(
          'span',
          { className: prefixCls + '-header-selected' },
          _react2["default"].createElement(
            'span',
            null,
            (checkedKeys.length > 0 ? checkedKeys.length + '/' : '') + totalDataSource.length,
            ' ',
            unit
          ),
          _react2["default"].createElement(
            'span',
            { className: prefixCls + '-header-title' },
            titleText
          )
        )
      ),
      listBody,
      listFooter
    );
  };

  return TransferList;
}(_react2["default"].Component);

var _initialiseProps = function _initialiseProps() {
  var _this5 = this;

  this.matchFilter = function (text, item) {
    //filter：搜索框中的内容
    //filterOption：用户自定义的搜索过滤方法
    var _props3 = _this5.props,
        filter = _props3.filter,
        filterOption = _props3.filterOption;

    if (filterOption) {
      return filterOption(filter, item);
    }
    return text.indexOf(filter) >= 0;
  };

  this.handleSelect = function (selectedItem) {
    // checkedKeys：已勾选的Keys数组
    // result：是否已勾选，true：已勾选  false：未勾选
    var checkedKeys = _this5.props.checkedKeys;

    var result = checkedKeys.some(function (key) {
      return key === selectedItem.key;
    });
    _this5.props.handleSelect(selectedItem, result);
  };

  this.handleFilter = function (e) {
    _this5.props.handleFilter(e);
  };

  this.handleClear = function () {
    _this5.props.handleClear();
  };

  this.renderItem = function (item) {
    var _props$render2 = _this5.props.render,
        render = _props$render2 === undefined ? noop : _props$render2;

    var renderResult = render(item);
    var isRenderResultPlain = isRenderResultPlainObject(renderResult);
    return {
      renderedText: isRenderResultPlain ? renderResult.value : renderResult,
      renderedEl: isRenderResultPlain ? renderResult.label : renderResult
    };
  };

  this.onKeyDown = function (event, provided, snapshot, item) {
    if (provided.dragHandleProps) {
      provided.dragHandleProps.onKeyDown(event);
    }

    if (event.defaultPrevented) {
      return;
    }

    if (snapshot.isDragging) {
      return;
    }

    if (event.keyCode !== _tinperBeeCore.KeyCode.ENTER) {
      return;
    }

    // 为了选择，我们使用此事件 we are using the event for selection
    event.preventDefault();

    _this5.performAction(event, item);
  };

  this.handleChangePage = function (value) {
    var val = +value;
    var paginationInfo = _this5.state.paginationInfo;

    if (Number.isNaN(val) || typeof val !== 'number' || val % 1 !== 0) {
      return;
    }
    if (val > paginationInfo.totalPages) {
      val = paginationInfo.totalPages;
    }
    if (val < 1) {
      val = 1;
    }
    _this5.setState({
      paginationInfo: _extends({}, paginationInfo, {
        currentPage: val
      })
    });
  };

  this.handleMove = function (step) {
    var _state$paginationInfo = _this5.state.paginationInfo,
        currentPage = _state$paginationInfo.currentPage,
        totalPages = _state$paginationInfo.totalPages;

    var newCurrentPage = currentPage + step;
    if (newCurrentPage < 1 || newCurrentPage > totalPages) {
      return;
    }
    _this5.setState({
      paginationInfo: {
        totalPages: totalPages,
        currentPage: newCurrentPage
      }
    });
  };

  this.createListPagination = function () {
    var prefixCls = _this5.props.prefixCls;
    var paginationInfo = _this5.state.paginationInfo;
    var currentPage = paginationInfo.currentPage,
        totalPages = paginationInfo.totalPages;

    return _react2["default"].createElement(
      'div',
      { className: prefixCls + '-pagination' },
      _react2["default"].createElement(
        'span',
        {
          onClick: function onClick() {
            return _this5.handleMove(-1);
          },
          className: 'prev-link ' + (currentPage === 1 ? 'disabled' : '')
        },
        _react2["default"].createElement(_beeIcon2["default"], { type: 'uf-arrow-left' })
      ),
      _react2["default"].createElement(_beeFormControl2["default"], {
        size: 'sm',
        value: currentPage,
        ref: 'input',
        onChange: _this5.handleChangePage
      }),
      _react2["default"].createElement(
        'span',
        {
          className: prefixCls + '-pagination-slash'
        },
        '/'
      ),
      _react2["default"].createElement(
        'span',
        null,
        totalPages
      ),
      _react2["default"].createElement(
        'span',
        {
          onClick: function onClick() {
            return _this5.handleMove(1);
          },
          className: 'next-link ' + (currentPage === totalPages ? 'disabled' : '')
        },
        _react2["default"].createElement(_beeIcon2["default"], { type: 'uf-arrow-right' })
      )
    );
  };
};

TransferList.defaultProps = defaultProps;
exports["default"] = TransferList;
module.exports = exports['default'];