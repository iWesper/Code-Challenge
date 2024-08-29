import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import { MdOutlineSwapVert } from "react-icons/md";
import Navbar from "./Navbar";
import ConfirmationModal from "./ConfirmationModal";

// Interface for the currency data
interface Currency {
  currency: string;
  date: string;
  price: number;
}

// Interface for the dropdown (react-select) options
interface CurrencyOption {
  value: string;
  label: string;
  image: string;
}

// Interface for user balances
interface CurrencyBalance {
  [currency: string]: number; // Currency code as key, balance as value
}

const CurrencySwap: React.FC = () => {
  // State variables
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  // Dropdown options for the currency selection
  const [options, setOptions] = useState<CurrencyOption[]>([]);
  // SVG filenames for currency icons
  const [svgNames, setSvgNames] = useState<string[]>([]);
  // Selected and target currencies
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(
    "ETH"
  );
  const [targetCurrency, setTargetCurrency] = useState<string | null>("USD");
  // Amount to swap
  const [amount, setAmount] = useState<any>(0);
  // Result of the currency swap
  const [result, setResult] = useState<number | null>(null);
  // Loading state
  const [loading, setLoading] = useState<boolean>(true);
  // Trade processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  // Error state
  const [error, setError] = useState<string | null>(null);
  // Insufficient balance state
  const [isInsufficientBalance, setIsInsufficientBalance] =
    useState<boolean>(false);
  // Balances of currencies
  const [balances, setBalances] = useState<CurrencyBalance>({});

  // Modal states for confirmation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAmount, setModalAmount] = useState(0);
  const [modalResult, setModalResult] = useState(0);
  const [modalSourceCurrency, setModalSourceCurrency] = useState<string | null>(
    null
  );
  const [modalTargetCurrency, setModalTargetCurrency] = useState<string | null>(
    null
  );

  // Fetch SVG filenames from GitHub API
  useEffect(() => {
    const fetchSvgFilenames = async (): Promise<string[]> => {
      const response = await fetch(
        "https://api.github.com/repos/Switcheo/token-icons/contents/tokens"
      );
      const data = await response.json();
      return data
        .filter((file: any) => file.name.endsWith(".svg"))
        .map((file: any) => file.name);
    };

    fetchSvgFilenames().then((filenames) => setSvgNames(filenames));
  }, []); // Runs only once

  // Fetch currency data after SVG filenames have been fetched
  useEffect(() => {
    // If SVG filenames are available, fetch currency data
    if (svgNames.length > 0) {
      const fetchCurrencyData = async () => {
        try {
          const response = await axios.get(
            "https://interview.switcheo.com/prices.json"
          );
          const currencyData = response.data;
          const currencyMap = new Map<string, Currency>();

          // Filter out duplicate currencies and keep the latest price
          currencyData.forEach((currency: Currency) => {
            const existingEntry = currencyMap.get(currency.currency);
            if (
              !existingEntry ||
              new Date(currency.date) > new Date(existingEntry.date)
            ) {
              currencyMap.set(currency.currency, currency);
            }
          });

          // Get unique currencies
          const uniqueCurrencies = Array.from(currencyMap.values());

          // Create options for the dropdown
          const newOptions = uniqueCurrencies.map((currency: Currency) => {
            const normalizedImageName = normalizeCurrencyName(
              currency.currency,
              svgNames
            );
            return {
              value: currency.currency,
              label: currency.currency,
              image: createImageUrl(normalizedImageName),
            };
          });

          setCurrencies(uniqueCurrencies);
          setOptions(newOptions);

          // Initialize balances with a default value
          const initialBalances: CurrencyBalance = {};
          uniqueCurrencies.forEach((currency) => {
            initialBalances[currency.currency] = 0; // Default balance of 0
          });

          // Set specific balances for "ETH" and "USD" for testing purposes
          initialBalances["ETH"] = 10;
          initialBalances["USD"] = 1000;

          setBalances(initialBalances);

          // Set default currencies if there are options available
          if (newOptions.length > 0) {
            setSelectedCurrency("ETH");
            setTargetCurrency("USD");
          }
        } catch (error) {
          console.error("There was a problem fetching the data: ", error);
        } finally {
          // Set loading to false after fetching data
          setLoading(false);
        }
      };
      fetchCurrencyData();
    }
  }, [svgNames]);

  // Calculate the result of the currency swap
  useEffect(() => {
    // Only calculate if all required fields are available
    if (!selectedCurrency || !targetCurrency || !amount) {
      setResult(0);
      return;
    }

    // Find the price of the selected and target currencies
    const sourceValue =
      currencies.find((c) => c.currency === selectedCurrency)?.price || 0;
    const targetValue =
      currencies.find((c) => c.currency === targetCurrency)?.price || 0;

    // Calculate the swapped amount
    const swappedAmount = (amount * sourceValue) / targetValue;
    // Set the result
    setResult(swappedAmount);
  }, [currencies, amount, selectedCurrency, targetCurrency]);

  // Function to filter out the selected source currency from the target options
  const filteredTargetOptions = options.filter(
    (option) => option.value !== selectedCurrency
  );

  // Function to handle currency swap
  const handleSwap = () => {
    // Swap the selected and target currencies
    const newSelectedCurrency = targetCurrency;
    setSelectedCurrency(targetCurrency);
    setTargetCurrency(selectedCurrency);

    // Check the balance of the new selected currency
    const sourceBalance = balances[newSelectedCurrency || ""] || 0;
    setIsInsufficientBalance(amount !== null && amount > sourceBalance);
  };

  // Function to handle input amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Use a regular expression to allow only numbers, commas, and periods
    const numericValue = value.replace(/[^0-9.,]/g, "");
    // if the value is empty, set the amount to null
    if (numericValue === "") {
      setAmount(null);
    } else {
      // Replace commas with periods for consistent decimal representation
      const standardizedValue = numericValue.replace(/,/g, ".");
      // Parse the value as a float
      const numberValue = parseFloat(standardizedValue);
      // Get the balance of the selected currency
      const sourceBalance = balances[selectedCurrency || ""] || 0;
      // Set the amount if it is a valid number and greater than or equal to 0
      if (!isNaN(numberValue) && numberValue >= 0) {
        setAmount(standardizedValue);
        setIsInsufficientBalance(numberValue > sourceBalance);
      }
    }
  };

  // Set the amount to the maximum balance of the selected currency
  const handleMaxClick = () => {
    const maxAmount = balances[selectedCurrency || ""] || 0;
    setAmount(maxAmount);
    setIsInsufficientBalance(false);
  };

  // Function to handle trade button click
  const handleTradeButtonClick = () => {
    // If any of the required fields are missing, show an alert
    if (!selectedCurrency || !targetCurrency || !amount || amount <= 0) {
      alert("Please enter a valid amount to swap.");
      return;
    }

    // Set the modal data and open the modal
    setModalAmount(Number(amount));
    setModalResult(Number(result));
    setModalSourceCurrency(selectedCurrency);
    setModalTargetCurrency(targetCurrency);
    setIsModalOpen(true);
  };

  // Handle when selecting a new source currency
  const handleSourceCurrencyChange = (option: CurrencyOption | null) => {
    setSelectedCurrency(option?.value || null);

    // Recalculate the insufficient balance state
    if (option?.value) {
      const sourceBalance = balances[option.value] || 0;
      setIsInsufficientBalance(amount !== null && amount > sourceBalance);
    }
  };

  // Handle when selecting a new target currency
  const handleTargetCurrencyChange = (option: CurrencyOption | null) => {
    setTargetCurrency(option?.value || null);

    // Recalculate the insufficient balance state
    const sourceBalance = balances[selectedCurrency || ""] || 0;
    setIsInsufficientBalance(amount !== null && amount > sourceBalance);
  };

  // When the user confirms the trade inside the modal, execute the trade and close the modal
  const handleConfirmTrade = () => {
    executeTradeCurrencies();
    setIsModalOpen(false);
  };

  // Close the modal when the user cancels the trade
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Function to execute the trade of currencies
  const executeTradeCurrencies = () => {
    // If any of the required fields are missing, show an alert
    if (!selectedCurrency || !targetCurrency || !amount || amount <= 0) {
      alert("Please enter a valid amount to swap.");
      return;
    }

    // Get the balance of the selected currency
    const sourceBalance = balances[selectedCurrency];

    // Check if the user has enough balance to execute the trade
    if (amount > sourceBalance) {
      alert(`Insufficient ${selectedCurrency} balance!`);
      return;
    }

    // Start the simulation of the trade
    setIsProcessing(true);
    // Clear previous error messages
    setError(null);

    // Using a timeout to simulate the trade processing
    setTimeout(() => {
      try {
        // Find the price of the selected and target currencies
        const sourceValue =
          currencies.find((c) => c.currency === selectedCurrency)?.price || 0;
        const targetValue =
          currencies.find((c) => c.currency === targetCurrency)?.price || 0;
        // Calculate the swapped amount
        const swappedAmount = (amount * sourceValue) / targetValue;
        // Update the balances after the trade
        setBalances((prevBalances) => ({
          ...prevBalances,
          [selectedCurrency]: prevBalances[selectedCurrency] - amount,
          [targetCurrency]: prevBalances[targetCurrency] + swappedAmount,
        }));
        // Reset the amount after the trade
        setAmount(0);
      } catch (error) {
        // Set an error message if the trade fails
        setError("An error occurred during the trade.");
        console.error("Trade failed:", error);
      } finally {
        // Finish the trade simulation
        setIsProcessing(false);
      }
    }, 2000); // Simulate a 2-second delay
  };

  // Normalize currency name to match the SVG filenames
  const normalizeCurrencyName = (
    currencyName: string,
    svgNames: string[]
  ): string => {
    // Convert the currency name to lowercase for comparison
    const normalizedCurrency = currencyName.toLowerCase();
    // Find the matching SVG filename
    const matchingSvg = svgNames.find(
      (name) => name.toLowerCase() === `${normalizedCurrency}.svg`
    );
    // Ideally, the SVG filename should match the currency code, but if not, return the currency name
    return matchingSvg || `${currencyName}.svg`;
  };

  // Create image URL for the currency icon
  const createImageUrl = (imageName: string): string => {
    return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${imageName}`;
  };

  // Custom styles for the react-select dropdown
  const customOptionStyles = {
    option: (provided: any, state: any) => ({
      ...provided,
      color: "#fff",
      "transition-duration": "300ms",
      backgroundColor: state.isFocused ? "#18181b" : "#09090b",
    }),
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "#27272a",
      border: "none",
      borderRadius: "0.5rem",
      "&:hover": {
        backgroundColor: "#323235",
        cursor: "pointer",
      },
      boxShadow: state.isFocused ? "0 0 0 1px #27272a" : null,
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#fff",
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "#27272a",
      borderColor: "#18181b",
    }),
    input: (provided: any) => ({
      ...provided,
      color: "#fff",
    }),
  };

  // Custom option component for the react-select dropdown
  const CustomOption = (props: any) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="flex items-center p-2 hover:bg-zinc-700 duration-300 cursor-pointer"
      >
        <img src={data.image} alt={data.label} className="w-6 h-6 mr-2" />
        <span>{data.label}</span>
      </div>
    );
  };
  // Custom single value component for the react-select dropdown
  const CustomSingleValue = (props: any) => {
    const { data } = props;
    return (
      <div className="flex items-center absolute top-0 left-0 h-full w-full">
        <img
          src={data.image}
          alt={data.label}
          className="ms-4 me-2 py-2 h-full"
        />
        <span>{data.label}</span>
      </div>
    );
  };

  return (
    <main className="w-8/12 sm:w-6/12 md:w-4/12 xl:w-3/12 2xl:w-2/12">
      <Navbar balances={balances} options={options} />
      <ConfirmationModal
        isOpen={isModalOpen}
        amount={modalAmount}
        result={modalResult}
        sourceCurrency={modalSourceCurrency || ""}
        targetCurrency={modalTargetCurrency || ""}
        onClose={handleCloseModal}
        onConfirm={handleConfirmTrade}
      />
      <form onSubmit={(e) => e.preventDefault()} className="">
        <div className="flex flex-col w-100 bg-zinc-600 p-4 rounded-lg h-full w-full bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 border border-opacity-20 border-gray-100">
          <h2 className="text-3xl font-bold pb-2 mb-4">
            Currency Swap Simulator
          </h2>
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              <fieldset
                disabled={isProcessing}
                className={isProcessing ? "opacity-50" : ""}
              >
                <Select
                  options={options}
                  value={
                    options.find(
                      (option) => option.value === selectedCurrency
                    ) || null
                  }
                  onChange={handleSourceCurrencyChange}
                  placeholder="Select source currency"
                  styles={customOptionStyles}
                  components={{
                    Option: CustomOption,
                    SingleValue: CustomSingleValue,
                  }}
                />
                <div className="flex items-center mt-2">
                  <input
                    type="text"
                    value={amount !== null ? amount : ""}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className={`pt-1 ps-4 pb-2 border outline-none focus:ring-0 w-[80%] ${
                      isInsufficientBalance ? "text-red-500" : "text-white"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="ml-2 text-center px-3 py-1 min-w-[20%] text-sm bg-[#229CD8] text-white rounded-full hover:bg-[#1A7DA1] transition duration-300"
                  >
                    Max
                  </button>
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-b border-gray-100 border-opacity-20"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <button
                      type="button"
                      onClick={handleSwap}
                      className="p-2 text-white rounded-3xl flex items-center justify-center bg-[#229CD8] hover:bg-[#1A7DA1] hover:rotate-180 transition duration-300"
                    >
                      <MdOutlineSwapVert size={24} />
                    </button>
                  </div>
                </div>
                <Select
                  options={filteredTargetOptions}
                  value={
                    filteredTargetOptions.find(
                      (option) => option.value === targetCurrency
                    ) || null
                  }
                  onChange={handleTargetCurrencyChange}
                  placeholder="Select target currency"
                  styles={customOptionStyles}
                  components={{
                    Option: CustomOption,
                    SingleValue: CustomSingleValue,
                  }}
                />
                {result !== null ? (
                  <p className="ps-4 text-start cursor-not-allowed">
                    {result.toString().substring(0, 10)}
                  </p>
                ) : (
                  <p className="ps-4 text-start cursor-not-allowed">0</p>
                )}
                {error && <p className="text-red-500">{error}</p>}
              </fieldset>
            </>
          )}
        </div>
        <button
          onClick={handleTradeButtonClick}
          className={`w-full mt-4 p-2 text-white rounded-lg transition-all duration-300 border border-opacity-20 border-gray-100 ${
            isInsufficientBalance
              ? "bg-red-700 cursor-not-allowed opacity-80"
              : "bg-green-600 hover:bg-green-500"
          } `}
          disabled={isInsufficientBalance || isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          ) : isInsufficientBalance ? (
            "Insufficient balance"
          ) : (
            "Trade"
          )}
        </button>
      </form>
    </main>
  );
};

export default CurrencySwap;
