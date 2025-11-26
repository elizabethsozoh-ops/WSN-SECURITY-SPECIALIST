# Firebase Database Schema

## Collections

### 1. companies
Stores security company information (multi-tenant)

```javascript
{
  companyId: "sss-security",
  name: "SSS Security",
  logo: "url-to-logo",
  colors: {
    primary: "#D4AF37",    // Bronze
    secondary: "#C0C0C0",  // Silver
    accent: "#000000"      // Black
  },
  contact: {
    phone: "0123456789",
    email: "control@sss-security.co.za",
    address: "Kempton Park, SA"
  },
  subscription: {
    plan: "premium",
    status: "active",
    monthlyFee: 2500,
    startDate: timestamp,
    nextBilling: timestamp
  },
  settings: {
    responseUnits: ["Armed Response", "Medical", "Fire"],
    autoDispatch: false,
    smsNotifications: true
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 2. users
End-user accounts (clients of security companies)

```javascript
{
  userId: "auto-generated-id",
  companyId: "sss-security",
  profile: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+27821234567",
    idNumber: "encrypted",
    address: {
      street: "123 Main Road",
      suburb: "Kempton Park",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "1619",
      coordinates: {
        lat: -26.1234,
        lng: 28.5678
      }
    }
  },
  subscription: {
    status: "active",
    plan: "standard",
    startDate: timestamp
  },
  dependants: [
    {
      dependantId: "auto-generated",
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "+27821234568",
      canTriggerPanic: true
    }
  ],
  emergencyContacts: [
    {
      name: "Family Member",
      phone: "+27821234569",
      relationship: "Brother"
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLogin: timestamp
}
```

### 3. incidents
Real-time incident tracking

```javascript
{
  incidentId: "auto-generated-id",
  companyId: "sss-security",
  userId: "user-id",
  type: "panic" | "medical" | "fire" | "technical",
  status: "pending" | "dispatched" | "en-route" | "on-scene" | "resolved" | "cancelled",
  priority: "critical" | "high" | "medium" | "low",
  
  location: {
    coordinates: {
      lat: -26.1234,
      lng: 28.5678,
      accuracy: 10  // meters
    },
    address: "123 Main Road, Kempton Park",
    timestamp: timestamp
  },
  
  userDetails: {
    name: "John Doe",
    phone: "+27821234567",
    address: "Home address"
  },
  
  dispatch: {
    unitId: "unit-123",
    unitName: "Alpha 1",
    officerName: "Officer Smith",
    officerPhone: "+27821111111",
    dispatchedAt: timestamp,
    estimatedArrival: timestamp,
    arrivedAt: timestamp
  },
  
  timeline: [
    {
      timestamp: timestamp,
      action: "incident_created",
      actor: "user",
      note: "Panic button pressed"
    },
    {
      timestamp: timestamp,
      action: "dispatched",
      actor: "control-room-operator-id",
      note: "Unit Alpha 1 dispatched"
    }
  ],
  
  notes: "Additional information from user or control room",
  
  resolution: {
    resolvedAt: timestamp,
    resolvedBy: "control-room-operator-id",
    outcome: "false-alarm" | "resolved" | "escalated",
    summary: "Details of resolution"
  },
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. controlRoomUsers
Control room operators and administrators

```javascript
{
  operatorId: "auto-generated-id",
  companyId: "sss-security" | "wsn-admin",  // wsn-admin for WSN staff
  profile: {
    firstName: "Control",
    lastName: "Operator",
    email: "operator@sss-security.co.za",
    phone: "+27821234567"
  },
  role: "operator" | "supervisor" | "admin" | "wsn-super-admin",
  permissions: {
    viewIncidents: true,
    dispatchUnits: true,
    manageUsers: false,
    viewAnalytics: true,
    manageCompany: false  // Only admins
  },
  activeShift: {
    startTime: timestamp,
    endTime: timestamp,
    status: "active" | "break" | "offline"
  },
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLogin: timestamp
}
```

### 5. responseUnits
Available response vehicles/teams

```javascript
{
  unitId: "auto-generated-id",
  companyId: "sss-security",
  name: "Alpha 1",
  type: "armed-response" | "medical" | "fire" | "technical",
  status: "available" | "dispatched" | "on-scene" | "offline",
  
  currentLocation: {
    coordinates: {
      lat: -26.1234,
      lng: 28.5678
    },
    lastUpdated: timestamp
  },
  
  assignedOfficers: [
    {
      name: "Officer Smith",
      phone: "+27821111111",
      role: "driver"
    }
  ],
  
  vehicle: {
    registration: "ABC123GP",
    make: "Toyota",
    model: "Hilux"
  },
  
  currentIncident: "incident-id" | null,
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 6. notifications
Push notification log

```javascript
{
  notificationId: "auto-generated-id",
  recipientId: "user-id-or-operator-id",
  recipientType: "user" | "operator",
  type: "incident-update" | "dispatch-notification" | "system-alert",
  
  title: "Emergency Response Dispatched",
  body: "Unit Alpha 1 is en route to your location",
  
  data: {
    incidentId: "incident-id",
    action: "view-incident"
  },
  
  status: "sent" | "delivered" | "read",
  sentAt: timestamp,
  deliveredAt: timestamp,
  readAt: timestamp
}
```

### 7. analytics
Usage and performance metrics

```javascript
{
  analyticsId: "auto-generated-id",
  companyId: "sss-security",
  period: "2024-11",  // YYYY-MM
  
  metrics: {
    totalIncidents: 150,
    incidentsByType: {
      panic: 80,
      medical: 40,
      fire: 10,
      technical: 20
    },
    averageResponseTime: 180,  // seconds
    resolvedIncidents: 145,
    falseAlarms: 20,
    activeUsers: 500,
    newUsers: 25
  },
  
  createdAt: timestamp
}
```

## Security Rules

### Firestore Rules Structure
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Companies - only WSN admins can modify
    match /companies/{companyId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'wsn-super-admin';
    }
    
    // Users - can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth.token.role in ['operator', 'admin', 'supervisor'];
    }
    
    // Incidents - users can create, operators can manage
    match /incidents/{incidentId} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid == resource.data.userId 
                  || request.auth.token.role in ['operator', 'admin', 'supervisor'];
      allow update: if request.auth.token.role in ['operator', 'admin', 'supervisor'];
    }
    
    // Control room users - only admins can manage
    match /controlRoomUsers/{operatorId} {
      allow read: if request.auth.token.role in ['operator', 'admin', 'supervisor'];
      allow write: if request.auth.token.role in ['admin', 'wsn-super-admin'];
    }
    
    // Response units - operators can view and update
    match /responseUnits/{unitId} {
      allow read, update: if request.auth.token.role in ['operator', 'admin', 'supervisor'];
      allow create, delete: if request.auth.token.role in ['admin', 'wsn-super-admin'];
    }
  }
}
```

## Indexes Required

1. **incidents**
   - companyId + status + createdAt (DESC)
   - companyId + type + createdAt (DESC)
   - userId + createdAt (DESC)

2. **users**
   - companyId + subscription.status

3. **notifications**
   - recipientId + status + sentAt (DESC)
