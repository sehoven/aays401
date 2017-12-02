import React from "react";
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import { Enum } from "enumify";

import NavPanel from "../src/components/NavPanel.js";
import Tabs from "../src/components/Tabs.js";
import OverlayContainer from "../src/components/Overlay.js";

class PanelType extends Enum {};
PanelType.initEnum(["SEARCH", "DRAW"]);

configure({ adapter: new Adapter() });

describe("Tabs", () => {
  let mountedTabs, props;

  const tabs = () => {
    if(!mountedTabs) {
      mountedTabs = mount(<Tabs {...props}/>);
    }
    return mountedTabs;
  }

  beforeEach(() => {
    mountedTabs = null;
    props = {
      PanelType: PanelType
    };
  });

  it("always renders a div", () => {
    const divs = tabs().find("div");
    expect(divs.length).toBeGreaterThan(0);
  });

  it("always renders NavPanel", () => {
    expect(tabs().find(NavPanel).length).toBe(1);
  });

  it("always renders OverlayContainer", () => {
    expect(tabs().find(OverlayContainer).length).toBe(1);
  });

  describe("when current panel is SEARCH", () => {
    beforeEach(() => {
      tabs().setState({currentPanel: tabs().props().PanelType.SEARCH});
    });

    it("show only one tab", () => {
      let activeTabs = tabs().find(".activeTabButton");
      expect(activeTabs.length).toBe(1);
    });

    it("show SEARCH tab", () => {
      tabs().find("#search-tab").hasClass("activeTabButton");
    });

    it("onClick on draw tab switches to draw tab", () => {
      tabs().find("#draw-tab").simulate("click", {stopPropagation: () => undefined});
      expect(tabs().state().currentPanel).toEqual(PanelType.DRAW);
      expect(tabs().find("#draw-tab").hasClass("activeTabButton")).toBe(true);
    });
  });

  describe("when current panel is DRAW", () => {
    beforeEach(() => {
      tabs().setState({currentPanel: tabs().props().PanelType.DRAW});
    });

    it("show only one tab", () => {
      let activeTabs = tabs().find(".activeTabButton");
      expect(activeTabs.length).toBe(1);
    });

    it("show DRAW tab", () => {
      tabs().find("#draw-tab").hasClass("activeTabButton");
    });

    it("onClick on search tab switches to search tab", () => {
      tabs().find("#search-tab").simulate("click", {stopPropagation: () => undefined});
      expect(tabs().state().currentPanel).toEqual(PanelType.SEARCH);
      expect(tabs().find("#search-tab").hasClass("activeTabButton")).toBe(true);
    });
  });
});
