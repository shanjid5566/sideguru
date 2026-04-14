import { useState, useEffect, useRef } from "react";
import { SquarePen, Trash2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  createAdminCountry,
  createAdminPricingPlan,
  createAdminRegion,
  deleteAdminCountry,
  deleteAdminPricingPlan,
  deleteAdminRegion,
  fetchAdminPricingData,
  updateAdminPricingPlan,
  updateAdminCountry,
  updateAdminRegion,
} from "../../../features/admin/adminSlice";

const inputClass =
  "h-10 sm:h-11 md:h-12 w-full rounded-md border border-transparent bg-[#F6F6F6] px-3 md:px-4 text-xs sm:text-sm md:text-[14px] text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#ec8d47]";

const ModalShell = ({ title, onClose, children, modalRef }) => {
  return (
    <div
      ref={modalRef}
      className="w-full max-w-80 sm:max-w-md md:max-w-lg rounded-xl bg-white shadow-lg border border-[#d8d8d8] mx-auto"
    >
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[#C2C2C2] bg-[#F8FAFC] rounded-t-xl">
        <h3 className="text-2xl sm:text-3xl leading-none font-medium text-[#111827]">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-full bg-[#D9D9D9] text-[#333] grid place-items-center  shrink-0"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="px-4 sm:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4">{children}</div>
    </div>
  );
};

const AdminPricing = () => {
  const dispatch = useDispatch();
  const pricingPlans = useSelector((state) => state.admin.pricingPlans);
  const countries = useSelector((state) => state.admin.countries);
  const pricingLoading = useSelector((state) => state.admin.pricingLoading);
  const locationsLoading = useSelector((state) => state.admin.locationsLoading);
  const pricingError = useSelector((state) => state.admin.pricingError);
  const locationsError = useSelector((state) => state.admin.locationsError);

  const [openModal, setOpenModal] = useState(null);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editingCountryId, setEditingCountryId] = useState("");
  const [editingRegionContext, setEditingRegionContext] = useState({ countryId: "", regionId: "" });
  const [deleteTarget, setDeleteTarget] = useState({
    type: "",
    countryId: "",
    regionId: "",
    name: "",
    parentName: "",
  });
  const [priceTitle, setPriceTitle] = useState("");
  const [priceValue, setPriceValue] = useState("");
  const [priceDuration, setPriceDuration] = useState("");
  const [countryName, setCountryName] = useState("");
  const [regionName, setRegionName] = useState("");
  const [selectedCountryIdForRegion, setSelectedCountryIdForRegion] = useState("");
  const modalContentRef = useRef(null);

  useEffect(() => {
    dispatch(fetchAdminPricingData());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalContentRef.current && !modalContentRef.current.contains(event.target)) {
        setOpenModal(null);
      }
    };

    if (openModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openModal]);

  const resetFields = () => {
    setPriceTitle("");
    setPriceValue("");
    setPriceDuration("");
    setCountryName("");
    setRegionName("");
    setSelectedCountryIdForRegion("");
    setEditingPlanId(null);
    setEditingCountryId("");
    setEditingRegionContext({ countryId: "", regionId: "" });
  };

  const openAddPriceModal = () => {
    resetFields();
    setOpenModal("price");
  };

  const openEditPriceModal = (plan) => {
    setPriceTitle(plan.title);
    setPriceValue(plan.price);
    setPriceDuration(plan.duration || "");
    setEditingPlanId(plan.id);
    setOpenModal("edit-price");
  };

  const openEditCountryModal = (country) => {
    setCountryName(country?.name || "");
    setEditingCountryId(String(country?.id || ""));
    setOpenModal("edit-country");
  };

  const openEditRegionModal = ({ country, region }) => {
    setSelectedCountryIdForRegion(String(country?.id || ""));
    setRegionName(region?.name || "");
    setEditingRegionContext({
      countryId: String(country?.id || ""),
      regionId: String(region?.id || ""),
    });
    setOpenModal("edit-region");
  };

  const openDeleteTargetModal = ({ type, countryId, regionId = "", name, parentName = "" }) => {
    setDeleteTarget({
      type,
      countryId: String(countryId || ""),
      regionId: String(regionId || ""),
      name: String(name || ""),
      parentName: String(parentName || ""),
    });
    setOpenModal("delete-target");
  };

  const handleSavePrice = async () => {
    if (!priceTitle.trim() || !priceValue.trim() || !priceDuration.trim()) {
      toast.error("Title, price and duration are required");
      return;
    }

    if (openModal === "edit-price" && editingPlanId) {
      try {
        await toast.promise(
          dispatch(
            updateAdminPricingPlan({
              pricingPlanId: editingPlanId,
              title: priceTitle.trim(),
              price: priceValue.trim(),
              duration: priceDuration.trim(),
              isActive: true,
            }),
          ).unwrap(),
          {
            pending: "Updating price...",
            success: "Price updated successfully",
            error: {
              render({ data }) {
                return data || "Failed to update price";
              },
            },
          },
        );
      } catch {
        return;
      }
    } else {
      try {
        await toast.promise(
          dispatch(
            createAdminPricingPlan({
              title: priceTitle.trim(),
              price: priceValue.trim(),
              duration: priceDuration.trim(),
            }),
          ).unwrap(),
          {
            pending: "Creating price...",
            success: "Price added successfully",
            error: {
              render({ data }) {
                if (typeof data === "string") return data;
                return "Failed to add price. Use valid title, price and duration.";
              },
            },
          },
        );
      } catch {
        return;
      }
    }

    resetFields();
    setOpenModal(null);
  };

  const handleDeletePrice = async (id) => {
    try {
      await toast.promise(dispatch(deleteAdminPricingPlan(id)).unwrap(), {
        pending: "Deleting price...",
        success: "Price deleted successfully",
        error: {
          render({ data }) {
            return data || "Failed to delete price";
          },
        },
      });
    } catch {
      return;
    }
  };

  const handleSaveCountry = async () => {
    if (!countryName.trim()) {
      toast.error("Country name is required");
      return;
    }

    if (openModal === "edit-country" && editingCountryId) {
      try {
        await toast.promise(
          dispatch(updateAdminCountry({ countryId: editingCountryId, name: countryName.trim() })).unwrap(),
          {
            pending: "Updating country...",
            success: "Country updated successfully",
            error: {
              render({ data }) {
                return data || "Failed to update country";
              },
            },
          },
        );
      } catch {
        return;
      }

      setCountryName("");
      setEditingCountryId("");
      setOpenModal(null);
      return;
    }

    try {
      await toast.promise(dispatch(createAdminCountry(countryName.trim())).unwrap(), {
        pending: "Creating country...",
        success: "Country added successfully",
        error: {
          render({ data }) {
            if (typeof data === "string") {
              if (/already|exists|duplicate/i.test(data)) {
                return "Country already exists";
              }
              return data;
            }
            return "Failed to add country";
          },
        },
      });
    } catch {
      return;
    }

    setCountryName("");
    setOpenModal(null);
  };

  const handleSaveRegion = async () => {
    if (!selectedCountryIdForRegion) {
      toast.error("Please select a country");
      return;
    }

    if (!regionName.trim()) {
      toast.error("Region name is required");
      return;
    }

    if (openModal === "edit-region" && editingRegionContext.countryId && editingRegionContext.regionId) {
      try {
        await toast.promise(
          dispatch(
            updateAdminRegion({
              countryId: editingRegionContext.countryId,
              regionId: editingRegionContext.regionId,
              name: regionName.trim(),
            }),
          ).unwrap(),
          {
            pending: "Updating region...",
            success: "Region updated successfully",
            error: {
              render({ data }) {
                return data || "Failed to update region";
              },
            },
          },
        );
      } catch {
        return;
      }

      setRegionName("");
      setSelectedCountryIdForRegion("");
      setEditingRegionContext({ countryId: "", regionId: "" });
      setOpenModal(null);
      return;
    }

    try {
      await toast.promise(
        dispatch(createAdminRegion({ countryId: selectedCountryIdForRegion, name: regionName.trim() })).unwrap(),
        {
          pending: "Creating region...",
          success: "Region added successfully",
          error: {
            render({ data }) {
              return data || "Failed to add region";
            },
          },
        },
      );
    } catch {
      return;
    }

    setRegionName("");
    setSelectedCountryIdForRegion("");
    setOpenModal(null);
  };

  const handleConfirmDeleteTarget = async () => {
    if (deleteTarget.type === "country") {
      try {
        await toast.promise(dispatch(deleteAdminCountry(deleteTarget.countryId)).unwrap(), {
          pending: "Deleting country...",
          success: "Country deleted successfully",
          error: {
            render({ data }) {
              return data || "Failed to delete country";
            },
          },
        });
      } catch {
        return;
      }
    }

    if (deleteTarget.type === "region") {
      try {
        await toast.promise(
          dispatch(deleteAdminRegion({ countryId: deleteTarget.countryId, regionId: deleteTarget.regionId })).unwrap(),
          {
            pending: "Deleting region...",
            success: "Region deleted successfully",
            error: {
              render({ data }) {
                return data || "Failed to delete region";
              },
            },
          },
        );
      } catch {
        return;
      }
    }

    setDeleteTarget({ type: "", countryId: "", regionId: "", name: "", parentName: "" });
    setOpenModal(null);
  };

  const regionItems = countries.flatMap((country) =>
    (Array.isArray(country.regions) ? country.regions : []).map((region) => ({
      ...region,
      countryId: country.id,
      countryName: country.name,
    })),
  );

  const isInitialPricingLoad = pricingLoading && pricingPlans.length === 0;
  const isInitialLocationsLoad = locationsLoading && countries.length === 0;
  const pricingSkeletonItems = Array.from({ length: 3 }, (_, index) => `pricing-skeleton-${index}`);
  const locationSkeletonItems = Array.from({ length: 6 }, (_, index) => `location-skeleton-${index}`);

  return (
    <div className="relative min-h-screen">
      <section className="space-y-6 md:space-y-10 px-2 md:px-0">

        <div>
          <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3 md:mb-4">
            <h1 className="text-xl sm:text-3xl leading-none font-bold text-[#111827] whitespace-nowrap">Pricing Plan</h1>
            <button
              type="button"
              onClick={openAddPriceModal}
              className="h-9 sm:h-10 rounded-md bg-[#E97C35] px-3 sm:px-5 text-white text-xs sm:text-base font-medium hover:bg-[#cf6d2e] whitespace-nowrap shrink-0"
            >
              Add new price
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {isInitialPricingLoad && pricingSkeletonItems.map((key) => (
              <div key={key} className="w-full sm:w-55 md:w-61.25 rounded-md border border-[#ececec] bg-white p-3 md:p-4 animate-pulse">
                <div className="h-3 w-28 rounded bg-[#e5e7eb]" />
                <div className="mt-3 h-8 w-20 rounded bg-[#d1d5db]" />
                <div className="mt-2 h-3 w-16 rounded bg-[#e5e7eb]" />
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-[#e5e7eb]" />
                  <div className="h-4 w-4 rounded bg-[#e5e7eb]" />
                </div>
              </div>
            ))}
            {!isInitialPricingLoad && pricingPlans.map((plan) => (
              <div key={plan.id} className="w-full sm:w-55 md:w-61.25 rounded-md border border-[#ececec] bg-white p-3 md:p-4">
                <p className="text-[11px] md:text-[13px] text-[#717171] font-medium">{plan.title}</p>
                <p className="mt-2 text-xl sm:text-2xl md:text-[30px] leading-tight font-bold text-[#004C48]">{plan.price}</p>
                {plan.duration ? <p className="mt-1 text-xs md:text-sm text-[#6b7280]">{plan.duration}</p> : null}
                <div className="mt-3 flex items-center gap-2">
                  <button type="button" className="text-[#004C48] hover:text-[#0d9488]" onClick={() => openEditPriceModal(plan)}>
                    <SquarePen className="h-4 w-4 md:h-4.5 md:w-4.5" strokeWidth={2.5} />
                  </button>
                  <button type="button" className="text-[#E97C35] hover:text-[#dc2626]" onClick={() => handleDeletePrice(plan.id)}>
                    <Trash2 className="h-4 w-4 md:h-4.5 md:w-4.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
            {!isInitialPricingLoad && !pricingLoading && pricingPlans.length === 0 && (
              <div className="w-full rounded-md border border-[#ececec] bg-white p-4 text-sm text-[#6b7280]">
                {pricingError || "No pricing plans found."}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 md:mb-5 flex items-center justify-between gap-2 sm:gap-3">
            <h2 className="text-xl sm:text-3xl leading-none font-bold text-[#111827] whitespace-nowrap">Country</h2>
            <button
              type="button"
              onClick={() => setOpenModal("country")}
              className="h-9 sm:h-10 rounded-md bg-[#E97C35] px-3 sm:px-5 text-white text-xs sm:text-sm md:text-base font-medium whitespace-nowrap shrink-0"
            >
              Add new Country
            </button>
          </div>

          <div className="space-y-2 md:space-y-3">
            <div className="flex flex-wrap gap-2 md:gap-3">
              {isInitialLocationsLoad && locationSkeletonItems.map((key) => (
                <span
                  key={key}
                  className="inline-flex h-9 w-32 items-center rounded-full border border-[#e5e7eb] bg-[#f3f4f6] animate-pulse"
                />
              ))}
              {!isInitialLocationsLoad && countries.map((item) => (
                <span
                  key={item.id || item.name}
                  className="inline-flex items-center gap-2 rounded-full border border-[#2db18e] px-3 sm:px-4 md:px-5 py-1.5 md:py-2 text-xs sm:text-sm md:text-[14px] text-[#12a57f] bg-[#ecf8f4] whitespace-nowrap"
                >
                  {item?.name || "N/A"}
                  <button
                    type="button"
                    onClick={() => openEditCountryModal(item)}
                    className="text-[#0f766e] hover:text-[#0d9488]"
                    aria-label="Edit country"
                  >
                    <SquarePen className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openDeleteTargetModal({
                        type: "country",
                        countryId: item.id,
                        name: item.name,
                      })
                    }
                    className="text-[#dc2626] hover:text-[#b91c1c]"
                    aria-label="Delete country"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
                {!isInitialLocationsLoad && !locationsLoading && countries.length === 0 && (
                <div className="w-full rounded-md border border-[#ececec] bg-white p-4 text-sm text-[#6b7280]">
                  {locationsError || "No countries found."}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 md:mb-5 flex items-center justify-between gap-2 sm:gap-3">
            <h2 className="text-xl sm:text-3xl leading-none font-bold text-[#111827] whitespace-nowrap">Region</h2>
            <button
              type="button"
              onClick={() => setOpenModal("region")}
              className="h-9 sm:h-10 rounded-md bg-[#E97C35] px-3 sm:px-5 text-white text-xs sm:text-sm md:text-base font-medium whitespace-nowrap shrink-0"
            >
              Add Region
            </button>
          </div>

          <div className="space-y-2 md:space-y-3">
            <div className="flex flex-wrap gap-2 md:gap-3">
              {isInitialLocationsLoad && locationSkeletonItems.map((key) => (
                <span
                  key={`region-${key}`}
                  className="inline-flex h-9 w-40 items-center rounded-full border border-[#e5e7eb] bg-[#f3f4f6] animate-pulse"
                />
              ))}
              {!isInitialLocationsLoad && regionItems.map((item) => (
                <span
                  key={`${item.countryId}-${item.id || item.name}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#2db18e] px-3 sm:px-4 md:px-5 py-1.5 md:py-2 text-xs sm:text-sm md:text-[14px] text-[#12a57f] bg-[#ecf8f4] whitespace-nowrap"
                >
                  {item.name}
                  <span className="text-[10px] md:text-xs text-[#6b7280]">({item.countryName})</span>
                  <button
                    type="button"
                    onClick={() =>
                      openEditRegionModal({
                        country: { id: item.countryId, name: item.countryName },
                        region: { id: item.id, name: item.name },
                      })
                    }
                    className="text-[#0f766e] hover:text-[#0d9488]"
                    aria-label="Edit region"
                  >
                    <SquarePen className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openDeleteTargetModal({
                        type: "region",
                        countryId: item.countryId,
                        regionId: item.id,
                        name: item.name,
                        parentName: item.countryName,
                      })
                    }
                    className="text-[#dc2626] hover:text-[#b91c1c]"
                    aria-label="Delete region"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
                {!isInitialLocationsLoad && !locationsLoading && regionItems.length === 0 && (
                <div className="w-full rounded-md border border-[#ececec] bg-white p-4 text-sm text-[#6b7280]">
                  {locationsError || "No regions found."}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {openModal && (
        <div className="fixed inset-0 z-20 bg-black/35 p-3 sm:p-4 md:p-6 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-80 sm:max-w-md md:max-w-lg my-auto">
            {(openModal === "price" || openModal === "edit-price") && (
              <ModalShell
                title={openModal === "edit-price" ? "Edit Price" : "Add Price"}
                onClose={() => setOpenModal(null)}
                modalRef={modalContentRef}
              >
                <div>
                  <label className="block text-sm md:text-base text-[#1f2937] mb-1.5 md:mb-2">Tittle</label>
                  <input type="text" placeholder="tittle" className={inputClass} value={priceTitle} onChange={(e) => setPriceTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm md:text-[14px] text-[#1f2937] mb-1.5 md:mb-2">Price</label>
                  <input type="text" placeholder="$100.00" className={inputClass} value={priceValue} onChange={(e) => setPriceValue(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm md:text-[14px] text-[#1f2937] mb-1.5 md:mb-2">Duration</label>
                  <input type="text" placeholder="e.g. 30 days" className={inputClass} value={priceDuration} onChange={(e) => setPriceDuration(e.target.value)} />
                </div>
                <button type="button" onClick={handleSavePrice} className="h-9 sm:h-10 rounded-md bg-[#E97C35] px-6 md:px-8 text-white text-sm md:text-[16px] font-medium  w-full sm:w-auto">
                  Save
                </button>
              </ModalShell>
            )}

            {(openModal === "country" || openModal === "edit-country") && (
              <ModalShell
                title={openModal === "edit-country" ? "Edit Country" : "Add Country"}
                onClose={() => setOpenModal(null)}
                modalRef={modalContentRef}
              >
                <div>
                  <label className="block text-sm md:text-base text-[#1f2937] mb-1.5 md:mb-2">Country Name</label>
                  <input type="text" placeholder="Country Name" className={inputClass} value={countryName} onChange={(e) => setCountryName(e.target.value)} />
                </div>
                <button type="button" onClick={handleSaveCountry} className="h-9 sm:h-10 rounded-md bg-[#e97c35] px-6 md:px-8 text-white text-sm md:text-[16px] font-medium  w-full sm:w-auto">
                  Save
                </button>
              </ModalShell>
            )}

            {(openModal === "region" || openModal === "edit-region") && (
              <ModalShell
                title={openModal === "edit-region" ? "Edit Region" : "Add Region"}
                onClose={() => setOpenModal(null)}
                modalRef={modalContentRef}
              >
                <div>
                  <label className="block text-sm md:text-base text-[#1f2937] mb-1.5 md:mb-2">Select Country</label>
                  <select
                    value={selectedCountryIdForRegion}
                    onChange={(e) => setSelectedCountryIdForRegion(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select country</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm md:text-base text-[#1f2937] mb-1.5 md:mb-2">Region Name</label>
                  <input type="text" placeholder="Region Name" className={inputClass} value={regionName} onChange={(e) => setRegionName(e.target.value)} />
                </div>
                <button type="button" onClick={handleSaveRegion} className="h-9 sm:h-10 rounded-md bg-[#e97c35] px-6 md:px-8 text-white text-sm md:text-[16px] font-medium  w-full sm:w-auto">
                  Save
                </button>
              </ModalShell>
            )}

            {openModal === "delete-target" && (
              <ModalShell title={deleteTarget.type === "country" ? "Delete Country" : "Delete Region"} onClose={() => setOpenModal(null)} modalRef={modalContentRef}>
                <p className="text-sm text-[#4b5563]">
                  {deleteTarget.type === "country"
                    ? `Delete ${deleteTarget.name}? This will remove all regions under this country.`
                    : `Delete ${deleteTarget.name} from ${deleteTarget.parentName}?`}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenModal(null)}
                    className="h-9 sm:h-10 rounded-md border border-[#d1d5db] px-6 text-sm text-[#374151]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteTarget}
                    className="h-9 sm:h-10 rounded-md bg-[#dc2626] px-6 text-sm text-white"
                  >
                    Delete
                  </button>
                </div>
              </ModalShell>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPricing;
