import React from "react";

// Props interface for the ConfirmationModal
interface ModalProps {
  isOpen: boolean;
  amount: number;
  result: number;
  sourceCurrency: string;
  targetCurrency: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<ModalProps> = ({
  isOpen,
  amount,
  result,
  sourceCurrency,
  targetCurrency,
  onClose,
  onConfirm,
}) => {
    // If the modal is not open, return null
  if (!isOpen) return null;

  // Ensure amount is a number
  const formattedAmount = typeof amount === 'number' ? amount.toFixed(7) : '0.0000000';
  const formattedResult = typeof result === 'number' ? result.toFixed(7) : '0.0000000';

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 border border-opacity-20 border-gray-100 p-6 rounded-lg shadow-lg w-11/12 sm:w-1/2 lg:w-1/3 z-50">
        <h2 className="text-3xl font-bold pb-2 mb-4 border-b border-gray-100 border-opacity-20">Confirm Trade</h2>
        <p>
          Are you sure you want to trade{" "}
          <strong>{formattedAmount}</strong> {sourceCurrency} for{" "}
          <strong>{formattedResult}</strong> {targetCurrency}?
        </p>
        <div className="flex justify-center mt-4 space-x-2">
          <button
            className="duration-300 px-4 py-2 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 border border-opacity-20 border-gray-100 text-white rounded-md hover:bg-red-700 hover:bg-opacity-80"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md duration-300"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
