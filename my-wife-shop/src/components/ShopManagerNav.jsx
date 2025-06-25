import React, { useState } from "react";
import { BsArrowLeftShort } from "react-icons/bs"; // ✅

import { FaBagShopping } from "react-icons/fa6";
import { MdMailOutline } from "react-icons/md";
import { AiOutlineBarChart } from "react-icons/ai";
import { FaShippingFast, FaReact } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { CiShop } from "react-icons/ci";
import UploadProduct from "./UploadProduct";

const ShopManagerNav = ({ isSeller, onLogout, onUploadClick, onDevClick }) => {
  const [open, setOpen] = useState(true);
  //For upload new product button
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeMenuComponent, setActiveMenuComponent] = useState(null);


  const Menus = [
    { title: "Post New Product", icon: <FaBagShopping />, action: "upload" },
    { title: "Inbox", icon: <MdMailOutline /> },
    { title: "Analytics", icon: <AiOutlineBarChart /> },
    { title: "Orders", icon: <FaShippingFast /> },
    { title: "Settings", icon: <IoSettingsOutline /> },
    { title: "Developer", icon: <FaReact />, action: "developer" },
  ];

  return (
    
    <div
  className={`h-screen transition-all duration-300 ${open ? "w-64" : "w-16"
  } bg-white border-r shadow-sm flex flex-col`}
  onMouseEnter={() => setOpen(true)}
  onMouseLeave={() => setOpen(false)}
>
  <div className="flex items-center justify-between px-4 py-3">
    <h1 className={`text-lg font-bold text-gray-700 transition-opacity duration-200 ${!open && "opacity-0"}`}>
      Dashboard
    </h1>
    {open && (
      <button
        className="text-gray-500 hover:text-gray-700"
        onClick={() => setOpen(false)}
      >
        <BsArrowLeftShort size={24} />
      </button>
    )}
  </div>

  <ul className="pt-4 space-y-2">
    {Menus.map((menu, index) => (
      <li
        key={index}
        className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 text-gray-700 rounded-md cursor-pointer transition-colors"
        onClick={() => {
        if (menu.action === "upload") {
      onUploadClick();
    }
    if (menu.action === "developer") {
      onDevClick();
      
    }
    
      }}
    >
        <span className="text-xl">{menu.icon}</span>
        <span className={`whitespace-nowrap transition-opacity duration-200 ${!open && "opacity-0"}`}>
          {menu.title}
        </span>
      </li>
    ))}
  </ul>
</div>







  );
};

export default ShopManagerNav;
