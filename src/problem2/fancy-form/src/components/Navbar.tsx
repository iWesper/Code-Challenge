import React, { useEffect, useRef } from "react";

// CurrencyOption interface for the dropdown options
interface CurrencyOption {
  value: string;
  image: string;
}

// Props interface for the Navbar
interface NavbarProps {
  balances: { [key: string]: number }; // Balances of currencies
  options: CurrencyOption[]; // Dropdown options including images
}

const Navbar: React.FC<NavbarProps> = ({ balances, options }) => {
  const navRef = useRef<HTMLDivElement>(null);

  // Create a map of currency code to image URL for quick lookup
  const currencyImageMap: { [key: string]: string } = options.reduce((acc, option) => {
    // Add the currency code and image URL to the map
    acc[option.value] = option.image;
    // Return the updated map
    return acc;
  }, {} as { [key: string]: string });

  useEffect(() => {
    const navElement = navRef.current;
    if (navElement) {
      const handleWheel = (event: WheelEvent) => {
        if (event.deltaY !== 0) {
          navElement.scrollLeft += event.deltaY;
          event.preventDefault();
        }
      };
      navElement.addEventListener('wheel', handleWheel);
      return () => {
        navElement.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  return (
    <nav ref={navRef} className="absolute text-sm overflow-x-scroll overflow-y-hidden top-0 left-0 xl:left-[25%] w-full xl:w-7/12 2xl:w-6/12 bg-zinc-800 p-4 flex justify-between items-center text-white rounded-md bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 border-0 border-b border-opacity-20 border-gray-100">
      <div className="flex space-x-10">
        {Object.entries(balances)
          .filter(([_, balance]) => balance !== 0) // Filter out currencies with 0 balance
          .map(([currency, balance]) => (
            <div key={currency} className="flex items-center whitespace-nowrap">
              <img src={currencyImageMap[currency]} alt={currency} className="w-6 h-6 mr-2" />
              <span className="mr-1">
                {balance % 1 === 0 ? balance : balance.toString().replace(/\.?0+$/, "").substring(0, 10)}
              </span>
              <span>{currency}</span>
            </div>
          ))}
      </div>
    </nav>
  );
};

export default Navbar;
