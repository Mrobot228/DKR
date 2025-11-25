import { Markup } from 'telegraf';
import { Parcel } from '../../database/entities';
export declare const parcelActionsKeyboard: (trackingNumber: string) => Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
export declare const statusSelectionKeyboard: (trackingNumber: string) => Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
export declare const parcelsListKeyboard: (parcels: Parcel[], page?: number, perPage?: number) => Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
export declare const confirmInlineKeyboard: (confirmCallback: string, cancelCallback?: string) => Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
export declare const deliveryTypeInlineKeyboard: () => Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
export declare const officeMapKeyboard: (lat: number, lng: number, officeNumber: string) => Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
export declare const nearbyOfficesKeyboard: (offices: Array<{
    office: {
        officeNumber: string;
        address: string;
    };
    distance: number;
}>) => Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
export declare const adminParcelKeyboard: (trackingNumber: string) => Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
export declare const adminMenuKeyboard: () => Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
