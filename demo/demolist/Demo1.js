/**
 *
 * @title 默认的模态框
 * @description
 *
 */

 import React, { Component } from 'react';
import Button from 'bee-button'
import Modal from 'bee-modal'
import Transfer from '../../src'

const AllTargetKeys = [];
 const mockData = [];
    for (let i = 0; i < 12000; i++) {
    mockData.push({
        key: i.toString(),
        title: `content${i + 1}`,
        description: `description of content${i + 1}`,
        disabled: i % 3 < 1,

    });
    AllTargetKeys.push(i.toString());
    }
    const targetKeys = mockData
        .filter(item => +item.key % 3 > 1)
        .map(item => item.key);

 class Demo1 extends Component {
     constructor(props) {
         super(props);
         this.state = {
             targetKeys,
            selectedKeys: [],
            showModal: false,
            modalSize: ''
         };
         this.close = this.close.bind(this);
         this.open = this.open.bind(this);
     }


     handleChange = (nextTargetKeys, direction, moveKeys) => {
        this.setState({ targetKeys: nextTargetKeys });
    
        console.log('targetKeys: ', nextTargetKeys);
        console.log('direction: ', direction);
        console.log('moveKeys: ', moveKeys);
      }
    
      handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] });
    
        console.log('sourceSelectedKeys: ', sourceSelectedKeys);
        console.log('targetSelectedKeys: ', targetSelectedKeys);
      }
    
      handleScroll = (direction, e) => {
        console.log('direction:', direction);
        console.log('target:', e.target);
      }
    
      moveAllToRight = () => {
        this.setState({
          targetKeys: AllTargetKeys
        })
      }
      moveAllToLeft = () => {
        this.setState({
          targetKeys: []
        })
      }



     close() {
         this.setState({
             showModal: false
         });
     }
     open() {
         this.setState({
             showModal: true
         });
     }
     render () {
        const state = this.state;
        const targetKeys = [...this.state.targetKeys];
         return (
         <div>
             <Button
             bordered
             className="demo-margin"
             onClick = { this.open }>
                 打开模态框
             </Button>​
             <Modal
             show = { this.state.showModal }
             onHide = { this.close } >
                 <Modal.Header closeButton closeButtonProps={{fieldId:'closeBtn'}}>
                     <Modal.Title>标题</Modal.Title>
                 </Modal.Header>
                 <Modal.Body>
                    <Transfer
                        pagination
                        dataSource={mockData}
                        titles={['Source', 'Target']}
                        targetKeys={targetKeys}
                        selectedKeys={state.selectedKeys}
                        onChange={this.handleChange}
                        onSelectChange={this.handleSelectChange}
                        onScroll={this.handleScroll}
                        render={item => item.title}
                        lazy
                    />
                 </Modal.Body>
                 <Modal.Footer>
                     <Button onClick={ this.close } colors="secondary" style={{marginRight: 8}}>取消</Button>
                     <Button onClick={ this.close } bordered>确认</Button>
                 </Modal.Footer>
            </Modal>
         </div>
         )
     }
 }

 export default Demo1;
