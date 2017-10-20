import React from "react";
import ReactDOM from "React-dom";
import { mount, shallow } from 'enzyme';
import GoogleMap from 'google-map-react';
import Overlay from "../src/components/Overlay.js";
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import sinon from "sinon";

// We are creating a fake google map polygon to populate our polygon array
window.google = {
    maps: {
        Polygon: class {
            setMap() {}
        }
    }
};

configure({ adapter: new Adapter() });

it("initial drawing state of Overlay is false", ()=>{
    const wrapper = mount(<Overlay />);
    //console.log(wrapper);
    //console.log(wrapper.state());
    //console.log(wrapper.polygons);
    expect(wrapper.state().isDrawing).toEqual(false);
});

it("initial state should not have any polygon in polygon array", ()=>{
    const wrapper = mount(<Overlay />);
    //console.log(wrapper.state().polygons.polygons.length);
    expect(wrapper.state().polygons.polygons.length).toEqual(0);

});

it("initial state should have DRAW button and CLEAR button", ()=>{
    const wrapper = shallow(<Overlay />);
    //console.log(wrapper.find("#draw-button"));
    expect(wrapper.find('#draw-button').length).toEqual(1);
    expect(wrapper.find('#clear-button').length).toEqual(1);
});

it("drawing state should have CANCEL button and FINISH button", ()=>{
    const wrapper = shallow(<Overlay/>);
    wrapper.setState({ isDrawing: true });
    //console.log(wrapper.state());
    expect(wrapper.find("#cancel-draw-button").length).toEqual(1);
    expect(wrapper.find("#finish-draw-button").length).toEqual(1);
});

it("polygon is not added to the polygon list when clicked on CANCEL button", ()=>{
    const wrapper = shallow(<Overlay/>);

});

it("polygon array is empty when clicked on CLEAR button", ()=>{
    var triangle = [{lat: 25.774, lng: -80.190},
         {lat: 18.466, lng: -66.118},
         {lat: 32.321, lng: -64.757}];

    var p = new window.google.maps.Polygon({paths: triangle});

    // const polygon1 = jest.fn();
    const wrapper =shallow(<Overlay/>);
    console.log(wrapper.state());
    wrapper.state().polygons.polygons.push(p);
    wrapper.find("#clear-button").simulate("click", {stopPropagation: ()=> undefined});
    console.log(wrapper.state());
    expect(wrapper.state().polygons.polygons.length).toEqual(0);
    // wrapper1.setState({ polygons: polygons1});
    //wrapper.state().polygons.polygons.add(triangle);
    // //console.log("after" + wrapper1.state());
});

it("onClick DRAW button set correct state for drawing", ()=>{
    // const GoogleObj = () => {
    //     google = {
    //         maps: {
    //             drawing: func
    //         }
    //     }
    // };
    //let click = jest.fn();
    //const mockDrawClick = jest.fn();
    let click = sinon.spy()
    const wrapper = shallow(<Overlay/>);
    //wrapper.drawClick = sinon.spy();
    //console.log(wrapper.find("#draw-button"));
    //console.log(wrapper);
    //wrapper.find("#draw-button").simulate("onClick");
    //console.log(wrapper.find("#draw-button"));
    //wrapper.instance().drawClick = sinon.spy();
    //console.log(wrapper.instance().drawClick);
    //console.log(wrapper.instance());
    //wrapper.find("#draw-button").simulate("onClick");
    console.log(wrapper.state());
    console.log(wrapper.find("#draw-button").simulate("click", {stopPropagation: ()=> undefined}));
    console.log(wrapper.state());
    expect(wrapper.state().isDrawing).toEqual(true);
    //expect(wrapper.instance().drawClick).toHaveBeenCalled();
//     const foo = jest.fn();
// foo();
// expect(foo).toHaveBeenCalled();
});

it("onClick FINISH button set drawing state for drawing", ()=>{
    // var triangle = [{lat: 25.774, lng: -80.190},
    //      {lat: 18.466, lng: -66.118},
    //      {lat: 32.321, lng: -64.757}];
    //
    // var p = new window.google.maps.Polygon({paths: triangle});
    // const wrapper = shallow(<Overlay/>);
    // wrapper.setState({ isDrawing: true });
    // wrapper.find("#finish-draw-button").simulate("click", {stopPropagation: ()=> undefined})
    // expect(wrapper.state().isDrawing).toEqual(false);
    const wrapper = shallow(<Overlay/> );
    wrapper.setState({ isDrawing: true });
    wrapper.instance().finishClick = jest.fn();
    console.log(wrapper.instance().finishClick);
    console.log(wrapper.instance());
    //console.log(wrapper.find("#finish-draw-button").simulate("onClick"));
    wrapper.find("#finish-draw-button").simulate("click");
    console.log(wrapper.instance().finishClick.mockReturnValue());
    expect(wrapper.instance().finishClick).toHaveBeenCalled();

});

// ////////////////////////
// //Testing Polygon array
// ////////////////////////
// it("testing adding, remove and remove all polygon ", ()=>{
//     var p =
// });

////////////////////////
//Testing DrawingTools
////////////////////////
