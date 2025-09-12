import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Table,
  InputGroup,
} from "react-bootstrap";
import Select from "react-select";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import api from "../../services/api";
import * as XLSX from "xlsx";
import "./ProductionEntryModal.css";
import BatchSplitModal from "./BatchSplitModal";

const modalStyle = {
  minHeight: "600px",
  display: "flex",
  flexDirection: "column",
};

const modalBodyStyle = {
  flex: 1,
  overflowY: "auto",
};

const customStyles = {
  control: (base) => ({
    ...base,
    fontSize: "0.8rem",
  }),
  option: (base) => ({
    ...base,
    fontSize: "0.8rem",
  }),
  singleValue: (base) => ({
    ...base,
    fontSize: "0.8rem",
  }),
};

const ProductionEntryModal = ({ show, onHide }) => {
  const [warehouseList, setWarehouseList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showBatchSplit, setShowBatchSplit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [transactionNumber, setTransactionNumber] = useState("PU" + Date.now());
  const initialFormState = {
    date: "",
    category: null,
    product: null,
    targetQty: "",
    producedQty: "",
    location: null,
  };

  const [formData, setFormData] = useState(initialFormState);

  const getMinDate = () => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    return twoDaysAgo.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.product || !formData.producedQty) {
      toast.error("Please select a product and enter produced quantity");
      return;
    }

    try {
      const selectedBom = productList.find(
        (product) => product.value === formData.product.value
      );
      if (selectedBom) {
        const fullBomData = selectedBom.original; // Get the full BOM data we stored earlier
        setSelectedProduct(fullBomData);
        
        // Check if BOM code starts with 2010 or 2020
        const bomCode = fullBomData.code;
        if (bomCode.startsWith("2010") || bomCode.startsWith("2020")) {
          setShowBatchSplit(true);
        } else {
          setShowPreview(true);
        }
      } else {
        toast.error("Selected product BOM not found");
      }
    } catch (error) {
      console.error("Error preparing preview:", error);
      toast.error("Error preparing preview");
    }
  };

  const handleSave = async (batchData) => {
    if (
      !selectedProduct ||
      !selectedProduct.items ||
      !formData.date ||
      !formData.producedQty
    ) {
      toast.error("Required data is missing");
      return;
    }

    try {
      const requestBody = {
        trNo: transactionNumber,
        bomCode: selectedProduct.code,
        bomName: selectedProduct.name,
        producedQuantity: Number(formData.producedQty),
        productionDate: new Date(formData.date).toISOString(),
        items: batchData ? batchData.items : selectedProduct.items.map((item) => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          usedQuantity: Number(
            (item.quantity * formData.producedQty).toFixed(3)
          ),
        })),
        hasBatchSplits: !!batchData,
      };
      
      console.log("request: " + JSON.stringify(requestBody));
      const response = await api.post(
        "/api/production-punch/create",
        requestBody
      );

      if (response.data.status) {
        toast.success("Production entry saved successfully");
        handleClose(); // Close both modals and reset form
      } else {
        toast.error(response.data.message || "Failed to save production entry");
      }
    } catch (error) {
      console.error("Error saving production entry:", error);
      toast.error("Error saving production entry");
    }
  };

  const handleExportExcel = () => {
    if (!selectedProduct || !selectedProduct.items) return;

    const exportData = selectedProduct.items.map((item) => ({
      "Item Code": item.itemCode,
      "Item Name": item.itemName,
      UOM: item.uom,
      "BOM Qty": item.quantity,
      "Used Qty": item.quantity * formData.producedQty,
      Warehouse: formData.location?.label || "-",
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BOM Items");

    // Save file
    XLSX.writeFile(
      wb,
      `${selectedProduct.code}_${selectedProduct.name}_BOM_Preview.xlsx`
    );
  };

  const filteredItems =
    selectedProduct?.items?.filter(
      (item) =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedProduct(null);
    setShowPreview(false);
  };

  const handleClose = () => {
    resetForm();
    setShowBatchSplit(false);
    setShowPreview(false);
    onHide();
  };

  const fetchWarehouseList = async () => {
    try {
      const response = await api.get("/api/warehouses/wip");
      console.log("Warehouse list response:", response.data.data);
      setWarehouseList(response.data.data);
    } catch (error) {
      console.error("Error fetching warehouse list:", error);
      toast.error("Error fetching warehouse list");
    }
  };

  const fetchProductList = async () => {
    try {
      const response = await api.get("/api/bom/all");
      console.log("Product list response:", response.data.data);
      const products = response.data.data;
      const formattedProducts = products.map((product) => ({
        value: product.id,
        label: `(${product.code}) - ${product.name}`,
        original: product, // Store the full BOM data
      }));
      setProductList(formattedProducts);
    } catch (error) {
      console.error("Error fetching product list:", error);
      toast.error("Error fetching product list");
    }
  };

  const setWarehouseFromCookies = () => {
    const userWarehouseId = Cookies.get("warehouseId");
    if (userWarehouseId && warehouseList.length > 0) {
      // First try to find by exact ID match
      let selectedWarehouse = warehouseList.find(
        (wh) => wh.id.toString() === userWarehouseId.toString()
      );

      // If not found, try to find by name containing WIP
      if (!selectedWarehouse) {
        selectedWarehouse = warehouseList.find((wh) =>
          wh.name.toUpperCase().includes("WIP")
        );
      }

      // If still not found, use the first warehouse
      if (!selectedWarehouse && warehouseList.length > 0) {
        selectedWarehouse = warehouseList[0];
      }

      if (selectedWarehouse) {
        handleInputChange("location", {
          value: selectedWarehouse.id,
          label: selectedWarehouse.name,
        });
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchWarehouseList();
    fetchProductList();
  }, []);

  // Set warehouse when modal is shown or warehouse list changes
  useEffect(() => {
    if (show) {
      setWarehouseFromCookies();
    }
  }, [show, warehouseList]);

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        dialogClassName="modal-dialog-centered"
        style={modalStyle}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-circle-check me-2"></i>Add Production Punch
          </Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={handleSubmit}
          className="flex-grow-1 d-flex flex-column"
        >
          <Modal.Body style={modalBodyStyle}>
            <Row className="g-3">
              <Col lg={4} md={6} sm={12}>
                <Form.Group>
                  <Form.Label className="text-8">Date</Form.Label>
                  <Form.Control
                    className="text-8"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    required
                  />
                </Form.Group>
              </Col>

              {/* <Col lg={4} md={6} sm={12}>
              <Form.Group>
                <Form.Label className="text-8">Category</Form.Label>
                <Select
                  options={categoryOptions}
                  value={formData.category}
                  onChange={(value) => handleInputChange("category", value)}
                  isSearchable
                  required
                  className="react-select-container text-8"
                  classNamePrefix="react-select"
                />
              </Form.Group>
            </Col> */}

              <Col lg={4} md={6} sm={12}>
                <Form.Group>
                  <Form.Label className="text-8">BOM Name</Form.Label>
                  <Select
                    options={productList}
                    value={formData.product}
                    onChange={(value) => handleInputChange("product", value)}
                    isSearchable
                    required
                    placeholder="Search by BOM code or name..."
                    className="react-select-container text-8"
                    classNamePrefix="react-select"
                    styles={customStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </Form.Group>
              </Col>

              <Col lg={4} md={6} sm={12}>
                <Form.Group>
                  <Form.Label className="text-8">Produced Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    className="text-8"
                    value={formData.producedQty}
                    placeholder="Enter produced quantity"
                    onChange={(e) =>
                      handleInputChange("producedQty", e.target.value)
                    }
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>

              <Col lg={4} md={6} sm={12}>
                <Form.Group>
                  <Form.Label className="text-8">Location</Form.Label>
                  <Select
                    options={warehouseList.map((wh) => ({
                      value: wh.id,
                      label: wh.name,
                    }))}
                    value={formData.location}
                    onChange={(value) => handleInputChange("location", value)}
                    isSearchable
                    required
                    isDisabled={true}
                    className="react-select-container text-8"
                    classNamePrefix="react-select"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              className="text-8"
              onClick={handleClose}
            >
              <i className="fas fa-times me-2"></i>Cancel
            </Button>
            <Button variant="primary" className="text-8" type="submit">
              <i className="fas fa-eye me-2"></i>Preview
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        size="xl"
        dialogClassName="modal-dialog-centered"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-circle-info me-2" />
            BOM Items Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <p className="text-8">
              Transaction #: <strong>{transactionNumber}</strong>
            </p>
            <div className="d-flex gap-2 w-50">
              <InputGroup>
                <InputGroup.Text className="text-8">
                  <i className="fas fa-search" />
                </InputGroup.Text>
                <Form.Control
                  className="text-8"
                  placeholder="Search items by code or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setSearchTerm("")}
                  className="text-8"
                >
                  <i className="fas fa-undo" /> Reset
                </Button>
              </InputGroup>
            </div>
            <Button
              variant="outline-success"
              className="text-8"
              onClick={handleExportExcel}
            >
              <i className="fas fa-file-excel me-2" />
              Export to Excel
            </Button>
          </div>
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <Table striped bordered hover>
              <thead>
                <tr className="text-8">
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Unit Qty</th>
                  <th>Used Qty</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody className="text-8 text-break">
                {filteredItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.itemCode}</td>
                    <td>{item.itemName}</td>
                    <td>{item.quantity + " " + item.uom.toLowerCase()}</td>
                    <td>{(item.quantity * formData.producedQty).toFixed(3)}</td>
                    <td>{formData.location?.label || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            className="text-8"
            onClick={() => setShowPreview(false)}
          >
            <i className="fas fa-times me-2" />
            Close
          </Button>
          <Button variant="primary" className="text-8" onClick={() => handleSave()}>
            <i className="fas fa-floppy-disk me-2" />
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <BatchSplitModal
        show={showBatchSplit}
        onHide={() => setShowBatchSplit(false)}
        selectedProduct={selectedProduct}
        formData={formData}
        transactionNumber={transactionNumber}
        onSave={handleSave}
      />
    </>
  );
};

export default ProductionEntryModal;
