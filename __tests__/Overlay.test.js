import React from "react";
import ReactDOM from "React-dom";
import { shallow } from 'enzyme';
import GoogleMap from 'google-map-react';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import sinon from "sinon";

import Overlay, {DrawingTools} from "../src/components/Overlay.js";

// We are creating a fake google map polygon to populate our polygon array
window.google = {
    maps: {
        Polygon: class {
            setMap() {}
        }
    }
};

configure({ adapter: new Adapter() });

///////////////////////////
//Overlay Component Testing
///////////////////////////
it("initial drawing state of Overlay is false", ()=>{
    const wrapper = shallow(<Overlay />);
    expect(wrapper.state().isDrawing).toEqual(false);
});

it("initial state should not have any polygon in polygon array", ()=>{
    const wrapper = shallow(<Overlay />);
    expect(wrapper.state().polygons.polygons.length).toEqual(0);
});

it("initial state should have DRAW button and CLEAR button", ()=>{
    const wrapper = shallow(<Overlay />);
    expect(wrapper.find('#draw-button').length).toEqual(1);
    expect(wrapper.find('#clear-button').length).toEqual(1);
});

it("drawing state should have CANCEL button and FINISH button", ()=>{
    const wrapper = shallow(<Overlay/>);
    wrapper.setState({ isDrawing: true });
    expect(wrapper.find("#cancel-draw-button").length).toEqual(1);
    expect(wrapper.find("#finish-draw-button").length).toEqual(1);
});

//investigating the best way to test this part of the component that uses the google api.
it("polygon is not added to the polygon list when clicked on CANCEL button", ()=>{

});

it("polygon array is empty when clicked on CLEAR button", ()=>{
    var triangle = [{lat: 25.774, lng: -80.190},
         {lat: 18.466, lng: -66.118},
         {lat: 32.321, lng: -64.757}];

    var p = new window.google.maps.Polygon({paths: triangle});

    const wrapper =shallow(<Overlay/>);
    wrapper.state().polygons.polygons.push(p);
    wrapper.find("#clear-button").simulate("click", {stopPropagation: ()=> undefined});
    expect(wrapper.state().polygons.polygons.length).toEqual(0);
});

it("onClick DRAW button set correct state for drawing", ()=>{
    const wrapper = shallow(<Overlay/>);
    wrapper.find("#draw-button").simulate("click", {stopPropagation: ()=> undefined})
    expect(wrapper.state().isDrawing).toEqual(true);
});

//investigating the best way to test this part of the component that uses the google api.
it("onClick FINISH button set drawing state for drawing", ()=>{

});

////////////////////////////////
//DrawingTools Component Testing
////////////////////////////////
// We are still investigating the best way to test components that use the Google Maps API.
it("testing initial states of DrawingTools", ()=>{

});

it("calling method should getPolygon will return polygon state", ()=>{

});

it("calling method selectPolygon should call deselectPolygon and set correct states", ()=>{

});

it("calling method deselectPolygon should set correct states", ()=>{

});

it("calling method deletePolygon should set the map of the polygon to null", ()=>{

});
