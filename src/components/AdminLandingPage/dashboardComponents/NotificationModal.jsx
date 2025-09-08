import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Tabs, Tab, Badge } from 'react-bootstrap';
import { 
  FaBell, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaCheckCircle,
  FaEye,
  FaSearch
} from 'react-icons/fa';

const NotificationModal = ({ 
  show, 
  onHide, 
  notifications, 
  selectedNotificationId = null,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [activeKey, setActiveKey] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Define categories
  const categories = [
    { key: 'all', name: 'All', count: 0 },
    { key: 'production', name: 'Production', count: 0 },
    { key: 'quality', name: 'Quality', count: 0 },
    { key: 'store', name: 'Store', count: 0 },
    { key: 'sales', name: 'Sales', count: 0 },
    { key: 'vendor', name: 'Vendor', count: 0 },
    { key: 'workforce', name: 'Workforce', count: 0 }
  ];

  // Filter notifications based on active tab and search term
  useEffect(() => {
    let filtered = [...notifications];
    
    // Filter by category
    if (activeKey !== 'all') {
      filtered = filtered.filter(notification => notification.category === activeKey);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.message.toLowerCase().includes(term) ||
        notification.source.toLowerCase().includes(term)
      );
    }
    
    // If a specific notification is selected, only show that one
    if (selectedNotificationId) {
      filtered = notifications.filter(notification => notification.id === selectedNotificationId);
      
      // Mark the selected notification as read
      if (filtered.length > 0 && !filtered[0].isRead) {
        onMarkAsRead(selectedNotificationId);
      }
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, activeKey, searchTerm, selectedNotificationId]);

  // Calculate unread counts
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Get icon based on notification type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'info': return <FaInfoCircle className="text-info" />;
      case 'warning': return <FaExclamationTriangle className="text-warning" />;
      case 'error': return <FaExclamationTriangle className="text-danger" />;
      case 'success': return <FaCheckCircle className="text-success" />;
      default: return <FaInfoCircle className="text-info" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day ago`;
  };

  // Format full date
  const formatFullDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="notification-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedNotificationId ? 'Notification Details' : 'All Notifications'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!selectedNotificationId && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="position-relative w-50">
                <FaSearch className="position-absolute text-muted" style={{ left: '10px', top: '10px' }} />
                <input
                  type="text"
                  className="form-control ps-4"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={onMarkAllAsRead}
                disabled={!notifications.some(n => !n.isRead)}
              >
                <FaEye className="me-1" />
                Mark all as read
              </Button>
            </div>

            <Tabs
              activeKey={activeKey}
              onSelect={(k) => setActiveKey(k)}
              className="mb-3"
            >
              {categories.map((category) => {
                const categoryCount = notifications.filter(n => 
                  category.key === 'all' || n.category === category.key
                ).filter(n => !n.isRead).length;
                
                return (
                  <Tab 
                    key={category.key} 
                    eventKey={category.key} 
                    title={
                      <div className="d-flex align-items-center">
                        {category.name}
                        {categoryCount > 0 && (
                          <Badge bg="danger" pill className="ms-1" style={{ fontSize: '0.6rem' }}>
                            {categoryCount}
                          </Badge>
                        )}
                      </div>
                    }
                  />
                );
              })}
            </Tabs>
          </>
        )}

        <div className="notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <FaBell size={24} className="mb-2" />
              <p>No notifications to display</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {filteredNotifications.map(notification => (
                <ListGroup.Item 
                  key={notification.id}
                  className={`notification-item py-3 px-3 ${!notification.isRead ? 'unread' : ''} ${notification.type}`}
                  onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
                >
                  <div className="d-flex">
                    <div className="me-3 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="mb-1 fw-bold">
                          {notification.message}
                          {!notification.isRead && (
                            <span className="ms-2 badge bg-primary" style={{ fontSize: '0.7rem', verticalAlign: 'middle' }}>
                              New
                            </span>
                          )}
                        </h6>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <div>
                          <span className="badge bg-light text-dark me-2">{notification.source}</span>
                          <span className="badge bg-light text-dark">{notification.category}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="text-muted small me-2">
                            {selectedNotificationId ? 
                              formatFullDate(notification.timestamp) : 
                              formatTimeAgo(notification.timestamp)
                            }
                          </div>
                          {notification.isRead ? (
                            <span className="badge bg-light text-secondary" style={{ fontSize: '0.7rem' }}>Read</span>
                          ) : null}
                        </div>
                      </div>
                      {selectedNotificationId && notification.details && Object.keys(notification.details).length > 0 && (
                        <div className="mt-3 p-2 bg-light rounded">
                          <h6 className="mb-2">Additional Details:</h6>
                          <ul className="mb-0">
                            {Object.entries(notification.details).map(([key, value]) => (
                              <li key={key}><strong>{key}:</strong> {value}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NotificationModal;
