import React, { Component } from 'react';
import NavPanel from './NavPanel.js';

export default class Tabs extends Component{
<<<<<<< HEAD
  constructor(){
      super()
      this.state = {
          currentIndex : 0
      }
    }
    checkTitleIndex(index){
      return index === this.state.currentIndex ? "tab_title active" : "tab_title"
    }

    checkItemIndex(index){
      return index === this.state.currentIndex ? "tab_item show" : "tab_item"
    }

    swapState(index){
      this.setState({ currentIndex : index });
    }
    render(){
      return(
        <div>
          { /* Tab title*/ }
            <div id="tab-bar" className="side-panel">
              {
                React.Children.map(this.props.children,(element,index) => {
                  return(
                      <div onClick={ () => { this.swapState(index) } } className={ this.checkTitleIndex(index) }>{element.props.name}</div>
                    )
                  })
                }
            </div>
            {/*Tab content*/}
              <div>
              {
                React.Children.map(this.props.children,( element,index )=>{
                  return(
                    <div className={ this.checkItemIndex( index ) }>{ element }</div>
                  )
                })
              }
                </div>
            </div>
        )
    }
=======
  constructor() {
    super()
    this.state = {
      currentIndex : 0
    }
  }

  checkTitleIndex(index) {
    return index === this.state.currentIndex ? "tab_title active" : "tab_title"
  }

  checkItemIndex(index) {
    return index === this.state.currentIndex ? "tab_item show" : "tab_item"
  }

  swapState(index) {
    this.setState({ currentIndex : index });
  }

  render() {
    return(
      <div>
        { /* Tab title*/ }
        <div id="tab-bar" className="side-panel">
          {
            React.Children.map(this.props.children , (element,index) => {
              return(
                <div onClick={ () => { this.swapState(index) } } className={ this.checkTitleIndex(index) }>
                  { element.props.name }
                </div>
              )
            })
          }
        </div>
        {/*Tab content*/}
        <div>
          {
            React.Children.map(this.props.children, (element,index) => {
              return(
                <div className={ this.checkItemIndex(index) }>{ element }</div>
              )
            })
          }
        </div>
      </div>
    )
  }
>>>>>>> 7f8cd87725362b6acb407d8564ce0416086e2e3a
}
