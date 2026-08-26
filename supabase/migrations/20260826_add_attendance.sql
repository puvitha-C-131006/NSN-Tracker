CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL REFERENCES public.employees(employee_id),
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('Present', 'Absent', 'Half Day', 'On Leave')),
  check_in time,
  check_out time,
  remarks text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (employee_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users full access to attendance"
ON public.attendance
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
