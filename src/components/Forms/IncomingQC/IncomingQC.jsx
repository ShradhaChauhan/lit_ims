import React, { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";
import { Modal } from "bootstrap";
import "./IncomingQC.css";
import _ from "lodash";

const IncomingQC = () => {
  const [isShowQualityCheckForm, setIsShowQualityCheckForm] = useState(false);
  const [searchBatchNo, setSearchBatchNo] = useState("");
  const [iqc, setIqc] = useState([]);
  const [holdQC, setHoldQC] = useState([]);
  const [passFailQC, setPassFailQC] = useState([]);
  const [batchDetails, setBatchDetails] = useState([]);
  const [isFail, setIsFail] = useState(false);
  const [isPass, setIsPass] = useState("");
  const [isHold, setIsHold] = useState("");
  const holdRef = useRef(null);
  const passRef = useRef(null);
  const failRef = useRef(null);
  const [defectCategory, setDefectCategory] = useState("");
  const [remarks, setRemarks] = useState("");
  const qcRef = useRef(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalCompletedItems = passFailQC.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompletedItems = passFailQC.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const [trno, setTrno] = useState("");
  const totalPages = Math.ceil(totalCompletedItems / itemsPerPage);

  // select QC to be deleted
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Confirm modal states
  const [message, setMesssage] = useState("");
  const [confirmState, setConfirmState] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [partnerIdState, setPartnerIdState] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [selectedQCs, setSelectedQCs] = useState([]);

  // Add new state for search-bar and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  /* Press Alt + P to pass transaction. */
  useHotkeys(
    ["alt+p"],
    (e) => {
      e.preventDefault();

      passRef.current?.focus();

      return false;
    },
    []
  );

  /* Press Alt + P to pass transaction. */
  useHotkeys(
    ["alt+f"],
    (e) => {
      e.preventDefault();

      failRef.current?.focus();

      return false;
    },
    []
  );

  // Add useEffect for filtering
  useEffect(() => {
    filterVendors();
  }, [iqc, searchQuery, vendorFilter, typeFilter, warehouseFilter]);

  // Function to filter vendors
  const filterVendors = () => {
    let filtered = [...iqc];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (iqc) =>
          iqc.itemName?.toLowerCase().includes(query) ||
          iqc.itemCode?.toLowerCase().includes(query) ||
          iqc.batchNumber?.toLowerCase().includes(query) ||
          iqc.vendorName?.toLowerCase().includes(query) ||
          iqc.vendorCode?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (vendorFilter) {
      filtered = filtered.filter(
        (vendor) =>
          vendor.vendorName.toLowerCase() === vendorFilter.toLowerCase()
      );
    }

    // Apply status filter
    if (typeFilter) {
      filtered = filtered.filter(
        (type) => type.status.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    setFilteredVendors(filtered);
    setTotalItems(filtered.length);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
    setVendorFilter("");
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Fetch pending IQC from API
  const fetchPendingQC = async () => {
    try {
      const response = await api.get("/api/receipt/pending-qc");
      // Flatten the pending items from all transactions
      const flattenedItems = response.data.data.reduce((acc, transaction) => {
        return acc.concat(
          transaction.pendingItems.map((item) => ({
            ...item,
            transactionNumber: transaction.transactionNumber,
          }))
        );
      }, []);
      setIqc(flattenedItems);
    } catch (error) {
      toast.error("Error in fetching pending IQC");
      console.error("Error fetching pending IQC:", error);
    }
  };

  // Fetch hold IQC from API
  const fetchHoldQC = async () => {
    try {
      const response = await api.get("/api/receipt/on-hold");
      setHoldQC(response.data.data);
    } catch (error) {
      toast.error("Error in fetching hold IQC");
      console.error("Error fetching hold IQC:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchHoldQC();
    fetchPendingQC();
    fetchWarehouses();
  }, []);

  // Fetch warehouses from API
  const fetchWarehouses = async () => {
    try {
      const response = await api.get("/api/warehouses/store-and-rej");
      console.log(response.data.data);
      setWarehouses(response.data.data);
    } catch (error) {
      toast.error("Error in fetching warehouses");
      console.error("Error fetching warehouses:", error);
    }
  };

  // Fetch pass/fail IQC from API
  const fetchPassFailQC = async () => {
    try {
      const response = await api.get("/api/receipt/qc-status/result");
      const sortedData = response.data.data.sort((a, b) => b.id - a.id);

      setPassFailQC(sortedData);
      // setPassFailQC(response.data.data);
    } catch (error) {
      toast.error("Error in fetching pass/fail IQC");
      console.error("Error fetching pass/fail IQC:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPassFailQC();
  }, []);

  // Update search input handler
  const handleSearchBatchNo = async (items) => {
    try {
      const responses = await Promise.all(
        items.map(async (item) => {
          const response = await api.get(
            `/api/receipt/qc/item-by-batch?batchNo=${item.batchNumber}`
          );
          const data = response.data.data;
          return Array.isArray(data) ? data : [data];
        })
      );

      const allDetails = responses.flat();

      setBatchDetails(items);

      // setBatchDetails((prev) => {
      //   // merge and deduplicate by batchNumber
      //   const merged = [...prev, ...allDetails];
      //   const unique = merged.filter(
      //     (obj, index, self) =>
      //       index === self.findIndex((o) => o.batchNumber === obj.batchNumber)
      //   );
      //   return unique;
      // });

      setIsShowQualityCheckForm(true);
    } catch (error) {
      toast.error("Error in fetching batch details");
      console.error("Error fetching batch details:", error);
    }
  };

  const handleSearchHoldBatchNo = async (batchNo) => {
    try {
      const response = await api.get(
        `/api/receipt/qc/item-by-batch?batchNo=${batchNo}`
      );
      const data = response.data.data;
      setBatchDetails((prev) => {
        // merge and deduplicate by batchNumber
        const merged = [...prev, data];
        const unique = merged.filter(
          (obj, index, self) =>
            index === self.findIndex((o) => o.batchNumber === obj.batchNumber)
        );
        return unique;
      });
      setIsShowQualityCheckForm(true);
    } catch (error) {
      toast.error("Error in fetching batch details");
      console.error("Error fetching batch details:", error);
    }
  };

  // Confirm useEffect for confirm modal
  useEffect(() => {
    let modal = null;

    if (isConfirmModal) {
      const modalElement = document.getElementById("incomingQcConfirmModal");

      if (modalElement) {
        // Clean up any existing modal artifacts
        cleanupModalArtifacts();

        // Create new modal
        modal = new Modal(modalElement, {
          backdrop: "static",
          keyboard: false,
        });

        // Add event listener for when modal is hidden
        modalElement.addEventListener("hidden.bs.modal", () => {
          cleanupModalArtifacts();
          setIsConfirmModal(false);
        });

        // Show the modal
        modal.show();

        // Store modal reference
        setConfirmModal(modal);
      }
    }

    // Cleanup function
    return () => {
      if (modal) {
        modal.dispose();
        cleanupModalArtifacts();
      }
    };
  }, [isConfirmModal]);

  // Global function to clean up modal artifacts
  const cleanupModalArtifacts = () => {
    console.log("Cleaning up modal artifacts");
    document.body.classList.remove("modal-open");
    document.body.style.paddingRight = "";
    document.body.style.overflow = "";
    const backdrops = document.getElementsByClassName("modal-backdrop");
    while (backdrops.length > 0) {
      backdrops[0].remove();
    }
  };

  const handleCloseConfirmModal = () => {
    if (confirmModal) {
      confirmModal.hide();
      cleanupModalArtifacts();
    }

    // Add a small delay before resetting states to allow animation to complete
    setTimeout(() => {
      setIsConfirmModal(false);
    }, 300);
  };

  const handleShowConfirm = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one QC to delete.");
      return;
    }
    setMesssage(`Are you sure you want to delete the selected QC(s)?`);
    setIsConfirmModal(true);
  };

  const handleYesConfirm = () => {
    handleDeleteSelected();
  };
  // Preview details
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleShowModal = () => {
    // Validation: Ensure all batches have required details
    for (const batch of batchDetails) {
      const { status, warehouseId } = batchStatuses[batch.id] || {};

      if (!status) {
        toast.error(`Please select a QC status for batch ${batch.batchNumber}`);
        return;
      }

      if (!warehouseId) {
        toast.error(`Please select a warehouse for batch ${batch.batchNumber}`);
        return;
      }

      if (
        (status === "FAIL" || status === "HOLD") &&
        !batchStatuses[batch.id]?.remarks
      ) {
        toast.error(`Please enter remarks for batch ${batch.batchNumber}`);
        return;
      }

      if (status === "FAIL" && !batchStatuses[batch.id]?.defectCategory) {
        toast.error(
          `Please select defect category for batch ${batch.batchNumber}`
        );
        return;
      }
    }

    // Validate that all required group files are uploaded
    const fileValidation = validateGroupFiles();
    if (!fileValidation.isValid) {
      toast.error(
        `Please upload attachments for the following groups: ${fileValidation.missingFiles.join(
          ", "
        )}`
      );
      return;
    }

    setShowPreviewModal(true);
  };

  const handleConfirm = async (e) => {
    setShowPreviewModal(false);
    await handlePassBatch(e);
  };

  const handleCancel = () => {
    setShowPreviewModal(false);
  };

  const qcStatus = isFail ? "FAIL" : isHold ? "HOLD" : "PASS";

  // Submit button function
  // const handlePassBatch = async (e) => {
  //   e.preventDefault();

  //   if (!selectedFile) {
  //     toast.error("Please select a file first.");
  //     return;
  //   }

  //   // Validate each batch
  //   for (const batch of batchDetails) {
  //     const batchData = batchStatuses[batch.id] || {};
  //     if (!batchData.status) {
  //       toast.error(`Please select QC status for batch ${batch.batchNumber}`);
  //       return;
  //     }
  //     if (
  //       (batchData.status === "FAIL" || batchData.status === "HOLD") &&
  //       !batchData.remarks
  //     ) {
  //       toast.error(`Please enter remarks for batch ${batch.batchNumber}`);
  //       return;
  //     }
  //     if (batchData.status === "FAIL" && !batchData.defectCategory) {
  //       toast.error(
  //         `Please select defect category for batch ${batch.batchNumber}`
  //       );
  //       return;
  //     }
  //   }

  //   try {
  //     // Build payload for JSON part
  //     const payload = {
  //       transactionNumber: trno,
  //       batchUpdates: batchDetails.map((batch) => {
  //         const batchData = batchStatuses[batch.id] || {};
  //         return {
  //           itemId: batch.id,
  //           qcStatus: batchData.status,
  //           warehouseId: batchData.warehouseId,
  //           defectCategory: batchData.defectCategory,
  //           remarks: batchData.remarks,
  //         };
  //       }),
  //     };

  //     const formData = new FormData();
  //     formData.append("data", JSON.stringify(payload)); // JSON for batches + transaction number
  //     formData.append("attachment", selectedFile); // file part

  //     // Debug log
  //     formData.forEach((value, key) => console.log(key, value));

  //     const response = await api.put(
  //       "/api/receipt/qc-status/update",
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     // Refresh tables
  //     fetchPassFailQC();
  //     fetchPendingQC();

  //     // Reset state
  //     setBatchStatuses({});
  //     setSelectedFile(null);
  //     setIsShowQualityCheckForm(false);
  //     setShowPreviewModal(false);

  //     toast.success("Batch details submitted successfully!");
  //   } catch (error) {
  //     console.error("Error submitting batch details:", error);
  //     toast.error(
  //       error.response.data.message || "Error submitting batch details"
  //     );
  //   }
  // };

  const handlePassBatch = async (e) => {
    e.preventDefault();

    // ✅ Validate each batch
    for (const batch of batchDetails) {
      const batchData = batchStatuses[batch.id] || {};
      if (!batchData.status) {
        toast.error(`Please select QC status for batch ${batch.batchNumber}`);
        return;
      }
      if (
        (batchData.status === "FAIL" || batchData.status === "HOLD") &&
        !batchData.remarks
      ) {
        toast.error(`Please enter remarks for batch ${batch.batchNumber}`);
        return;
      }
      if (batchData.status === "FAIL" && !batchData.defectCategory) {
        toast.error(
          `Please select defect category for batch ${batch.batchNumber}`
        );
        return;
      }
    }

    // ✅ Validate grouped attachments
    const fileValidation = validateGroupFiles();
    if (!fileValidation.isValid) {
      toast.error(
        `Please upload attachments for the following groups: ${fileValidation.missingFiles.join(
          ", "
        )}`
      );
      return;
    }

    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();

      // 1. Prepare the JSON part (without files)
      const batchUpdates = batchDetails.map((batch) => {
        const batchData = batchStatuses[batch.id] || {};
        return {
          itemId: batch.id,
          qcStatus: batchData.status,
          warehouseId: batchData.warehouseId,
          defectCategory: batchData.defectCategory,
          remarks: batchData.remarks,
        };
      });

      const dtoPayload = {
        transactionNumber: trno,
        batchUpdates: batchUpdates,
      };

      formData.append("data", JSON.stringify(dtoPayload));

      // 2. Append files in the SAME order as batchUpdates
      // Each batch gets its corresponding group file
      batchUpdates.forEach((batchUpdate, index) => {
        const batch = batchDetails[index];
        const groupKey = `${batch.vendorCode}_${batch.itemCode}`;
        const groupFile = groupedBatchFiles[groupKey];

        if (groupFile) {
          formData.append("files", groupFile);
        } else {
          // Append empty slot to maintain index alignment if required
          formData.append("files", new Blob([]), "");
        }
      });

      // Debug log to verify FormData contents
      console.log("=== FormData Contents ===");
      console.log("Transaction Number:", trno);
      console.log("DTO Payload:", dtoPayload);
      console.log("Batch Updates:", batchUpdates);
      console.log("Grouped Files:", groupedBatchFiles);

      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            key,
            "File:",
            value.name,
            "Size:",
            value.size,
            "Type:",
            value.type
          );
        } else {
          console.log(key, value);
        }
      }

      const response = await api.put(
        "/api/receipt/qc-status/update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Refresh tables
      fetchPassFailQC();
      fetchPendingQC();

      // Reset state
      setBatchStatuses({});
      setGroupedBatchFiles({});
      setIsShowQualityCheckForm(false);
      setShowPreviewModal(false);

      toast.success("Batch details submitted successfully!");
    } catch (error) {
      console.error("Error submitting batch details:", error);
      toast.error(
        error.response?.data?.message || "Error submitting batch details"
      );
    }
  };

  // const handlePassBatch = async (e) => {
  //   e.preventDefault();
  //   if (!selectedWarehouse) {
  //     toast.error("Please select a warehouse");
  //     return;
  //   }
  //   if (selectedFile) {
  //     console.log("File selected:", selectedFile);
  //   } else {
  //     toast.error("Please select a file first.");
  //     return;
  //   }
  //   if (isFail === "FAIL" && !defectCategory) {
  //     toast.error("Please select a defect category");
  //     return;
  //   }
  //   try {
  //     const data = {
  //       id: batchDetails[0].id,
  //       qcStatus: isFail ? "FAIL" : isHold ? "HOLD" : "PASS",
  //       defectCategory: defectCategory,
  //       remarks: remarks,
  //       warehouseId: selectedWarehouse,
  //       attachment: selectedFile,
  //     };
  //     console.log(data);
  //     const response = await api.put("/api/receipt/qc-status/update", data, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });
  //     fetchPassFailQC();
  //     fetchPendingQC();
  //     setIsPass("");
  //     setIsHold("");
  //     setIsFail(false);
  //     setSelectedFile("");
  //     toast.success("Batch details are passed successfully");
  //     setIsShowQualityCheckForm(false);
  //   } catch (error) {
  //     toast.error("Error in fetching batch details");
  //     console.error("Error fetching batch details:", error);
  //     setIsShowQualityCheckForm(false);
  //   }
  // };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allQCIds = iqc.map((batch) => batch.id);
      setSelectedItems(allQCIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleDeleteSelected = () => {
    // Create an array of promises for each delete operation
    const deletePromises = selectedItems.map((qcId) =>
      api.delete(`/api/receipt/delete-pending/${qcId}`)
    );

    // Execute all delete operations
    Promise.all(deletePromises)
      .then((responses) => {
        console.log("QC's deleted successfully:", responses);
        // Check if all deletions were successful
        const allSuccessful = responses.every(
          (response) => response.data.status
        );

        if (allSuccessful) {
          toast.success("Successfully deleted selected QC's");
          // Refresh the items list
          // Clear selection
          setSelectedItems([]);
          setSelectAll(false);
        } else {
          // Some deletions failed
          toast.error("Some items could not be deleted. Please try again.");
        }
        setIsConfirmModal(false);
        fetchPendingQC();
      })
      .catch((error) => {
        console.error("Error deleting items:", error);
        // Handle error (show error message)
        setIsConfirmModal(false);
        toast.error("Error deleting items. Please try again.");
      });
  };

  // Dynamically calculate widths
  const fieldClass = isFail ? "flex-1" : "flex-1-3";

  // File size validation constant
  const MAX_FILE_SIZE_MB = 2;

  // const handleFileChange = (event) => {
  //   event.preventDefault();
  //   const file = event.target.files[0];

  //   if (file) {
  //     const fileSizeInMB = file.size / (1024 * 1024); // Convert bytes to MB
  //     if (fileSizeInMB > MAX_FILE_SIZE_MB) {
  //       toast.warning("File size must be less than or equal to 2MB.");
  //       setSelectedFile(null);

  //       return;
  //     }

  //     setSelectedFile(file);
  //   }
  // };

  // Shortcut keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case "p":
            e.preventDefault();
            setIsPass("PASS");
            setIsFail(false);
            setIsHold(false);
            break;
          case "f":
            e.preventDefault();
            setIsFail("FAIL");
            setIsPass(false);
            setIsHold(false);
            break;
          case "h":
            e.preventDefault();
            setIsHold("HOLD");
            setIsPass(false);
            setIsFail(false);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const previewFile = async (filename) => {
    try {
      const response = await api.get(
        `/api/receipt/qc-status/attachment/${encodeURIComponent(filename)}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data]);
      const fileURL = window.URL.createObjectURL(blob);

      // Create a temporary anchor tag
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = filename; // 👈 ensures filename with extension
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileURL);
    } catch (error) {
      toast.error("Error previewing file");
      console.error("Error previewing file:", error);
    }
  };

  const groupedData = _.groupBy(
    iqc.filter((i) => {
      const search = searchQuery.toLowerCase();
      return (
        i.itemName?.toLowerCase().includes(search) ||
        i.itemCode?.toLowerCase().includes(search) ||
        i.batchNumber?.toLowerCase().includes(search) ||
        i.vendorName?.toLowerCase().includes(search)
      );
    }),
    "transactionNumber"
  );

  // Batch details button change
  const [batchStatuses, setBatchStatuses] = useState({}); // { batchId: {status, warehouseId} }

  const handleStatusChange = (batchId, status) => {
    let warehouseId = "";
    if (status === "PASS") {
      const storeWarehouse = warehouses.find((w) => w.type === "STR");
      warehouseId = storeWarehouse?.id || "";
    } else if (status === "FAIL") {
      const rejectionWarehouse = warehouses.find((w) => w.type === "REJ");
      warehouseId = rejectionWarehouse?.id || "";
    } else if (status === "HOLD") {
      const iqcWarehouse = warehouses.find((w) => w.type === "IQC");
      warehouseId = iqcWarehouse?.id || "";
    }

    setBatchStatuses((prev) => ({
      ...prev,
      [batchId]: {
        ...prev[batchId],
        status,
        warehouseId,
        defectCategory:
          status === "FAIL" ? prev[batchId]?.defectCategory || "" : "",
        remarks:
          status === "FAIL" || status === "HOLD"
            ? prev[batchId]?.remarks || ""
            : "",
      },
    }));
  };

  const handleDefectChange = (batchId, value) => {
    setBatchStatuses((prev) => ({
      ...prev,
      [batchId]: {
        ...prev[batchId],
        defectCategory: value,
      },
    }));
  };

  const handleRemarksChange = (batchId, value) => {
    setBatchStatuses((prev) => ({
      ...prev,
      [batchId]: {
        ...prev[batchId],
        remarks: value,
      },
    }));
  };

  // Bulk action handlers for all batches
  const handleBulkPass = () => {
    const newBatchStatuses = {};
    batchDetails.forEach((batch) => {
      const storeWarehouse = warehouses.find((w) => w.type === "STR");
      newBatchStatuses[batch.id] = {
        status: "PASS",
        warehouseId: storeWarehouse?.id || "",
        defectCategory: "",
        remarks: "",
      };
    });
    setBatchStatuses(newBatchStatuses);
    toast.success("All items marked as PASS");
  };

  const handleBulkFail = () => {
    const newBatchStatuses = {};
    batchDetails.forEach((batch) => {
      const rejectionWarehouse = warehouses.find((w) => w.type === "REJ");
      newBatchStatuses[batch.id] = {
        status: "FAIL",
        warehouseId: rejectionWarehouse?.id || "",
        defectCategory: "Material Defect", // Default defect category
        remarks: "Bulk fail - please review individual items",
      };
    });
    setBatchStatuses(newBatchStatuses);
    toast.success("All items marked as FAIL");
  };

  const handleBulkHold = () => {
    const newBatchStatuses = {};
    batchDetails.forEach((batch) => {
      const iqcWarehouse = warehouses.find((w) => w.type === "IQC");
      newBatchStatuses[batch.id] = {
        status: "HOLD",
        warehouseId: iqcWarehouse?.id || "",
        defectCategory: "",
        remarks: "Bulk hold - pending review",
      };
    });
    setBatchStatuses(newBatchStatuses);
    toast.success("All items marked as HOLD");
  };

  // Add new state for grouped batch files
  const [groupedBatchFiles, setGroupedBatchFiles] = useState({});

  // Function to group batch details by vendorCode and itemCode
  const getGroupedBatchDetails = () => {
    if (!Array.isArray(batchDetails) || batchDetails.length === 0) return [];

    const grouped = {};
    batchDetails.forEach((batch) => {
      const key = `${batch.vendorCode}_${batch.itemCode}`;
      if (!grouped[key]) {
        grouped[key] = {
          vendorCode: batch.vendorCode,
          itemCode: batch.itemCode,
          vendorName: batch.vendorName,
          itemName: batch.itemName,
          batches: [],
          totalQuantity: 0,
        };
      }
      grouped[key].batches.push(batch);
      grouped[key].totalQuantity += Number(batch.quantity || 0);
    });

    return Object.values(grouped);
  };

  // Function to validate grouped files
  const validateGroupFiles = () => {
    const missingFiles = [];
    const groupedDetails = getGroupedBatchDetails();

    groupedDetails.forEach((group) => {
      const groupKey = `${group.vendorCode}_${group.itemCode}`;
      if (!groupedBatchFiles[groupKey]) {
        missingFiles.push(`${group.vendorName} - ${group.itemName}`);
      }
    });

    return {
      isValid: missingFiles.length === 0,
      missingFiles: missingFiles,
    };
  };

  // Handle file change for grouped items
  const handleGroupedFileChange = (groupKey, file) => {
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024); // Convert bytes to MB
      if (fileSizeInMB > MAX_FILE_SIZE_MB) {
        toast.warning("File size must be less than or equal to 2MB.");
        return;
      }
    }

    setGroupedBatchFiles((prev) => ({
      ...prev,
      [groupKey]: file,
    }));
  };

  // Remove file from group
  const handleRemoveGroupFile = (groupKey) => {
    setGroupedBatchFiles((prev) => {
      const newState = { ...prev };
      delete newState[groupKey];
      return newState;
    });
  };

  // Bulk apply to a specific group
  const handleGroupBulkPass = (group) => {
    group.batches.forEach((batch) => {
      handleStatusChange(batch.id, "PASS");
    });
  };

  const handleGroupBulkFail = (group) => {
    group.batches.forEach((batch) => {
      handleStatusChange(batch.id, "FAIL");
    });
  };

  const handleGroupBulkHold = (group) => {
    group.batches.forEach((batch) => {
      handleStatusChange(batch.id, "HOLD");
    });
  };

  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">
              Incoming Quality Control (IQC)
            </h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / IQC
              </span>
            </p>
          </div>
        </div>
      </nav>

      {/* Form Header Section */}
      {/* <div className="table-form-container mx-2 mb-4">
        <div className="form-header">
          <h2>
            <i className="fas fa-qrcode"></i> Scan Batch
          </h2>
        </div>
        
        <form autoComplete="off" className="padding-2">
          <div className="form-grid pt-0 m-0">
            <div className="row form-style">
              <div className="col-12 d-flex flex-column form-group">
                <label htmlFor="scanBatch" className="form-label">
                  Scan or Enter Batch Number{" "}
                  <span className="text-danger fs-6">*</span>
                </label>
                <div className="search-box">
                  <i className="fas fa-barcode position-absolute z-0 input-icon"></i>
                  <input
                    type="text"
                    className="form-control vendor-search-bar"
                    placeholder="Scan or type batch number..."
                    value={searchBatchNo}
                    onChange={(e) => {
                      setSearchBatchNo(e.target.value);
                      handleSearchBatchNo(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div> */}

      {/* Quality Check Form */}
      {isShowQualityCheckForm && (
        <div className="table-form-container mx-2 mb-4" id="qc" ref={qcRef}>
          <div className="form-header">
            <h2>
              <i className="fas fa-circle-check"></i> Quality Check
            </h2>
          </div>

          {/* Form Fields */}
          <form autoComplete="off" className="padding-2">
            <div className="form-grid pt-0">
              <div className="row form-style">
                <div className="col-md-12">
                  <label className="text-8 font-weight p-0">
                    Trno: <span className="text-primary text-8">{trno}</span>
                  </label>

                  {/* File Upload Summary */}
                  {Array.isArray(batchDetails) && batchDetails.length > 0 && (
                    <div className="mt-3 mb-3 p-3 bg-info bg-opacity-10 border border-info rounded">
                      <div className="row">
                        <div className="col-md-3">
                          <strong>Total Groups:</strong>{" "}
                          {getGroupedBatchDetails().length}
                        </div>
                        <div className="col-md-3">
                          <strong>Files Uploaded:</strong>{" "}
                          {Object.keys(groupedBatchFiles).length}
                        </div>
                        <div className="col-md-3">
                          <strong>Files Remaining:</strong>{" "}
                          {getGroupedBatchDetails().length -
                            Object.keys(groupedBatchFiles).length}
                        </div>
                        <div className="col-md-3">
                          <strong>Total Batches:</strong> {batchDetails.length}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grouped Batch Items */}
                  {Array.isArray(batchDetails) && batchDetails.length > 0 && (
                    <div className="mt-4 mb-3">
                      {getGroupedBatchDetails().map((group, groupIndex) => {
                        const groupKey = `${group.vendorCode}_${group.itemCode}`;
                        const groupFile = groupedBatchFiles[groupKey];

                        return (
                          <div
                            key={groupKey}
                            className="grouped-batch-container border rounded p-3 mb-3"
                          >
                            {/* Group Header */}
                            <div className="group-header mb-3 p-2 bg-light rounded">
                              <div className="row text-8">
                                <div className="col-md-3">
                                  <strong>Vendor:</strong> {group.vendorName} (
                                  {group.vendorCode})
                                </div>
                                <div className="col-md-3">
                                  <strong>Item:</strong> {group.itemName} (
                                  {group.itemCode})
                                </div>
                                <div className="col-md-3">
                                  <strong>Total Quantity:</strong>{" "}
                                  {group.totalQuantity}
                                </div>
                                <div className="col-md-3">
                                  <strong>Batch Count:</strong>{" "}
                                  {group.batches.length}
                                </div>
                              </div>
                            </div>

                            {/* Group Bulk Actions */}
                            <div className="mt-3 mb-3">
                              <label className="text-8 font-weight p-0 mb-2">
                                Bulk Actions{" "}
                                <span className="text-muted">
                                  (Apply to this group only)
                                </span>
                              </label>
                              <div className="row">
                                <div className="col-md-4">
                                  <button
                                    type="button"
                                    className="btn w-100 text-8 btn-outline-success"
                                    onClick={() => handleGroupBulkPass(group)}
                                  >
                                    <i className="fas fa-check-circle me-1"></i>
                                    Pass All in Group
                                  </button>
                                </div>
                                <div className="col-md-4">
                                  <button
                                    type="button"
                                    className="btn w-100 text-8 btn-outline-danger"
                                    onClick={() => handleGroupBulkFail(group)}
                                  >
                                    <i className="fas fa-times-circle me-1"></i>
                                    Reject All in Group
                                  </button>
                                </div>
                                <div className="col-md-4">
                                  <button
                                    type="button"
                                    className="btn w-100 text-8 btn-outline-warning"
                                    onClick={() => handleGroupBulkHold(group)}
                                  >
                                    <i className="fas fa-pause-circle me-1"></i>
                                    Hold All in Group
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Group Attachment */}
                            <div className="group-attachment mb-3">
                              <label className="form-label text-8 font-weight mb-2">
                                Group Attachment{" "}
                                <span className="text-danger fs-6">*</span>
                                <span className="text-muted ms-2">
                                  (One file for all batches in this group)
                                </span>
                              </label>
                              <div className="position-relative w-100">
                                <input
                                  className="form-control text-8"
                                  type="file"
                                  accept=".pdf, .jpg, .jpeg, .heic"
                                  onChange={(e) =>
                                    handleGroupedFileChange(
                                      groupKey,
                                      e.target.files[0]
                                    )
                                  }
                                />
                              </div>
                              {groupFile && (
                                <div className="file-selection-display">
                                  <div className="file-info">
                                    <i className="fas fa-file-alt file-icon"></i>
                                    <span className="fw-medium">
                                      {groupFile.name}
                                    </span>
                                    <small className="text-muted">
                                      (
                                      {(groupFile.size / (1024 * 1024)).toFixed(
                                        2
                                      )}{" "}
                                      MB)
                                    </small>
                                  </div>
                                  <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() =>
                                      handleRemoveGroupFile(groupKey)
                                    }
                                    title="Remove file"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Individual Batch Items */}
                            <div className="batch-items">
                              <h6 className="mb-2">Batch Details:</h6>
                              {group.batches.map((batch) => {
                                const status =
                                  batchStatuses[batch.id]?.status || "";
                                const currentWarehouse =
                                  batchStatuses[batch.id]?.warehouseId || "";

                                return (
                                  <div
                                    key={batch.id}
                                    className="batch-details d-flex align-items-center justify-content-between flex-wrap p-2 border rounded mb-2"
                                  >
                                    {/* Batch No */}
                                    <div className="text-8 me-3">
                                      <label className="form-label text-8">
                                        Batch No
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control text-8"
                                        value={batch.batchNumber}
                                        disabled
                                      />
                                    </div>

                                    {/* Quantity */}
                                    <div className="text-8 me-3">
                                      <label className="form-label text-8">
                                        Quantity
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control text-8"
                                        value={batch.quantity}
                                        disabled
                                      />
                                    </div>

                                    {/* Warehouse */}
                                    <div
                                      className="me-3"
                                      style={{ minWidth: "150px" }}
                                    >
                                      <label className="form-label text-8">
                                        Warehouse{" "}
                                        <span className="text-danger">*</span>
                                      </label>
                                      <select
                                        className="form-control text-8"
                                        value={currentWarehouse}
                                        disabled
                                      >
                                        <option value="">Warehouse</option>
                                        {warehouses.map((wh) => (
                                          <option key={wh.id} value={wh.id}>
                                            {wh.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    {/* FAIL → Defect Category */}
                                    {status === "FAIL" && (
                                      <div className="">
                                        <label className="form-label text-8">
                                          Defect Category{" "}
                                          <span className="text-danger">*</span>
                                        </label>
                                        <select
                                          className="form-select text-8"
                                          value={
                                            batchStatuses[batch.id]
                                              ?.defectCategory || ""
                                          }
                                          onChange={(e) =>
                                            handleDefectChange(
                                              batch.id,
                                              e.target.value
                                            )
                                          }
                                        >
                                          <option value="">
                                            Select defect category
                                          </option>
                                          <option value="Broken/Damaged">
                                            Broken/Damaged
                                          </option>
                                          <option value="Color Mismatch">
                                            Color Mismatch
                                          </option>
                                          <option value="Dimensional Issue">
                                            Dimensional Issue
                                          </option>
                                          <option value="Material Defect">
                                            Material Defect
                                          </option>
                                          <option value="Wrong Item">
                                            Wrong Item
                                          </option>
                                        </select>
                                      </div>
                                    )}

                                    {/* FAIL or HOLD → Remarks */}
                                    {(status === "FAIL" ||
                                      status === "HOLD") && (
                                      <div className="mt-3">
                                        <label className="form-label text-8">
                                          Remarks
                                        </label>
                                        <textarea
                                          className="form-control text-8"
                                          placeholder="Enter remarks"
                                          value={
                                            batchStatuses[batch.id]?.remarks ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            handleRemarksChange(
                                              batch.id,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                    )}

                                    {/* Buttons */}
                                    <div className="mt-3 d-flex">
                                      <button
                                        type="button"
                                        className={`btn me-2 text-8 ${
                                          status === "PASS"
                                            ? "btn-success"
                                            : "btn-outline-success"
                                        }`}
                                        onClick={() =>
                                          handleStatusChange(batch.id, "PASS")
                                        }
                                      >
                                        Pass
                                      </button>
                                      <button
                                        type="button"
                                        className={`btn me-2 text-8 ${
                                          status === "FAIL"
                                            ? "btn-danger"
                                            : "btn-outline-danger"
                                        }`}
                                        onClick={() =>
                                          handleStatusChange(batch.id, "FAIL")
                                        }
                                      >
                                        Reject
                                      </button>
                                      <button
                                        type="button"
                                        className={`btn text-8 ${
                                          status === "HOLD"
                                            ? "btn-warning"
                                            : "btn-outline-warning"
                                        }`}
                                        onClick={() =>
                                          handleStatusChange(batch.id, "HOLD")
                                        }
                                      >
                                        Hold
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-primary add-btn"
                onClick={handleShowModal}
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Submit Quality
                Check
              </button>
              <button
                className="btn btn-secondary add-btn"
                type="button"
                onClick={() => setIsShowQualityCheckForm(false)}
              >
                <i className="fa-solid fa-xmark me-1"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute z-0 input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search pending items by item name, code, batch no, vendor name..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter-options">
          <button className="filter-select" onClick={handleResetFilters}>
            <i className="fas fa-filter me-2"></i>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Pending Transactions Table Section */}
      <div>
        <div className="table-form-container mx-2 mt-4">
          <div className="form-header">
            <h2>
              {" "}
              <i className="fas fa-hourglass-half"></i>Pending Transactions
            </h2>
          </div>
          {/* Table Header */}
          <div className="table-header">
            <div className="selected-count">
              <input
                type="checkbox"
                id="select-all"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
              <label htmlFor="select-all">
                {selectedItems.length} Selected
              </label>
            </div>
            <div className="bulk-actions">
              <button className="btn-action">
                <i className="fas fa-file-export"></i>
                Export Selected
              </button>
              <button className="btn-action">
                <i className="fas fa-clock-rotate-left"></i>
                View Recent
              </button>
              <button
                className="btn-action btn-danger"
                onClick={handleShowConfirm}
              >
                <i className="fas fa-trash"></i> Delete Selected
              </button>
            </div>
          </div>
          <div className="item-table-container mt-3 overflow-hidden">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>TrNo.</th>
                  <th>Total Items</th>
                  <th>Batch Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="transactionsTable" className="accordion">
                {Object.entries(groupedData).map(([trNo, items], index) => {
                  const collapseId = `collapse-${index}`;
                  const totalQty = items.reduce(
                    (total, item) => total + Number(item.quantity || 0),
                    0
                  );

                  return (
                    <React.Fragment key={trNo}>
                      {/* Accordion Header Row */}
                      <tr
                        className="accordion-header-row"
                        data-bs-toggle="collapse"
                        data-bs-target={`#${collapseId}`}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="px-3 py-2 text-decoration-none text-reset">
                          {trNo}
                        </td>
                        <td>{items.length}</td>
                        <td>{totalQty}</td>
                        <td className="actions">
                          <a href="#qc">
                            <button
                              className="btn btn-primary"
                              style={{ fontSize: "0.7rem" }}
                              onClick={() => {
                                handleSearchBatchNo(items);
                                setTrno(trNo);
                                setTimeout(() => {
                                  qcRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                  });
                                }, 100); // delay to wait for form render
                              }}
                            >
                              <i className="fa-solid fa-clipboard-check me-1"></i>{" "}
                              Start QC
                            </button>
                          </a>
                        </td>
                      </tr>
                      <tr className="collapse p-0" id={collapseId}>
                        <td colSpan="8">{/* Your item details here */}</td>
                      </tr>

                      {/* Accordion Content Row */}
                      <tr className="p-0">
                        <td colSpan={4} className="p-0 border-0">
                          <div
                            id={collapseId}
                            className="accordion-collapse collapse"
                            data-bs-parent="#transactionsTable"
                          >
                            <table className="table table-hover table-sm mb-0">
                              <thead className="table-light">
                                <tr className="text-primary">
                                  <th>Item Name</th>
                                  <th>Batch No</th>
                                  <th>Vendor Name</th>
                                  <th>Quantity</th>
                                  <th>Received Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.map((item) => (
                                  <tr key={item.id}>
                                    <td className="px-3 py-2 ">{`(${item.itemCode}) ${item.itemName}`}</td>
                                    <td>{item.batchNumber}</td>
                                    <td>{item.vendorName}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.createdAt}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              Showing 1 to 5 of 10 pending items
            </div>
            <div className="pagination">
              <button className="btn-page" disabled>
                <i className="fas fa-chevron-left"></i>
              </button>
              {/* Generate page buttons */}

              <button className="btn btn-primary">1</button>

              <button className="btn-page" disabled>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <div className="items-per-page">
              <select>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Hold Transactions Table Section */}
      <div>
        <div className="table-form-container mx-2 mt-4">
          <div className="form-header">
            <h2>
              {" "}
              <i className="fa-solid fa-box-archive"></i>Hold Transactions
            </h2>
          </div>

          <div className="item-table-container mt-3">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Batch Number</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Vendor</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="holdTransactionsTable" className="accordion">
                {holdQC.map((pfqc, index) => (
                  <tr key={index}>
                    <td>{pfqc.items[0].batchNumber}</td>
                    <td>
                      {"(" +
                        pfqc.items[0].itemCode +
                        ") " +
                        pfqc.items[0].itemName}
                    </td>
                    <td>{pfqc.items[0].quantity}</td>
                    <td>
                      {" "}
                      {pfqc.items[0].vendorCode
                        ? "(" +
                          pfqc.items[0].vendorCode +
                          ") " +
                          pfqc.items[0].vendorName
                        : "-----"}
                    </td>
                    <td>
                      {pfqc.items[0].createdAt
                        ? pfqc.items[0].createdAt
                        : "-----"}
                    </td>
                    <td className="actions">
                      <button
                        className="btn btn-warning"
                        style={{ fontSize: "0.7rem" }}
                        onClick={() => {
                          handleSearchHoldBatchNo(pfqc.items[0].batchNumber);
                          setTrno(pfqc.trNumber);
                          setIsShowQualityCheckForm(true);
                          setTimeout(() => {
                            qcRef.current?.scrollIntoView({
                              behavior: "smooth",
                            });
                          }, 100);
                        }}
                      >
                        <i className="fa-solid fa-clipboard-check me-1"></i>{" "}
                        Start QC
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              Showing 1 to 5 of 10 pending items
            </div>
            <div className="pagination">
              <button className="btn-page" disabled>
                <i className="fas fa-chevron-left"></i>
              </button>
              {/* Generate page buttons */}

              <button className="btn btn-primary">1</button>

              <button className="btn-page" disabled>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <div className="items-per-page">
              <select>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Transactions Table Section */}
      <div>
        <div className="table-form-container mx-2 mt-4 mb-4">
          <div className="form-header">
            <h2>
              {" "}
              <i className="fas fa-clipboard-check"></i>Completed Transactions
            </h2>
          </div>

          <div className="item-table-container mt-3">
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Item Code</th>
                  <th>Batch No</th>
                  <th>Vendor Name</th>
                  <th>Quantity</th>
                  <th>Received Date</th>
                  <th>Attachment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="text-break">
                {currentCompletedItems.map((pfqc) => (
                  <tr key={pfqc.id}>
                    <td>{pfqc.itemName}</td>
                    <td>{pfqc.itemCode}</td>
                    <td>{pfqc.batchNumber}</td>
                    <td>{pfqc.vendorName}</td>
                    <td>{pfqc.quantity}</td>
                    <td>{pfqc.createdAt}</td>
                    <td>
                      {pfqc.attachmentFileName &&
                      pfqc.attachmentFileName.length > 0 ? (
                        <i
                          className="fa-solid fa-link text-primary"
                          role="button"
                          title="View Attachment"
                          onClick={() => previewFile(pfqc.attachmentFileName)}
                        ></i>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>

                    <td className="actions">
                      <span
                        className={`badge status ${
                          pfqc.status === "PASS" ? "active" : "inactive"
                        }`}
                      >
                        {pfqc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, totalCompletedItems)} of{" "}
              {totalCompletedItems} items
            </div>
            <div className="pagination">
              {/* Left Arrow */}
              <button
                className="btn-page"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <i className="fas fa-chevron-left"></i>
              </button>

              {/* Show only current active page */}
              <button className="btn btn-sm btn-primary mx-1">
                {currentPage}
              </button>

              {/* Right Arrow */}
              <button
                className="btn-page"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>

            <div className="items-per-page">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // reset to first page
                }}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation dialog modal */}
      {isConfirmModal && (
        <div className="modal fade" id="incomingQcConfirmModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-check me-2"></i>
                  Confirm
                </h5>
                <button
                  type="button"
                  className="btn"
                  onClick={handleCloseConfirmModal}
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">{message}</div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary add-btn"
                  onClick={handleYesConfirm}
                >
                  <i className="fas fa-check me-2"></i>
                  Yes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  onClick={() => {
                    setConfirmState(false);
                    handleCloseConfirmModal();
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div
          className="modal d-block show"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              {/* Header */}
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-check me-2"></i> Confirm Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancel}
                  aria-label="Close"
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body">
                {/* Transaction-level info */}
                <div className="mb-3 p-3 bg-light border rounded">
                  <div className="row">
                    <div className="col-sm-6 text-8">
                      <strong>Transaction No:</strong> <span>{trno}</span>
                    </div>
                    <div className="col-sm-6 text-8">
                      <strong>Total Groups:</strong>{" "}
                      <span>{getGroupedBatchDetails().length}</span>
                    </div>
                  </div>
                </div>

                {/* Grouped Items */}
                {getGroupedBatchDetails().map((group, groupIndex) => {
                  const groupKey = `${group.vendorCode}_${group.itemCode}`;
                  const groupFile = groupedBatchFiles[groupKey];

                  return (
                    <div
                      key={groupKey}
                      className="card mb-3 shadow-sm border-primary"
                    >
                      <div className="card-header bg-primary text-white text-8">
                        <strong>
                          Group {groupIndex + 1} — {group.vendorName} -{" "}
                          {group.itemName}
                        </strong>
                      </div>
                      <div className="card-body text-8">
                        <div className="row mb-3">
                          <div className="col-sm-6">
                            <strong>Vendor:</strong> {group.vendorName} (
                            {group.vendorCode})
                          </div>
                          <div className="col-sm-6">
                            <strong>Item:</strong> {group.itemName} (
                            {group.itemCode})
                          </div>
                          <div className="col-sm-6">
                            <strong>Total Quantity:</strong>{" "}
                            {group.totalQuantity}
                          </div>
                          <div className="col-sm-6">
                            <strong>Batch Count:</strong> {group.batches.length}
                          </div>
                          <div className="col-12">
                            <strong>Group Attachment:</strong>{" "}
                            <span className="text-primary">
                              {groupFile?.name || "N/A"}
                            </span>
                          </div>
                        </div>

                        <h6 className="mb-2">Batch Details:</h6>
                        {group.batches.map((batch, batchIndex) => (
                          <div
                            key={batch.id}
                            className="border rounded p-2 mb-2 bg-light"
                          >
                            <div className="row">
                              <div className="col-sm-6">
                                <strong>Batch {batchIndex + 1}:</strong>{" "}
                                {batch.batchNumber}
                              </div>
                              <div className="col-sm-6">
                                <strong>Quantity:</strong> {batch.quantity}
                              </div>
                              <div className="col-sm-6">
                                <strong>QC Status:</strong>{" "}
                                <span
                                  className={`badge ${
                                    batchStatuses[batch.id]?.status === "PASS"
                                      ? "bg-success"
                                      : batchStatuses[batch.id]?.status ===
                                        "FAIL"
                                      ? "bg-danger"
                                      : batchStatuses[batch.id]?.status ===
                                        "HOLD"
                                      ? "bg-warning"
                                      : "bg-secondary"
                                  }`}
                                >
                                  {batchStatuses[batch.id]?.status || "N/A"}
                                </span>
                              </div>
                              <div className="col-sm-6">
                                <strong>Warehouse:</strong>{" "}
                                <span>
                                  {warehouses.find(
                                    (w) =>
                                      w.id ===
                                      batchStatuses[batch.id]?.warehouseId
                                  )?.name || "N/A"}
                                </span>
                              </div>
                              {batchStatuses[batch.id]?.status === "FAIL" && (
                                <div className="col-12">
                                  <strong>Defect Category:</strong>{" "}
                                  <span>
                                    {batchStatuses[batch.id]?.defectCategory ||
                                      "N/A"}
                                  </span>
                                </div>
                              )}
                              {(batchStatuses[batch.id]?.status === "FAIL" ||
                                batchStatuses[batch.id]?.status === "HOLD") && (
                                <div className="col-12">
                                  <strong>Remarks:</strong>{" "}
                                  <span>
                                    {batchStatuses[batch.id]?.remarks || "N/A"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button
                  className="btn btn-s btn-primary"
                  onClick={handleConfirm}
                >
                  <i className="fas fa-check me-1"></i> Yes
                </button>
                <button
                  className="btn btn-s btn-secondary"
                  onClick={handleCancel}
                >
                  <i className="fas fa-times me-1"></i> No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomingQC;
