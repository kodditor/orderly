import { Subscription } from "paystack-sdk/dist/subscription/interface";

export interface IPlanCreated {
    name: string;
    amount: number;
    interval: string;
    integration: number;
    domain: string;
    plan_code: string;
    description: unknown;
    send_invoices: boolean;
    send_sms: boolean;
    hosted_page: boolean;
    hosted_page_url: unknown;
    hosted_page_summary: unknown;
    currency: string;
    migrate: boolean;
    is_archived: boolean;
    id: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPlan extends IPlanCreated {
    subscriptions: Subscription[];
    is_deleted: boolean;
    pages_count: number;
    subscribers_count: number;
    subscriptions_count: number;
    active_subscriptions_count: number;
    total_revenue: number;
    subscribers: unknown[];
}