import React from "react";
import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-15";
import {NotificationContainer, NotificationManager} from 'react-notifications';

import OverlayContainer, { Overlay } from "../src/components/Overlay.js";
import DrawingTools, { PolygonTools } from "../src/components/DrawingTools.js";

// TO MOVE MOCK OBJECT TO GLOBAL LEVEL FOR ALL TESTS
const google = {
  maps: {
    Map: function() {
      return {
        setZoom: function() {
          return {};
        },
        setCenter: function() {
          return {};
        }
      };
    },
    Geocoder: function() {
      return {
        geocode: function() {
          return {};
        }
      }
    },
    Polygon: function() {
      return {
        setEditable: function() {
          return {};
        },
        setMap: function() {
          return {};
        }
      };
    },
    event: {
      addListener: function() {
        return {};
      },
      removeListener: function() {
        return {};
      }
    },
    ControlPosition: {
      TOP_RIGHT: 0
    },
    drawing: {
      OverlayType: {
        POLYGON: 0
      },
      DrawingManager: function() {
        return {
          setDrawingMode: function() {
            return {};
          },
          setOptions: function() {
            return {};
          }
        };
      }
    }
  }
}

configure({ adapter: new Adapter() });

describe("Overlay", () => {
  let mountedOverlay;
  let props;

  const overlay = () => {
    if(!mountedOverlay) {
      mountedOverlay = mount(<Overlay {...props}/>);
    }
    return mountedOverlay;
  }

  beforeEach(() => {
    mountedOverlay = null;
    props = {
      map: new google.maps.Map(),
      maps: google.maps
    }
  });

  describe("when not active", () => {
    beforeEach(() => {
      props.active = false;
    });

    it("always renders nothing", () => {
      expect(overlay().children().length).toBe(0);
    });
  });

  describe("when active", () => {
    beforeEach(() => {
      props.active = true;
    });

    it("always renders NotificationContainer", () => {
      expect(overlay().find(NotificationContainer).length).toBe(1);
    });

    describe("when drawing", () => {
      beforeEach(() => {
        overlay().setState({isDrawing: true});
      });

      it("always renders cancel button", () => {
        expect(overlay().find("#cancel-draw-button").length).toBe(1);
      });

      it("always renders finish button", () => {
        expect(overlay().find("#finish-draw-button").length).toBe(1);
      });

      it("always renders add button", () => {
        expect(overlay().find("#add-draw-button").length).toBe(1);
      });
    });

    describe("when not drawing", () => {
      beforeEach(() => {
        overlay().setState({isDrawing: false});
      });

      it("always renders draw button", () => {
        expect(overlay().find("#draw-button").length).toBe(1);
      });

      it("always renders clear button", () => {
        expect(overlay().find("#draw-button").length).toBe(1);
      });
    });

    describe("when can clear", () => {
      beforeEach(() => {
        props.canClear = true;
      });

      it("always renders clear button", () => {
        expect(overlay().find("#clear-button").length).toBe(1);
      });
    });

    describe("when cannot clear", () => {
      beforeEach(() => {
        props.canClear = false;
      });

      it("never renders clear button", () => {
        expect(overlay().find("#clear-button").length).toBe(0);
      });
    });
  });

  describe("notification tests", () => {
    // TODO
  });
});

describe("OverlayContainer", () => {
  let mountedOverlayContainer;
  let props;

  const overlayContainer = () => {
    if(!mountedOverlayContainer) {
      mountedOverlayContainer = mount(<OverlayContainer {...props}/>);
    }
    return mountedOverlayContainer;
  }

  beforeEach(() => {
    mountedOverlayContainer = null;
    props = {
      map: new google.maps.Map(),
      maps: google.maps
    }
  });

  it("always renders div", () => {
    expect(overlayContainer().find("div").length).toBeGreaterThan(0);
  });

  it("always renders Overlay", () => {
    expect(overlayContainer().find(Overlay).length).toBe(1);
  });

  describe("when active", () => {
    beforeEach(() => {
      props.active = true;
    });

    it("always renders navbar-list", () => {
      expect(overlayContainer().find("#navbar-list").length).toBe(1);
    });

    describe("when data ready", () => {
      let data = ["a", "b", "c"];

      beforeEach(() => {
        overlayContainer().setState({dataReady: true, data: data});
      });

      it("renders correct number of residence cards", () => {
        expect(overlayContainer().find("#navbar-list").children().length).toBe(data.length);
      });
    });

    describe("when data not ready", () => {
      beforeEach(() => {
        overlayContainer().setState({dataReady: false});
      });

      it("renders nothing", () => {
        expect(overlayContainer().find("#navbar-list").children().length).toBe(0);
      });
    });
  });

  // TODO TESTS FOR CALLBACKS
});


///////
///
/// TESTS FROM OVERLAY PRE-REFACTOR THAT COULD BE USEFUL IN WRITING MORE TESTS
///
///////

//
//   beforeEach(() => {
//     wrapper = shallow(<OverlayContainer />);
//   });
//   it("initial state of OverlayContainer renders correct children", () => {
//     expect(wrapper.children().length).toEqual(2);
//     expect(wrapper.childAt(0).type()).toEqual(Overlay);
//     expect(wrapper.childAt(1).type()).toEqual("ol");
//   });
//
//   it("drawing state of OverlayContainer renders correct children", () => {
//     wrapper.setState({isDrawing: true});
//     expect(wrapper.children().length).toEqual(3);
//     expect(wrapper.childAt(0).type()).toEqual(Overlay);
//     expect(wrapper.childAt(1).type()).toEqual(DrawingTools);
//     expect(wrapper.childAt(2).type()).toEqual("ol");
//   });
//
//   it("drawing and polygon states of OverlayContainer render correct children", () => {
//     wrapper.setState({isDrawing: true, polygon: new window.google.maps.Polygon()});
//     expect(wrapper.children().length).toEqual(3);
//     expect(wrapper.childAt(0).type()).toEqual(Overlay);
//     expect(wrapper.childAt(1).type()).toEqual(PolygonTools);
//     expect(wrapper.childAt(2).type()).toEqual("ol");
//   });
//
//   it("toggleDrawingTools from initial state sets correct drawing state", () => {
//     wrapper.instance().toggleDrawingTools();
//     expect(wrapper.state().isDrawing).toEqual(true);
//   });
//
//   it("toggleDrawingTools from drawing state sets correct drawing state", () => {
//     wrapper.setState({isDrawing: true});
//     wrapper.instance().toggleDrawingTools();
//     wrapper.update();
//     expect(wrapper.state().isDrawing).toEqual(false);
//   });
//
//   it("setPolygon from initial state sets correct polygon state", () => {
//     polygon = new window.google.maps.Polygon();
//     wrapper.instance().setPolygon(polygon);
//     expect(wrapper.state().polygon).toEqual(polygon);
//   });
//
//   it("setPolygon from existing polygon state to null state sets correct states", () => {
//     polygon = new window.google.maps.Polygon();
//     wrapper.instance().setPolygon(polygon);
//     wrapper.setState({dataReady: true, data: {}});
//
//     wrapper.instance().setPolygon(null);
//     expect(wrapper.state().polygon).toBeNull();
//     expect(wrapper.state().dataReady).toEqual(false);
//     expect(wrapper.state().data).toBeNull();
//   });
//
//   it("convertToLatLng converts polygon into correct format", () => {
//     // DO WE NEED THIS?
//     // IF YES, NEED TO MOCK THE POLYGON OBJECT DIFFERENTLY
//
//     // TO WRITE
//     expect(false).toEqual(true);
//   });
//
//   it("draw click callback behaviour is expected", () => {
//     wrapper.instance().drawClickCallback();
//
//     // THIS METHOD HAS NOT BEHAVIOUR CURRENTLY SO THERE IS NOTHING TO TEST FOR
//   });
//
//   it("clear click callback behaviour is expected", () => {
//     wrapper.instance().clearClickCallback();
//     expect(wrapper.state().polygon).toBeNull();
//
//     wrapper.setState({polygon: new window.google.maps.Polygon()});
//     wrapper.instance().clearClickCallback();
//     expect(wrapper.state().polygon).toBeNull();
//   });
//
//   it("cancel click callback behaviour is expected", () => {
//     wrapper.instance().cancelClickCallback();
//
//     // THIS METHOD HAS NOT BEHAVIOUR CURRENTLY SO THERE IS NOTHING TO TEST FOR
//   });
//
//   it("finish click callback behaviour is expected", () => {
//     wrapper.setState({polygon: new window.google.maps.Polygon()});
//     wrapper.instance().finishClickCallback();
//     // TO WRITE
//     expect(false).toEqual(true);
//   });
// })
//
// describe("Overlay", () => {
//   let wrapper;
//
//   beforeEach(() => {
//     wrapper = shallow(<Overlay />);
//   });
//
//   it("initial drawing state of Overlay is false", () => {
//     expect(wrapper.state().isDrawing).toEqual(false);
//   });
//
//   it("initial state should have DRAW button and CLEAR button", () => {
//     expect(wrapper.find("#draw-button").length).toEqual(1);
//     expect(wrapper.find("#clear-button").length).toEqual(1);
//   });
//
//   it("onClick DRAW button sets correct drawing state and renders correct buttons", () => {
//     wrapper.find("#draw-button").simulate("click", {stopPropagation: () => undefined})
//     expect(wrapper.state().isDrawing).toEqual(true);
//     expect(wrapper.find("#cancel-draw-button").length).toEqual(1);
//     expect(wrapper.find("#finish-draw-button").length).toEqual(1);
//   });
//
//   it("onClick CLEAR button sets correct drawing state and renders correct buttons", () => {
//     wrapper.find("#clear-button").simulate("click", {stopPropagation: () => undefined})
//     expect(wrapper.state().isDrawing).toEqual(false);
//     expect(wrapper.find("#draw-button").length).toEqual(1);
//     expect(wrapper.find("#clear-button").length).toEqual(1);
//   });
//
//   it("onClick CANCEL button sets correct drawing state and renders correct buttons", () => {
//     wrapper.setState({ isDrawing: true });
//     wrapper.find("#cancel-draw-button").simulate("click", {stopPropagation: () => undefined})
//     expect(wrapper.state().isDrawing).toEqual(false);
//     expect(wrapper.find("#draw-button").length).toEqual(1);
//     expect(wrapper.find("#clear-button").length).toEqual(1);
//   });
//
//   it("onClick FINISH button sets correct drawing state and renders correct buttons", () => {
//     wrapper.setState({ isDrawing: true });
//     wrapper.find("#finish-draw-button").simulate("click", {stopPropagation: () => undefined})
//     expect(wrapper.state().isDrawing).toEqual(false);
//     expect(wrapper.find("#draw-button").length).toEqual(1);
//     expect(wrapper.find("#clear-button").length).toEqual(1);
//   });
// });


// //investigating the best way to test this part of the component that uses the google api.
// it("polygon is not added to the polygon list when clicked on CANCEL button", ()=>{
//
// });
//
// it("polygon array is empty when clicked on CLEAR button", ()=>{
//     var triangle = [{lat: 25.774, lng: -80.190},
//          {lat: 18.466, lng: -66.118},
//          {lat: 32.321, lng: -64.757}];
//
//     var p = new window.google.maps.Polygon({paths: triangle});
//
//     const wrapper =shallow(<Overlay/>);
//     wrapper.state().polygons.polygons.push(p);
//     wrapper.find("#clear-button").simulate("click", {stopPropagation: ()=> undefined});
//     expect(wrapper.state().polygons.polygons.length).toEqual(0);
// });

////////////////////////////////
//DrawingTools Component Testing
// ////////////////////////////////
// // We are still investigating the best way to test components that use the Google Maps API.
// it("testing initial states of DrawingTools", ()=>{
//
// });
//
// it("calling method should getPolygon will return polygon state", ()=>{
//
// });
//
// it("calling method selectPolygon should call deselectPolygon and set correct states", ()=>{
//
// });
//
// it("calling method deselectPolygon should set correct states", ()=>{
//
// });
//
// it("calling method deletePolygon should set the map of the polygon to null", ()=>{
//
// });
