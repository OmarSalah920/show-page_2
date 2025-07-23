import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../../../../components/ui/navigation-menu";

export const StatsSection = (): JSX.Element => {
  // Navigation items data for easy mapping
  const navItems = [
    { id: 1, name: "Dashboard", icon: "/frame.svg", isActive: false },
    { id: 2, name: "Live", icon: "/frame-11.svg", isActive: false },
    { id: 3, name: "Calls", icon: "/frame-5.svg", isActive: false },
    { id: 4, name: "Unserviced Calls", icon: "/frame-12.svg", isActive: false },
    { id: 5, name: "Conversations", icon: "/frame-21.svg", isActive: false },
    { id: 6, name: "Users", icon: "/frame-15.svg", isActive: false },
    { id: 7, name: "Groups", icon: "/frame-4.svg", isActive: false },
    { id: 8, name: "Reports", icon: "/frame-10.svg", isActive: false },
    { id: 9, name: "Phonebook", icon: "/frame-6.svg", isActive: false },
    { id: 10, name: "IVR", icon: "/frame-13.svg", isActive: false },
    { id: 11, name: "Campaigns", icon: "/frame-17.svg", isActive: true },
    { id: 12, name: "", icon: "/frame-16.svg", isActive: false },
  ];

  return (
    <nav className="w-full h-[46px] bg-white border-b border-black">
      <NavigationMenu className="h-full max-w-none">
        <NavigationMenuList className="h-full flex">
          {navItems.map((item) => (
            <NavigationMenuItem key={item.id} className="h-full">
              <NavigationMenuLink
                href="#"
                className={`flex items-center h-full px-4 ${
                  item.name === "" ? "w-14" : ""
                }`}
              >
                <div
                  className="w-3.5 h-3.5 bg-[100%_100%]"
                  style={{ backgroundImage: `url(${item.icon})` }}
                />
                {item.name && (
                  <span
                    className={`ml-2 font-normal text-[11.9px] leading-[46px] whitespace-nowrap ${
                      item.isActive ? "text-[#1677ff]" : "text-[#000000e0]"
                    }`}
                  >
                    {item.name}
                  </span>
                )}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
};
