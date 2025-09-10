import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import "./ProductionEntryModal.css";

// Dummy options for select fields
const productOptions = [
  { value: "PROD001", label: "(PROD001) - LED Display" },
  { value: "PROD002", label: "(PROD002) - Circuit Board" },
  { value: "PROD003", label: "(PROD003) - Gear Assembly" },
];

const categoryOptions = [
  { value: "Paytm", label: "Paytm" },
  { value: "Remote", label: "Remote" },
];

const locationOptions = [
  { value: "WIP0", label: "WIP0" },
  { value: "WIP1", label: "WIP1" },
  { value: "WIP2", label: "WIP2" },
  { value: "WIP3", label: "WIP3" },
  { value: "WIP4", label: "WIP4" },
];

const ProductionEntryModal = ({ show, onHide }) => {
  const [formData, setFormData] = useState({
    date: "",
    category: null,
    product: null,
    targetQty: "",
    producedQty: "",
    location: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    onHide();
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-circle-check me-2"></i>Add Production Entry
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col lg={4} md={6} sm={12}>
              <Form.Group>
                <Form.Label className="text-8">Date</Form.Label>
                <Form.Control
                  className="text-8"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>

            <Col lg={4} md={6} sm={12}>
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
            </Col>

            <Col lg={4} md={6} sm={12}>
              <Form.Group>
                <Form.Label className="text-8">Product</Form.Label>
                <Select
                  options={productOptions}
                  value={formData.product}
                  onChange={(value) => handleInputChange("product", value)}
                  isSearchable
                  required
                  placeholder="Search by Product Code or Name..."
                  className="react-select-container text-8"
                  classNamePrefix="react-select"
                />
              </Form.Group>
            </Col>

            <Col lg={4} md={6} sm={12}>
              <Form.Group>
                <Form.Label className="text-8">Target Quantity</Form.Label>
                <Form.Control
                  className="text-8"
                  type="number"
                  value={formData.targetQty}
                  onChange={(e) =>
                    handleInputChange("targetQty", e.target.value)
                  }
                  required
                  min="0"
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
                  options={locationOptions}
                  value={formData.location}
                  onChange={(value) => handleInputChange("location", value)}
                  isSearchable
                  required
                  className="react-select-container text-8"
                  classNamePrefix="react-select"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="text-8" onClick={onHide}>
            <i className="fas fa-times me-2"></i>Cancel
          </Button>
          <Button variant="primary" className="text-8" type="submit">
            <i className="fas fa-floppy-disk me-2"></i>Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductionEntryModal;
