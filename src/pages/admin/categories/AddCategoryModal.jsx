import { useRef, useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";

const ModalCard = ({ title, onClose, children }) => {
  return (
    <div className="w-full max-w-80 sm:max-w-md md:max-w-lg rounded-xl bg-[#f4f4f4] shadow-lg border border-[#d8d8d8] mx-auto">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[#d2d2d2]">
        <h3 className="text-xl md:text-2xl font-medium text-[#111827] leading-none">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-full bg-[#D9D9D9] text-[#333] grid place-items-center shrink-0"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="px-4 sm:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4">{children}</div>
    </div>
  );
};

const FieldLabel = ({ children }) => (
  <label className="block text-xs sm:text-sm md:text-[14px] text-[#1f2937] mb-1.5 md:mb-2">{children}</label>
);

const FieldInput = (props) => (
  <input
    {...props}
    className="h-10 sm:h-11 md:h-12 w-full rounded-md border border-transparent bg-[#EFEFEF] px-3 md:px-4 text-xs sm:text-sm md:text-[14px] text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#ec8d47]"
  />
);

const AddCategoryModal = ({ isOpen, onClose, onSave }) => {
  const modalRef = useRef(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState("service");

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const isSaved = await onSave?.({
      name: categoryName,
      type: categoryType,
    });
    if (isSaved) {
      setCategoryName("");
      setCategoryType("service");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-20 bg-black/35 p-3 sm:p-4 md:p-6 flex items-center justify-center overflow-y-auto">
      <div ref={modalRef} className="w-full max-w-80 sm:max-w-md md:max-w-lg my-auto">
        <ModalCard title="Add Category" onClose={onClose}>
          <div>
            <FieldLabel>Category Type</FieldLabel>
            <div className="relative">
              <select
                className="h-10 sm:h-11 md:h-12 w-full appearance-none rounded-md border border-transparent bg-[#EFEFEF] px-3 md:px-4 pr-10 text-xs sm:text-sm md:text-[14px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#ec8d47]"
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
              >
                <option value="service">Service Category</option>
                <option value="event">Event Category</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111827]" />
            </div>
          </div>

          <div>
            <FieldLabel>Category Name</FieldLabel>
            <FieldInput
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="h-9 sm:h-10 rounded-md bg-[#e97c35] px-6 text-white text-sm md:text-[16px] font-medium hover:bg-[#cf6d2e] w-full sm:w-auto"
          >
            Save
          </button>
        </ModalCard>
      </div>
    </div>
  );
};

export default AddCategoryModal;
