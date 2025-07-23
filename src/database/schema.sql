-- Database schema for WebEDI Visual Workflow

-- Companies table (your customers)
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  company_type VARCHAR(50) CHECK (company_type IN ('customer', 'trading_partner', 'both')),
  edi_id VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trading partners table
CREATE TABLE trading_partners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  edi_id VARCHAR(100),
  integration_type VARCHAR(100),
  contact_info JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_number VARCHAR(100) UNIQUE,
  company_id UUID REFERENCES companies(id),
  trading_partner_id UUID REFERENCES trading_partners(id),
  
  -- EDI specific fields
  document_type VARCHAR(10) NOT NULL,
  supplier VARCHAR(255),
  buyer VARCHAR(255),
  error_type VARCHAR(255),
  error_code VARCHAR(100),
  affected_pos TEXT[], -- Array of PO numbers
  action VARCHAR(50),
  
  -- Workflow data
  workflow_data JSONB, -- Stores the visual workflow
  raw_text TEXT,
  
  -- Status and tracking
  status VARCHAR(50) DEFAULT 'open',
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_time_minutes INTEGER,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- Customer profiles view (joins companies with their ticket history)
CREATE VIEW customer_profiles AS
SELECT 
  c.id,
  c.name,
  c.company_type,
  c.edi_id,
  c.contact_email,
  c.contact_phone,
  COUNT(t.id) as total_tickets,
  COUNT(CASE WHEN t.status = 'resolved' THEN 1 END) as resolved_tickets,
  COUNT(CASE WHEN t.status = 'open' THEN 1 END) as open_tickets,
  ARRAY_AGG(DISTINCT t.document_type) as document_types_used,
  ARRAY_AGG(DISTINCT t.error_type) as common_errors,
  MAX(t.created_at) as last_ticket_date,
  AVG(t.resolution_time_minutes) as avg_resolution_time
FROM companies c
LEFT JOIN tickets t ON c.id = t.company_id
GROUP BY c.id;

-- Indexes for performance
CREATE INDEX idx_tickets_company_id ON tickets(company_id);
CREATE INDEX idx_tickets_trading_partner_id ON tickets(trading_partner_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_companies_name ON companies(name);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_partners_updated_at BEFORE UPDATE ON trading_partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();