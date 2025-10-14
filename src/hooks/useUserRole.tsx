import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRole = "admin" | "editor" | "member" | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) throw error;
        
        // Priorité: admin > editor > member
        if (!data || data.length === 0) {
          setRole(null);
        } else if (data.some(r => r.role === "admin")) {
          setRole("admin");
        } else if (data.some(r => r.role === "editor")) {
          setRole("editor");
        } else {
          setRole("member");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  const isAdmin = role === "admin";
  const isEditor = role === "editor";
  const canPublish = isAdmin || isEditor;

  return { role, loading, isAdmin, isEditor, canPublish };
}
