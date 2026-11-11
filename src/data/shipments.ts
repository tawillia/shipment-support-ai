import type { Shipment } from "../engine/types";
export const deliveryDates = [
  "November 14, 2026",
  "November 16, 2026",
  "November 17, 2026",
];
export const mockShipments: Record<string, Shipment> = {
  DEMO123456: {
    trackingNumber: "DEMO123456",
    status: "In transit",
    latestUpdate:
      "Arrived at the Northbridge sorting facility · Nov 11, 8:42 AM",
    estimatedDelivery: "November 13, 2026",
    route: "Brookhaven → Northbridge",
    address: "18 Example Lane, Northbridge, NY 10001",
    canChangeAddress: true,
    canReschedule: true,
  },
  DEMO234567: {
    trackingNumber: "DEMO234567",
    status: "Delayed",
    latestUpdate: "Weather disruption at the Westhaven hub · Nov 11, 7:15 AM",
    route: "Lakewood → Westhaven",
    address: "42 Sample Road, Westhaven, NY 10002",
    canChangeAddress: false,
    canReschedule: true,
    delayReason:
      "Severe weather has paused departures from the Westhaven hub. A new delivery estimate is not available yet.",
  },
  DEMO345678: {
    trackingNumber: "DEMO345678",
    status: "Delivered",
    latestUpdate: "Delivered to the fictional front porch · Nov 10, 2:06 PM",
    route: "Fairview → Eastbrook",
    address: "7 Demo Court, Eastbrook, NY 10003",
    canChangeAddress: false,
    canReschedule: false,
  },
};
