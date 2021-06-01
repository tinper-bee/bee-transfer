import React from 'react';
import Search from './search';
import classNames from 'classnames';
import Animate from 'bee-animate';
import PureRenderMixin from './PureRenderMixin';
import assign from 'object-assign';
import { TransferItem } from './index';
import Item from './item';
import Checkbox from 'bee-checkbox';
import Icon from 'bee-icon';
import FormControl from 'bee-form-control';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { KeyCode} from 'tinper-bee-core';

function noop() {
}

const defaultProps = {
  dataSource: [],
  titleText: '',
  showSearch: false,
  render: noop,
  pagination: false
}; 
function isRenderResultPlainObject(result) {
  return result && !React.isValidElement(result) &&
    Object.prototype.toString.call(result) === '[object Object]';
}

class TransferList extends React.Component {

  constructor(props) {
    super(props);
    const { pagination } = props
    const dataSource = this.handleFilterDataSource()
    const totalPages = Math.ceil(dataSource.length / 10)
    const paginationInfo = pagination ? {
      currentPage: 1,
      totalPages: totalPages === 0 ? 1 : totalPages
    } : {}
    this.state = {
      mounted: false,
      paginationInfo,
      dataSource
    };
  }

  componentDidMount() {
    this.timer = setTimeout(() => {
      this.setState({
        mounted: true,
      });
    }, 0);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { paginationInfo } = this.state
    const { pagination } = nextProps
    const dataSource = this.handleFilterDataSource(nextProps)
    if (pagination) {
      const totalPages = Math.ceil(dataSource.length / 10)
      const currentPage = paginationInfo.currentPage
      this.setState({
        dataSource,
        paginationInfo: {
          totalPages: totalPages === 0 ? 1 : totalPages,
          currentPage: totalPages === 0 ? 1 : (currentPage && totalPages && totalPages < currentPage) ? totalPages : currentPage // 在最后一页移除元素之后，当前页设置为最后一页
        }
      })
    } else {
      this.setState({
        dataSource
      })
    }
    return {};
  };

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }


  matchFilter = (text,item,filter,filterOption) => {
    //filter：搜索框中的内容
    //filterOption：用户自定义的搜索过滤方法
    if (filterOption) {
      return filterOption(filter, item);
    }
    return text.indexOf(filter) >= 0;
  }
  /**
   * 获取Checkbox状态
   * @param {*} filteredDataSource dataSource中刨去设置为disabled的部分
   */
  getCheckStatus(filteredDataSource) {
    const { checkedKeys } = this.props;
    if (checkedKeys.length === 0) {
      return 'none'; //全部未选
    } else if (filteredDataSource.every(item => checkedKeys.indexOf(item.key) >= 0)) {
      return 'all';  //全部已选
    }
    return 'part';   //部分已选
  }

  /**
   * 点击list item，选中或取消选中
   * @param selectedItem 选中的item的信息，和dataSource数据源中的item信息一致
   */
  handleSelect = (selectedItem) => {
    // checkedKeys：已勾选的Keys数组
    // result：是否已勾选，true：已勾选  false：未勾选
    const { checkedKeys } = this.props;
    const result = checkedKeys.some((key) => key === selectedItem.key);
    this.props.handleSelect(selectedItem, result);
  }

  handleFilter = (e) => {
    this.props.handleFilter(e);
  }

  handleClear = () => {
    this.props.handleClear();
  }
  renderItem = (item) => {
    const { render = noop } = this.props;
    const renderResult = render(item);
    const isRenderResultPlain = isRenderResultPlainObject(renderResult);
    return {
      renderedText: isRenderResultPlain ? renderResult.value : renderResult,
      renderedEl: isRenderResultPlain ? renderResult.label : renderResult,
    };
  }
  renderCheckbox({ prefixCls, filteredDataSource, checked, checkPart, disabled, checkable }) {
    const checkAll = (!checkPart) && checked; //非半选 && 全选
    prefixCls = "u"
    const checkboxCls = classNames({
      [`${prefixCls}-checkbox-indeterminate`]: checkPart,
      [`${prefixCls}-checkbox-disabled`]: disabled,
    });
    return (
      <span
        className="u-checkbox-wrapper"
      >
        <Checkbox 
        onChange={() => this.props.handleSelectAll(filteredDataSource, checkAll)} 
        className={checkboxCls}
        checked={checkAll}
        />
      </span>
      
    );
  }

  onKeyDown = (event,provided,snapshot,item) => {
    if (provided.dragHandleProps) {
      provided.dragHandleProps.onKeyDown(event);
    }

    if (event.defaultPrevented) {
      return;
    }

    if (snapshot.isDragging) {
      return;
    }

    if (event.keyCode !== KeyCode.ENTER) {
      return;
    }

    // 为了选择，我们使用此事件 we are using the event for selection
    event.preventDefault();

    this.performAction(event,item);
  };

  handleChangePage = value => {
    let val = +value
    const { paginationInfo } = this.state
    if (Number.isNaN(val) || typeof val !== 'number' || val % 1 !== 0) {
      return
    }
    if (val > paginationInfo.totalPages) {
      val = paginationInfo.totalPages
    }
    if (val < 1) {
      val = 1
    }
    this.setState({
      paginationInfo: {
        ...paginationInfo,
        currentPage: val
      }
    })
  }

  handleMove = step => {
    const { currentPage, totalPages } = this.state.paginationInfo
    const newCurrentPage = currentPage + step
    if (newCurrentPage < 1 || newCurrentPage > totalPages) {
      return
    }
    this.setState({
      paginationInfo: {
        totalPages,
        currentPage: newCurrentPage
      }
    })
  }

  createListPagination = () => {
    const { prefixCls } = this.props
    const { paginationInfo } = this.state
    const { currentPage, totalPages } = paginationInfo
    return <div className={`${prefixCls}-pagination`}>
      <span
        onClick={() => this.handleMove(-1)}
        className={`prev-link ${currentPage === 1 ? 'disabled' : ''}`}
      >
        <Icon type="uf-arrow-left" />
      </span>
      <FormControl
          size="sm"
          value={currentPage}
          ref="input"
          onChange={this.handleChangePage}
      />
      <span
        className={`${prefixCls}-pagination-slash`}
      >/</span>
      <span>{totalPages}</span>
      <span
        onClick={() => this.handleMove(1)}
        className={`next-link ${currentPage === totalPages ? 'disabled' : ''}`}
      >
        <Icon type="uf-arrow-right" />
      </span>
    </div>
  }

  handleFilterDataSource = (nextProps) => {
    const { dataSource, filter, filterOption } = nextProps || this.props
    return dataSource.filter(data => {
      const { renderedText } = this.renderItem(data);
      if (filter && filter.trim() && !this.matchFilter(renderedText, data, filter, filterOption)) {
        return false
      }
      return true
    })
  }

  render() {
    const { prefixCls, titleText, filter, checkedKeys, lazy, filterOption, pagination,
            body = noop, footer = noop, showSearch, render = noop, style, id, showCheckbox, draggable, droppableId, draggingItemId } = this.props;
    let { searchPlaceholder, notFoundContent } = this.props;

    // Custom Layout
    const { paginationInfo, dataSource } = this.state
    const footerDom = footer(assign({}, this.props));
    const bodyDom = body(assign({}, this.props));

    const listCls = classNames(prefixCls, {
      [`${prefixCls}-with-footer`]: !!footerDom,
      [`${prefixCls}-draggable`]: !!draggable,
      [`${prefixCls}-with-pagination`]: !!pagination
    });
    let filteredDataSource = [];
    const totalDataSource = pagination ? dataSource : [];
    const splitedDataSource = !pagination ? dataSource.concat() : dataSource.slice(10 * (paginationInfo.currentPage - 1), 10 * paginationInfo.currentPage)
    if (pagination) {
      filteredDataSource = dataSource.filter(item => !item.disabled)
    }
    const showItems = splitedDataSource.map((item,index) => {
      if(!item){return}
      const { renderedText, renderedEl } = this.renderItem(item);

      // all show items
      if (!pagination) {
        totalDataSource.push(item);
      }

      if (!item.disabled && !pagination) {
        filteredDataSource.push(item);
      }
      
      const checked = checkedKeys.indexOf(item.key) >= 0;
      return (
        <Draggable key={item.key} index={index} draggableId={`${item.key}`} isDragDisabled={draggable ? item.disabled : !draggable}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              // onClick={(event) =>this.handleDrag(event, provided, snapshot, item)}
              onKeyDown={(event) =>
                this.onKeyDown(event, provided, snapshot, item)
              }
              // className={classnames({
              //     ...getClass(this.props,snapshot.isDragging).drag
              //   })}
                style={{...provided.draggableProps.style}}>
                <Item
                  // ref={provided.innerRef} //Error: provided.innerRef has not been provided with a HTMLElement
                  // key={item.key}
                  item={item}
                  lazy={lazy}
                  render={render}
                  renderedText={renderedText}
                  renderedEl={renderedEl}
                  filter={filter}
                  filterOption={filterOption}
                  checked={checked}
                  checkedKeys={checkedKeys}
                  prefixCls={prefixCls}
                  onClick={this.handleSelect}
                  showCheckbox={showCheckbox}
                  isMultiDragSource={draggingItemId === item.key}
                  draggingItemId={draggingItemId}
                />
            </div>
          )}
        </Draggable>)
    });

    let unit = '';
    const antLocale = this.context.antLocale;
    if (antLocale && antLocale.Transfer) {
      const transferLocale = antLocale.Transfer;
      unit = dataSource.length > 1 ? transferLocale.itemsUnit : transferLocale.itemUnit;
      searchPlaceholder = searchPlaceholder || transferLocale.searchPlaceholder;
      notFoundContent = notFoundContent || transferLocale.notFoundContent;
    }

    const checkStatus = this.getCheckStatus(filteredDataSource);
    const outerPrefixCls = prefixCls.replace('-list', '');
    const search = showSearch ? (
      <div className={`${prefixCls}-body-search-wrapper`}>
        <Search
          prefixCls={`${prefixCls}-search`}
          onChange={this.handleFilter}
          handleClear={this.handleClear}
          placeholder={searchPlaceholder}
          value={filter}
        />
      </div>
    ) : null;

    const listBody = bodyDom || (
      <div className={showSearch ? `${prefixCls}-body ${prefixCls}-body-with-search` : `${prefixCls}-body`}>
        {search}
        <Droppable droppableId={`droppable_${id}`} direction='vertical' isDropDisabled={!draggable}>
          {(provided, snapshot) => (
            <div ref={provided.innerRef} key={id} className={`${prefixCls}-content`}>
              <div style={{display:'none'}}>{provided.placeholder}</div>
              <Animate
                component="ul"
                transitionName={this.state.mounted ? `${prefixCls}-content-item-highlight` : ''}
                transitionLeave={false}
              >
                {showItems}
              </Animate>
              <div className={`${prefixCls}-delete-selected ${snapshot.isDraggingOver && droppableId === 'droppable_2'? 'show': ''}`}>
                <div className={`${prefixCls}-del-btn`}>
                  <Icon type="uf-arrow-down-2"></Icon>
                  <span>移除已选</span>
                </div>
              </div>
            </div>
          )}
        </Droppable>
        {pagination ? this.createListPagination() : null}
        <div className={`${prefixCls}-body-not-found ${dataSource.length == 0? "show" : ""}`}>
          {notFoundContent}
        </div>
      </div>
    );

    const listFooter = footerDom ? (
      <div className={`${prefixCls}-footer`}>
        {footerDom}
      </div>
    ) : null;

    const renderedCheckbox = this.renderCheckbox({
      prefixCls: outerPrefixCls,
      checked: checkStatus === 'all',
      checkPart: checkStatus === 'part',
      checkable: <span className={`${outerPrefixCls}-checkbox-inner`} />,
      filteredDataSource,
      disabled: false,
    });

    return (
      <div className={listCls} style={style}>
        <div className={`${prefixCls}-header`}>
          {showCheckbox ? renderedCheckbox : ''}
          <span className={`${prefixCls}-header-selected`}>
            <span>
              {(checkedKeys.length > 0 ? `${checkedKeys.length}/` : '') + totalDataSource.length} {unit}
            </span>
            <span className={`${prefixCls}-header-title`}>
              {titleText}
            </span>
          </span>
        </div>
        {listBody}
        {listFooter}
      </div>
    );
  }
}

TransferList.defaultProps = defaultProps;
export default TransferList;