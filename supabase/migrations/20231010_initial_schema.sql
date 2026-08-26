-- Initial Database Schema for NSN Tracker

-- 1. Create a table for Dynamic Dropdown Options (to allow users to add new choices)
CREATE TABLE IF NOT EXISTS public.dropdown_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(255) NOT NULL, -- e.g., 'stream', 'project_name', 'department', 'location'
    value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, value)
);

-- Enable RLS
ALTER TABLE public.dropdown_options ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view options
CREATE POLICY "Allow authenticated users to read dropdown options"
ON public.dropdown_options FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert new options
CREATE POLICY "Allow authenticated users to insert dropdown options"
ON public.dropdown_options FOR INSERT
TO authenticated
WITH CHECK (true);


-- 2. Create the Employees table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ust_id VARCHAR(50) UNIQUE NOT NULL,
    nokia_id VARCHAR(50),
    employee_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    
    project_name VARCHAR(255),
    project_id VARCHAR(100),
    manager VARCHAR(255),
    department VARCHAR(255),
    location VARCHAR(255),
    stream VARCHAR(255),
    
    designation VARCHAR(255),
    joining_date DATE NOT NULL,
    account_status VARCHAR(50) DEFAULT 'Active', -- Active, Inactive, Ramp Down, Notice Period
    employee_type VARCHAR(100),
    
    nokia_lwd DATE, -- Last Working Date
    ust_lwd DATE,
    attrition_type VARCHAR(100),
    attrition_reason TEXT,
    
    laptop_assigned BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated operations on employees
CREATE POLICY "Allow authenticated users full access to employees"
ON public.employees FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- 3. Create Employee History (Audit log for movements and status changes)
CREATE TABLE IF NOT EXISTS public.employee_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_ust_id VARCHAR(50) NOT NULL REFERENCES public.employees(ust_id) ON DELETE CASCADE,
    change_type VARCHAR(100) NOT NULL, -- e.g., 'Status Change', 'Project Movement', 'Advancement'
    old_value TEXT,
    new_value TEXT,
    changed_by UUID, -- Could link to auth.users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.employee_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read history"
ON public.employee_history FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert history"
ON public.employee_history FOR INSERT
TO authenticated
WITH CHECK (true);

-- Helper function to automatically update `updated_at` column
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;   
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_modtime 
BEFORE UPDATE ON public.employees 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Seed some initial dropdown options
INSERT INTO public.dropdown_options (category, value) VALUES
('location', 'Chennai'),
('location', 'Noida'),
('account_status', 'Active'),
('account_status', 'Inactive'),
('account_status', 'Ramp Down'),
('account_status', 'Notice Period'),
('employee_type', 'Employee'),
('employee_type', 'Contractor')
ON CONFLICT DO NOTHING;
