import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dropdown, Badge, ListGroup, Button, Tabs, Tab } from 'react-bootstrap';
import { 
  FaBell, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaEye,
  FaTrash,
  FaCog
} from 'react-icons/fa';
import api from '../../../services/api';
import NotificationModal from './NotificationModal';

const NotificationDropdown = ({ permissions }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeKey, setActiveKey] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Define categories based on permissions
  const getAvailableCategories = () => {
    // Calculate unread counts for each category
    const getCategoryUnreadCount = (category) => {
      if (!notifications.length) return 0;
      if (category === 'all') return notifications.filter(n => !n.isRead).length;
      return notifications.filter(n => n.category === category && !n.isRead).length;
    };
    
    const categories = [{ key: 'all', name: 'All', count: getCategoryUnreadCount('all') }];
    
    // Check if user is admin/owner (has all permissions)
    const isAdmin = permissions.length > 0 && 
                    permissions.every(p => p.canView === true);
    
    if (isAdmin) {
      return [
        { key: 'all', name: 'All', count: getCategoryUnreadCount('all') },
        { key: 'production', name: 'Production', count: getCategoryUnreadCount('production') },
        { key: 'quality', name: 'Quality', count: getCategoryUnreadCount('quality') },
        { key: 'store', name: 'Store', count: getCategoryUnreadCount('store') },
        { key: 'sales', name: 'Sales', count: getCategoryUnreadCount('sales') },
        { key: 'vendor', name: 'Vendor', count: getCategoryUnreadCount('vendor') },
        { key: 'workforce', name: 'Workforce', count: getCategoryUnreadCount('workforce') }
      ];
    }

    // Add categories based on user permissions
    if (hasViewPermission('Production', permissions)) {
      categories.push({ key: 'production', name: 'Production', count: getCategoryUnreadCount('production') });
    }
    if (hasViewPermission('Quality', permissions) || hasViewPermission('IQC', permissions)) {
      categories.push({ key: 'quality', name: 'Quality', count: getCategoryUnreadCount('quality') });
    }
    if (hasViewPermission('Store', permissions) || hasViewPermission('Store Material Inward', permissions)) {
      categories.push({ key: 'store', name: 'Store', count: getCategoryUnreadCount('store') });
    }
    if (hasViewPermission('Sales', permissions)) {
      categories.push({ key: 'sales', name: 'Sales', count: getCategoryUnreadCount('sales') });
    }
    if (hasViewPermission('Vendor', permissions) || hasViewPermission('Vendor Rating', permissions)) {
      categories.push({ key: 'vendor', name: 'Vendor', count: getCategoryUnreadCount('vendor') });
    }
    if (hasViewPermission('Workforce', permissions)) {
      categories.push({ key: 'workforce', name: 'Workforce', count: getCategoryUnreadCount('workforce') });
    }

    return categories;
  };

  // Recalculate categories when notifications change to update counts
  const categories = useMemo(() => getAvailableCategories(), [notifications, permissions]);

  // Check if user has view access to a specific module
  function hasViewPermission(pageName, permissions) {
    const perm = permissions.find((p) => p.pageName === pageName);
    return perm?.canView === true;
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications(activeKey);
  }, [notifications, activeKey]);

  // Always keep track of total unread count from all notifications
  useEffect(() => {
    // Update unread count from all notifications, regardless of filtering
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Try to use existing API endpoints
      let endpoint = '/api/alerts/unread';
      
      try {
        const response = await api.get(endpoint);
        const processedNotifications = processApiNotifications(response.data.data);
        setNotifications(processedNotifications);
      } catch (apiError) {
        console.error('Error fetching notifications from API:', apiError);
        // Fallback to dummy data
        setNotifications(generateDummyNotifications());
      }
    } catch (error) {
      console.error('Error in notification fetch:', error);
      setNotifications(generateDummyNotifications());
    } finally {
      setIsLoading(false);
    }
  };

  const filterNotifications = (category) => {
    if (category === 'all') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(
        notifications.filter(notification => notification.category === category)
      );
    }
  };

  // Process API notifications
  const processApiNotifications = (apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return generateDummyNotifications();
    }
    
    return apiData.map((item, index) => {
      // Map API data to our notification format
      return {
        id: item.id || index + 1,
        timestamp: new Date(item.createdAt || Date.now()),
        type: mapApiSeverityToType(item.severity || 'info'),
        message: item.message || 'No message provided',
        source: item.source || 'System',
        category: mapSourceToCategory(item.source || 'System'),
        isRead: item.isRead || false,
        details: item.details || {}
      };
    });
  };

  // Map API severity to our type
  const mapApiSeverityToType = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  // Map source to category
  const mapSourceToCategory = (source) => {
    switch (source.toLowerCase()) {
      case 'production':
      case 'machine':
      case 'assembly':
        return 'production';
      case 'quality':
      case 'qc':
      case 'inspection':
        return 'quality';
      case 'inventory':
      case 'store':
      case 'warehouse':
        return 'store';
      case 'sales':
      case 'order':
      case 'customer':
        return 'sales';
      case 'vendor':
      case 'supplier':
      case 'purchase':
        return 'vendor';
      case 'workforce':
      case 'employee':
      case 'hr':
        return 'workforce';
      default:
        return 'production'; // Default category
    }
  };

  // Generate consistent notifications
  const generateDummyNotifications = () => {
    // Define a consistent set of notifications
    const predefinedNotifications = [
      // Production notifications - newest
      {
        type: 'warning',
        category: 'production',
        message: 'Machine CNC-02 performance degrading',
        source: 'Production',
        isRead: false,
        minutesAgo: 5
      },
      {
        type: 'info',
        category: 'production',
        message: 'Production batch #12345 started',
        source: 'Production',
        isRead: false,
        minutesAgo: 15
      },
      {
        type: 'success',
        category: 'production',
        message: 'Production target exceeded by 10%',
        source: 'Production',
        isRead: true,
        minutesAgo: 45
      },
      
      // Quality notifications
      {
        type: 'error',
        category: 'quality',
        message: 'Batch #12345 failed quality check',
        source: 'Quality',
        isRead: false,
        minutesAgo: 10
      },
      {
        type: 'info',
        category: 'quality',
        message: 'Quality audit scheduled for tomorrow',
        source: 'Quality',
        isRead: false,
        minutesAgo: 30
      },
      
      // Store notifications
      {
        type: 'warning',
        category: 'store',
        message: 'Stock level low for Item Z-789',
        source: 'Store',
        isRead: false,
        minutesAgo: 20
      },
      {
        type: 'info',
        category: 'store',
        message: 'New stock received for Item X-123',
        source: 'Store',
        isRead: true,
        minutesAgo: 60
      },
      
      // Sales notifications
      {
        type: 'success',
        category: 'sales',
        message: 'Monthly sales target exceeded by 10%',
        source: 'Sales',
        isRead: true,
        minutesAgo: 75
      },
      {
        type: 'info',
        category: 'sales',
        message: 'New order #12345 received from Customer ABC',
        source: 'Sales',
        isRead: false,
        minutesAgo: 25
      },
      
      // Vendor notifications
      {
        type: 'warning',
        category: 'vendor',
        message: 'Supplier ABC delivery delay for Material X',
        source: 'Vendor',
        isRead: false,
        minutesAgo: 35
      },
      {
        type: 'error',
        category: 'vendor',
        message: 'Critical material shortage from Vendor ABC',
        source: 'Vendor',
        isRead: true,
        minutesAgo: 90
      },
      
      // Workforce notifications
      {
        type: 'info',
        category: 'workforce',
        message: 'Safety training session completed for Team A',
        source: 'Workforce',
        isRead: true,
        minutesAgo: 110
      },
      {
        type: 'warning',
        category: 'workforce',
        message: 'Increased absenteeism in Assembly Team',
        source: 'Workforce',
        isRead: false,
        minutesAgo: 40
      },
      {
        type: 'success',
        category: 'workforce',
        message: 'Zero safety incidents this month',
        source: 'Workforce',
        isRead: true,
        minutesAgo: 120
      },
      {
        type: 'error',
        category: 'workforce',
        message: 'Safety incident reported in Warehouse Area',
        source: 'Workforce',
        isRead: false,
        minutesAgo: 55
      }
    ];
    
    // Convert to our notification format with timestamps
    const now = new Date();
    const notifications = predefinedNotifications.map((notif, index) => {
      const timestamp = new Date(now);
      timestamp.setMinutes(now.getMinutes() - notif.minutesAgo);
      
      return {
        id: index + 1,
        timestamp,
        type: notif.type,
        message: notif.message,
        category: notif.category,
        source: notif.source,
        isRead: notif.isRead,
        details: {}
      };
    });
    
    // Sort by timestamp (newest first)
    return notifications.sort((a, b) => b.timestamp - a.timestamp);
  };

  const getRandomProductionNotification = (type) => {
    const notifications = {
      info: [
        'Production batch #12345 started',
        'Shift change completed successfully',
        'Maintenance scheduled for Machine CNC-01',
        'Daily production target updated to 1,500 units'
      ],
      warning: [
        'Machine CNC-02 performance degrading',
        'Production rate below target by 15%',
        'Material inventory running low',
        'Minor process deviation detected in Assembly-03'
      ],
      error: [
        'Machine Welding-05 breakdown detected',
        'Emergency stop activated on Production Line 2',
        'Critical process failure in Packaging-03',
        'Production halted due to quality issues'
      ],
      success: [
        'Production target exceeded by 10%',
        'Zero defects achieved in batch #12345',
        'Maintenance completed successfully',
        'New efficiency record achieved on Assembly-01'
      ]
    };
    
    return notifications[type][Math.floor(Math.random() * notifications[type].length)];
  };

  const getRandomQualityNotification = (type) => {
    const notifications = {
      info: [
        'Quality check initiated for batch #12345',
        'Batch sampling completed for incoming materials',
        'Quality audit scheduled for tomorrow',
        'New quality procedure implemented'
      ],
      warning: [
        'Quality metrics trending down for Product A',
        'Increased defect rate detected in Assembly-02',
        'Calibration due for testing equipment',
        'Minor quality deviation in batch #12345'
      ],
      error: [
        'Batch #12345 failed quality check',
        'Critical defect detected in Product B',
        'Quality standard violation in Assembly-03',
        'Product recall required for batch #54321'
      ],
      success: [
        'Zero defects in inspection of batch #12345',
        'Quality audit passed with no findings',
        'Calibration completed successfully',
        'Quality improvement target achieved'
      ]
    };
    
    return notifications[type][Math.floor(Math.random() * notifications[type].length)];
  };

  const getRandomStoreNotification = (type) => {
    const notifications = {
      info: [
        'Inventory count initiated for warehouse A',
        'New stock received for Item X-123',
        'Reorder point reached for Item Y-456',
        'Stock transfer completed to Production Line 1'
      ],
      warning: [
        'Stock level low for Item Z-789',
        'Inventory discrepancy detected for Item X-123',
        'Items approaching expiry date in Zone B',
        'Storage capacity at 80% in Warehouse C'
      ],
      error: [
        'Stock out situation for critical Item Z-789',
        'Damaged inventory detected in shipment #12345',
        'Storage temperature deviation in Cold Storage',
        'Expired items found in Zone D'
      ],
      success: [
        'Inventory reconciliation completed successfully',
        'Optimal stock level achieved for all critical items',
        'Storage optimization completed in Warehouse A',
        'Inventory turnover target met for Q2'
      ]
    };
    
    return notifications[type][Math.floor(Math.random() * notifications[type].length)];
  };

  const getRandomSalesNotification = (type) => {
    const notifications = {
      info: [
        'New order #12345 received from Customer ABC',
        'Customer XYZ inquiry logged for Product A',
        'Price update scheduled for Product Line B',
        'Sales meeting completed with Customer DEF'
      ],
      warning: [
        'Order #12345 fulfillment delayed',
        'Monthly sales target at risk by 15%',
        'Customer complaint received for order #54321',
        'Pricing discrepancy detected in Quote #789'
      ],
      error: [
        'Order #12345 cancellation by Customer ABC',
        'Payment rejection for Invoice #54321',
        'Major dispute with Customer XYZ',
        'Critical delivery failure for Order #789'
      ],
      success: [
        'Monthly sales target exceeded by 10%',
        'Large order #12345 confirmed by Customer ABC',
        'New customer XYZ acquired',
        'Perfect delivery record maintained for Q2'
      ]
    };
    
    return notifications[type][Math.floor(Math.random() * notifications[type].length)];
  };

  const getRandomVendorNotification = (type) => {
    const notifications = {
      info: [
        'Vendor ABC evaluation initiated',
        'New supplier XYZ onboarded for Material A',
        'Contract review scheduled with Vendor DEF',
        'Supplier meeting completed with Vendor GHI'
      ],
      warning: [
        'Supplier ABC delivery delay for Material X',
        'Quality issues detected with Vendor DEF materials',
        'Price increase notification from Supplier XYZ',
        'Supplier ABC capacity constraint reported'
      ],
      error: [
        'Supplier XYZ contract breach detected',
        'Critical material shortage from Vendor ABC',
        'Supplier DEF quality certification expired',
        'Major non-conformance detected in Vendor GHI shipment'
      ],
      success: [
        'Supplier ABC awarded excellence recognition',
        '10% cost reduction achieved with Vendor XYZ',
        'Perfect delivery performance from Supplier DEF',
        'Successful supplier audit completed for Vendor GHI'
      ]
    };
    
    return notifications[type][Math.floor(Math.random() * notifications[type].length)];
  };

  const getRandomWorkforceNotification = (type) => {
    const notifications = {
      info: [
        'New employee John Doe onboarded',
        'Safety training session completed for Team A',
        'Performance review scheduled for next week',
        'Shift schedule updated for Production Line 1'
      ],
      warning: [
        'Increased absenteeism in Assembly Team',
        'Skill gap identified in Maintenance Team',
        'Overtime threshold reached for Production Team',
        'Safety refresher training needed for Team B'
      ],
      error: [
        'Safety incident reported in Warehouse Area',
        'Critical skill shortage in Quality Team',
        'Compliance violation in working hours',
        'Unplanned absence affecting Production Line 2'
      ],
      success: [
        'Zero safety incidents this month',
        'Training certification completed for all teams',
        'Productivity target exceeded by Team A',
        'Employee of the month awarded to Jane Smith'
      ]
    };
    
    return notifications[type][Math.floor(Math.random() * notifications[type].length)];
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'info': return <FaInfoCircle className="text-info" />;
      case 'warning': return <FaExclamationTriangle className="text-warning" />;
      case 'error': return <FaExclamationTriangle className="text-danger" />;
      case 'success': return <FaCheckCircle className="text-success" />;
      default: return <FaInfoCircle className="text-info" />;
    }
  };

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

  const markAsRead = (id) => {
    // Update the read status without changing the order
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    // Mark all as read without changing the order
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, isRead: true }))
    );
  };
  
  const handleViewAllClick = () => {
    setSelectedNotificationId(null);
    setShowModal(true);
  };
  
  const handleNotificationClick = (id) => {
    markAsRead(id);
    setSelectedNotificationId(id);
    setShowModal(true);
  };

  const handleBellClick = () => {
    // Refresh notifications when bell is clicked
    fetchNotifications();
  };

  // Custom toggle component for the dropdown
  const CustomToggle = React.forwardRef(({ onClick }, ref) => (
    <div 
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
        handleBellClick();
      }}
      className="notification-bell-container"
      style={{ cursor: 'pointer' }}
    >
      <FaBell size={20} className="notification-bell" />
      {unreadCount > 0 && (
        <Badge 
          bg="danger" 
          pill 
          className="notification-badge"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </div>
  ));

  const handleDropdownToggle = (isOpen) => {
    setIsDropdownOpen(isOpen);
  };

  return (
    <>
      <Dropdown 
        align="end" 
        ref={dropdownRef} 
        show={isDropdownOpen}
        onToggle={handleDropdownToggle}
      >
        <Dropdown.Toggle as={CustomToggle} id="notification-dropdown-toggle" />
        
        <Dropdown.Menu className="notification-dropdown-menu shadow">
          <div className="notification-header d-flex justify-content-between align-items-center p-3 border-bottom">
            <h6 className="mb-0">Notifications</h6>
            <div className="d-flex">
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 text-muted me-3"
                onClick={markAllAsRead}
                disabled={!notifications.some(n => !n.isRead)}
              >
                <FaEye size={14} className="me-1" />
                <small>Mark all read</small>
              </Button>
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 text-muted"
              >
                <FaCog size={14} />
              </Button>
            </div>
          </div>
          
          <Tabs
            activeKey={activeKey}
            onSelect={(k) => setActiveKey(k)}
            className="notification-tabs"
          >
            {categories.map((category) => (
              <Tab 
                key={category.key} 
                eventKey={category.key} 
                title={
                  <div className="d-flex align-items-center">
                    {category.name}
                    {category.count > 0 && (
                      <Badge bg="danger" pill className="ms-1" style={{ fontSize: '0.6rem' }}>
                        {category.count}
                      </Badge>
                    )}
                  </div>
                }
              />
            ))}
          </Tabs>
          
          <div className="notification-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {isLoading ? (
              <div className="text-center py-4">Loading notifications...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <FaBell size={24} className="mb-2" />
                <p>No notifications to display</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {filteredNotifications.map(notification => (
                  <ListGroup.Item 
                    key={notification.id}
                    className={`notification-item py-2 px-3 ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="d-flex">
                      <div className="me-2 mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-grow-1">
                                              <div className="d-flex justify-content-between align-items-start">
                        <p className="mb-0 notification-message">
                          {notification.message}
                          {!notification.isRead && (
                            <span className="ms-1 badge bg-primary" style={{ fontSize: '0.65rem', verticalAlign: 'middle' }}>
                              New
                            </span>
                          )}
                        </p>
                      </div>
                        <div className="d-flex justify-content-between align-items-center mt-1">
                          <small className="text-muted">{notification.source}</small>
                          <div className="d-flex align-items-center">
                            <small className="text-muted me-1">{formatTimeAgo(notification.timestamp)}</small>
                            {notification.isRead && (
                              <FaEye size={10} className="text-muted" title="Read" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
          
          <div className="notification-footer p-2 border-top text-center">
            <Button 
              variant="link" 
              size="sm" 
              className="text-decoration-none"
              onClick={handleViewAllClick}
            >
              View all notifications
            </Button>
          </div>
        </Dropdown.Menu>
      </Dropdown>

      {/* Notification Modal */}
      <NotificationModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedNotificationId(null);
          // We don't close the dropdown when the modal is closed
        }}
        notifications={notifications}
        selectedNotificationId={selectedNotificationId}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </>
  );
};

export default NotificationDropdown;
