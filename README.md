# The Meta Insurance

Insurance comparison and management platform.

## MVP
- Travel Insurance
- Motor Insurance
- Property Insurance
- AI Insurance Assistant
- Insurance Blog

## Policy document uploads

Motor and Property policy file bytes upload directly from the browser to the
private `policy-documents` Supabase Storage bucket using a temporary,
path-scoped signed upload authorization. The application server validates the
stored object's actual size and file signature before moving it to its final
private path and accepting it as a `policy_document_path`.
