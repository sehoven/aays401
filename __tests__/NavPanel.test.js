import React from "react";
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';

import NavPanel from "../src/components/NavPanel.js";
import NavList from "../src/components/NavList.js";

configure({ adapter: new Adapter() });

describe("NavPanel", () => {
  let mountedNavPanel;
  let props;

  const navPanel = () => {
    if(!mountedNavPanel) {
      mountedNavPanel = mount(<NavPanel {...props}/>);
    }
    return mountedNavPanel;
  }

  beforeEach(() => {
    mountedNavPanel = null;
  });

  describe("when active", () => {
    beforeEach(() => {
      props = {
        active: true
      }
    });

    it("always renders a div", () => {
      expect(navPanel().find("div").length).toBeGreaterThan(0);
    });

    it("always renders input", () => {
      expect(navPanel().find("input").length).toBe(1);
    });

    it("always renders NavList", () => {
      expect(navPanel().find(NavList).length).toBe(1);
    });

    it("input change", () => {
      // TODO
      // This test will require a Google Maps Mock
      // navPanel().find("input").simulate("change", {target: {value: "test"}});
    });
  });

  describe("when not active", () => {
    beforeEach(() => {
      props = {
        active: false
      }
    });

    it("always renders nothing", () => {
      expect(navPanel().children().length).toBe(0);
    });
  });
});
