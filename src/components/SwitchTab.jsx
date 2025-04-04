import React, { useState } from "react";

const SwitchTab = ({ options, onTabChange }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [left, setLeft] = useState(0);

  const activeTab = (tab, index) => {
    const bgSize = window.innerWidth >= 768 ? 100 : 60;
    setLeft(index * bgSize);
    setTimeout(() => {
      setSelectedTab(index);
    }, 100);
    onTabChange(tab, index);
  };

  return (
    <div className="h-[34px] bg-white rounded-[20px] p-[2px]">
      <div className="flex items-center h-[30px] relative">
        {options.map((tab, index) => (
          <span
            key={index}
            className={`h-full flex items-center justify-center w-[60px] md:w-[100px] text-[12px] md:text-[14px] relative z-[1] cursor-pointer transition-colors ease-in duration-300 ${
              selectedTab === index ? "text-white" : ""
            }`}
            onClick={() => activeTab(tab, index)}
          >
            {tab}
          </span>
        ))}
        <span
          className="h-[30px] w-[60px] md:w-[100px] rounded-[15px] bg-red-500 absolute left-0 transition-[left] duration-200"
          style={{ left }}
        />
      </div>
    </div>
  );
};

export default SwitchTab;
