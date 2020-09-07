import React from 'react';
import classNames from 'classnames';
import PureRenderMixin from './PureRenderMixin';
import assign from 'object-assign';
import Lazyload from 'react-lazy-load';
import Checkbox from 'bee-checkbox';

function isRenderResultPlainObject(result) {
  return result && !React.isValidElement(result) &&
    Object.prototype.toString.call(result) === '[object Object]';
}

class Item extends React.Component{
  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }
  // matchFilter = (text) => {
  //   const { filter, filterOption, item } = this.props;
  //   if (filterOption) {
  //     return filterOption(filter, item);
  //   }
  //   return text.indexOf(filter) >= 0;
  // }
  render() {
    const { render, filter, item, lazy, checked, prefixCls, onClick,renderedText,renderedEl, showCheckbox, checkedKeys, isMultiDragSource, draggingItemId } = this.props;
    const isAttachedDraggingItem = checked && !isMultiDragSource && draggingItemId
    const className = classNames({
      [`${prefixCls}-content-item`]: true,
      [`${prefixCls}-content-item-disabled`]: item.disabled || isAttachedDraggingItem,
      [`${prefixCls}-content-item-selected`]: checked && !isAttachedDraggingItem
    });

    const lazyProps = assign({
      height: 32,
      offset: 500,
      throttle: 0,
      debounce: false,
    }, lazy);

    let lazyFlag = true;
    if(lazy && lazy.container == "modal")
    {
      lazyFlag = false
    }
    if(!lazyFlag) {
      return (
        <li
          className={className}
          title={renderedText}
          onClick={item.disabled ? undefined : () => onClick(item)}
        >
          <Checkbox checked={checked} disabled={item.disabled} onClick={item.disabled ? undefined : () => onClick(item)}/>
          <span>{renderedEl}</span>
        </li>
      )
    } else {
        return (
          <Lazyload {...lazyProps}>
            <li
              className={className}
              title={renderedText}
              onClick={item.disabled ? undefined : () => onClick(item)}
            >
            {
              showCheckbox?
              <Checkbox
                checked={checked && !isAttachedDraggingItem}
                disabled={item.disabled || isAttachedDraggingItem}
                onClick={item.disabled ? undefined : () => onClick(item)}
              /> :''
            }
              <span>{renderedEl}</span>
            { (isMultiDragSource && checkedKeys.length > 1) && <span className="multi-drag-count">{checkedKeys.length}</span> }
            </li>
          </Lazyload>
        );
    }
    
  }
}

export default Item;
