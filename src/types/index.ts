// ── Shared entity types ──────────────────────────────────────────────

export interface Atoll {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  type: string;
  code?: string;
  atoll?: string;
  address?: string;
  registration_no?: string;
  coordinates?: string;
  contract_count?: number;
  linked_resorts?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RelatedEntity {
  name: string;
}

// ── Contract types ───────────────────────────────────────────────────

export interface ContractBase {
  id: string;
  contract_id?: string;
  contract_code: string;
  sub_contract_id?: string;
  sub_contract_type?: string;
  carrier_id?: string;
  resort_id?: string;
  group_id?: string;
  start_date: string;
  end_date: string;
  agreement_type?: string;
  created_at?: string;
  updated_at?: string;
  resort?: RelatedEntity | null;
  group?: RelatedEntity | null;
}

// ── Sub-table row types ──────────────────────────────────────────────

/** Generic parameter row (baggage, booking, fuel, payment plan, etc.) */
export interface ParamRow {
  id: string;
  sub_contract_id?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface AgeRow {
  id: string;
  sub_contract_id?: string;
  type?: string;
  min_age?: number;
  max_age?: number | null;
}

export interface AddonRow {
  id: string;
  sub_contract_id?: string;
  sub_category?: string;
  type?: string;
  value?: number;
  remark?: string | null;
}

export interface PricingStandardRow {
  id: string;
  sub_contract_id?: string;
  weekdays?: string[];
  point_a_id?: string;
  point_b_id?: string;
  transfer_type?: string;
  pax_condition?: string;
  passenger_type?: string;
  return_fare_usd?: number;
  one_way_fare_usd?: number;
  start_date?: string;
  end_date?: string;
}

export interface PricingSpecialRow {
  id: string;
  sub_contract_id?: string;
  request_type?: string;
  discount_type?: string;
  return_fare_usd?: number;
  one_way_fare_usd?: number;
  pax_condition?: string;
  start_date?: string;
  end_date?: string;
}

export interface NoteRow {
  id: string;
  contract_id?: string;
  content?: string;
}

// ── Full contract detail (with nested sub-table arrays) ──────────────

export interface ContractDetail extends ContractBase {
  pricing_standard?: PricingStandardRow[];
  pricing_special?: PricingSpecialRow[];
  contract_baggage?: ParamRow[];
  contract_booking?: ParamRow[];
  contract_age?: AgeRow[];
  contract_addons?: AddonRow[];
  contract_insurance?: ParamRow[];
  contract_government_charges?: ParamRow[];
  contract_fuel?: ParamRow[];
  contract_payment_plan?: ParamRow[];
  contract_service_commitment?: ParamRow[];
  contract_termination?: ParamRow[];
  contract_notes?: NoteRow[];
}
