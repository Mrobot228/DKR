export declare const Messages: {
    WELCOME: string;
    HELP: string;
    FIND_OFFICE_PROMPT: string;
    FIND_OFFICE_LOCATION: string;
    NO_OFFICES_FOUND: string;
    OFFICES_FOUND: (count: number) => string;
    CREATE_PARCEL_START: string;
    CREATE_PARCEL_CANCELLED: string;
    TRACK_PROMPT: string;
    PARCEL_NOT_FOUND: string;
    NO_PARCELS: string;
    MY_PARCELS_HEADER: string;
    CALC_START: string;
    ERROR_GENERAL: string;
    ERROR_INVALID_PHONE: string;
    ERROR_INVALID_WEIGHT: string;
    ERROR_INVALID_VALUE: string;
    ERROR_INVALID_TRACKING: string;
    BTN_FIND_OFFICE: string;
    BTN_CREATE_PARCEL: string;
    BTN_TRACK_PARCEL: string;
    BTN_MY_PARCELS: string;
    BTN_CALCULATOR: string;
    BTN_INFO: string;
    BTN_CANCEL: string;
    BTN_CONFIRM: string;
    BTN_BACK: string;
    BTN_SKIP: string;
    INFO: string;
    PARCEL_CREATED: (trackingNumber: string) => string;
    STATUS_UPDATED: (status: string) => string;
};
export declare const CreateParcelSteps: {
    SENDER_NAME: {
        step: number;
        total: number;
        message: string;
    };
    SENDER_PHONE: {
        step: number;
        total: number;
        message: string;
    };
    SENDER_CITY: {
        step: number;
        total: number;
        message: string;
    };
    SENDER_ADDRESS: {
        step: number;
        total: number;
        message: string;
    };
    SENDER_OFFICE: {
        step: number;
        total: number;
        message: string;
    };
    RECIPIENT_NAME: {
        step: number;
        total: number;
        message: string;
    };
    RECIPIENT_PHONE: {
        step: number;
        total: number;
        message: string;
    };
    RECIPIENT_CITY: {
        step: number;
        total: number;
        message: string;
    };
    RECIPIENT_ADDRESS: {
        step: number;
        total: number;
        message: string;
    };
    RECIPIENT_OFFICE: {
        step: number;
        total: number;
        message: string;
    };
    DESCRIPTION: {
        step: number;
        total: number;
        message: string;
    };
    WEIGHT: {
        step: number;
        total: number;
        message: string;
    };
    DECLARED_VALUE: {
        step: number;
        total: number;
        message: string;
    };
    DELIVERY_TYPE: {
        step: number;
        total: number;
        message: string;
    };
};
