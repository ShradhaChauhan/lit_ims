import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";

const LineMonitoringModal = ({
  show,
  handleClose,
  handleSave,
  editMode,
  lineData,
}) => {
  const initialState = {
    lineNumber: "",
    product: "",
    supervisor: "",
    peopleCount: 0,
    startTime: "",
    stopTime: "",
    status: "active",
    timeEntries: [],
  };

  const [formData, setFormData] = useState(initialState);
  const [timeEntries, setTimeEntries] = useState([]);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (editMode && lineData) {
      setFormData({
        id: lineData.id,
        lineNumber: lineData.lineNumber,
        product: lineData.product,
        supervisor: lineData.supervisor,
        peopleCount: lineData.peopleCount,
        startTime: lineData.startTime,
        stopTime: lineData.stopTime,
        status: lineData.status,
      });
      setTimeEntries(lineData.timeEntries || []);
    } else {
      setFormData(initialState);
      setTimeEntries([{ id: 1, start: "", stop: "", reason: "" }]);
    }
    setValidated(false);
  }, [editMode, lineData, show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTimeEntryChange = (index, field, value) => {
    const updatedEntries = [...timeEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };
    setTimeEntries(updatedEntries);
  };

  const addTimeEntry = () => {
    setTimeEntries([
      ...timeEntries,
      {
        id: timeEntries.length + 1,
        start: "",
        stop: "",
        reason: "",
      },
    ]);
  };

  const removeTimeEntry = (index) => {
    if (timeEntries.length > 1) {
      const updatedEntries = timeEntries.filter((_, i) => i !== index);
      setTimeEntries(updatedEntries);
    } else {
      toast.warning("At least one time entry is required");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Validate time entries
    const validTimeEntries = timeEntries.every(
      (entry) => entry.start && entry.stop
    );
    if (!validTimeEntries) {
      toast.error("All time entries must have start and stop times");
      return;
    }

    // Prepare data for saving
    const dataToSave = {
      ...formData,
      timeEntries: timeEntries,
    };

    handleSave(dataToSave);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-circle-info me-2"></i>
          {editMode ? "Edit Line Details" : "Add New Line"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="lineNumber">
                <Form.Label className="text-8">Line Number</Form.Label>
                <Form.Control
                  className="text-8"
                  type="text"
                  name="lineNumber"
                  value={formData.lineNumber}
                  onChange={handleInputChange}
                  disabled={editMode}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a line number.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="product">
                <Form.Label className="text-8">Product</Form.Label>
                <Form.Control
                  type="text"
                  className="text-8"
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a product name.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="supervisor">
                <Form.Label className="text-8">Supervisor</Form.Label>
                <Form.Control
                  type="text"
                  name="supervisor"
                  className="text-8"
                  value={formData.supervisor}
                  onChange={handleInputChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a supervisor name.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="peopleCount">
                <Form.Label className="text-8">Number of People</Form.Label>
                <Form.Control
                  type="number"
                  name="peopleCount"
                  className="text-8"
                  min="1"
                  value={formData.peopleCount}
                  onChange={handleInputChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid number of people.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="startTime">
                <Form.Label className="text-8">Start Time</Form.Label>
                <Form.Control
                  className="text-8"
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a start time.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="stopTime">
                <Form.Label className="text-8">Stop Time</Form.Label>
                <Form.Control
                  className="text-8"
                  type="time"
                  name="stopTime"
                  value={formData.stopTime}
                  onChange={handleInputChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a stop time.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="status">
                <Form.Label className="text-8">Status</Form.Label>
                <Form.Select
                  className="text-8"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {editMode && (
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Time Entries</h6>
                <Button variant="primary text-8" onClick={addTimeEntry}>
                  <i className="fas fa-plus me-1 text-8"></i> Add Entry
                </Button>
              </div>

              {timeEntries.map((entry, index) => (
                <div key={index} className="time-entry-row">
                  <div className="d-flex justify-content-between mb-2">
                    <h6 className="text-8">Entry #{index + 1}</h6>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeTimeEntry(index)}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                  <Row>
                    <Col md={4}>
                      <Form.Group controlId={`start-${index}`}>
                        <Form.Label className="text-8">Start Time</Form.Label>
                        <Form.Control
                          className="text-8"
                          type="time"
                          value={entry.start}
                          onChange={(e) =>
                            handleTimeEntryChange(
                              index,
                              "start",
                              e.target.value
                            )
                          }
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId={`stop-${index}`}>
                        <Form.Label className="text-8">Stop Time</Form.Label>
                        <Form.Control
                          className="text-8"
                          type="time"
                          value={entry.stop}
                          onChange={(e) =>
                            handleTimeEntryChange(index, "stop", e.target.value)
                          }
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId={`reason-${index}`}>
                        <Form.Label className="text-8">
                          Reason (if stopped)
                        </Form.Label>
                        <Form.Control
                          className="text-8"
                          type="text"
                          value={entry.reason}
                          onChange={(e) =>
                            handleTimeEntryChange(
                              index,
                              "reason",
                              e.target.value
                            )
                          }
                          placeholder="Optional"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary text-8" onClick={handleClose}>
          <i className="fas fa-xmark me-2 text-8"></i>Cancel
        </Button>
        <Button variant="primary text-8" onClick={handleSubmit}>
          <i class="fa-solid fa-floppy-disk me-2"></i>
          {editMode ? "Update" : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LineMonitoringModal;
