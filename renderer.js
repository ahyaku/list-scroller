'use strict';

import React from 'react';
import { render, findDOMNode } from 'react-dom';
import { List, AutoSizer } from 'react-virtualized';
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import thunk from 'redux-thunk';

const LIST_MAX = 10000;
const ROW_HEIGHT = 16.0;
const OFFSET_DELTA = 10;

// List data as an array of strings
let item_list = [];
let styles_body = [];

for(let i=0; i<LIST_MAX + 1; i++){
  item_list.push(i);
  styles_body.push({
    color : '#FFFFFF',
    background : '#888888'
  });
}

item_list[LIST_MAX] = '';

let reducer = (state, action) => {
  switch(action.type){
    case 'MOVE_CURSOR_UP':
      {
         const cursor_pos = (state.cursor_pos - 1) >= 0 
                              ? (state.cursor_pos - 1)
                              : (state.list_len - 1);
         return {
           cursor_pos: cursor_pos,
           list_len: state.list_len,
         };
      }
    case 'MOVE_CURSOR_DOWN':
      {  
         const cursor_pos = (state.cursor_pos + 1) < state.list_len
                              ? (state.cursor_pos + 1)
                              : 0;
         return {
           cursor_pos: cursor_pos,
           list_len: state.list_len,
         };
      }
    default:
      return state;
  }
}

let state_init = {
  cursor_pos: 0,
  list_len: LIST_MAX
};

let store = createStore(reducer, state_init, applyMiddleware(thunk));

function ListenKeydown(mapEventToAction){
  return function(dispatch, getState){
    function handleEvent(e){
      dispatch(mapEventToAction(getState, e));
    }

    document.addEventListener('keydown', handleEvent);
    return () => document.removeEventListener('keydown', handleEvent);
  };
}

function mapKeydownToAction(getState, e){
  return function(dispatch){
    const state = getState();
    return dispatch(checkKey(state, e));
  }
}

const checkKey = (state, e) => {
  switch(e.key){
    case 'j': /* 'j' */
      //console.log('j');
      return {
        type: 'MOVE_CURSOR_DOWN'
      };
    case 'k': /* 'k' */
      //console.log('k');
      return {
        type: 'MOVE_CURSOR_UP'
      };
    default:
      return  {
        type: 'DO_NOTHING'
      };
  }
}

const unlistenKeydown = store.dispatch(ListenKeydown(mapKeydownToAction));

class App extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    //return (
    //  <AppCore cursor_pos={this.props.cursor_pos}/>
    //);

    const style = {
      display: 'flex',
      flex: 'auto',
      flexDirection: 'raw',
      justifyContent: 'flex-start',
      width: '100%',
      height: '100%'
    };


    const style_body = {
      border: 'solid 1px #FFFFFF',
      background: '#333333',
      color: '#FFFFFF',
      display: 'flex',
      flex: 'auto',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      width: '100%',
      height: '100%'
    };


    return (
      <div style={style}>
        <div style={style_body}>
          <AppCore cursor_pos={this.props.cursor_pos}/>
        </div>
      </div>
    );
  }
}

class AppCore extends React.Component {
  constructor(props){
    super(props);
    this._rowRenderer = this._rowRenderer.bind(this);
  }

  render(){
    let rowRenderer = this._rowRenderer;

    //console.log('App <> cursor_pos: ' + this.props.cursor_pos);

    return React.createElement(
      AutoSizer,
      null,
      ({height, width}) => {
        //console.log('height: ' + height + ', width: ' + width);
        return React.createElement(
          ListClass,
          {
            width: width,
            height: height,
            rowCount: item_list.length,
            rowHeight: ROW_HEIGHT,
            scrollToAlignment: 'auto',
            scrollToIndex: this.props.cursor_pos,
            cursor_pos: this.props.cursor_pos,
            ref: 'ListClass',
            rowRenderer: rowRenderer,
          }
        );
      }
    );

  }

  _rowRenderer ({
    key,         // Unique key within array of rows
    index,       // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible,   // This row is visible within the List (eg it is not an overscanned row)
    style,        // Style object to be applied to row (to position it)
    parent
  }) {
    let style_mdf;
    let style_cell;

    let style_cell_base = Object.assign(
      {},
      style,
      {
         color: '#FFFFFF',
         background: '#333333',
         verticalAlign: 'bottom',
         borderCollapse: 'separate',
         boxSizing: 'border-box'
      }
    )


//    let style_cell_base = {
//      color: '#FFFFFF',
//      background: '#333333',
//      verticalAlign: 'bottom',
//      borderCollapse: 'separate',
//      boxSizing: 'border-box'
//    }

    if(index == parent.props.cursor_pos){
      //console.log('key: ' + key + ', index: ' + index + ', p_cpos: ' + parent.props.cursor_pos);
      style_mdf = Object.assign(
                    {},
                    style,
                    {
                      borderCollapse: 'separate',
                      zIndex: '1'
                    }
                  );

      style_cell = Object.assign(
                     {},
                     style_cell_base,
                     {
                        borderTop: 'solid 1px #333333',
                        borderLeft: 'solid 1px #333333',
                        borderRight: 'solid 1px #333333',
                        borderBottom: 'solid 2px #0000FF',
                        zIndex: '1',
                     }
                   );
    }else{
      style_mdf = Object.assign(
                    {},
                    style,
                    {
                      borderCollapse: 'separate',
                      zIndex: '0'
                    }
                  );

      style_cell = Object.assign(
                     {},
                     style_cell_base,
                     {
                        borderTop: 'solid 1px #333333',
                        borderLeft: 'solid 1px #333333',
                        borderRight: 'solid 1px #333333',
                        borderBottom: 'solid 2px #333333',
                        zIndex: '0',
                     }
                   );
    }

    return (
      <div
        key={key}
        style={style_cell}>
        {item_list[index]}
      </div>
    );

//    return (
//      <div
//        key={key}
//        style={style_mdf}>
//        <div
//          style={style_cell}>
//          {item_list[index]}
//        </div>
//      </div>
//    );

  }

}

class ListClass extends List {
  constructor(props){
    super(props);
    this.state = {
      offset: 0,
    }
  }

  componentDidUpdate(prevProps, prevState){
    //console.log('ListClass componentDidUpdate <> this.props: ', this.props);
    //console.log('ListClass componentDidUpdate <> cursor_pos: ' + this.props.cursor_pos);
    //console.log('ListClass componentDidUpdate <> prevProps.cursor_pos: ' + prevProps.cursor_pos);
    let offset = this.getOffsetForRow('auto', this.props.cursor_pos);

    this.forceUpdateGrid();

    //console.log('ListClass componentDidUpdate <> offset: ' + offset +  ', prevState.offset: ' + prevState.offset);

    let ref = findDOMNode(this);
    let offset_top = ref.offsetTop;
    let client_height = ref.clientHeight;
    let client_width = ref.clientWidth;
    //console.log('ListClass componentDidUpdate <> offset_top: ' + offset_top + ', client_height: ' + client_height + ', client_width: ' + client_width);

    if( (prevProps.cursor_pos === 0) &&
        (this.props.cursor_pos === (item_list.length - 2)) ){
      this.scrollToPosition(offset + OFFSET_DELTA);
    }else if( (prevProps.cursor_pos === (item_list.length - 2)) &&
              (this.props.cursor_pos === 0) ){
    }else if(this.props.cursor_pos > prevProps.cursor_pos){
      if(offset > prevState.offset){
        this.scrollToPosition(offset + OFFSET_DELTA);
      }
    }else if(this.props.cursor_pos < prevProps.cursor_pos){
    }else{
    }

    this.state.offset = offset;

    return true;
  }

}

class InnerCell extends React.Component{
  constructor(props){
    super(props);
  }

  render(){

    return (
      <div
        style={this.props.style}>
        {this.props.item} 
      </div>
    );

  }

  //componentDidUpdate(prevProps, prevState){
  //  if(this.props.index === this.props.cursor_pos){
  //    console.log('InnerCell componentDidUpdate <> cursor_pos: ' + this.props.cursor_pos);
  //  }
  //}

}

const mapStateToProps = (state, ownProps) => {
  //console.log('cursor_pos: ' + state.cursor_pos);
  return {
    cursor_pos: state.cursor_pos,
  };
}

const ConnectedApp = connect(
  mapStateToProps
)(App);

render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('root')
);

