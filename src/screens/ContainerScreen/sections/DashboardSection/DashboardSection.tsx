import React from "react";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";

export const DashboardSection = (): JSX.Element => {
  return (
    <header className="w-full border-b border-solid py-3 px-4">
      <div className="flex justify-end items-center">
        <div className="flex items-center gap-2">
          {/* WhatsApp Button */}
          <Button
            className="bg-[#1677ff] hover:bg-[#1677ff]/90 text-white rounded-md h-8 px-4 py-0 flex items-center gap-2"
            size="sm"
          >
            <div className="w-4 h-4 bg-[url(/frame-3.svg)] bg-[100%_100%]" />
            <span className="text-[11.9px] font-normal">Whatsapp</span>
          </Button>

          {/* Dialer Button */}
          <Button
            className="bg-[#1677ff] hover:bg-[#1677ff]/90 text-white rounded-md h-8 px-4 py-0 flex items-center gap-2"
            size="sm"
          >
            <div className="w-4 h-4 bg-[url(/frame-14.svg)] bg-[100%_100%]" />
            <span className="text-[11.9px] font-normal">Dialer</span>
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 px-4 py-0 flex items-center gap-2 border-transparent"
              >
                <Avatar className="h-8 w-8 bg-blue-500 border border-transparent">
                  <AvatarFallback className="text-[11.9px] text-white">
                    A
                  </AvatarFallback>
                </Avatar>
                <span className="text-[11.9px] text-[#000000e0]">
                  Ahmed Ayman
                </span>
                <div className="w-3.5 h-3.5 bg-[url(/frame-9.svg)] bg-[100%_100%]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Dropdown content would go here */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
