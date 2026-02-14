import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.enum(["Group", "Resort"]),
  code: z.string().max(20).optional().or(z.literal("")),
  atoll: z.string().max(100).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  registration_no: z.string().max(100).optional().or(z.literal("")),
  coordinates: z.string().max(100).optional().or(z.literal("")),
});

export type CompanyFormData = z.infer<typeof companySchema>;

export const contractSchema = z.object({
  contract_id: z.string().min(1, "Contract ID is required").max(100),
  contract_code: z.string().min(1, "Contract code is required").max(100),
  carrier_id: z.string().default("TMA101"),
  group_id: z.string().uuid("Select a group"),
  resort_id: z.string().uuid("Select a resort"),
  sub_contract_id: z.string().min(1, "Sub-contract ID is required"),
  sub_contract_type: z.enum(["Transfer", "Charter", "Signed Charter"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  agreement_type: z.string().default("Exclusive Seaplane (Day time)"),
}).refine(data => new Date(data.end_date) > new Date(data.start_date), {
  message: "End date must be after start date",
  path: ["end_date"],
});

export type ContractFormData = z.infer<typeof contractSchema>;

export const pricingStandardSchema = z.object({
  weekdays: z.array(z.string()).min(1, "Select at least one day"),
  point_a_id: z.string().uuid("Select Point A"),
  point_b_id: z.string().uuid("Select Point B"),
  transfer_type: z.string().optional().or(z.literal("")),
  pax_condition: z.string().optional().or(z.literal("")),
  passenger_type: z.enum(["Adult", "Child"]),
  return_fare_usd: z.number().min(0),
  one_way_fare_usd: z.number().min(0),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
});

export type PricingStandardFormData = z.infer<typeof pricingStandardSchema>;

export const pricingSpecialSchema = z.object({
  request_type: z.enum(["Management", "Staff", "Service providers", "FAM trips", "Tour Operators", "Tour Guides", "Journalists", "Advertisers", "Others"]),
  discount_type: z.enum(["Absolute", "Percentage"]),
  return_fare_usd: z.number().min(0),
  one_way_fare_usd: z.number().min(0),
  pax_condition: z.string().optional().or(z.literal("")),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
});

export type PricingSpecialFormData = z.infer<typeof pricingSpecialSchema>;
