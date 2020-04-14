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
  matchFilter = (text) => {
    const { filter, filterOption, item } = this.props;
    if (filterOption) {
      return filterOption(filter, item);
    }
    return text.indexOf(filter) >= 0;
  }
  highlightFilter = (text,filter) =>{
    let { prefixCls } = this.props;
    text = text.replace(filter,'<i class="'+prefixCls+'-content-item-filter">'+filter+'</i>');
    return text;
  }
  render() {
    const { render, filter, item, lazy, checked, prefixCls, onClick,renderedText,renderedEl } = this.props;
    const className = classNames({
      [`${prefixCls}-content-item`]: true,
      [`${prefixCls}-content-item-disabled`]: item.disabled,
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
          <span dangerouslySetInnerHTML={{__html:this.highlightFilter(renderedEl,filter)}}></span>
        </li>
      )
    }else {
        return (
          <Lazyload {...lazyProps}>
            <li
              className={className}
              title={renderedText}
              onClick={item.disabled ? undefined : () => onClick(item)}
            >
              <Checkbox checked={checked} disabled={item.disabled} onClick={item.disabled ? undefined : () => onClick(item)}/>
              <span dangerouslySetInnerHTML={{__html:this.highlightFilter(renderedEl,filter)}}></span>
            </li>
          </Lazyload>
        );
    }
    
  }
}

export default Item;
