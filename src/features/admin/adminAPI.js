import apiClient from "../../services/apiClient";

const YEAR_OPTIONS = ["This year", "Last year", "2 years ago", "3 years ago", "4 years ago", "5 years ago"];

const PERIOD_BY_LABEL = {
  "This year": "thisYear",
  "Last year": "lastYear",
  "2 years ago": "twoYearsAgo",
  "3 years ago": "threeYearsAgo",
  "4 years ago": "fourYearsAgo",
  "5 years ago": "fiveYearsAgo",
};

const LABEL_BY_PERIOD = {
  thisYear: "This year",
  lastYear: "Last year",
  twoYearsAgo: "2 years ago",
  threeYearsAgo: "3 years ago",
  fourYearsAgo: "4 years ago",
  fiveYearsAgo: "5 years ago",
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toChangeText = (value) => {
  const numeric = toNumber(value);
  const sign = numeric >= 0 ? "+" : "";
  return `${sign}${numeric}% vs previous period`;
};

const buildStats = (overview = {}) => {
  const totalUsers = overview?.totalUsers || {};
  const totalListings = overview?.totalListings || {};
  const totalRevenue = overview?.totalRevenue || {};
  const pendingListings = overview?.pendingListings || {};
  const spamReports = overview?.spamReports || {};

  return [
    {
      title: "Total Users",
      value: toNumber(totalUsers.value).toLocaleString(),
      delta: toChangeText(totalUsers.changePercentage),
      icon: "UserRound",
    },
    {
      title: "Total Listings",
      value: toNumber(totalListings.value).toLocaleString(),
      delta: toChangeText(totalListings.changePercentage),
      icon: "Package",
    },
    {
      title: "Total Revenue",
      value: `$${toNumber(totalRevenue.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      delta: toChangeText(totalRevenue.changePercentage),
      icon: "Landmark",
    },
    {
      title: "Pending Listings",
      value: toNumber(pendingListings.value).toLocaleString(),
      delta: toChangeText(pendingListings.changePercentage),
      icon: "Package",
    },
    {
      title: "Spam Reports",
      value: toNumber(spamReports.value).toLocaleString(),
      delta: toChangeText(spamReports.changePercentage),
      icon: "AlertTriangle",
    },
  ];
};

const buildSales = (salesPerformance = {}) => {
  const points = Array.isArray(salesPerformance?.points) ? salesPerformance.points : [];

  const months = points.map((item) => {
    const label = String(item?.label || "").trim();
    if (!label) return "";
    return label.split(" ")[0];
  });

  const salesData = points.map((item) => toNumber(item?.revenue));
  const maxDataValue = Math.max(0, ...salesData);
  const maxValue = maxDataValue > 0 ? Math.ceil(maxDataValue * 1.2) : 1;
  const step = maxValue >= 5 ? Math.ceil(maxValue / 5) : 1;

  const gridTicks = [1, 2, 3, 4, 5].map((index) => index * step);
  const yAxisLabels = [...gridTicks]
    .reverse()
    .map((tick) => ({ value: tick, label: tick >= 1000 ? `${Math.round(tick / 1000)}K` : String(tick) }));

  return {
    months,
    salesData,
    yearlyRevenue: {},
    gridTicks,
    yAxisLabels,
    tooltipIndex: salesData.length > 0 ? Math.min(2, salesData.length - 1) : 0,
    maxValue,
  };
};

export const fetchAdminDashboardOverviewAPI = async (period = "thisYear") => {
  let response;

  try {
    response = await apiClient.get("/api/dashboard/overview", {
      params: { period },
    });
  } catch (error) {
    const status = error?.response?.status;

    // Keep support for older backend route while preferring the current endpoint.
    if (status === 404) {
      response = await apiClient.get("/api/admin/dashboard/overview", {
        params: { period },
      });
    } else {
      throw error;
    }
  }

  const payload = response?.data?.data || {};
  const normalizedPeriod = payload?.filter?.period || period;
  const selectedLabel = LABEL_BY_PERIOD[normalizedPeriod] || payload?.filter?.label || "This year";

  return {
    selectedPeriod: normalizedPeriod,
    selectedYearLabel: selectedLabel,
    yearOptions: YEAR_OPTIONS,
    dashboard: {
      stats: buildStats(payload?.overview),
      sales: buildSales(payload?.salesPerformance),
    },
    rawOverview: payload?.overview || {},
    rawSalesPerformance: payload?.salesPerformance || {},
  };
};

export const mapYearLabelToPeriod = (label = "This year") => PERIOD_BY_LABEL[label] || "thisYear";

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const extractPayload = (data) => data?.data || data?.result || data;

const normalizePagination = (payload, fallbackPage = 1, fallbackLimit = 20) => {
  const source = extractPayload(payload);
  const pageInfo = payload?.meta || payload?.pagination || source?.pagination || source?.meta || {};

  const page = Number(pageInfo?.page ?? source?.page ?? fallbackPage) || fallbackPage;
  const limit = Number(pageInfo?.limit ?? source?.limit ?? fallbackLimit) || fallbackLimit;
  const total = Number(pageInfo?.total ?? pageInfo?.totalItems ?? source?.total ?? 0) || 0;
  const totalPages =
    Number(pageInfo?.totalPages ?? source?.totalPages ?? (total > 0 ? Math.ceil(total / limit) : 1)) || 1;

  return {
    page,
    limit,
    total,
    totalPages,
  };
};

const normalizeAdminUser = (item) => ({
  id: item?.managedUserId ?? item?.id ?? item?._id,
  managedUserId: item?.managedUserId ?? item?.id ?? item?._id,
  name: item?.fullName ?? item?.name ?? item?.userName ?? "N/A",
  email: item?.email ?? "N/A",
  phone: item?.phoneNumber ?? item?.phone ?? "N/A",
  country: item?.country?.name ?? item?.countryName ?? item?.country ?? "N/A",
  location: item?.region?.name ?? item?.regionName ?? item?.location ?? "N/A",
  listings: Number(item?.listingsCount ?? item?.listings ?? item?.totalListings ?? 0),
  joined: item?.createdAt
    ? new Date(item.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })
    : item?.joined || "N/A",
  raw: item,
});

const normalizeAdminListingStatus = (value) => {
  const raw = String(value || "").trim().toLowerCase();

  if (raw === "pending" || raw === "approved" || raw === "suspended") {
    return raw;
  }

  return "pending";
};

const toArrayOfStrings = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item : item?.name || item?.title || ""))
    .filter(Boolean);
};

const toImageArray = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item : item?.url || item?.image || item?.src || ""))
    .filter(Boolean);
};

const normalizeListingFeatureRows = (item) => {
  const source = Array.isArray(item?.features)
    ? item.features
    : Array.isArray(item?.benefits)
      ? item.benefits
      : [];

  const rows = source
    .map((feature, index) => ({
      icon: feature?.icon ?? (index % 2 === 0 ? "✦" : "◉"),
      title: feature?.title ?? feature?.name ?? `Feature ${index + 1}`,
      desc: feature?.desc ?? feature?.description ?? "",
    }))
    .filter((feature) => feature.title);

  if (rows.length > 0) return rows;

  return [
    { icon: "✦", title: "Verified Listing", desc: "Reviewed by admin for platform compliance." },
    { icon: "◉", title: "Responsive Support", desc: "Provider contact details are available for follow-up." },
  ];
};

const normalizeAdminListingSummary = (item) => ({
  id: item?.serviceId ?? item?.eventId ?? item?.listingId ?? item?.id ?? item?._id,
  title: item?.title ?? item?.serviceTitle ?? item?.eventTitle ?? item?.name ?? "Untitled Listing",
  description: item?.description ?? item?.shortDescription ?? "",
  listingType: String(item?.listingType ?? item?.type ?? item?.category?.type ?? "").toUpperCase(),
  category:
    item?.category?.name ?? item?.categoryName ?? item?.category ?? item?.listingType ?? "Uncategorized",
  categoryName: item?.category?.name ?? item?.categoryName ?? item?.category ?? "",
  userName:
    item?.user?.fullName ??
    item?.user?.name ??
    item?.owner?.fullName ??
    item?.owner?.name ??
    item?.provider?.name ??
    item?.userName ??
    "N/A",
  userId: item?.userId ?? item?.user?.id ?? item?.owner?.id ?? item?.provider?.id ?? "",
  country: item?.country?.name ?? item?.countryName ?? item?.country ?? "N/A",
  countryName: item?.country?.name ?? item?.countryName ?? item?.country ?? "",
  countryId: item?.countryId ?? item?.country?.id ?? "",
  location: item?.region?.name ?? item?.regionName ?? item?.location ?? item?.address ?? "N/A",
  regionName: item?.region?.name ?? item?.regionName ?? "",
  regionId: item?.regionId ?? item?.region?.id ?? "",
  address: item?.address ?? "",
  spamReport: Number(item?.spamReportsCount ?? item?.reportsCount ?? item?.spamReports ?? item?.spamReport ?? 0),
  status: normalizeAdminListingStatus(item?.status ?? item?.listingStatus ?? item?.approvalStatus),
  image: item?.mainImage ?? item?.image ?? item?.imageUrl ?? item?.thumbnail ?? "",
  price: item?.price ?? item?.startingPrice ?? 0,
  createdAt: item?.createdAt ?? null,
  updatedAt: item?.updatedAt ?? null,
  raw: item,
});

const normalizeAdminListingDetail = (payload) => {
  const item = extractPayload(payload);
  const summary = normalizeAdminListingSummary(item);

  const mainImage = item?.mainImage ?? item?.image ?? item?.imageUrl ?? item?.thumbnail ?? "";
  const thumbnails = toImageArray(
    item?.thumbnails || item?.images || item?.serviceImages || item?.eventImages || item?.gallery,
  );
  const galleryImages = toImageArray(item?.galleryImages || item?.gallery || item?.images);

  return {
    ...summary,
    description: item?.description ?? item?.shortDescription ?? "",
    thumbnails: thumbnails.length > 0 ? thumbnails : mainImage ? [mainImage] : [],
    galleryImages: galleryImages.length > 0 ? galleryImages : thumbnails,
    featureRows: normalizeListingFeatureRows(item),
    serviceTargets: toArrayOfStrings(item?.serviceTargets || item?.targets || item?.targetAudience),
    commonServices: toArrayOfStrings(item?.commonServices || item?.includes || item?.services),
    owner: {
      name:
        item?.user?.fullName ||
        item?.user?.name ||
        item?.owner?.fullName ||
        item?.owner?.name ||
        item?.provider?.name ||
        summary.userName,
      email: item?.contactEmail || item?.user?.email || item?.owner?.email || item?.provider?.email || "N/A",
      phone: item?.contactPhone || item?.user?.phone || item?.owner?.phone || item?.provider?.phone || "N/A",
      address: item?.address || summary.location,
      avatar: item?.owner?.avatar || item?.user?.avatar || item?.provider?.avatar || "",
    },
  };
};

export const fetchAdminListingsAPI = async (params = {}) => {
  const response = await apiClient.get("/api/admin/listings", { params });

  return {
    items: normalizeList(response.data).map(normalizeAdminListingSummary).filter((item) => item.id),
    pagination: normalizePagination(response.data, params.page, params.limit),
  };
};

export const fetchAdminListingByIdAPI = async (listingId) => {
  const response = await apiClient.get(`/api/admin/listings/${listingId}`);
  return normalizeAdminListingDetail(response.data);
};

export const updateAdminListingStatusAPI = async ({ listingId, status }) => {
  const normalizedStatus = String(status || "").trim().toUpperCase();
  const response = await apiClient.patch(`/api/admin/listings/${listingId}/status`, {
    status: normalizedStatus,
  });

  const payload = extractPayload(response.data);
  return {
    listingId: String(listingId),
    status: normalizeAdminListingStatus(payload?.status || normalizedStatus),
    item: payload && typeof payload === "object" ? normalizeAdminListingSummary(payload) : null,
    raw: response.data,
  };
};

export const deleteAdminListingAPI = async (listingId) => {
  const response = await apiClient.delete(`/api/admin/listings/${listingId}`);
  return {
    listingId: String(listingId),
    raw: response?.data,
  };
};

export const fetchAdminUsersAPI = async (params = {}) => {
  const response = await apiClient.get("/api/admin/users", { params });

  return {
    items: normalizeList(response.data).map(normalizeAdminUser).filter((item) => item.id),
    pagination: normalizePagination(response.data, params.page, params.limit),
  };
};

export const fetchAdminUserByIdAPI = async (managedUserId) => {
  const response = await apiClient.get(`/api/admin/users/${managedUserId}`);
  const payload = extractPayload(response.data);
  return normalizeAdminUser(payload);
};

export const deleteAdminUserAPI = async (managedUserId) => {
  const response = await apiClient.delete(`/api/admin/users/${managedUserId}`);
  return response?.data;
};

const normalizeCategory = (item, type = "service") => ({
  id: item?.id ?? item?._id ?? item?.categoryId,
  name: item?.name ?? item?.categoryName ?? item?.title ?? "Untitled Category",
  image: item?.image ?? item?.imageUrl ?? item?.thumbnail ?? "",
  type,
  subcategories: [],
});

const normalizeSubCategory = (item) => ({
  id: item?.id ?? item?._id ?? item?.subCategoryId,
  name: item?.name ?? item?.subCategoryName ?? item?.title ?? "Untitled Subcategory",
  image: item?.image ?? item?.imageUrl ?? item?.thumbnail ?? "",
});

const normalizePricingPlan = (item) => ({
  id: item?.id ?? item?._id ?? item?.pricingPlanId,
  title: item?.title ?? item?.name ?? item?.planName ?? "Untitled Plan",
  price: String(item?.price ?? item?.amount ?? item?.value ?? ""),
  duration: String(item?.duration ?? item?.period ?? item?.tenure ?? ""),
});

const normalizePriceInput = (value) => {
  const raw = String(value || "").trim();
  const numeric = Number(raw.replace(/[^0-9.-]/g, ""));
  return {
    raw,
    numeric: Number.isFinite(numeric) ? numeric : null,
  };
};

const normalizeRegion = (item) => ({
  id: item?.id ?? item?._id ?? item?.regionId,
  name: item?.name ?? item?.regionName ?? "Unnamed Region",
});

const normalizeCountry = (item) => ({
  id: item?.id ?? item?._id ?? item?.countryId,
  name: item?.name ?? item?.countryName ?? "Unnamed Country",
  regions: normalizeList(item?.regions || item?.regionList || item?.children)
    .map(normalizeRegion)
    .filter((region) => region.id),
});

const toCategoryFormData = ({ name, image }) => {
  const formData = new FormData();
  formData.append("name", String(name || "").trim());
  if (image) {
    formData.append("image", image);
  }
  return formData;
};

export const fetchAdminCategoriesAPI = async () => {
  const [serviceResponse, eventResponse] = await Promise.all([
    apiClient.get("/api/categories/service"),
    apiClient.get("/api/categories/event"),
  ]);

  const serviceCategories = normalizeList(serviceResponse.data)
    .map((item) => normalizeCategory(item, "service"))
    .filter((item) => item.id);

  const eventCategories = normalizeList(eventResponse.data)
    .map((item) => normalizeCategory(item, "event"))
    .filter((item) => item.id);

  const serviceCategoriesWithSubcategories = await Promise.all(
    serviceCategories.map(async (category) => {
      try {
        const detailResponse = await apiClient.get(`/api/categories/service/${category.id}`);
        const detailPayload = extractPayload(detailResponse.data);
        const subcategoriesSource =
          detailPayload?.subcategories ||
          detailPayload?.subCategories ||
          detailPayload?.children ||
          detailPayload?.subCategoryList ||
          detailPayload;

        const subcategories = normalizeList(subcategoriesSource)
          .map(normalizeSubCategory)
          .filter((item) => item.id);

        return {
          ...category,
          subcategories,
        };
      } catch {
        return {
          ...category,
          subcategories: [],
        };
      }
    }),
  );

  return {
    serviceCategories: serviceCategoriesWithSubcategories,
    eventCategories,
  };
};

export const createServiceCategoryAPI = async ({ name, image }) => {
  const response = await apiClient.post("/api/categories/service", toCategoryFormData({ name, image }));
  const payload = extractPayload(response.data);
  return normalizeCategory(payload, "service");
};

export const createEventCategoryAPI = async ({ name, image }) => {
  const response = await apiClient.post("/api/categories/event", toCategoryFormData({ name, image }));
  const payload = extractPayload(response.data);
  return normalizeCategory(payload, "event");
};

export const createServiceSubCategoryAPI = async ({ serviceCategoryId, name, image } = {}) => {
  const normalizedName = String(name || "").trim();
  const url = `/api/categories/service/${serviceCategoryId}/subcategories`;

  const response = image
    ? await apiClient.post(url, toCategoryFormData({ name: normalizedName, image }))
    : await apiClient.post(url, {
        name: normalizedName,
      });

  const payload = extractPayload(response.data);
  return {
    serviceCategoryId: String(serviceCategoryId),
    subcategory: normalizeSubCategory(payload),
  };
};

export const updateAdminServiceCategoryAPI = async ({ categoryId, categoryName, subcategories = [] }) => {
  const normalizedCategoryId = String(categoryId || "");
  const normalizedCategoryName = String(categoryName || "").trim();

  const normalizedSubcategories = Array.isArray(subcategories)
    ? subcategories
        .map((item) => ({
          id: item?.id == null ? "" : String(item.id).trim(),
          name: String(item?.name || item || "").trim(),
        }))
        .filter((item) => item.name)
    : [];

  const existingSubcategories = normalizedSubcategories.filter((item) => item.id);

  const response = await apiClient.patch("/api/admin/categories/service", {
    categoryId: normalizedCategoryId,
    categoryName: normalizedCategoryName,
  });

  const existingResults = await Promise.allSettled(
    existingSubcategories.map((item) =>
      apiClient.patch("/api/admin/categories/service", {
        categoryId: normalizedCategoryId,
        subcategoryId: item.id,
        subcategoryName: item.name,
      }),
    ),
  );

  const failedExisting = existingResults
    .map((result, index) => ({ result, item: existingSubcategories[index] }))
    .filter(({ result }) => result.status === "rejected")
    .map(({ item }) => item.name);

  if (failedExisting.length > 0) {
    const failureText = failedExisting.join(", ");
    throw new Error(`Failed to save subcategories: ${failureText}`);
  }

  const payload = extractPayload(response.data);
  return {
    categoryId: String(payload?.categoryId ?? normalizedCategoryId),
    categoryName: String(payload?.categoryName ?? normalizedCategoryName ?? "").trim(),
    subcategories: normalizedSubcategories,
    raw: response.data,
  };
};

export const updateAdminEventCategoryAPI = async ({ categoryId, categoryName }) => {
  const response = await apiClient.patch("/api/admin/categories/event", {
    categoryId: String(categoryId || ""),
    categoryName: String(categoryName || "").trim(),
  });

  const payload = extractPayload(response.data);
  return {
    categoryId: String(payload?.categoryId ?? categoryId),
    categoryName: String(payload?.categoryName ?? categoryName ?? "").trim(),
    raw: response.data,
  };
};

export const deleteAdminServiceCategoryAPI = async (categoryId) => {
  const normalizedCategoryId = String(categoryId || "").trim();
  await apiClient.delete(`/api/admin/categories/service/${normalizedCategoryId}`);
  return {
    categoryId: normalizedCategoryId,
  };
};

export const deleteAdminServiceSubCategoryAPI = async ({ categoryId, subCategoryId }) => {
  const normalizedCategoryId = String(categoryId || "").trim();
  const normalizedSubCategoryId = String(subCategoryId || "").trim();

  await apiClient.delete(
    `/api/admin/categories/service/${normalizedCategoryId}/subcategories/${normalizedSubCategoryId}`,
  );

  return {
    categoryId: normalizedCategoryId,
    subCategoryId: normalizedSubCategoryId,
  };
};

export const deleteAdminEventCategoryAPI = async (categoryId) => {
  const normalizedCategoryId = String(categoryId || "").trim();
  await apiClient.delete(`/api/admin/categories/event/${normalizedCategoryId}`);
  return {
    categoryId: normalizedCategoryId,
  };
};

export const fetchAdminPricingPlansAPI = async () => {
  let response;

  try {
    response = await apiClient.get("/api/pricing");
  } catch (error) {
    if (error?.response?.status === 404) {
      response = await apiClient.get("/api/pricing-plans");
    } else {
      throw error;
    }
  }

  return normalizeList(response.data).map(normalizePricingPlan).filter((plan) => plan.id);
};

export const createAdminPricingPlanAPI = async ({ title, price, duration }) => {
  const normalizedTitle = String(title || "").trim();
  const normalizedPrice = normalizePriceInput(price);
  const normalizedDuration = String(duration || "").trim();

  const payload = {
    title: normalizedTitle,
    name: normalizedTitle,
    planName: normalizedTitle,
    price: normalizedPrice.numeric ?? normalizedPrice.raw,
    amount: normalizedPrice.numeric ?? normalizedPrice.raw,
    duration: normalizedDuration,
    period: normalizedDuration,
  };

  const response = await apiClient.post("/api/pricing-plans", payload);

  const responsePayload = extractPayload(response.data);
  return normalizePricingPlan(responsePayload || payload);
};

export const updateAdminPricingPlanAPI = async ({ pricingPlanId, title, price, duration, isActive }) => {
  const normalizedPrice = normalizePriceInput(price);
  const normalizedDurationRaw = String(duration || "").trim();
  const normalizedDurationNumeric = Number(normalizedDurationRaw);

  const payload = {
    title: String(title || "").trim(),
    price: normalizedPrice.numeric ?? normalizedPrice.raw,
    duration: Number.isFinite(normalizedDurationNumeric) ? normalizedDurationNumeric : normalizedDurationRaw,
    isActive: typeof isActive === "boolean" ? isActive : true,
  };

  const response = await apiClient.patch(`/api/pricing/${pricingPlanId}`, payload);
  const responsePayload = extractPayload(response.data);

  return normalizePricingPlan({
    id: responsePayload?.id ?? pricingPlanId,
    ...payload,
    ...responsePayload,
  });
};

export const deleteAdminPricingPlanAPI = async (pricingPlanId) => {
  let response;

  try {
    response = await apiClient.delete(`/api/pricing/${pricingPlanId}`);
  } catch (error) {
    if (error?.response?.status === 404) {
      response = await apiClient.delete(`/api/pricing-plans/${pricingPlanId}`);
    } else {
      throw error;
    }
  }

  return response?.data;
};

export const fetchAdminCountriesWithRegionsAPI = async () => {
  const response = await apiClient.get("/api/locations/countries-with-regions");
  const countries = normalizeList(response.data).map(normalizeCountry).filter((country) => country.id);

  const flatRegionNames = countries.flatMap((country) =>
    (Array.isArray(country.regions) ? country.regions : []).map((region) => region.name),
  );

  return {
    countries,
    regions: flatRegionNames,
  };
};

export const createAdminCountryAPI = async (name) => {
  const response = await apiClient.post("/api/locations/countries", {
    name: String(name || "").trim(),
  });

  const payload = extractPayload(response.data);
  return normalizeCountry(payload);
};

export const updateAdminCountryAPI = async ({ countryId, name }) => {
  const normalizedCountryId = String(countryId || "").trim();
  const response = await apiClient.patch(`/api/locations/countries/${normalizedCountryId}`, {
    name: String(name || "").trim(),
  });

  const payload = extractPayload(response.data);
  return {
    countryId: normalizedCountryId,
    country: normalizeCountry(payload),
  };
};

export const deleteAdminCountryAPI = async (countryId) => {
  const normalizedCountryId = String(countryId || "").trim();
  await apiClient.delete(`/api/locations/countries/${normalizedCountryId}`);

  return {
    countryId: normalizedCountryId,
  };
};

export const createAdminRegionAPI = async ({ countryId, name }) => {
  const response = await apiClient.post(`/api/locations/countries/${countryId}/regions`, {
    name: String(name || "").trim(),
  });

  const payload = extractPayload(response.data);
  return {
    countryId: String(countryId),
    region: normalizeRegion(payload),
  };
};

export const updateAdminRegionAPI = async ({ countryId, regionId, name }) => {
  const normalizedCountryId = String(countryId || "").trim();
  const normalizedRegionId = String(regionId || "").trim();

  const response = await apiClient.patch(
    `/api/locations/countries/${normalizedCountryId}/regions/${normalizedRegionId}`,
    {
      name: String(name || "").trim(),
    },
  );

  const payload = extractPayload(response.data);
  return {
    countryId: normalizedCountryId,
    regionId: normalizedRegionId,
    region: normalizeRegion(payload),
  };
};

export const deleteAdminRegionAPI = async ({ countryId, regionId }) => {
  const normalizedCountryId = String(countryId || "").trim();
  const normalizedRegionId = String(regionId || "").trim();

  await apiClient.delete(
    `/api/locations/countries/${normalizedCountryId}/regions/${normalizedRegionId}`,
  );

  return {
    countryId: normalizedCountryId,
    regionId: normalizedRegionId,
  };
};
