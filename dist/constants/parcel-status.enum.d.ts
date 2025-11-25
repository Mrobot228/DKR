export declare enum ParcelStatus {
    AWAITING_SHIPMENT = "awaiting_shipment",
    ACCEPTED_AT_ORIGIN = "accepted_at_origin",
    IN_TRANSIT = "in_transit",
    ARRIVED_AT_DESTINATION = "arrived_at_destination",
    AT_RECIPIENT_OFFICE = "at_recipient_office",
    DELIVERED = "delivered",
    RETURNED_TO_SENDER = "returned_to_sender"
}
export declare const ParcelStatusLabels: Record<ParcelStatus, string>;
export declare const ParcelStatusEmojis: Record<ParcelStatus, string>;
export declare const ParcelStatusOrder: ParcelStatus[];
