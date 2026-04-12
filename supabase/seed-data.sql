-- ============================================================
-- TMA Contract Data — Seed SQL
-- Generated: 2026-04-12
-- Source:    public/data/*.xlsx
--
-- Instructions:
--   Paste this entire file into Supabase SQL Editor and Run.
--   Schema must already be applied (supabase/full-schema.sql).
--   Safe to re-run — uses INSERT ... ON CONFLICT DO UPDATE.
-- ============================================================

-- ── atolls (12 rows) ──────────────────────────────
INSERT INTO public.atolls ("id", "created_at", "updated_at", "name")
VALUES
  ('c983362a-e407-41dc-ad5b-66e7bc09cc4b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'North Malé Atoll'),
  ('78ce8bc7-a017-426c-98a4-3031ce36ceca', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'South Malé Atoll'),
  ('0cf24454-7cc9-42b9-a277-594cd7494cbe', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Baa Atoll'),
  ('cd2b459a-a775-4a2a-8c9f-331b1a16acc5', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Noonu Atoll'),
  ('efe70fbd-71d6-419c-9ebe-8d0ab0710f32', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Dhaalu Atoll'),
  ('ef836ab2-ae6d-420e-8900-65736d31e481', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Raa Atoll'),
  ('f50b1e3f-a70d-4483-a4ec-6ff1d4234f2f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Lhaviyani Atoll'),
  ('e166b76a-f3e7-413b-bc4d-477dd3200e11', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Ari Atoll'),
  ('3ff3b4ef-9b86-47b9-bc63-f3bb26ffc86f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Meemu Atoll'),
  ('408b3a30-7da7-48de-a173-5a83d45f2794', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Laamu Atoll'),
  ('d0d40e87-6e2f-4d54-99de-9cf2e2c78d3f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Gaafu Alifu Atoll'),
  ('a4e5f5e1-7a3e-4428-8dfc-86bb3ff86450', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Addu Atoll')
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "name" = EXCLUDED."name";

-- ── companies (15 rows) ──────────────────────────────
INSERT INTO public.companies ("id", "created_at", "updated_at", "name", "code", "address", "registration_no", "coordinates", "type", "atoll_id")
VALUES
  ('3878f7f2-c5c5-48c0-9178-4fed0b5ffef5', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Marriott International', 'MAR', 'Bethesda, Maryland, USA', 'MI-2024-001', '38.9807, -77.0962', 'Group', NULL),
  ('777dac53-12bf-48ef-a913-ac3e14639321', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Soneva Group', 'SON', 'Bangkok, Thailand', 'SG-2024-002', '13.7563, 100.5018', 'Group', NULL),
  ('2d720ce4-b7e5-4a56-bebe-46ba7ddefe65', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'LVMH Hospitality', 'LVMH', 'Paris, France', 'LV-2024-003', '48.8566, 2.3522', 'Group', NULL),
  ('b90a2822-5146-4bc6-8193-1413cd5a2e04', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Four Seasons Hotels & Resorts', 'FS', 'Toronto, Ontario, Canada', 'FS-2024-004', '43.6532, -79.3832', 'Group', NULL),
  ('00814f5b-b883-4ca7-b853-b2667ab37505', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Minor International (Anantara)', 'MINT', 'Bangkok, Thailand', 'MT-2024-005', '13.7235, 100.5284', 'Group', NULL),
  ('8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Soneva Fushi', 'SF', 'Kunfunadhoo Island, Baa Atoll, Maldives', 'SF-2024-R01', '5.1100, 73.0700', 'Resort', '0cf24454-7cc9-42b9-a277-594cd7494cbe'),
  ('ebf035b5-c1d1-4e4e-b99a-0fa6b0fcbdb0', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Waldorf Astoria Maldives Ithaafushi', 'WAI', 'Ithaafushi Island, South Malé Atoll, Maldives', 'WA-2024-R02', '4.1500, 73.4200', 'Resort', '78ce8bc7-a017-426c-98a4-3031ce36ceca'),
  ('42e6bcee-426a-4f7a-877e-20c9962142d5', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'St. Regis Maldives Vommuli', 'SRV', 'Vommuli Island, Dhaalu Atoll, Maldives', 'SR-2024-R03', '2.8200, 73.3900', 'Resort', 'efe70fbd-71d6-419c-9ebe-8d0ab0710f32'),
  ('bc4b67a6-ea9d-4639-ba7b-e1c4adfbc48c', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Patina Maldives Fari Islands', 'PMF', 'Fari Islands, North Malé Atoll, Maldives', 'PM-2024-R04', '4.3100, 73.4800', 'Resort', 'c983362a-e407-41dc-ad5b-66e7bc09cc4b'),
  ('c4b758b0-8279-41c1-9617-c33355bf329a', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Cheval Blanc Randheli', 'CBR', 'Randheli Island, Noonu Atoll, Maldives', 'CB-2024-R05', '5.7200, 73.0100', 'Resort', 'cd2b459a-a775-4a2a-8c9f-331b1a16acc5'),
  ('57aee1f6-06da-4322-8c0f-f0d0d82a1a31', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Four Seasons Landaa Giraavaru', 'FSLG', 'Landaa Giraavaru, Baa Atoll, Maldives', 'FL-2024-R06', '5.2840, 73.0710', 'Resort', '0cf24454-7cc9-42b9-a277-594cd7494cbe'),
  ('a6635d78-8321-470b-ba54-19fb00ecc897', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Four Seasons Kuda Huraa', 'FSKH', 'Kuda Huraa Island, North Malé Atoll, Maldives', 'FK-2024-R07', '4.3300, 73.5900', 'Resort', 'c983362a-e407-41dc-ad5b-66e7bc09cc4b'),
  ('c4302238-45ab-437a-8e35-756858676994', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Anantara Kihavah Maldives', 'AKV', 'Kihavah Huravalhi, Baa Atoll, Maldives', 'AK-2024-R08', '5.3050, 73.0690', 'Resort', '0cf24454-7cc9-42b9-a277-594cd7494cbe'),
  ('7a7a2625-26bd-424d-acbe-9c84fc54ea85', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'The Ritz-Carlton Maldives Fari Islands', 'RCFI', 'Fari Islands, North Malé Atoll, Maldives', 'RC-2024-R09', '4.3150, 73.4750', 'Resort', 'c983362a-e407-41dc-ad5b-66e7bc09cc4b'),
  ('a6317543-34f5-4949-96ef-e195ab1aa389', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'Soneva Jani', 'SJ', 'Medhufaru Island, Noonu Atoll, Maldives', 'SJ-2024-R10', '5.7600, 73.3800', 'Resort', 'cd2b459a-a775-4a2a-8c9f-331b1a16acc5')
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "name" = EXCLUDED."name",
  "code" = EXCLUDED."code",
  "address" = EXCLUDED."address",
  "registration_no" = EXCLUDED."registration_no",
  "coordinates" = EXCLUDED."coordinates",
  "type" = EXCLUDED."type",
  "atoll_id" = EXCLUDED."atoll_id";

-- ── contracts (19 rows) ──────────────────────────────
INSERT INTO public.contracts ("id", "created_at", "updated_at", "contract_id", "contract_code", "carrier_id", "group_id", "resort_id", "sub_contract_id", "sub_contract_type", "start_date", "end_date", "agreement_type")
VALUES
  ('c0f92e8a-aa8b-4aa2-bec2-95cb55998bf6', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001', 'MAR-WAI-2025', 'TMA101', '3878f7f2-c5c5-48c0-9178-4fed0b5ffef5', 'ebf035b5-c1d1-4e4e-b99a-0fa6b0fcbdb0', 'CTR-001-001', 'Transfer', '2025-01-01', '2026-03-01', 'Exclusive Seaplane (Day time)'),
  ('78cd917a-a41b-4df3-8a31-0015a170155d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001', 'MAR-WAI-2025', 'TMA101', '3878f7f2-c5c5-48c0-9178-4fed0b5ffef5', 'ebf035b5-c1d1-4e4e-b99a-0fa6b0fcbdb0', 'CTR-001-002', 'Charter', '2025-06-01', '2026-05-31', 'Charter Agreement'),
  ('b9037295-b281-4339-9c92-58351d8b0574', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002', 'MAR-SRV-2025', 'TMA101', '3878f7f2-c5c5-48c0-9178-4fed0b5ffef5', '42e6bcee-426a-4f7a-877e-20c9962142d5', 'CTR-002-001', 'Transfer', '2025-03-01', '2027-02-28', 'Exclusive Seaplane (Day time)'),
  ('a88b36f6-364e-4b60-974f-222c0081fc60', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003', 'SON-SF-2025', 'TMA101', '777dac53-12bf-48ef-a913-ac3e14639321', '8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', 'CTR-003-001', 'Charter', '2025-06-01', '2027-05-31', 'Charter Agreement'),
  ('2d49a8f8-7dad-441d-a2fe-0ac431ddd8e5', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003', 'SON-SF-2025', 'TMA101', '777dac53-12bf-48ef-a913-ac3e14639321', '8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', 'CTR-003-002', 'Transfer', '2025-06-01', '2026-12-31', 'Exclusive Seaplane (Day time)'),
  ('ac4463fc-0f11-4250-a7d1-ee3d343e1431', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003', 'SON-SF-2025', 'TMA101', '777dac53-12bf-48ef-a913-ac3e14639321', '8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', 'CTR-003-003', 'Signed Charter', '2025-10-01', '2026-09-30', 'Signed Charter Agreement'),
  ('9a4b1770-6a3e-42c5-b683-6bae0cafa620', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-004', 'LVMH-CBR-2024', 'TMA101', '2d720ce4-b7e5-4a56-bebe-46ba7ddefe65', 'c4b758b0-8279-41c1-9617-c33355bf329a', 'CTR-004-001', 'Signed Charter', '2024-01-01', '2024-12-31', 'Signed Charter Agreement'),
  ('8003b4e4-5d86-4a0e-90e2-d92850a7b277', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005', 'MAR-PMF-2025', 'TMA101', '3878f7f2-c5c5-48c0-9178-4fed0b5ffef5', 'bc4b67a6-ea9d-4639-ba7b-e1c4adfbc48c', 'CTR-005-001', 'Transfer', '2025-04-01', '2027-03-31', 'Exclusive Seaplane (Day time)'),
  ('acc61d98-766d-4699-824b-8957c82e9880', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005', 'MAR-PMF-2025', 'TMA101', '3878f7f2-c5c5-48c0-9178-4fed0b5ffef5', 'bc4b67a6-ea9d-4639-ba7b-e1c4adfbc48c', 'CTR-005-002', 'Charter', '2025-11-01', '2026-10-31', 'Charter Agreement'),
  ('6d461192-db6a-452f-b9da-1b11c9a51892', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006', 'FS-FSLG-2025', 'TMA101', 'b90a2822-5146-4bc6-8193-1413cd5a2e04', '57aee1f6-06da-4322-8c0f-f0d0d82a1a31', 'CTR-006-001', 'Transfer', '2025-01-01', '2027-12-31', 'Exclusive Seaplane (Day time)'),
  ('854f50a4-31dc-44ba-80b4-78507bca3ef4', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006', 'FS-FSLG-2025', 'TMA101', 'b90a2822-5146-4bc6-8193-1413cd5a2e04', '57aee1f6-06da-4322-8c0f-f0d0d82a1a31', 'CTR-006-002', 'Charter', '2025-06-01', '2027-05-31', 'Charter Agreement'),
  ('9060cc4e-5de5-426c-a394-8306393b1b09', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006', 'FS-FSLG-2025', 'TMA101', 'b90a2822-5146-4bc6-8193-1413cd5a2e04', '57aee1f6-06da-4322-8c0f-f0d0d82a1a31', 'CTR-006-003', 'Signed Charter', '2026-01-01', '2026-12-31', 'Signed Charter Agreement'),
  ('751a7f5c-6eb1-4059-a3f3-28923fbed286', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007', 'FS-FSKH-2025', 'TMA101', 'b90a2822-5146-4bc6-8193-1413cd5a2e04', 'a6635d78-8321-470b-ba54-19fb00ecc897', 'CTR-007-001', 'Transfer', '2025-01-01', '2026-03-10', 'Exclusive Speedboat'),
  ('5e23c4f6-3282-4a58-ae5a-03461ceb868d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007', 'FS-FSKH-2025', 'TMA101', 'b90a2822-5146-4bc6-8193-1413cd5a2e04', 'a6635d78-8321-470b-ba54-19fb00ecc897', 'CTR-007-002', 'Transfer', '2025-01-01', '2026-03-10', 'Exclusive Seaplane (Day time)'),
  ('b015f249-d107-4b91-a15a-f882a23c73a6', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008', 'MINT-AKV-2025', 'TMA101', '00814f5b-b883-4ca7-b853-b2667ab37505', 'c4302238-45ab-437a-8e35-756858676994', 'CTR-008-001', 'Charter', '2025-10-01', '2027-09-30', 'Charter Agreement'),
  ('593fada6-c6da-4a28-bd27-28a0ada37389', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008', 'MINT-AKV-2025', 'TMA101', '00814f5b-b883-4ca7-b853-b2667ab37505', 'c4302238-45ab-437a-8e35-756858676994', 'CTR-008-002', 'Transfer', '2025-10-01', '2026-09-30', 'Exclusive Seaplane (Day time)'),
  ('04bb15d6-9e8a-4631-b7e7-04dae158c4d2', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009', 'MAR-RCFI-2026', 'TMA101', '3878f7f2-c5c5-48c0-9178-4fed0b5ffef5', '7a7a2625-26bd-424d-acbe-9c84fc54ea85', 'CTR-009-001', 'Transfer', '2025-11-01', '2026-10-31', 'Exclusive Speedboat'),
  ('daca0df5-90b1-426b-b6e8-4afd695e1cd0', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010', 'SON-SJ-2024', 'TMA101', '777dac53-12bf-48ef-a913-ac3e14639321', 'a6317543-34f5-4949-96ef-e195ab1aa389', 'CTR-010-001', 'Charter', '2024-03-01', '2025-02-28', 'Charter Agreement'),
  ('7e24aec1-1b96-44df-bfc4-b54406625ab0', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010', 'SON-SJ-2024', 'TMA101', '777dac53-12bf-48ef-a913-ac3e14639321', 'a6317543-34f5-4949-96ef-e195ab1aa389', 'CTR-010-002', 'Transfer', '2024-03-01', '2025-02-28', 'Exclusive Seaplane (Day time)')
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "contract_id" = EXCLUDED."contract_id",
  "contract_code" = EXCLUDED."contract_code",
  "carrier_id" = EXCLUDED."carrier_id",
  "group_id" = EXCLUDED."group_id",
  "resort_id" = EXCLUDED."resort_id",
  "sub_contract_id" = EXCLUDED."sub_contract_id",
  "sub_contract_type" = EXCLUDED."sub_contract_type",
  "start_date" = EXCLUDED."start_date",
  "end_date" = EXCLUDED."end_date",
  "agreement_type" = EXCLUDED."agreement_type";

-- ── pricing_standard (38 rows) ──────────────────────────────
INSERT INTO public.pricing_standard ("id", "created_at", "updated_at", "sub_contract_id", "weekdays", "point_a_id", "point_b_id", "transfer_type", "pax_condition", "passenger_type", "return_fare_usd", "one_way_fare_usd", "start_date", "end_date")
VALUES
  ('b14da057-d399-4899-be81-4d33dd8ac607', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'ebf035b5-c1d1-4e4e-b99a-0fa6b0fcbdb0', 'ebf035b5-c1d1-4e4e-b99a-0fa6b0fcbdb0', 'Seaplane', NULL, 'Adult', 680, 400, '2025-01-01', '2026-03-01'),
  ('28b3c775-48cd-4918-a969-04c08f686eca', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'ebf035b5-c1d1-4e4e-b99a-0fa6b0fcbdb0', 'ebf035b5-c1d1-4e4e-b99a-0fa6b0fcbdb0', 'Seaplane', 'Age 2-11', 'Child', 410, 240, '2025-01-01', '2026-03-01'),
  ('9ed1d6a6-998a-4229-9e78-a82fd61c88b3', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-002', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'ebf035b5-c1d1-4e4e-b99a-0fa6b0fcbdb0', 'ebf035b5-c1d1-4e4e-b99a-0fa6b0fcbdb0', 'Seaplane', NULL, 'Adult', 850, 500, '2025-06-01', '2026-05-31'),
  ('380b1d13-4b52-4dcb-832f-80002d0c81e2', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-002', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'ebf035b5-c1d1-4e4e-b99a-0fa6b0fcbdb0', 'ebf035b5-c1d1-4e4e-b99a-0fa6b0fcbdb0', 'Seaplane', 'Age 2-11', 'Child', 510, 300, '2025-06-01', '2026-05-31'),
  ('f6221ca4-a31e-4d8a-9649-0175d08ad66e', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '42e6bcee-426a-4f7a-877e-20c9962142d5', '42e6bcee-426a-4f7a-877e-20c9962142d5', 'Seaplane', NULL, 'Adult', 620, 370, '2025-03-01', '2027-02-28'),
  ('3bfbc8a4-62b3-4bce-bb74-068e6dd44e4c', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '42e6bcee-426a-4f7a-877e-20c9962142d5', '42e6bcee-426a-4f7a-877e-20c9962142d5', 'Seaplane', 'Age 2-11', 'Child', 370, 220, '2025-03-01', '2027-02-28'),
  ('ffa7bddc-5c19-42f6-b7d0-f6616785e41f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', '8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', 'Seaplane', NULL, 'Adult', 750, 440, '2025-06-01', '2027-05-31'),
  ('b45e1a53-6096-4113-ab42-3ab481f95dcd', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', '8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', 'Seaplane', 'Age 2-11', 'Child', 450, 264, '2025-06-01', '2027-05-31'),
  ('c1998332-6652-4bb8-af08-705527f34209', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-002', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', '8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', 'Seaplane', NULL, 'Adult', 600, 350, '2025-06-01', '2026-12-31'),
  ('f2bac5d1-3cc4-42d5-8eec-1c98d7de11c7', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-002', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', '8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', 'Seaplane', 'Age 2-11', 'Child', 360, 210, '2025-06-01', '2026-12-31'),
  ('86d50382-dd25-4626-8914-2d933aa5e033', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-003', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', '8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', 'Seaplane', NULL, 'Adult', 900, 530, '2025-10-01', '2026-09-30'),
  ('d3ee1b0b-a0ac-4b02-a846-ba2dc54de08d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-003', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', '8c495640-1ad6-4fe8-a0e6-d51bbcc503c9', 'Seaplane', 'Age 2-11', 'Child', 540, 318, '2025-10-01', '2026-09-30'),
  ('3b15c6b6-06c3-4449-8a12-beb871b6bc0b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-004-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'c4b758b0-8279-41c1-9617-c33355bf329a', 'c4b758b0-8279-41c1-9617-c33355bf329a', 'Seaplane', NULL, 'Adult', 740, 440, '2024-01-01', '2024-12-31'),
  ('4bb4d804-c953-42dc-98cb-1b4431a7f5d7', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-004-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'c4b758b0-8279-41c1-9617-c33355bf329a', 'c4b758b0-8279-41c1-9617-c33355bf329a', 'Seaplane', 'Age 2-11', 'Child', 440, 260, '2024-01-01', '2024-12-31'),
  ('afc7be75-aa6a-407c-ba83-5bed3009c8a3', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'bc4b67a6-ea9d-4639-ba7b-e1c4adfbc48c', 'bc4b67a6-ea9d-4639-ba7b-e1c4adfbc48c', 'Seaplane', NULL, 'Adult', 590, 345, '2025-04-01', '2027-03-31'),
  ('db7410da-9808-42b9-944f-e3428493da05', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'bc4b67a6-ea9d-4639-ba7b-e1c4adfbc48c', 'bc4b67a6-ea9d-4639-ba7b-e1c4adfbc48c', 'Seaplane', 'Age 2-11', 'Child', 355, 207, '2025-04-01', '2027-03-31'),
  ('40d1aadf-8cff-47e3-97a4-9e0652422f2a', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-002', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'bc4b67a6-ea9d-4639-ba7b-e1c4adfbc48c', 'bc4b67a6-ea9d-4639-ba7b-e1c4adfbc48c', 'Seaplane', NULL, 'Adult', 780, 460, '2025-11-01', '2026-10-31'),
  ('e847d8ef-871c-4ae4-8dae-8129a24ba758', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-002', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'bc4b67a6-ea9d-4639-ba7b-e1c4adfbc48c', 'bc4b67a6-ea9d-4639-ba7b-e1c4adfbc48c', 'Seaplane', 'Age 2-11', 'Child', 468, 276, '2025-11-01', '2026-10-31'),
  ('f4e61566-b88f-4d58-8269-0f4e866f5d7f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '57aee1f6-06da-4322-8c0f-f0d0d82a1a31', '57aee1f6-06da-4322-8c0f-f0d0d82a1a31', 'Seaplane', NULL, 'Adult', 640, 380, '2025-01-01', '2027-12-31'),
  ('2b8d2669-f2f8-46e7-a579-9d35d4c8817c', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '57aee1f6-06da-4322-8c0f-f0d0d82a1a31', '57aee1f6-06da-4322-8c0f-f0d0d82a1a31', 'Seaplane', 'Age 2-11', 'Child', 385, 228, '2025-01-01', '2027-12-31'),
  ('62d0ec91-c81e-43e9-a888-767a8c0ff75a', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-002', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '57aee1f6-06da-4322-8c0f-f0d0d82a1a31', '57aee1f6-06da-4322-8c0f-f0d0d82a1a31', 'Seaplane', NULL, 'Adult', 820, 485, '2025-06-01', '2027-05-31'),
  ('c3fc00db-7fe1-47d0-a6b2-f0887daddc01', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-002', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '57aee1f6-06da-4322-8c0f-f0d0d82a1a31', '57aee1f6-06da-4322-8c0f-f0d0d82a1a31', 'Seaplane', 'Age 2-11', 'Child', 492, 291, '2025-06-01', '2027-05-31'),
  ('c1cedbd7-b78c-4dbb-81d1-d865723b0da6', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-003', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '57aee1f6-06da-4322-8c0f-f0d0d82a1a31', '57aee1f6-06da-4322-8c0f-f0d0d82a1a31', 'Seaplane', NULL, 'Adult', 950, 560, '2026-01-01', '2026-12-31'),
  ('1d7d4f31-6362-4e97-9e15-5b484e0743b1', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-003', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '57aee1f6-06da-4322-8c0f-f0d0d82a1a31', '57aee1f6-06da-4322-8c0f-f0d0d82a1a31', 'Seaplane', 'Age 2-11', 'Child', 570, 336, '2026-01-01', '2026-12-31'),
  ('4ad253cf-4c59-4d16-a300-8e3e89975f96', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'a6635d78-8321-470b-ba54-19fb00ecc897', 'a6635d78-8321-470b-ba54-19fb00ecc897', 'Speedboat', NULL, 'Adult', 320, 190, '2025-01-01', '2026-03-10'),
  ('90664373-0ec3-4523-9edf-aa9dea7b0069', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'a6635d78-8321-470b-ba54-19fb00ecc897', 'a6635d78-8321-470b-ba54-19fb00ecc897', 'Speedboat', 'Age 2-11', 'Child', 190, 115, '2025-01-01', '2026-03-10'),
  ('631e40e6-447e-4fdf-a766-9dc6d4053f10', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-002', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'a6635d78-8321-470b-ba54-19fb00ecc897', 'a6635d78-8321-470b-ba54-19fb00ecc897', 'Seaplane', NULL, 'Adult', 520, 310, '2025-01-01', '2026-03-10'),
  ('26678c5a-d9dc-49ef-b982-0cfba38d0a7e', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-002', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'a6635d78-8321-470b-ba54-19fb00ecc897', 'a6635d78-8321-470b-ba54-19fb00ecc897', 'Seaplane', 'Age 2-11', 'Child', 312, 186, '2025-01-01', '2026-03-10'),
  ('530a72f9-a1fb-488d-ab0d-479463e9010e', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'c4302238-45ab-437a-8e35-756858676994', 'c4302238-45ab-437a-8e35-756858676994', 'Seaplane', NULL, 'Adult', 660, 390, '2025-10-01', '2027-09-30'),
  ('95dfc946-018f-47b5-9ab5-a2ef28acd1e0', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'c4302238-45ab-437a-8e35-756858676994', 'c4302238-45ab-437a-8e35-756858676994', 'Seaplane', 'Age 2-11', 'Child', 395, 234, '2025-10-01', '2027-09-30'),
  ('9a373d08-80e9-4a00-a556-b391225bee11', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-002', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'c4302238-45ab-437a-8e35-756858676994', 'c4302238-45ab-437a-8e35-756858676994', 'Seaplane', NULL, 'Adult', 580, 340, '2025-10-01', '2026-09-30'),
  ('2e68c8ea-00c4-48f3-94a7-4e6b4693dbcf', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-002', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'c4302238-45ab-437a-8e35-756858676994', 'c4302238-45ab-437a-8e35-756858676994', 'Seaplane', 'Age 2-11', 'Child', 348, 204, '2025-10-01', '2026-09-30'),
  ('ab021eb8-bd6f-400e-a8ca-0edc5115b05b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '7a7a2625-26bd-424d-acbe-9c84fc54ea85', '7a7a2625-26bd-424d-acbe-9c84fc54ea85', 'Speedboat', NULL, 'Adult', 350, 210, '2025-11-01', '2026-10-31'),
  ('edde193d-c8fa-470c-a2b0-72e3ad2bc425', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', '7a7a2625-26bd-424d-acbe-9c84fc54ea85', '7a7a2625-26bd-424d-acbe-9c84fc54ea85', 'Speedboat', 'Age 2-11', 'Child', 210, 125, '2025-11-01', '2026-10-31'),
  ('b70083ef-9379-47c0-b3e9-936131584fb4', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'a6317543-34f5-4949-96ef-e195ab1aa389', 'a6317543-34f5-4949-96ef-e195ab1aa389', 'Seaplane', NULL, 'Adult', 710, 420, '2024-03-01', '2025-02-28'),
  ('f6ef7488-3648-499c-9a6a-152532c8deeb', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-001', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'a6317543-34f5-4949-96ef-e195ab1aa389', 'a6317543-34f5-4949-96ef-e195ab1aa389', 'Seaplane', 'Age 2-11', 'Child', 425, 252, '2024-03-01', '2025-02-28'),
  ('8e38815b-bd86-43fb-814f-55d6df7f699f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-002', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'a6317543-34f5-4949-96ef-e195ab1aa389', 'a6317543-34f5-4949-96ef-e195ab1aa389', 'Seaplane', NULL, 'Adult', 550, 325, '2024-03-01', '2025-02-28'),
  ('fb7d9445-dcb2-409e-9d05-42f071294ad5', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-002', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 'a6317543-34f5-4949-96ef-e195ab1aa389', 'a6317543-34f5-4949-96ef-e195ab1aa389', 'Seaplane', 'Age 2-11', 'Child', 330, 195, '2024-03-01', '2025-02-28')
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "sub_contract_id" = EXCLUDED."sub_contract_id",
  "weekdays" = EXCLUDED."weekdays",
  "point_a_id" = EXCLUDED."point_a_id",
  "point_b_id" = EXCLUDED."point_b_id",
  "transfer_type" = EXCLUDED."transfer_type",
  "pax_condition" = EXCLUDED."pax_condition",
  "passenger_type" = EXCLUDED."passenger_type",
  "return_fare_usd" = EXCLUDED."return_fare_usd",
  "one_way_fare_usd" = EXCLUDED."one_way_fare_usd",
  "start_date" = EXCLUDED."start_date",
  "end_date" = EXCLUDED."end_date";

-- ── pricing_special (20 rows) ──────────────────────────────
INSERT INTO public.pricing_special ("id", "created_at", "updated_at", "sub_contract_id", "request_type", "discount_type", "return_fare_usd", "one_way_fare_usd", "pax_condition", "start_date", "end_date")
VALUES
  ('11f717dc-f999-496d-8608-1632858bfc47', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Management', 'Percentage', 100, 100, 'Hotel GM and above', '2025-01-01', '2026-03-01'),
  ('e6a09bcd-21dc-4c4d-95fb-2e9b53a009b7', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Staff', 'Absolute', 150, 90, 'Resort staff with valid ID', '2025-01-01', '2026-03-01'),
  ('699ce08a-3f8f-4be6-b7ae-51714b4b5632', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-002', 'VIP Guest', 'Percentage', 80, 80, 'Platinum loyalty members', '2025-06-01', '2026-05-31'),
  ('69a3abc7-cc92-4650-8da0-91f9db0b9c76', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', 'FAM trips', 'Percentage', 50, 50, 'Approved travel agents only', '2025-03-01', '2027-02-28'),
  ('132edc10-ee01-4f2c-8c0a-caa2dcdaf811', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Management', 'Percentage', 100, 100, 'Soneva executives', '2025-06-01', '2027-05-31'),
  ('79834d0e-835c-4662-9c62-ea5221057102', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Journalists', 'Percentage', 75, 75, 'Pre-approved media only', '2025-06-01', '2027-05-31'),
  ('2becd8f6-84ac-4055-ae79-43d162b885aa', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-002', 'Staff', 'Absolute', 120, 70, 'Soneva staff', '2025-06-01', '2026-12-31'),
  ('3744239a-e3e6-4df4-ad4f-afe10c877806', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-003', 'Management', 'Percentage', 100, 100, 'Soneva board members', '2025-10-01', '2026-09-30'),
  ('0f882d89-d3a7-40ed-8ac9-2ae1cd3aba80', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-001', 'Tour Operators', 'Absolute', 490, 285, 'Min 10 pax per group', '2025-04-01', '2027-03-31'),
  ('c0d8a6de-11bb-4a75-99b7-8c095e85b5c0', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-002', 'Management', 'Percentage', 100, 100, 'Marriott VP and above', '2025-11-01', '2026-10-31'),
  ('6b3e9f74-2b1d-4c4c-a1db-2fb0b42ea8a8', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Management', 'Percentage', 100, 100, 'FS executives', '2025-01-01', '2027-12-31'),
  ('6ed05daa-d443-492a-a012-d799176637ad', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Staff', 'Absolute', 160, 95, 'Resort staff', '2025-01-01', '2027-12-31'),
  ('0bac89b3-5f02-4ce1-b4d8-e44404837d85', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'FAM trips', 'Percentage', 50, 50, 'Approved agents', '2025-01-01', '2027-12-31'),
  ('440031ac-e24e-4b9a-9026-e8a02a27e908', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-002', 'Journalists', 'Percentage', 70, 70, 'Accredited media', '2025-06-01', '2027-05-31'),
  ('0c762f0d-b233-497c-8ac5-b7004ee3bbc8', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-003', 'VIP Guest', 'Percentage', 85, 85, 'FS Private Jet guests', '2026-01-01', '2026-12-31'),
  ('a1a7ab30-fb87-4525-9dc8-db84837d8057', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Management', 'Percentage', 100, 100, 'Minor Hotels executive team', '2025-10-01', '2027-09-30'),
  ('deb4acad-764d-4e62-8d28-38ed1f1186bb', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Tour Guides', 'Absolute', 200, 120, 'Licensed Maldives tour guides', '2025-10-01', '2027-09-30'),
  ('1926d4be-76c6-4626-a248-cffe755a5b70', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-002', 'Staff', 'Absolute', 140, 85, 'Anantara resort staff', '2025-10-01', '2026-09-30'),
  ('30d0d506-39c6-4c13-8915-266b045908b3', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', 'Staff', 'Absolute', 100, 60, 'RC staff with employee badge', '2025-11-01', '2026-10-31'),
  ('379229b6-7a17-4a2e-ac74-a09a189016d1', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', 'Advertisers', 'Percentage', 60, 60, 'Approved brand partners', '2025-11-01', '2026-10-31')
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "sub_contract_id" = EXCLUDED."sub_contract_id",
  "request_type" = EXCLUDED."request_type",
  "discount_type" = EXCLUDED."discount_type",
  "return_fare_usd" = EXCLUDED."return_fare_usd",
  "one_way_fare_usd" = EXCLUDED."one_way_fare_usd",
  "pax_condition" = EXCLUDED."pax_condition",
  "start_date" = EXCLUDED."start_date",
  "end_date" = EXCLUDED."end_date";

-- ── contract_baggage (26 rows) ──────────────────────────────
INSERT INTO public.contract_baggage ("id", "created_at", "updated_at", "sub_contract_id", "parameter", "value", "remark")
VALUES
  ('ebf84ed7-404c-479b-a30e-1fcf2043e458', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Checked baggage', '25 kg per adult', 'Soft bags preferred for seaplane'),
  ('f4b71d83-02be-49cb-b4c1-e701e3ba7d75', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Hand baggage', '5 kg per person', 'Must fit under seat'),
  ('a595f4a3-19ff-4c4a-b0cf-e411f2fea647', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-002', 'Checked baggage', '30 kg per adult', 'Charter premium allowance'),
  ('4ef5ecb6-bdef-4b62-bd64-ad87c752f4d4', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-002', 'Hand baggage', '7 kg per person', 'Charter cabin allowance'),
  ('b25d4e3e-35b0-4865-a04b-833a0fca6ea4', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', 'Checked baggage', '25 kg per adult', 'Hard cases accepted'),
  ('a48c83bb-311a-44e4-8b5f-27b07bef98fd', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', 'Hand baggage', '5 kg per person', NULL),
  ('e93222ce-dcf6-4234-adb0-31dd414c0ef8', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Checked baggage', '32 kg per adult', 'Soneva charter allows heavier luggage'),
  ('f5d96080-3668-47b2-a60f-d73b0944e3ae', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Excess baggage', '$5 per kg', 'Payable at check-in counter'),
  ('c518b1dd-b9b7-4a52-8a17-45a812d9d5b1', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-002', 'Checked baggage', '25 kg per adult', 'Standard seaplane allowance'),
  ('5b529956-79b4-4b2b-8266-67e23d1985e4', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-003', 'Checked baggage', '35 kg per adult', 'Signed charter premium'),
  ('70839751-266c-4c0a-a4b7-701c2cda8b8d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-003', 'Sports equipment', 'Pre-approval required', 'Diving, surfing gear'),
  ('e1f87001-39e6-46d6-accf-fe9a925247e0', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-001', 'Checked baggage', '25 kg per adult', 'Standard allowance'),
  ('1135d22a-aa39-4df2-848d-5e463e8d9a96', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-002', 'Checked baggage', '30 kg per adult', 'Charter allowance'),
  ('40720f58-4a75-4a0a-8846-c89690fa8f95', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Checked baggage', '25 kg per adult', 'Soft bags strongly preferred'),
  ('6c0758d5-f93f-4595-9fe9-2a30ac4ad5f5', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Hand baggage', '5 kg per person', NULL),
  ('bd98f0f5-2019-431b-ad27-06b8cb46c7a2', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Excess baggage', '$6 per kg', 'Subject to availability'),
  ('d9e4d391-a7d3-4394-91b8-b2d96216610d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-002', 'Checked baggage', '30 kg per adult', 'Charter allowance'),
  ('56ea5719-698a-4272-9552-aebd73b58b20', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-003', 'Checked baggage', '35 kg per adult', 'Signed charter premium'),
  ('2b5e6c82-6300-4430-a9f3-3559ad99d019', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-001', 'Checked baggage', '20 kg per adult', 'Speedboat weight restrictions'),
  ('0085bbdb-0f5e-447c-9275-dccbfcec455b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-002', 'Checked baggage', '25 kg per adult', 'Standard seaplane'),
  ('3ca3ea1a-7866-48d0-81f5-1204004af70b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Checked baggage', '32 kg per adult', 'Charter premium allowance'),
  ('5e392451-e0df-46b0-9b5c-44a9ec8ce1af', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Sports equipment', 'Pre-approval required', 'Surfboards, dive gear etc.'),
  ('4fcc4a2e-5c24-4bf7-9bdb-603fa8fbb47b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-002', 'Checked baggage', '25 kg per adult', 'Standard seaplane'),
  ('208744eb-a9e0-4e31-87de-5781a9c7d970', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', 'Checked baggage', '20 kg per adult', 'Speedboat transfer'),
  ('c8f3f8fc-b6c8-4c2b-9be5-4ba70553bc3d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-001', 'Checked baggage', '30 kg per adult', 'Soneva charter allowance'),
  ('a3eac25c-d454-4c3a-b148-eefd4de523d7', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-002', 'Checked baggage', '25 kg per adult', 'Standard seaplane')
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "sub_contract_id" = EXCLUDED."sub_contract_id",
  "parameter" = EXCLUDED."parameter",
  "value" = EXCLUDED."value",
  "remark" = EXCLUDED."remark";

-- ── contract_booking (23 rows) ──────────────────────────────
INSERT INTO public.contract_booking ("id", "created_at", "updated_at", "sub_contract_id", "parameter", "value", "remark")
VALUES
  ('26ee8ef8-d433-40cb-8a0b-c3a941aa7efa', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Advance booking', '48 hours minimum', 'Peak season may require 72 hours'),
  ('f5666ed6-33d2-4fbb-a520-2a9f8ff74936', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Cancellation', '24 hours before departure', 'No-show fee: 50% of fare'),
  ('027fe6a0-6a2b-4055-aa5b-fc0c3ae52b6d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-002', 'Charter booking', '72 hours minimum', 'Full manifest required 24h before'),
  ('4f3f59d8-07d4-4908-838e-4748cce530d6', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', 'Advance booking', '48 hours minimum', NULL),
  ('28e10377-afe7-4efe-9e56-8d31398ea364', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', 'Cancellation', '24 hours before departure', '100% refund if cancelled 48h prior'),
  ('912a5ca0-b383-4da3-aa67-8c6577940bbf', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Charter booking', '72 hours minimum', 'Full manifest required 24h before'),
  ('c3d40983-40a5-4e24-ae83-475ff6438939', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-002', 'Advance booking', '48 hours minimum', NULL),
  ('4e0d4549-e0ad-45f3-b5c0-c72a9085f0c2', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-003', 'Signed charter booking', '96 hours minimum', 'Requires Soneva GM approval'),
  ('21ec8eae-0ce6-4fa2-9afc-c46d09ff7f7a', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-001', 'Advance booking', '48 hours minimum', NULL),
  ('d7f571fd-09b7-4159-811a-86794b13b5dd', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-002', 'Charter booking', '72 hours minimum', 'Marriott group coordination'),
  ('7711da02-8693-477c-a552-66c40ea5239d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Advance booking', '48 hours minimum', 'Online portal booking available'),
  ('f73df0c9-3d99-40eb-98f0-08febf5a87e8', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Cancellation', '24 hours before departure', 'No-show fee: 50% of fare'),
  ('e15739d9-7399-4508-a6e2-0a49ceeebe25', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Amendment', 'Free up to 12h before', 'Name changes $25 per pax'),
  ('1528b98f-cc21-4958-8fef-75c3637b81d5', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-002', 'Charter booking', '72 hours minimum', 'Full manifest 48h before'),
  ('055f1d09-38b7-44ec-989d-4151b343353e', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-003', 'Signed charter booking', '96 hours minimum', 'FS Regional approval required'),
  ('3eb2d448-9ed1-40fc-b979-df7ab9315c2c', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-001', 'Advance booking', '24 hours minimum', 'Speedboat more flexible'),
  ('9d659a3d-6add-4444-94b3-f62dbac29d5e', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-002', 'Advance booking', '48 hours minimum', 'Seaplane requires more notice'),
  ('4a390d7d-80a3-400d-a386-67e3a7b4d3b5', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Charter booking', '72 hours minimum', 'Full pax manifest 48h before'),
  ('6c83ee1b-02f2-4f6b-bafa-09c5be73731f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Cancellation', '48 hours before departure', '50% penalty for late cancel'),
  ('dad4d58c-f73b-4f28-9fb4-390d2c7a59da', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-002', 'Advance booking', '48 hours minimum', NULL),
  ('57308cbc-eba8-435b-9af6-d86f3ec60ccd', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', 'Advance booking', '24 hours minimum', 'Speedboat schedule'),
  ('f3fad190-ac88-4191-a358-1face13fc55f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-001', 'Charter booking', '72 hours minimum', 'Soneva concierge handles'),
  ('eee1bbd0-5680-4c21-bf5f-a8fa1403949b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-002', 'Advance booking', '48 hours minimum', NULL)
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "sub_contract_id" = EXCLUDED."sub_contract_id",
  "parameter" = EXCLUDED."parameter",
  "value" = EXCLUDED."value",
  "remark" = EXCLUDED."remark";

-- ── contract_age (38 rows) ──────────────────────────────
INSERT INTO public.contract_age ("id", "created_at", "updated_at", "sub_contract_id", "type", "min_age", "max_age")
VALUES
  ('c7acfe7c-8893-4903-b540-968a4ab89519', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Adult', 12, NULL),
  ('d36f53dd-20ed-4f97-a407-df450e8cd48f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Child', 2, 11),
  ('a5345232-5c81-4c0e-832c-72bd10ca6330', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-002', 'Adult', 12, NULL),
  ('59c2af63-2444-4f6b-9cd3-f5c5e6b32112', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-002', 'Child', 2, 11),
  ('fc9e72f0-9ad9-46be-8113-75fc3c463c18', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', 'Adult', 12, NULL),
  ('8b999cda-ddc3-4168-aed9-d2912caf27c3', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', 'Child', 2, 11),
  ('7196a4be-1cb3-4146-80e6-e9aae903d25b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Adult', 12, NULL),
  ('eef18aef-59e6-45db-8927-f5d6b8ad17b9', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Child', 2, 11),
  ('3b134594-b7cc-4d61-b8c2-1766635d71c3', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-002', 'Adult', 12, NULL),
  ('c4fb038a-7e04-417b-9c05-148de6c966ee', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-002', 'Child', 2, 11),
  ('9719d4cd-85ce-4f54-9837-69b4c8d2865c', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-003', 'Adult', 12, NULL),
  ('3e6ba279-841d-445e-ad66-ec0d75a795b6', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-003', 'Child', 2, 11),
  ('8ee1c0af-079e-47f8-8051-351074285431', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-004-001', 'Adult', 12, NULL),
  ('56e29561-bcf6-461a-b5ad-2da0a1b48e62', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-004-001', 'Child', 2, 11),
  ('2755a0e4-66c5-4aca-ad1e-59525be5e2da', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-001', 'Adult', 12, NULL),
  ('b85c5289-9cf3-4d7b-aac4-18929d6d168f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-001', 'Child', 2, 11),
  ('86e392f1-3616-41e2-b1a9-1953abf97ea3', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-002', 'Adult', 12, NULL),
  ('54e24af4-3791-4056-8f22-c052c5465336', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-002', 'Child', 2, 11),
  ('9bfae15c-66d7-4b8e-996f-c871654272ee', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Adult', 12, NULL),
  ('74284e75-7a36-4f8d-9844-a04551184e4b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Child', 2, 11),
  ('45b07b4c-34d2-429c-a7d6-e7a9ed632548', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-002', 'Adult', 12, NULL),
  ('d21ce1ae-0512-4aad-8a05-d8602b6897ab', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-002', 'Child', 2, 11),
  ('9cfd86b3-29f4-4677-b914-c03b384689cc', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-003', 'Adult', 12, NULL),
  ('0ee24022-3c5a-4021-a691-ad42da368337', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-003', 'Child', 2, 11),
  ('1dc9e3d1-d427-400f-a3c0-65b0b9942c86', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-001', 'Adult', 13, NULL),
  ('e5c192ca-eb15-4a24-94ef-93c12fae420b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-001', 'Child', 2, 12),
  ('c6c40f0c-1c30-48e1-a4a7-301455e74c94', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-002', 'Adult', 13, NULL),
  ('f156f758-7455-4bf1-ae30-f0b1cde6e3a7', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-002', 'Child', 2, 12),
  ('4e4dbe7b-c72f-43f5-8f67-23c5172966fa', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Adult', 12, NULL),
  ('f725a8c8-d6d1-4c6d-bf89-1007bd7b578a', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Child', 2, 11),
  ('d01141e2-e9ff-4069-8428-d1858056beb7', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-002', 'Adult', 12, NULL),
  ('dc93633b-e976-4ed5-b780-cc33c4c160d1', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-002', 'Child', 2, 11),
  ('33f280c9-fcc2-4e80-8bd7-4112cf190732', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', 'Adult', 12, NULL),
  ('83f6a2d6-37f1-434a-884a-28e8c0b495f8', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', 'Child', 2, 11),
  ('1a17d5c3-0a52-4f5f-8f29-88d35e90d352', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-001', 'Adult', 12, NULL),
  ('877f8af8-5fb9-432a-93e0-6c5966da4bad', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-001', 'Child', 2, 11),
  ('cbce127f-0a7b-4bf2-a9d4-ad5d71109534', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-002', 'Adult', 12, NULL),
  ('7a8f4f12-fab9-4c94-8281-3362134ce14c', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-002', 'Child', 2, 11)
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "sub_contract_id" = EXCLUDED."sub_contract_id",
  "type" = EXCLUDED."type",
  "min_age" = EXCLUDED."min_age",
  "max_age" = EXCLUDED."max_age";

-- ── contract_addons (16 rows) ──────────────────────────────
INSERT INTO public.contract_addons ("id", "created_at", "updated_at", "sub_contract_id", "sub_category", "type", "value", "remark")
VALUES
  ('7ddb91dd-af4a-4af5-bea7-8ab21dcdfd5c', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Dedicated Vehicle', 'VIP Lounge Access', 150, 'Velana Airport VIP terminal'),
  ('93742c9d-ef2f-4e05-aea8-e0e2b172c5b2', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Dedicated Vehicle', 'Airport Transfer SUV', 85, 'Airport to seaplane terminal'),
  ('3745e457-5513-477d-9d4f-dae48dbfeb92', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-002', 'Photography', 'Aerial Photography Package', 400, 'Charter scenic flight with photographer'),
  ('26fe8707-6695-481a-8bc3-3aad108fdcf2', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Dedicated Vehicle', 'VIP Lounge Access', 200, 'Private charter lounge'),
  ('89a08344-e343-44f9-806f-7f9ad7326402', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-003', 'Dedicated Vehicle', 'Luxury Transfer', 300, 'Yacht transfer from airport'),
  ('b7b65883-8b55-4f08-a8bd-1b68003ae3df', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-001', 'Dedicated Vehicle', 'Airport Transfer SUV', 85, NULL),
  ('7310acbf-fdfa-4460-bfd3-62a5de9fdaa1', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-002', 'Dedicated Vehicle', 'VIP Lounge Access', 175, 'Marriott Bonvoy Platinum lounge'),
  ('a3eddab7-e847-4b9e-a137-764bc85658b0', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Dedicated Vehicle', 'VIP Lounge Access', 175, 'TMA Lounge included for suites'),
  ('55bc317b-7721-47c4-8a97-791d7261e0c1', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Dedicated Vehicle', 'Airport Transfer SUV', 90, 'Meet & greet included'),
  ('6757589b-f0e9-4ca6-810d-48563e732a9a', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-002', 'Photography', 'Aerial Photography Package', 350, '20-minute scenic flight with photographer'),
  ('5c71346c-172f-4603-8f9d-51c60340be15', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-003', 'Dedicated Vehicle', 'Luxury Yacht Transfer', 500, 'Signed charter luxury option'),
  ('a794b50c-47c9-4bf3-be52-91dddbf66325', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Dedicated Vehicle', 'VIP Lounge Access', 180, 'Anantara lounge'),
  ('a7c33d1f-7b56-4aaf-9cbd-ba793485fe4c', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Dedicated Vehicle', 'Airport Transfer Van', 60, 'Group transfer vehicle'),
  ('c4706d88-66a7-44ba-a0d4-e2d949f05bd1', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-002', 'Photography', 'Sunset Scenic Flight', 280, '30-min scenic flight at golden hour'),
  ('c6d3c821-590b-417a-a39f-a6c7f3e30857', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', 'Dedicated Vehicle', 'Luxury Speedboat Upgrade', 250, 'Private yacht-style transfer'),
  ('9ea7c4b6-d16a-486c-929d-95320a8676bd', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-001', 'Dedicated Vehicle', 'VIP Lounge Access', 190, 'Soneva private lounge')
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "sub_contract_id" = EXCLUDED."sub_contract_id",
  "sub_category" = EXCLUDED."sub_category",
  "type" = EXCLUDED."type",
  "value" = EXCLUDED."value",
  "remark" = EXCLUDED."remark";

-- ── contract_insurance (19 rows) ──────────────────────────────
INSERT INTO public.contract_insurance ("id", "created_at", "updated_at", "sub_contract_id", "parameter", "value", "remark")
VALUES
  ('b849968c-c12c-410d-919e-011849ceb220', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Insurance cover', 'Yes', 'Included in fare'),
  ('be40e6c9-1fe7-46f3-950c-56af609cf921', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-002', 'Insurance cover', 'Yes', 'Standard cover'),
  ('4b7b502a-77fc-4733-add4-18291cdf6844', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', 'Insurance cover', 'Yes', 'Standard cover'),
  ('de9366ca-d8fa-4889-9b9f-32fd19d7da1f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Insurance cover', 'Yes', 'Included in fare'),
  ('92d0ace3-91ca-48e9-ad85-05ac12c849e9', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-002', 'Insurance cover', 'Yes', 'Standard cover'),
  ('0226721c-9b76-41c0-b8cc-7d49781a43b7', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-003', 'Insurance cover', 'Yes', 'Included in fare'),
  ('ccded64d-a555-48b5-bdb4-3f4338527b22', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-004-001', 'Insurance cover', 'Yes', 'Included in fare'),
  ('7e6d746e-196f-4e00-bd53-ac07c818fdb2', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-001', 'Insurance cover', 'Yes', 'Included in fare'),
  ('4712cb71-e3a8-45a7-9882-3991befb6dab', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-002', 'Insurance cover', 'Yes', 'Standard cover'),
  ('d4d1ee88-a512-4a8b-bca2-0e19dd18a0ce', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Insurance cover', 'Yes', 'Included in fare'),
  ('a7f10841-45ae-47ef-8c0b-602b37abc5b2', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-002', 'Insurance cover', 'Yes', 'Standard cover'),
  ('07833196-7bf9-4fd3-9d87-b26493174609', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-003', 'Insurance cover', 'Yes', 'Included in fare'),
  ('4c7dfe88-8da7-4ca5-9d50-e65005870c50', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-001', 'Insurance cover', 'Yes', 'Marine transit coverage'),
  ('8537cc7b-dc89-4188-8886-41b65876c27a', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-002', 'Insurance cover', 'Yes', 'Marine transit coverage'),
  ('714484e4-1a96-4928-a961-c881076b2c10', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Insurance cover', 'Yes', 'Included in fare'),
  ('7c3aadf3-3003-4d4d-9e0b-761a39f9281e', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-002', 'Insurance cover', 'Yes', 'Standard cover'),
  ('6df1ca0a-adc7-4356-8836-1560dc76d615', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', 'Insurance cover', 'Yes', 'Included in fare'),
  ('4e19c577-4b93-4bd1-8321-06eda109cd06', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-001', 'Insurance cover', 'No', 'Resort arranges own cover'),
  ('c0d63f15-cae8-4321-b4ae-2067fb49e95d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-002', 'Insurance cover', 'Yes', 'Included in fare')
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "sub_contract_id" = EXCLUDED."sub_contract_id",
  "parameter" = EXCLUDED."parameter",
  "value" = EXCLUDED."value",
  "remark" = EXCLUDED."remark";

-- ── contract_government_charges (19 rows) ──────────────────────────────
INSERT INTO public.contract_government_charges ("id", "created_at", "updated_at", "sub_contract_id", "parameter", "value", "remark")
VALUES
  ('68298850-cf51-4338-8a31-b344269a7197', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('777b2047-7507-4674-94c5-4aa2eeb24587', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-002', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('11df087b-673e-444c-8236-31e9aa8fea67', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('1bff4627-bf72-4d2c-869f-e9692103b6f5', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('8d103063-493a-4fcc-9afa-72cd4344dda2', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-002', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('fbfea8fa-7e37-4302-9e8c-4b9da9fcb1d3', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-003', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('2e9fbb80-08c5-460e-bc4e-9d9c82cb1dd7', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-004-001', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('814cc44e-2800-4e16-8edf-1f6de58f1ecb', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-001', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('63bcb46d-f0c8-49c9-888b-152c7de85629', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-002', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('a04efa8e-7869-43d7-816c-bfedffefba2e', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('0d324c6c-b306-4a9c-9d1a-196f1b96125d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-002', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('39f909e9-4642-48bd-a7b8-eeebf45e0055', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-003', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('e8545051-87a6-403b-a792-8ac586a6caf3', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-001', 'Government_charges', 2, 'Speedboat lower levy'),
  ('b5f9efad-c4ed-4009-b4d1-2ac0c58449be', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-002', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('f394e4a5-2878-47a2-bd52-028ecdd699f0', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('6a339645-b8e9-46fe-b358-7ed166e600b9', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-002', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('0ca0e74c-e3ab-4b26-a58b-ead0d5a4700f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', 'Government_charges', 2, 'Speedboat lower levy'),
  ('dfded33e-6e95-4bf2-9a46-88af0306ce59', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-001', 'Government_charges', 3.5, 'Return per pax excluding GST'),
  ('26c7a169-541b-4d09-8827-99f57605c6ec', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-002', 'Government_charges', 3.5, 'Return per pax excluding GST')
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "sub_contract_id" = EXCLUDED."sub_contract_id",
  "parameter" = EXCLUDED."parameter",
  "value" = EXCLUDED."value",
  "remark" = EXCLUDED."remark";

-- ── contract_fuel (18 rows) ──────────────────────────────
INSERT INTO public.contract_fuel ("id", "created_at", "updated_at", "sub_contract_id", "type", "value", "remark")
VALUES
  ('74b1ee3f-d701-4a98-a6ae-0e0d0e79a09d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Fuel surcharge', 'Included', 'Bundled into transfer fare'),
  ('204bcafa-e56d-4ec0-9ea0-19998ba6d019', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-002', 'Fuel surcharge', '$48 per flight hour', 'Charter fuel variable'),
  ('1089e4c1-7022-4470-86fc-0a67ee7c461e', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', 'Fuel surcharge', 'Included', 'Bundled into fare'),
  ('0bb869a3-7727-4d7f-922d-893fb8abf2a5', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Fuel surcharge', '$45 per flight hour', 'Variable based on Platts index'),
  ('03aef89d-d7a0-4a22-9766-a623e8b6bf10', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-002', 'Fuel surcharge', 'Included', 'Bundled into fare'),
  ('960f97d2-de98-407b-96af-2a0683bbc331', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-003', 'Fuel surcharge', '$52 per flight hour', 'Signed charter premium rate'),
  ('11ac1ad7-235f-4bc1-9222-12b1233ee62a', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-001', 'Fuel surcharge', 'Included', 'Bundled'),
  ('706cc27b-e553-4e5c-a8de-e487dcb4b7ce', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-002', 'Fuel surcharge', '$46 per flight hour', 'Charter rate'),
  ('c46f568a-9c45-4cd4-b099-399f08076fef', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Fuel surcharge', 'Included', 'Bundled into transfer fare'),
  ('0a975d17-0dc0-4cac-b2c9-897e6a98617b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-002', 'Fuel surcharge', '$47 per flight hour', 'Charter fuel'),
  ('3f62f105-444e-4141-9f53-82a68a866a1d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-003', 'Fuel surcharge', '$55 per flight hour', 'Signed charter premium'),
  ('25d63e04-62d1-489e-9904-7c6babb8294b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-001', 'Fuel surcharge', '$15 per trip', 'Speedboat fuel levy'),
  ('f4b4224c-dfd8-4b31-86e1-1c1474d4bacf', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-002', 'Fuel surcharge', 'Included', 'Seaplane fare inclusive'),
  ('1cbf07e1-81a2-4423-bb0b-f7200f251cf2', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Fuel surcharge', '$50 per flight hour', 'Reviewed quarterly'),
  ('5c253bd0-25b4-4396-aada-cf895f99e546', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-002', 'Fuel surcharge', 'Included', 'Bundled'),
  ('2c2f5f06-31b2-4693-b44f-b2bf3f8aa74d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', 'Fuel surcharge', '$15 per trip', 'Speedboat fuel levy'),
  ('a395032e-bfc2-421b-b7bd-94c678845e80', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-001', 'Fuel surcharge', '$40 per flight hour', 'Based on Platts Singapore'),
  ('fe4112a8-16a8-42d1-9243-37c68d1b50bf', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-002', 'Fuel surcharge', 'Included', 'Bundled')
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "sub_contract_id" = EXCLUDED."sub_contract_id",
  "type" = EXCLUDED."type",
  "value" = EXCLUDED."value",
  "remark" = EXCLUDED."remark";

-- ── contract_payment_plan (22 rows) ──────────────────────────────
INSERT INTO public.contract_payment_plan ("id", "created_at", "updated_at", "sub_contract_id", "parameter", "value", "remark")
VALUES
  ('b676824d-8088-46b1-af0e-3dabeda92892', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Payment terms', 'Net 30 days', 'Monthly invoice cycle'),
  ('4d803241-4d32-4c71-8099-5c23ac12d9ec', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Payment method', 'Bank transfer / Wire', 'USD account at BML'),
  ('dd23ce50-4507-4d7d-9e53-ff2a816d976d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-002', 'Payment terms', 'Net 15 days', 'Charter prepayment'),
  ('9666c103-5af5-40de-9704-e87aea932cfc', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', 'Payment terms', 'Net 30 days', 'Monthly billing'),
  ('46eb0685-1f5a-4ade-9bac-cd0e61d78ef9', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Payment terms', 'Net 15 days', 'Charter prepayment required'),
  ('fceb5e73-0b09-4222-bd58-312f9cca3645', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-002', 'Payment terms', 'Net 30 days', 'Monthly billing'),
  ('e60fd999-b159-41a1-be93-c6fca5b93c6b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-003', 'Payment terms', 'Prepaid', 'Full payment before flight'),
  ('bfb49c5d-791c-49dd-bf91-edce1b8cdd5b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-001', 'Payment terms', 'Net 30 days', 'Standard Marriott terms'),
  ('b4e1fc0f-7855-41b4-8430-800dcc69902a', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-002', 'Payment terms', 'Net 15 days', 'Charter prepayment'),
  ('4fe42f39-a036-4e5f-990f-6a4842dbb60b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Payment terms', 'Net 30 days', 'Monthly invoice to FS finance'),
  ('e520c10a-e14c-4d6d-b21f-e7fd8ae63ee2', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Payment method', 'Bank transfer / Wire', 'USD or EUR accepted'),
  ('e2eb41f9-e483-4151-afb0-bf1a61b6c72b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Late payment', '1.5% per month', 'Applied after 45 days'),
  ('63abc6e2-2bf4-4389-8d0c-a96753b99614', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-002', 'Payment terms', 'Net 15 days', 'Charter invoice'),
  ('35ce2e24-eaeb-4701-983b-5872f1f56751', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-003', 'Payment terms', 'Prepaid', 'Full payment 48h before'),
  ('d64d714a-eeb7-4c20-b010-83e20c744247', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-001', 'Payment terms', 'Net 30 days', NULL),
  ('3b8746a6-bf61-4b65-89cc-7395004106b8', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-002', 'Payment terms', 'Net 30 days', NULL),
  ('a9a4e993-fb0b-496e-8918-901d319e8b82', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Payment terms', 'Net 15 days', 'Charter prepayment'),
  ('6fc7e2e6-b5fa-4579-8ff2-13d057ec289b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Deposit', '20% upfront', 'Balance on monthly invoice'),
  ('c50e10ae-4096-4bc3-a921-1a8826b4a87c', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-002', 'Payment terms', 'Net 30 days', 'Standard transfer billing'),
  ('69c52de7-2e11-43bf-a587-c3168d02d71a', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', 'Payment terms', 'Net 30 days', 'Marriott centralized billing'),
  ('a69666fd-f899-41cf-b62b-8d0d962457b7', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-001', 'Payment terms', 'Net 15 days', 'Charter prepayment'),
  ('1bc68fbf-a433-40d8-9ddb-dc8163402458', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-002', 'Payment terms', 'Net 30 days', 'Monthly billing')
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "sub_contract_id" = EXCLUDED."sub_contract_id",
  "parameter" = EXCLUDED."parameter",
  "value" = EXCLUDED."value",
  "remark" = EXCLUDED."remark";

-- ── contract_service_commitment (26 rows) ──────────────────────────────
INSERT INTO public.contract_service_commitment ("id", "created_at", "updated_at", "sub_contract_id", "parameter", "value", "remark")
VALUES
  ('4a7f40d6-d8a9-4f9b-b9ba-58a50ff52363', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Operating hours', '06:00 - 16:30', 'Daylight seaplane operations'),
  ('bfd72f38-61b6-477f-8073-c700c2fb025a', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Guaranteed seats', '40 seats/day', 'Peak season Nov-Apr'),
  ('e1f23ab5-a967-4cef-82d5-d0212bbc6e22', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-002', 'Dedicated aircraft', '1 DHC-6 Twin Otter', 'Charter dedicated asset for WAI'),
  ('9f86ea43-ff12-45ff-b27d-772bffc96f9f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', 'Operating hours', '06:00 - 16:30', 'Standard daylight hours'),
  ('46b67179-0acf-474c-8146-62d4185b28e5', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', 'Guaranteed seats', '30 seats/day', 'Peak season'),
  ('ddf2f0a6-aa12-4850-8c9e-77b31876ba9f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Dedicated aircraft', '1 DHC-6 Twin Otter', 'Soneva charter dedicated asset'),
  ('fb799a65-15bb-4891-b7d5-029b00f77e5b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Operating hours', '06:00 - 16:30', NULL),
  ('3f3d480a-40ca-4f31-8db5-5b42e45e1574', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-002', 'Operating hours', '06:00 - 16:30', 'Daylight operations'),
  ('065f0615-ffaf-43b4-80b7-43713741a984', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-003', 'Dedicated aircraft', '1 DHC-6 Twin Otter (Premium)', 'Signed charter luxury interior'),
  ('26d94d42-4eb6-451d-acd5-c8148608b542', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-001', 'Operating hours', '06:00 - 16:30', NULL),
  ('a6ed98af-d61b-4ef7-b586-2c113e4d2585', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-002', 'Dedicated aircraft', '1 DHC-6 Twin Otter', 'Patina charter'),
  ('a730bbaf-6102-43b9-a2b8-8f95994daa0c', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Operating hours', '06:00 - 16:30', 'Daylight operations only'),
  ('e1a67acb-cf65-4e97-b2a6-b826910e9b6d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Guaranteed seats', '50 seats/day', 'Peak season commitment'),
  ('6f766952-8f16-47b6-b48e-379da2a00f43', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Response time', '2 hours', 'Booking confirmation SLA'),
  ('03dc7ad3-8328-405d-addc-017a0b6cab0d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-002', 'Dedicated aircraft', '1 DHC-6 Twin Otter', 'FS Landaa charter asset'),
  ('85836a9b-7ddd-4cf7-a636-505a60b7dea7', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-003', 'Dedicated aircraft', '1 DHC-6 Twin Otter (VIP)', 'VIP configured cabin'),
  ('9f8c01e9-c594-4240-ae6c-6bef9f3d07c1', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-001', 'Operating hours', '06:00 - 22:00', 'Speedboat extended hours'),
  ('531700a7-b062-41a6-a9a8-d16642b216eb', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-001', 'Frequency', 'Every 30 minutes', 'Peak hours 07:00-10:00, 14:00-17:00'),
  ('5a84d718-69f3-49ce-bd81-27684d0ca7f2', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-002', 'Operating hours', '06:00 - 16:30', 'Seaplane daylight only'),
  ('568e0ef7-a185-4619-b962-7103a5f1c658', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Dedicated aircraft', '1 DHC-6 Twin Otter', 'Charter asset for Anantara'),
  ('28e1e26b-ae82-4e3c-a9a8-2eca20e7fa00', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Operating hours', '06:00 - 16:30', NULL),
  ('f8cf952b-2326-4bbe-b18e-d1ed8b27c69e', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-002', 'Operating hours', '06:00 - 16:30', 'Standard seaplane hours'),
  ('b23cffc0-d74e-46fd-9225-9387b86d7c46', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', 'Operating hours', '06:00 - 22:00', 'Speedboat schedule'),
  ('c4a88b2f-4151-443a-a3e3-69e717c96bd8', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', 'Frequency', 'Every 45 minutes', 'Fixed schedule'),
  ('ee31cf57-effb-48f0-9248-4aa9fffafb41', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-001', 'Dedicated aircraft', '1 DHC-6 Twin Otter', 'Soneva dedicated charter'),
  ('21b5d7ee-eaaf-46b3-b324-db2c341ca055', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-002', 'Operating hours', '06:00 - 16:30', 'Standard hours')
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "sub_contract_id" = EXCLUDED."sub_contract_id",
  "parameter" = EXCLUDED."parameter",
  "value" = EXCLUDED."value",
  "remark" = EXCLUDED."remark";

-- ── contract_termination (24 rows) ──────────────────────────────
INSERT INTO public.contract_termination ("id", "created_at", "updated_at", "sub_contract_id", "parameter", "value", "remark")
VALUES
  ('6b7a880e-f770-407e-b49b-392f06ad1e52', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Notice period', '90 days', 'Written notice required'),
  ('36aed8c8-a3bc-4c5c-bcc2-f26627f9bf3b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-001', 'Early termination fee', '3 months transfer revenue', 'Based on trailing average'),
  ('cd59bf2e-1e80-44a3-bf59-14fdd9b3a1da', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-001-002', 'Notice period', '180 days', 'Charter longer notice'),
  ('e3c0586a-b4d9-448b-9a24-214555b661ff', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-002-001', 'Notice period', '90 days', 'Written notice'),
  ('7993c0ce-48dd-4e6a-a571-584c4b242e7e', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Notice period', '180 days', 'Charter requires longer notice'),
  ('a22b6164-4da8-4354-9c05-5761e092c477', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-001', 'Early termination fee', '6 months charter fees', 'Due to dedicated asset'),
  ('6d0a3447-553a-4a02-8405-39de6a3d798f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-002', 'Notice period', '90 days', 'Transfer standard notice'),
  ('2ad6cfd2-822a-4cb8-a8a2-da5ca4a5834c', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-003-003', 'Notice period', '180 days', 'Signed charter notice'),
  ('8a37c4c6-79ee-4496-957d-d0b8ec7dc142', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-001', 'Notice period', '90 days', 'Standard Marriott terms'),
  ('09f30c7a-9941-44bc-96d2-321c56dc5b5b', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-005-002', 'Notice period', '180 days', 'Charter notice'),
  ('9a1e7c8d-14c9-4ae7-ab4c-22fba3d953ff', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Notice period', '90 days', 'Written notice to both parties'),
  ('cfef5b68-f170-4ed2-abbb-6f68bdf45b76', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Early termination fee', '3 months revenue', 'Trailing 3-month average'),
  ('1263b9ab-a0c1-469a-b1c0-80232b3060f8', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-001', 'Force majeure', 'No penalty', 'Natural disaster, pandemic, govt order'),
  ('0347ab65-186c-486e-83ba-f3467222667f', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-002', 'Notice period', '180 days', 'Charter notice'),
  ('5213000b-804c-4b87-b0e4-239258d18aca', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-003', 'Notice period', '180 days', 'Signed charter notice'),
  ('74b7e947-feb7-4943-8d59-71f354a44916', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-006-003', 'Early termination fee', 'Full remaining contract value', 'Signed charter penalty'),
  ('ae1774fb-62fa-4b0b-9992-fc6ac2d183bd', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-001', 'Notice period', '60 days', 'Speedboat shorter notice'),
  ('ed5a7ddc-6abf-40f8-9954-2db5a873e430', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-007-002', 'Notice period', '90 days', 'Seaplane standard'),
  ('e8ea776f-ea84-48e4-a084-9062ea14317c', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Notice period', '180 days', 'Charter termination notice'),
  ('d9861bc5-83b9-403d-8979-e6dd95d687ef', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-001', 'Early termination fee', '6 months charter fees', 'Due to dedicated asset'),
  ('7e33d2f6-33a8-4f79-b9e3-5dabc79ab17e', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-008-002', 'Notice period', '90 days', 'Transfer notice'),
  ('cba6f2f2-1fd4-4a42-b40d-39b71eed0352', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-009-001', 'Notice period', '60 days', 'Speedboat notice period'),
  ('e070cecd-13b3-4c2b-9cf3-2d1399222447', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-001', 'Notice period', '180 days', 'Charter notice'),
  ('599a0965-f065-4c49-8f38-0b1edff3761e', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'CTR-010-002', 'Notice period', '90 days', 'Transfer notice')
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "sub_contract_id" = EXCLUDED."sub_contract_id",
  "parameter" = EXCLUDED."parameter",
  "value" = EXCLUDED."value",
  "remark" = EXCLUDED."remark";

-- ── contract_notes (10 rows) ──────────────────────────────
INSERT INTO public.contract_notes ("id", "created_at", "updated_at", "contract_id", "content")
VALUES
  ('98c42733-9897-464d-bbd6-9f2d45f790c2', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'c0f92e8a-aa8b-4aa2-bec2-95cb55998bf6', '<h2>Waldorf Astoria Transfer & Charter</h2><p>Dual contract covering both scheduled seaplane transfers and dedicated charter service for Waldorf Astoria Maldives Ithaafushi. <strong>Key highlights:</strong></p><ul><li>Transfer (CTR-001-001): VIP lounge access included for suite guests, dedicated check-in at TMA terminal</li><li>Charter (CTR-001-002): Private aircraft for large group bookings, aerial photography add-on available</li><li>Priority boarding during peak season Nov-Apr</li></ul><p>Contact: Marriott Reservations at +960 400-0000</p><p><em>Transfer sub-contract expiring March 2026 - renewal talks initiated.</em></p>'),
  ('65a44019-3d62-4701-9b04-03bd30cba68d', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'b9037295-b281-4339-9c92-58351d8b0574', '<h2>St. Regis Vommuli Transfer</h2><p>2-year seaplane transfer contract for St. Regis Maldives Vommuli. Flight time approximately <strong>45 minutes</strong> from Velana International Airport.</p><ul><li>Butler service coordination for VIP arrivals</li><li>Weather delay protocol: speedboat backup arrangement with partner operator</li><li>30 guaranteed seats daily during peak season</li></ul><p>Long-term contract secured through Feb 2027.</p>'),
  ('fc863e60-ac03-42d8-8c48-402f9bcde026', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'a88b36f6-364e-4b60-974f-222c0081fc60', '<h2>Soneva Fushi - Triple Contract</h2><p>Comprehensive 3-contract arrangement covering Charter, Transfer, and Signed Charter services for Soneva Fushi. <strong>Aircraft:</strong> DHC-6 Twin Otter (19 seats).</p><ul><li>Charter (CTR-003-001): Dedicated aircraft with Soneva livery, custom in-flight refreshments</li><li>Transfer (CTR-003-002): Standard scheduled seaplane service for regular guests</li><li>Signed Charter (CTR-003-003): Premium VIP service with luxury cabin configuration</li></ul><p>Soneva Group is TMA''s largest charter partner in Baa Atoll. <em>Contract value exceeds $2M annually.</em></p>'),
  ('7255990f-9063-4a16-95f9-066722fbf336', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', '9a4b1770-6a3e-42c5-b683-6bae0cafa620', '<h2>Cheval Blanc - Expired Contract</h2><p>This signed charter contract expired on 31 Dec 2024. <strong>Status:</strong> Pending renewal negotiations.</p><p>LVMH team evaluating competitive bids. TMA submitted revised proposal Jan 2025. Expected decision Q2 2025.</p><p><strong>Note:</strong> Interim transfer service provided on ad-hoc basis at published rates.</p>'),
  ('5cf3c019-3b33-4e3c-ac82-00bc4ef4eb59', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', '8003b4e4-5d86-4a0e-90e2-d92850a7b277', '<h2>Patina Maldives - Transfer & Charter</h2><p>Dual contract for Patina Maldives, Fari Islands. Located in <strong>North Malé Atoll</strong> - shorter flight time (~20 min seaplane).</p><ul><li>Transfer (CTR-005-001): 2-year contract, shared service coordination with Ritz-Carlton Fari</li><li>Charter (CTR-005-002): Dedicated service for Marriott Bonvoy Platinum events</li><li>Shared lounge facilities at Velana International Airport</li></ul>'),
  ('8a58fe38-f1e4-420a-b172-0836da6fa153', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', '6d461192-db6a-452f-b9da-1b11c9a51892', '<h2>Four Seasons Landaa Giraavaru - Premium Triple</h2><p>TMA''s most comprehensive contract: 3-year transfer + 2-year charter + 1-year signed charter for FS Landaa Giraavaru in Baa Atoll. <strong>Flight time:</strong> ~35 minutes.</p><ul><li>UNESCO Biosphere Reserve location - special low-altitude approach required</li><li>Marine biology equipment transport arrangements in place</li><li>Peak season (Nov-Apr): 50 guaranteed seats daily</li><li>Aerial photography and sunset scenic flight packages available</li><li>Signed charter with VIP cabin configuration for ultra-high-net-worth guests</li></ul><p>Account manager: Sarah Chen, FS Regional Office. <em>Highest-value contract in portfolio at ~$3.5M/year.</em></p>'),
  ('6e248b58-a663-43e8-9596-dbf7092e0b3a', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', '751a7f5c-6eb1-4059-a3f3-28923fbed286', '<h2>Four Seasons Kuda Huraa - Dual Transfer</h2><p>Combined speedboat and seaplane transfer for the closest Four Seasons property to Male airport.</p><ul><li>Speedboat (CTR-007-001): 25-minute journey, extended hours until 22:00, every 30 minutes at peak</li><li>Seaplane (CTR-007-002): Alternative for guests preferring aerial arrival, ~15 min flight</li></ul><p><em>Both contracts expiring March 2026 - renewal terms under active discussion. FS requesting 10% rate reduction.</em></p>'),
  ('796c105d-7af7-4d35-a74b-505ae48e1342', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'b015f249-d107-4b91-a15a-f882a23c73a6', '<h2>Anantara Kihavah - Charter & Transfer</h2><p>2-year charter + 1-year transfer for Anantara Kihavah Villas, Baa Atoll. <strong>Includes:</strong></p><ul><li>Charter (CTR-008-001): Dedicated DHC-6 Twin Otter, overwater observatory transfers for astronomy programme</li><li>Transfer (CTR-008-002): Standard scheduled seaplane, dive equipment transport arrangements</li><li>Sunset scenic flight add-on popular with honeymooners</li></ul><p>Minor Hotels regional team oversees operations. 20% deposit required for charter bookings.</p>'),
  ('d271e3a0-8f93-432a-919c-759e0a5d4c83', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', '04bb15d6-9e8a-4631-b7e7-04dae158c4d2', '<h2>Ritz-Carlton Fari Islands - Speedboat</h2><p>Speedboat transfer for The Ritz-Carlton Maldives, Fari Islands.</p><ul><li>Shared speedboat service coordination with Patina Maldives (same island cluster)</li><li>Luxury speedboat upgrade available at $250 per trip for private transfer</li><li>20-minute journey from Velana Airport</li><li>Fixed schedule every 45 minutes throughout the day</li></ul><p>Marriott centralized billing covers both RC Fari and Patina contracts.</p>'),
  ('63d42901-b827-44e6-b4da-6b6f7ca0fc42', '2026-02-15T07:01:23.175Z', '2026-02-15T07:01:23.175Z', 'daca0df5-90b1-426b-b6e8-4afd695e1cd0', '<h2>Soneva Jani - Expired Dual Contract</h2><p>Both charter and transfer contracts expired Feb 2025. <strong>Status:</strong> Under renewal.</p><ul><li>Charter (CTR-010-001): Dedicated aircraft no longer assigned</li><li>Transfer (CTR-010-002): Ad-hoc service at published rates</li></ul><p>Soneva Group consolidating charter terms for both Fushi and Jani properties. New combined multi-property contract expected Q2 2025. Delay due to Soneva''s expansion plans for third Maldives property.</p>')
ON CONFLICT (id) DO UPDATE SET
  "updated_at" = EXCLUDED."updated_at",
  "contract_id" = EXCLUDED."contract_id",
  "content" = EXCLUDED."content";

