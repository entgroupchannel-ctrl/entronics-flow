-- Fix security issues by setting search_path for functions
CREATE OR REPLACE FUNCTION public.log_user_action(
  action_name TEXT,
  resource_type_param TEXT,
  resource_id_param TEXT DEFAULT NULL,
  details_param JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix security issues by setting search_path for functions
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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