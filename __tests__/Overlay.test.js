import React from "react";
import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-15";
import { NotificationContainer, NotificationManager } from "react-notifications";

import OverlayContainer, { Overlay, PolygonArray } from "../src/components/Overlay.js";
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
        },
        getPath: function() {
          return {
            getLength: function() {
              return {};
            }
          };
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

    it("always renders div", () => {
      expect(overlay().find("div").length).toBeGreaterThan(0);
    });

    it("always renders NotificationContainer", () => {
      expect(overlay().find(NotificationContainer).length).toBe(1);
    });

    describe("when containerState is 1", () => {
      beforeEach(() => {
        props.containerState = 1;
      });

      it("renders one button", () => {
        expect(overlay().find("button").length).toBe(1);
      });

      it("click on draw button", () => {
        let mockCallback = jest.fn();
        props.drawClickCallback = mockCallback;

        overlay().find("#draw-button").simulate("click", {stopPropagation: () => undefined});
        expect(mockCallback).toHaveBeenCalled();
      });
    });

    describe("when containerState is 2", () => {
      beforeEach(() => {
        props.containerState = 2;
      });

      it("renders two buttons", () => {
        expect(overlay().find("button").length).toBe(2);
      });

      it("click on cancel button", () => {
        let mockCallback = jest.fn();
        props.cancelClickCallback = mockCallback;

        overlay().find("#cancel-draw-button").simulate("click", {stopPropagation: () => undefined});
        expect(mockCallback).toHaveBeenCalled();
      });

      it("click on confirm button", () => {
        let mockCallback = jest.fn();
        props.confirmClickCallback = mockCallback;

        overlay().find("#confirm-draw-button").simulate("click", {stopPropagation: () => undefined});
        expect(mockCallback).toHaveBeenCalled();
      });
    });

    describe("when containerState is 3", () => {
      beforeEach(() => {
        props.containerState = 3;
      });

      it("renders three buttons", () => {
        expect(overlay().find("button").length).toBe(3);
      });

      it("click on draw button", () => {
        let mockCallback = jest.fn();
        props.drawClickCallback = mockCallback;

        overlay().find("#draw-button").simulate("click", {stopPropagation: () => undefined});
        expect(mockCallback).toHaveBeenCalled();
      });

      it("click on clear button", () => {
        let mockCallback = jest.fn();
        props.clearClickCallback = mockCallback;

        overlay().find("#clear-button").simulate("click", {stopPropagation: () => undefined});
        expect(mockCallback).toHaveBeenCalled();
      });

      it("click on edit button", () => {
        let mockCallback = jest.fn();
        props.editClickCallback = mockCallback;

        overlay().find("#edit-button").simulate("click", {stopPropagation: () => undefined});
        expect(mockCallback).toHaveBeenCalled();
      });
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
//
// describe("OverlayContainer mount", () => {
//   let mountedOverlayContainer;
//   let props;
//
//   const overlayContainer = () => {
//     if(!mountedOverlayContainer) {
//       mountedOverlayContainer = mount(<OverlayContainer {...props}/>);
//     }
//     return mountedOverlayContainer;
//   }
//
//   beforeEach(() => {
//     mountedOverlayContainer = null;
//     props = {
//       map: new google.maps.Map(),
//       maps: google.maps
//     }
//   });
//
//   it("always renders div", () => {
//     expect(overlayContainer().find("div").length).toBeGreaterThan(0);
//   });
//
//   it("always renders Overlay", () => {
//     expect(overlayContainer().find(Overlay).length).toBe(1);
//   });
//
//   describe("when active", () => {
//     beforeEach(() => {
//       props.active = true;
//     });
//
//     it("always renders navbar-list", () => {
//       expect(overlayContainer().find("#navbar-list").length).toBe(1);
//     });
//
//     describe("when data ready", () => {
//       let data = ["a", "b", "c"];
//
//       beforeEach(() => {
//         overlayContainer().setState({dataReady: true, data: data});
//       });
//
//       it("renders correct number of residence cards", () => {
//         expect(overlayContainer().find("#navbar-list").children().length).toBe(data.length);
//       });
//     });
//
//     describe("when data not ready", () => {
//       beforeEach(() => {
//         overlayContainer().setState({dataReady: false});
//       });
//
//       it("renders nothing", () => {
//         expect(overlayContainer().find("#navbar-list").children().length).toBe(0);
//       });
//     });
//   });
// });
//
// describe("OverlayContainer shallow", () => {
//   let mountedOverlayContainer;
//   let props;
//
//   const overlayContainer = () => {
//     if(!mountedOverlayContainer) {
//       mountedOverlayContainer = shallow(<OverlayContainer {...props}/>);
//     }
//     return mountedOverlayContainer;
//   }
//
//   beforeEach(() => {
//     mountedOverlayContainer = null;
//     props = {
//       map: new google.maps.Map(),
//       maps: google.maps
//     }
//   });
//
//   describe("testing methods", () => {
//     it("toggleDrawingTools to true with callback argument", () => {
//       let mockCallback = jest.fn();
//       overlayContainer().setState({isDrawing: false});
//       overlayContainer().instance().toggleDrawingTools(true, mockCallback);
//       expect(overlayContainer().state().isDrawing).toEqual(true);
//       expect(mockCallback).toHaveBeenCalled();
//     });
//
//     it("toggleDrawingTools to false with callback argument", () => {
//       let mockCallback = jest.fn();
//       overlayContainer().setState({isDrawing: true});
//       overlayContainer().instance().toggleDrawingTools(false, mockCallback);
//       expect(overlayContainer().state().isDrawing).toBe(false);
//       expect(mockCallback).toHaveBeenCalled();
//     });
//
//     it("toggleDrawingTools with null callback argument", () => {
//       let mockCallback = null;
//       overlayContainer().setState({isDrawing: false});
//       overlayContainer().instance().toggleDrawingTools(true, mockCallback);
//       expect(overlayContainer().state().isDrawing).toBe(true);
//     });
//
//     it("drawClickCallback", () => {
//       // no behaviour right now, so no need for a test
//     });
//
//     it("clearClickCallback", () => {
//       let polygon = new google.maps.Polygon();
//       let polygonArray = new PolygonArray(polygon, polygon);
//       overlayContainer().setState({
//         polygons: polygonArray,
//         url: ["a", "b"],
//         data: ["a", "b"],
//         polyNum: polygonArray.size()
//       });
//       let polyCount = overlayContainer().instance().clearClickCallback();
//       expect(polyCount).toBe(2);
//       expect(overlayContainer().state().data.length).toBe(1);
//       expect(overlayContainer().state().url.length).toBe(1);
//       expect(overlayContainer().state().polyNum).toBe(1);
//       expect(overlayContainer().state().polygons.size()).toBe(1);
//     });
//
//     it("addClickCallback", () => {
//       overlayContainer().setState({isDrawing: false, polyNum: 0});
//       overlayContainer().instance().addClickCallback();
//       expect(overlayContainer().state().isDrawing).toBe(true);
//       expect(overlayContainer().state().polyNum).toBe(1);
//     });
//
//     it("addFirstPolygon", () => {
//       let polygon = new google.maps.Polygon();
//       overlayContainer().instance().addFirstPolygon(polygon);
//       expect(overlayContainer().state().polygons.size()).toBe(1);
//       expect(overlayContainer().state().polygons.getAt(0)).toEqual(polygon);
//     });
//
//     it("addFirstPolygon with previous polygons", () => {
//       let polygon = new google.maps.Polygon();
//       overlayContainer().setState({polygons: new PolygonArray(polygon)});
//       let newPolygon = new google.maps.Polygon();
//       overlayContainer().instance().addFirstPolygon(newPolygon);
//       expect(overlayContainer().state().polygons.size()).toBe(1);
//       expect(overlayContainer().state().polygons.getAt(0)).toEqual(newPolygon);
//     });
//
//     it("addPolygon", () => {
//       let polygon = new google.maps.Polygon();
//       overlayContainer().instance().addPolygon(polygon);
//       expect(overlayContainer().state().polygons.size()).toBe(1);
//       expect(overlayContainer().state().polygons.getAt(0)).toEqual(polygon);
//     });
//
//     it("addPolygon with previous polygons", () => {
//       let polygon0 = new google.maps.Polygon();
//       let polygon1 = new google.maps.Polygon();
//       overlayContainer().setState({polygons: new PolygonArray(polygon0)});
//       overlayContainer().instance().addPolygon(polygon1);
//       expect(overlayContainer().state().polygons.size()).toBe(2);
//       expect(overlayContainer().state().polygons.getAt(0)).toEqual(polygon0);
//       expect(overlayContainer().state().polygons.getAt(1)).toEqual(polygon1);
//     });
//
//     it("setPolygonArray", () => {
//       let polygon0 = new google.maps.Polygon();
//       let polygon1 = new google.maps.Polygon();
//       overlayContainer().instance().setPolygonArray([polygon0, polygon1]);
//       expect(overlayContainer().state().polygons.size()).toBe(2);
//       expect(overlayContainer().state().polygons.getAt(0)).toEqual(polygon0);
//       expect(overlayContainer().state().polygons.getAt(1)).toEqual(polygon1);
//     });
//
//     it("setImgUrl", () => {
//       overlayContainer().setState({url: []});
//       overlayContainer().instance().setImgUrl([]);
//       expect(overlayContainer().state().url.length).toBe(1);
//     });
//
//     it("updatePolygonData", () => {
//       //let polygon = new google.maps.Polygon();
//       //overlayContainer().setState({polygons: new PolygonArray(polygon)});
//       //overlayContainer().instance().updatePolygonData();
//
//       // TODO Can we test this? Needs to make call to server to retrieve address count
//     });
//
//     describe("spy on updatePolygonData", () => {
//       let spy;
//
//       beforeEach(() => {
//         spy = jest.spyOn(overlayContainer().instance(), "updatePolygonData");
//       });
//
//       it("finishClickCallback", () => {
//         overlayContainer().instance().finishClickCallback();
//         expect(spy).toHaveBeenCalled();
//       });
//
//       it("cancelClickCallback", () => {
//         overlayContainer().instance().cancelClickCallback();
//         expect(spy).toHaveBeenCalled();
//       });
//     });
//   });
// });
//
// describe("PolygonArray", () => {
//   it("contructor with one element", () => {
//     let polygon = new google.maps.Polygon();
//     let polygons = new PolygonArray(polygon);
//     expect(polygons.arr.length).toBe(1);
//     expect(polygons.arr[0]).toEqual(polygon);
//   });
//
//   it("constructor with multiple elements", () => {
//     let polygon0 = new google.maps.Polygon();
//     let polygon1 = new google.maps.Polygon();
//     let polygons = new PolygonArray(polygon0, polygon1);
//     expect(polygons.arr.length).toBe(2);
//     expect(polygons.arr[0]).toEqual(polygon0);
//     expect(polygons.arr[1]).toEqual(polygon1);
//   });
//
//   it("empty constructor", () => {
//     let polygons = new PolygonArray();
//     expect(polygons.arr.length).toBe(0);
//   });
//
//   it("push", () => {
//     let polygon = new google.maps.Polygon();
//     let polygons = new PolygonArray();
//     polygons.push(polygon);
//     expect(polygons.arr.length).toBe(1);
//     expect(polygons.arr[0]).toEqual(polygon);
//   });
//
//   it("pop", () => {
//     let polygon = new google.maps.Polygon();
//     let polygons = new PolygonArray(polygon);
//     let popped = polygons.pop();
//     expect(polygons.arr.length).toBe(0);
//     expect(popped).toEqual(polygon);
//   });
//
//   it("remove", () => {
//     let polygon0 = new google.maps.Polygon();
//     let polygon1 = new google.maps.Polygon();
//     let polygons = new PolygonArray(polygon0, polygon1);
//     let removed = polygons.remove(0);
//     expect(polygons.arr.length).toBe(1);
//     expect(polygons.arr[0]).toEqual(polygon1);
//     expect(removed).toEqual(polygon0);
//   });
//
//   it("getAt", () => {
//     let polygon = new google.maps.Polygon();
//     let polygons = new PolygonArray(polygon);
//     expect(polygons.getAt(0)).toEqual(polygons.arr[0]);
//   });
//
//   it("indexOf", () => {
//     let polygon = new google.maps.Polygon();
//     let polygons = new PolygonArray(polygon);
//     expect(polygons.indexOf(polygon)).toBe(0);
//   });
//
//   it("clear", () => {
//     let polygon0 = new google.maps.Polygon();
//     let polygon1 = new google.maps.Polygon();
//     let polygons = new PolygonArray(polygon0, polygon1);
//     polygons.clear();
//     expect(polygons.arr.length).toBe(0);
//   });
//
//   it("size", () => {
//     let polygon = new google.maps.Polygon();
//     let polygons = new PolygonArray(polygon);
//     expect(polygons.size()).toBe(polygons.arr.length);
//   })
// });
