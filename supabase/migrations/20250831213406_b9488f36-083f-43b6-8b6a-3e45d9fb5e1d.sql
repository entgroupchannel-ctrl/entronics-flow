-- Create invitations table for user invitations
CREATE TABLE public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role app_role NOT NULL DEFAULT 'user',
  invitation_token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on invitations table
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for invitations
CREATE POLICY "Admins can manage invitations" ON public.user_invitations
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own invitation" ON public.user_invitations
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create audit log table for security tracking
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- Create system settings table
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on system settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for system settings
CREATE POLICY "Admins can manage system settings" ON public.system_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "All users can view system settings" ON public.system_settings
  FOR SELECT USING (true);

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, description, category) VALUES
  ('company_name', '"ENT GROUP"', 'Company name displayed in the system', 'company'),
  ('company_email', '"admin@entgroup.co.th"', 'Main company email address', 'company'),
  ('company_phone', '"+66 XX XXX XXXX"', 'Company phone number', 'company'),
  ('session_timeout', '3600', 'Session timeout in seconds (1 hour)', 'security'),
  ('password_min_length', '8', 'Minimum password length', 'security'),
  ('max_login_attempts', '5', 'Maximum failed login attempts before lockout', 'security'),
  ('invitation_expiry_days', '7', 'Number of days before invitation expires', 'security'),
  ('require_2fa', 'false', 'Require two-factor authentication for all users', 'security');

-- Create function to log user actions
CREATE OR REPLACE FUNCTION public.log_user_action(
  action_name TEXT,
  resource_type_param TEXT,
  resource_id_param TEXT DEFAULT NULL,
  details_param JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    action_name,
    resource_type_param,
    resource_id_param,
    details_param
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create function to accept invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  user_id UUID;
BEGIN
  -- Check if invitation exists and is valid
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE invitation_token = accept_invitation.invitation_token
    AND expires_at > now()
    AND accepted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired invitation');
  END IF;
  
  -- Get current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not authenticated');
  END IF;
  
  -- Check if user email matches invitation
  IF (SELECT email FROM auth.users WHERE id = user_id) != invitation_record.email THEN
    RETURN jsonb_build_object('success', false, 'message', 'Email does not match invitation');
  END IF;
  
  -- Assign role to user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id, invitation_record.role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Mark invitation as accepted
  UPDATE public.user_invitations
  SET accepted_at = now(), updated_at = now()
  WHERE invitation_token = accept_invitation.invitation_token;
  
  -- Log the action
  PERFORM public.log_user_action(
    'invitation_accepted',
    'user_invitation',
    invitation_record.id::text,
    jsonb_build_object('role', invitation_record.role)
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Invitation accepted successfully', 'role', invitation_record.role);
END;
$$;

-- Create updated_at trigger for system_settings
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for user_invitations
CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON public.user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();