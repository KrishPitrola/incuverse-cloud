import { useEffect, useRef, useCallback } from "react";

const API_BASE = "http://localhost:8001/api";
const DEBOUNCE_MS = 1500; // save 1.5s after user stops typing

export function useProfileSync(userId, formData, setFormData) {
  const debounceTimer = useRef(null);
  const isLoadingRef = useRef(false);

  // Load profile on mount
  useEffect(() => {
    if (!userId) return;
    isLoadingRef.current = true;

    fetch(`${API_BASE}/profile/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.profile) {
          setFormData((prev) => ({ ...prev, ...data.profile }));
          console.log("[Profile] Loaded from DynamoDB:", data.updated_at);
        }
      })
      .catch(() => console.warn("[Profile] Could not load — using local state"))
      .finally(() => {
        isLoadingRef.current = false;
      });
  }, [userId]); // eslint-disable-line

  // Debounced auto-save whenever formData changes
  const saveProfile = useCallback(
    (data) => {
      if (!userId || isLoadingRef.current) return;

      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        fetch(`${API_BASE}/profile/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_data: data }),
        })
          .then((r) => r.json())
          .then((res) => {
            if (res.success)
              console.log("[Profile] Auto-saved at", res.updated_at);
          })
          .catch(() => console.warn("[Profile] Auto-save failed"));
      }, DEBOUNCE_MS);
    },
    [userId]
  );

  useEffect(() => {
    saveProfile(formData);
  }, [formData, saveProfile]);

  // Manual save (for a Save button)
  const forceSave = useCallback(() => {
    clearTimeout(debounceTimer.current);
    return fetch(`${API_BASE}/profile/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_data: formData }),
    }).then((r) => r.json());
  }, [userId, formData]);

  return { forceSave };
}