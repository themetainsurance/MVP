import type {
  AffiliateCommissionStatus,
  AffiliateConversionStatus,
} from "./affiliate-conversion-types";
import type { LeadStatus } from "./lead-status-types";
import type {
  PartnerHandoffMethod,
  PartnerHandoffStatus,
} from "./partner-handoff-types";
import type {
  PartnerInsuranceType,
  PartnerStatus,
  PartnerType,
} from "./partner-types";

export type AdminLeadListItem = {
  id: string;
  created_at: string;
  insurance_type: PartnerInsuranceType;
  full_name: string;
  email: string | null;
  phone: string | null;
  preferred_contact: string | null;
  status: LeadStatus;
  policy_document_path: string | null;
};

export type AdminLead = AdminLeadListItem & {
  consent: boolean;
  source: string | null;
  details: unknown;
};

export type AdminLeadStatusHistory = {
  id: string;
  created_at: string;
  previous_status: LeadStatus | null;
  new_status: LeadStatus;
  change_source: string;
  actor_reference: string | null;
  note: string | null;
};

export type AdminPartnerCapability = {
  id: string;
  created_at: string;
  partner_id: string;
  insurance_type: PartnerInsuranceType;
  country_code: string;
  status: PartnerStatus;
};

export type AdminPartner = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  partner_type: PartnerType;
  status: PartnerStatus;
  website_url: string | null;
  contact_email: string | null;
  handoff_method: PartnerHandoffMethod;
  affiliate_reference: string | null;
  notes: string | null;
  capabilities?: AdminPartnerCapability[];
};

export type AdminConversionSummary = {
  id: string;
  status: AffiliateConversionStatus;
  commission_status: AffiliateCommissionStatus;
};

export type AdminHandoff = {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string;
  partner_id: string;
  handoff_method: PartnerHandoffMethod;
  status: PartnerHandoffStatus;
  assigned_at: string;
  sent_at: string | null;
  responded_at: string | null;
  external_reference: string | null;
  failure_code: string | null;
  internal_note: string | null;
  lead?: Pick<AdminLeadListItem, "id" | "insurance_type" | "full_name"> | null;
  partner?: Pick<AdminPartner, "id" | "name" | "status"> | null;
  conversion?: AdminConversionSummary | AdminConversionSummary[] | null;
};

export type AdminHandoffHistory = {
  id: string;
  handoff_id: string;
  created_at: string;
  previous_status: PartnerHandoffStatus | null;
  new_status: PartnerHandoffStatus;
  change_source: string;
  note: string | null;
};

export type AdminConversion = {
  id: string;
  created_at: string;
  updated_at: string;
  handoff_id: string;
  status: AffiliateConversionStatus;
  attribution_reference: string | null;
  external_conversion_reference: string | null;
  reported_at: string;
  confirmed_at: string | null;
  reversed_at: string | null;
  commission_status: AffiliateCommissionStatus;
  commission_amount: string | number | null;
  commission_currency: string | null;
  commission_reported_at: string | null;
  commission_paid_at: string | null;
  internal_note: string | null;
  handoff?: AdminHandoff | null;
};

export type AdminConversionHistory = {
  id: string;
  conversion_id: string;
  created_at: string;
  previous_conversion_status: AffiliateConversionStatus | null;
  new_conversion_status: AffiliateConversionStatus;
  previous_commission_status: AffiliateCommissionStatus | null;
  new_commission_status: AffiliateCommissionStatus;
  change_source: string;
  note: string | null;
};

export type AdminPageResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminDashboardSummary = {
  totalLeads: number;
  newLeads: number;
  reviewingLeads: number;
  sentToPartnerLeads: number;
  completedLeads: number;
  activePartners: number;
  pendingHandoffs: number;
  sentHandoffs: number;
  pendingConversions: number;
  confirmedConversions: number;
  pendingCommissions: number;
  approvedCommissions: number;
  paidCommissions: number;
  recentLeads: AdminLeadListItem[];
  recentHandoffs: AdminHandoff[];
  recentConversions: AdminConversion[];
};
