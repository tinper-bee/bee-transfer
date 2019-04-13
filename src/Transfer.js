import React from 'react';
import classNames from 'classnames';
import List from './list';
import Operation from './operation';
import Search from './search';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-beautiful-dnd';
import { reorder,move } from './utils';

function noop() {
}

const defaultProps = {
	dataSource: [],
	render: noop,
  showSearch: false,
  searchPlaceholder: 'Search',
  notFoundContent: 'Not Found',
  showCheckbox: true
};

const propTypes = {
    prefixCls: PropTypes.string,
    dataSource: PropTypes.array,
    render: PropTypes.func,
    targetKeys: PropTypes.array,
    onChange: PropTypes.func,
    height: PropTypes.number,
    listStyle: PropTypes.object,
    className: PropTypes.string,
    titles: PropTypes.array,
    operations: PropTypes.array,
    showSearch: PropTypes.bool,
    filterOption: PropTypes.func,
    searchPlaceholder: PropTypes.string,
    notFoundContent: PropTypes.node,
    body: PropTypes.func,
    footer: PropTypes.func,
    rowKey: PropTypes.func,
    lazy: PropTypes.object,
    showCheckbox: PropTypes.bool
};

const defaultTitles = ['', ''];
class Transfer extends React.Component{

  constructor(props) {
    super(props);
    const { selectedKeys = [], targetKeys = [] } = props;
    this.state = {
      leftFilter: '',
      rightFilter: '',
      sourceSelectedKeys: selectedKeys.filter(key => targetKeys.indexOf(key) === -1),
      targetSelectedKeys: selectedKeys.filter(key => targetKeys.indexOf(key) > -1),
      dragging: false,
      leftDataSource: [],
      rightDataSource: []
    };
    this.cacheTargetKeys = [...targetKeys];
  }
  componentDidMount(){
    const { leftDataSource, rightDataSource } = this.splitDataSource();
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.targetKeys !== this.cacheTargetKeys, '0000000000000000')
    const { sourceSelectedKeys, targetSelectedKeys } = this.state;
    if (nextProps.targetKeys !== this.props.targetKeys ||
        nextProps.dataSource !== this.props.dataSource ||
        nextProps.targetKeys !== this.cacheTargetKeys) {
      // clear cached splited dataSource
      this.splitedDataSource = null;

      const { dataSource, targetKeys = [] } = nextProps;
      function existInDateSourcekey(key) {
        return dataSource.filter(item => item.key === key).length;
      }
      // clear key nolonger existed
      // clear checkedKeys according to targetKeys
      this.setState({
        sourceSelectedKeys: sourceSelectedKeys.filter(existInDateSourcekey)
          .filter(data => targetKeys.filter(key => key === data).length === 0),
        targetSelectedKeys: targetSelectedKeys.filter(existInDateSourcekey)
          .filter(data => targetKeys.filter(key => key === data).length > 0),
      });
    }
    if (nextProps.selectedKeys) {
      const targetKeys = nextProps.targetKeys;
      this.setState({
        sourceSelectedKeys: nextProps.selectedKeys.filter(key => targetKeys.indexOf(key) === -1),
        targetSelectedKeys: nextProps.selectedKeys.filter(key => targetKeys.indexOf(key) > -1),
      });
    }
  }
  /**
   * 从dataSource中分离出leftDataSource和rightDataSource
   * @param {*} newTargetKeys 
   */
  splitDataSource(newTargetKeys) {
    // targetKeys：展示在右边列表的数据集
    if (this.splitedDataSource) {
      return this.splitedDataSource;
    }

    const { rowKey, dataSource, targetKeys = [] } = this.props;
    if (rowKey) {
      dataSource.forEach(record => {
        record.key = rowKey(record);
      });
    }

    let tempTargetKeys = newTargetKeys ? newTargetKeys : targetKeys;
    const leftDataSource = dataSource.filter(({ key }) => tempTargetKeys.indexOf(key) === -1);
    // Why?
    // const rightDataSource = [];
    // targetKeys.forEach((targetKey) => {
    //   const targetItem = dataSource.filter(record => record.key === targetKey)[0];
    //   if (targetItem) {
    //     rightDataSource.push(targetItem);
    //   }
    // });
    const rightDataSource = dataSource.filter(({key}) => tempTargetKeys.indexOf(key) > -1);

    this.splitedDataSource = {
      leftDataSource,
      rightDataSource,
    };
    this.setState({
      leftDataSource,
      rightDataSource,
    })

    return this.splitedDataSource;
  }

  moveTo = (direction) => {
    const { targetKeys = [], onChange } = this.props;
    const { sourceSelectedKeys, targetSelectedKeys } = this.state;
    const moveKeys = direction === 'right' ? sourceSelectedKeys : targetSelectedKeys;
    // move items to target box
    const newTargetKeys = direction === 'right'
      ? moveKeys.concat(targetKeys)
      : targetKeys.filter(targetKey => moveKeys.indexOf(targetKey) === -1);

    // empty checked keys
    const oppositeDirection = direction === 'right' ? 'left' : 'right';
    this.setState({
      [this.getSelectedKeysName(oppositeDirection)]: [],
    });
    this.handleSelectChange(oppositeDirection, []);

    if (onChange) {
      onChange(newTargetKeys, direction, moveKeys);
    }
    this.splitDataSource(newTargetKeys);
  }

  moveToLeft = () => this.moveTo('left')
  moveToRight = () => this.moveTo('right')

  /**
   * List中的item选中/未选中状态改变时触发
   * @param {*} direction 'left' or 'right'
   * @param {*} holder 更新后的'sourceSelectedKeys' or 'targetSelectedKeys'
   */
  handleSelectChange(direction, holder) {
    // onSelectChange：当选中的item发生改变时的回调 参数(sourceSelectedKeys, targetSelectedKeys)
    const { sourceSelectedKeys, targetSelectedKeys } = this.state;
    const onSelectChange = this.props.onSelectChange;
    if (!onSelectChange) {
      return;
    }

    if (direction === 'left') {
      onSelectChange(holder, targetSelectedKeys);
    } else {
      onSelectChange(sourceSelectedKeys, holder);
    }
  }

  handleSelectAll = (direction, filteredDataSource, checkAll) => {
    const holder = checkAll ? [] : filteredDataSource.map(item => item.key);
    this.handleSelectChange(direction, holder);

    if (!this.props.selectedKeys) {
      this.setState({
        [this.getSelectedKeysName(direction)]: holder,
      });
    }
  }

  /**
   * 左侧列表全选事件
   * @param filteredDataSource dataSource中刨去设置为disabled的部分
   * @param checkAll 是否是全选状态 true：全选
   */
  handleLeftSelectAll = (filteredDataSource, checkAll) => {
    this.handleSelectAll('left', filteredDataSource, checkAll)
  }
  handleRightSelectAll = (filteredDataSource, checkAll) => (
    this.handleSelectAll('right', filteredDataSource, checkAll)
  )

  /**
   * 搜索框值更改事件
   * @param direction 'left' or 'right'
   * @param value 输入的值
   */
  handleFilter = (direction, value) => {
    this.setState({
      // add filter
      [`${direction}Filter`]: value,
    });
  }

  handleLeftFilter = (v) => this.handleFilter('left', value)
  handleRightFilter = (v) => this.handleFilter('right', value)

  /**
   * 清空搜索框内容
   * @param direction 'left' or 'right'
   */
  handleClear = (direction) => {
    this.setState({
      [`${direction}Filter`]: '',
    });
  }

  handleLeftClear = () => this.handleClear('left')
  handleRightClear = () => this.handleClear('right')

  /**
   * 点击list item，选中或取消选中
   * @param direction 'left' or 'right'
   * @param selectedItem 选中的item的信息，和dataSource数据源中的item信息一致
   * @param checked 是否已勾选，true：已勾选 false：未勾选
   */
  handleSelect = (direction, selectedItem, checked) => {
    const { sourceSelectedKeys, targetSelectedKeys } = this.state;
    const holder = direction === 'left' ? [...sourceSelectedKeys] : [...targetSelectedKeys];
    const index = holder.indexOf(selectedItem.key);
    if (checked) {  //已勾选
      holder.splice(index, 1);
    }else if(index === -1){  //未勾选
      holder.push(selectedItem.key);
    }
    this.handleSelectChange(direction, holder);

    if (!this.props.selectedKeys) {
      this.setState({
        [this.getSelectedKeysName(direction)]: holder,
      });
    }
  }

  handleLeftSelect = (selectedItem, checked) => this.handleSelect('left', selectedItem, checked);
  handleRightSelect = (selectedItem, checked) => this.handleSelect('right', selectedItem, checked);

  getTitles = () => {
    if (this.props.titles) {
      return this.props.titles;
    }
    if (this.context &&
      this.context.antLocale &&
      this.context.antLocale.Transfer
    ) {
      return this.context.antLocale.Transfer.titles || [];
    }
    return defaultTitles;
  }

  getSelectedKeysName(direction) {
    return direction === 'left' ? 'sourceSelectedKeys' : 'targetSelectedKeys';
  }

  id2List = {
    droppable_1: 'leftDataSource',
    droppable_2: 'rightDataSource'
  };

  getList = id => this.state[this.id2List[id]];

  onDragEnd = result => {
    this.setState({
      dragging: false
    });
    console.log(result);
    const { source, destination,draggableId } = result;

    // dropped outside the list
    if (!destination) {
        return;
    }
    let { targetKeys, onChange } = this.props;
    let { leftDataSource, rightDataSource } = this.state;
    let sourceIndex = source.index; //初始位置
    let disIndex = destination.index; //移动后的位置
    let temp; //拖拽的元素
    // debugger
    // 在同一个Droppable容器中拖拽
    if (source.droppableId === destination.droppableId) {
      console.log(this.getList(source.droppableId),"==拖拽前==");
      const items = reorder(
        this.getList(source.droppableId),
        source.index,
        destination.index
      );
      let state = {leftDataSource:items}
      if (source.droppableId === 'droppable_2'){
        state = {rightDataSource:items}
      }
      console.log(items,'==拖拽后==');
      this.setState(state);
      // switch(source.droppableId){
      //   case 'droppable_1': //left
          // temp = leftDataSource.splice(sourceIndex,1); //拖拽的元素，Array
          // leftDataSource.splice(disIndex,0,temp[0]); //插入新的位置
          // targetKeys.splice(sourceIndex,1); //同时更新targetKeys
          // targetKeys.splice(disIndex,0,draggableId);
          // console.log(leftDataSource,'==拖拽后==');
        //   break;
        // case 'droppable_2': //right
          // temp = rightDataSource.splice(sourceIndex,1);
          // rightDataSource.splice(disIndex,0,temp[0]);
          // targetKeys.splice(sourceIndex,1);
          // targetKeys.splice(disIndex,0,draggableId);
          // console.log(rightDataSource,'==拖拽后==');
      //     break;
      //   default:
      //     break;
      // }
      if (onChange) {
        onChange(targetKeys, "", draggableId);
      }
      // const items = this.reorder(
      //     this.getList(source.droppableId),
      //     source.index,
      //     destination.index
      // );

      // let state = { sourceSelectedKeys: items };
      // list=items;

      // if (source.droppableId === 'droppable_2') {
      //     state = { targetSelectedKeys: items };
      //     otherList=items;
      //     list=this.state.sourceSelectedKeys;
      // }
      // this.setState(state);
    } else {  // 从一个Droppable容器拖拽到另一Droppable容器
      if(source.droppableId === 'droppable_1'){  // moveToRight
        this.moveTo('right');
      }else if(source.droppableId === 'droppable_2'){  // moveToLeft
        this.moveTo('left')
      }
      // const result = move(
      //     this.getList(source.droppableId),
      //     this.getList(destination.droppableId),
      //     source,
      //     destination
      // );
      // debugger
      // this.setState({
      //   sourceSelectedKeys: result.droppable_1,
      //   targetSelectedKeys: result.droppable_2
      // });
      // list=result.droppable_1;
      // otherList=result.droppable_2;
    }
    // this.props.onStop(result,{
    //     list:list,
    //     otherList:otherList
    // })
  };

  onDragStart = result =>{
    // debugger
    let selectedItem = {};
    const { source } = result; 
    selectedItem.key = result.draggableId;
    if(source.droppableId === 'droppable_1'){  // leftMenu
      this.handleLeftSelect(selectedItem);
    }else if(source.droppableId === 'droppable_2'){  // rightMenu
      this.handleRightSelect(selectedItem);
      this.setState({
        dragging: true
      });
    }
  }

  render() {
    const {
      prefixCls = 'u-transfer', operations = [], showSearch, notFoundContent,
      searchPlaceholder, body, footer, listStyle, className = '',
      filterOption, render, lazy, showCheckbox
    } = this.props;
    const { leftFilter, rightFilter, sourceSelectedKeys, targetSelectedKeys, dragging, leftDataSource, rightDataSource } = this.state;

    // const { leftDataSource, rightDataSource } = this.splitDataSource(this.props);
    const leftActive = targetSelectedKeys.length > 0;
    const rightActive = sourceSelectedKeys.length > 0;

    const cls = classNames(className, prefixCls);

    const titles = this.getTitles();
    return (
      <div className={cls}>
        <DragDropContext onDragEnd={this.onDragEnd} onDragStart={this.onDragStart} >
          <List
            titleText={titles[0]}    //左侧标题
            dataSource={leftDataSource} //左侧数据源
            filter={leftFilter}    //搜索框中输入的内容
            filterOption={filterOption} //搜索过滤方法 参数(inputValue, option)
            style={listStyle}  //自定义的columns的样式表
            checkedKeys={sourceSelectedKeys}  //左侧已勾选的item的keys
            handleFilter={this.handleLeftFilter}  //左侧搜索框值更改事件
            handleClear={this.handleLeftClear}   //清空左侧搜索框内容
            handleSelect={this.handleLeftSelect}  //点击左侧列表中的item，改变选中或取消选中状态
            handleSelectAll={this.handleLeftSelectAll} //点击左侧全选
            render={render}
            showSearch={showSearch} //是否显示搜索框
            searchPlaceholder={searchPlaceholder} //搜索框placeholder
            notFoundContent={notFoundContent} //当没有相关内容的显示内容
            body={body}
            footer={footer}
            prefixCls={`${prefixCls}-list`}
            lazy={lazy}
            showCheckbox={showCheckbox}
            id={'1'}
          />
          <Operation
            rightActive={rightActive}
            rightArrowText={operations[0]}
            moveToRight={this.moveToRight}
            leftActive={leftActive}
            leftArrowText={operations[1]}
            moveToLeft={this.moveToLeft}
            className={`${prefixCls}-operation`}
          />
          <List
            titleText={titles[1]}  //右侧标题
            dataSource={rightDataSource}   //右侧数据源
            filter={rightFilter}    //搜索框中输入的内容
            filterOption={filterOption}  //搜索过滤方法 参数(inputValue, option)
            style={listStyle}  //自定义的columns的样式表
            checkedKeys={targetSelectedKeys}  //右侧已勾选的item的keys
            handleFilter={this.handleRightFilter}  //右侧搜索框值更改事件
            handleClear={this.handleRightClear}  //清空右侧搜索框内容
            handleSelect={this.handleRightSelect}  //点击右侧列表中的item，改变选中或取消选中状态
            handleSelectAll={this.handleRightSelectAll} //点击右侧全选
            render={render}
            showSearch={showSearch}  //是否显示搜索框
            searchPlaceholder={searchPlaceholder} //搜索框placeholder
            notFoundContent={notFoundContent} //当没有相关内容的显示内容
            body={body}
            footer={footer}
            prefixCls={`${prefixCls}-list`}
            lazy={lazy}
            showCheckbox={showCheckbox}
            dragging={dragging}
            id={'2'}
          />
        </DragDropContext>
      </div>
    );
  }
}

Transfer.List = Transfer.List;
Transfer.Operation = Transfer.Operation;
Transfer.Search = Transfer.Search;

Transfer.propTypes = propTypes;
Transfer.defaultProps = defaultProps;

export default Transfer;
