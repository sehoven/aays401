import React,{Component} from 'react';
import {render} from 'react-dom';
import NavPanel from './NavPanel.js';
export default class Tabs extends Component{
  constructor(  ){
        super(  )
        this.state = {
            currentIndex : 0
        }
    }

    checkTitleIndex( index ){
        return index === this.state.currentIndex ? "tab_title active" : "tab_title"
    }

    checkItemIndex( index ){
        return index === this.state.currentIndex ? "tab_item show" : "tab_item"
    }
    swapState(index){
      this.setState({ currentIndex : index });
    }
    render(  ){
        let _this = this
        return(
            <div>
                { /* Tab title*/ }
                <div id="tab-bar" className="side-panel">
                    {
                      React.Children.map( this.props.children , ( element,index ) => {
                        return(
                          <div onClick={ (  ) => { this.swapState(index) } } className={ this.checkTitleIndex( index ) }>{ element.props.name }</div>
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
}
