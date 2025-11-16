-- Fix critical security issue: Restrict user_roles visibility to authenticated users only
DROP POLICY IF EXISTS "User roles are viewable by everyone" ON public.user_roles;

CREATE POLICY "Authenticated users can view roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Improve profile visibility: Allow users to view their own profile and admins to view all
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile and admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Add policy for authenticated users to view other authenticated users' basic profiles if needed
CREATE POLICY "Authenticated users can view other profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);