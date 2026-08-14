import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Generate a per-session unique suffix so two devices sharing the same userId
// don't collide on the same Supabase channel name.
const SESSION_ID = Math.random().toString(36).slice(2, 8);

export type SyncStatus = "synced" | "syncing" | "offline" | "reconnecting" | "connection_restored";

interface RealtimeSyncContextType {
  estimations: any[];
  symptoms: any[];
  syncStatus: SyncStatus;
  isAuthenticated: boolean;
  addEstimation: (est: {
    condition: string;
    city: string;
    hospital_type: string;
    estimated_cost: number;
    insurance_applied?: boolean;
    insurance_coverage?: number;
  }) => Promise<any>;
  updateEstimation: (id: string, condition: string) => Promise<void>;
  deleteEstimation: (id: string) => Promise<void>;
  addSymptom: (sym: {
    symptom: string;
    predicted_condition: string;
    confidence_score: number;
    city?: string;
  }) => Promise<any>;
  updateSymptom: (id: string, symptom: string) => Promise<void>;
  deleteSymptom: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const RealtimeSyncContext = createContext<RealtimeSyncContextType | undefined>(undefined);

export const RealtimeSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [estimations, setEstimations] = useState<any[]>([]);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  const estChannelRef = useRef<any>(null);
  const symChannelRef = useRef<any>(null);

  // Load guest data from localStorage when offline/guest
  const loadGuestData = useCallback(() => {
    try {
      const localEst = JSON.parse(localStorage.getItem("estimationHistory") || "[]");
      const localSym = JSON.parse(localStorage.getItem("symptomHistory") || "[]");

      // Adapt localStorage structure to DB model structure
      const adaptedEst = localEst.map((item: any) => ({
        id: item.id || Date.now().toString() + Math.random().toString(),
        created_at: item.date || new Date().toISOString(),
        condition: item.condition,
        city: item.city,
        hospital_type: item.hospitalType,
        estimated_cost: item.total || 0,
        insurance_applied: item.insurance_applied || false,
        insurance_coverage: item.insurance_coverage || 0
      }));

      const adaptedSym = localSym.map((item: any) => ({
        id: item.id || Date.now().toString() + Math.random().toString(),
        created_at: item.date || new Date().toISOString(),
        symptom: item.symptoms || item.symptom || "Symptom check",
        predicted_condition: item.analysis || item.condition || "Potential issue",
        confidence_score: item.confidence || 0.85,
        city: item.city || "Unknown"
      }));

      setEstimations(adaptedEst);
      setSymptoms(adaptedSym);
    } catch (e) {
      console.error("Failed to load local storage guest data", e);
    }
  }, []);

  // Fetch all authenticated data from Supabase
  const fetchData = useCallback(async (uid: string) => {
    setSyncStatus("syncing");
    try {
      // Fetch cost estimations
      const { data: costData, error: costError } = await supabase
        .from("cost_estimation_logs")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (costError) throw costError;

      // Fetch symptom searches
      const { data: symptomData, error: symptomError } = await supabase
        .from("symptom_searches")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (symptomError) throw symptomError;

      setEstimations(costData || []);
      setSymptoms(symptomData || []);
      setSyncStatus("synced");

      console.log(`[SYNC] Loaded ${costData?.length} estimations and ${symptomData?.length} symptom searches.`);
    } catch (error: any) {
      console.error("[SYNC] Fetch error:", error.message);
      setSyncStatus("offline");
      
      if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
         toast.error("Database tables are missing. Please run the SQL setup script in your Supabase SQL Editor.", { duration: 10000 });
      } else {
         toast.error("Failed to sync with cloud. Displaying local cache.");
      }
      
      loadGuestData();
    }
  }, [loadGuestData]);

  // Sync offline guest data to DB upon logging in
  const syncOfflineGuestData = useCallback(async (uid: string) => {
    try {
      const localEst = JSON.parse(localStorage.getItem("estimationHistory") || "[]");
      const localSym = JSON.parse(localStorage.getItem("symptomHistory") || "[]");

      if (localEst.length === 0 && localSym.length === 0) return;

      setSyncStatus("syncing");
      toast.info("Syncing local guest data to your account...");

      if (localEst.length > 0) {
        const estRecords = localEst.map((item: any) => ({
          user_id: uid,
          condition: item.condition,
          city: item.city,
          hospital_type: item.hospitalType,
          estimated_cost: item.total || 0,
          insurance_applied: item.insurance_applied || false,
          insurance_coverage: item.insurance_coverage || 0
        }));

        const { error } = await supabase.from("cost_estimation_logs").insert(estRecords);
        if (error) console.error("Error uploading guest estimations:", error);
        else localStorage.removeItem("estimationHistory");
      }

      if (localSym.length > 0) {
        const symRecords = localSym.map((item: any) => ({
          user_id: uid,
          symptom: item.symptoms || item.symptom || "Symptom check",
          predicted_condition: item.analysis || item.condition || "Potential issue",
          confidence_score: item.confidence || 0.85,
          city: item.city || "Unknown"
        }));

        const { error } = await supabase.from("symptom_searches").insert(symRecords);
        if (error) console.error("Error uploading guest symptoms:", error);
        else localStorage.removeItem("symptomHistory");
      }

      await fetchData(uid);
      toast.success("Guest data successfully synchronized with cloud!");
    } catch (err) {
      console.error("[SYNC] Offline sync failed:", err);
    }
  }, [fetchData]);

  // Real-time Subscriptions setup — channel names are unique per user+session
  // so Android and Web both receive their own copy of all database changes.
  const subscribeRealtime = useCallback((uid: string) => {
    if (estChannelRef.current) supabase.removeChannel(estChannelRef.current);
    if (symChannelRef.current) supabase.removeChannel(symChannelRef.current);

    const estChannel = `cost-est-${uid}-${SESSION_ID}`;
    const symChannel = `symptom-${uid}-${SESSION_ID}`;

    console.log(`[SYNC] Subscribing on channels: ${estChannel}, ${symChannel}`);

    // 1. Cost estimations
    estChannelRef.current = supabase
      .channel(estChannel)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cost_estimation_logs", filter: `user_id=eq.${uid}` },
        (payload) => {
          console.log("[SYNC] Estimation change:", payload.eventType);
          if (payload.eventType === "INSERT") {
            const rec = payload.new;
            setEstimations((prev) => prev.some((x) => x.id === rec.id) ? prev : [rec, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setEstimations((prev) => prev.map((x) => (x.id === payload.new.id ? payload.new : x)));
          } else if (payload.eventType === "DELETE") {
            setEstimations((prev) => prev.filter((x) => x.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log(`[SYNC] Estimation channel status: ${status}`);
        if (status === "SUBSCRIBED") setSyncStatus("synced");
      });

    // 2. Symptom searches
    symChannelRef.current = supabase
      .channel(symChannel)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "symptom_searches", filter: `user_id=eq.${uid}` },
        (payload) => {
          console.log("[SYNC] Symptom change:", payload.eventType);
          if (payload.eventType === "INSERT") {
            const rec = payload.new;
            setSymptoms((prev) => prev.some((x) => x.id === rec.id) ? prev : [rec, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setSymptoms((prev) => prev.map((x) => (x.id === payload.new.id ? payload.new : x)));
          } else if (payload.eventType === "DELETE") {
            setSymptoms((prev) => prev.filter((x) => x.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log(`[SYNC] Symptom channel status: ${status}`);
      });
  }, []);

  // Cleanup subscriptions on logout
  const unsubscribeRealtime = useCallback(() => {
    if (estChannelRef.current) {
      supabase.removeChannel(estChannelRef.current);
      estChannelRef.current = null;
    }
    if (symChannelRef.current) {
      supabase.removeChannel(symChannelRef.current);
      symChannelRef.current = null;
    }
    console.log("[SYNC] Real-time subscriptions cleaned up.");
  }, []);

  // Handle Authentication and Session Synchronization
  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session?.user) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        fetchData(session.user.id);
        subscribeRealtime(session.user.id);
        syncOfflineGuestData(session.user.id);
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        loadGuestData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      console.log("[SYNC] Auth State Change Event:", event);
      if (session?.user) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        fetchData(session.user.id);
        subscribeRealtime(session.user.id);
        if (event === "SIGNED_IN") {
          syncOfflineGuestData(session.user.id);
        }
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        unsubscribeRealtime();
        loadGuestData();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
      unsubscribeRealtime();
    };
  }, [fetchData, subscribeRealtime, unsubscribeRealtime, loadGuestData, syncOfflineGuestData]);

  // Network Status / Reconnection Logic
  // When the device comes back online (e.g., backgrounded Android app resumes),
  // immediately re-fetch all data and re-create subscriptions so both platforms
  // are guaranteed to be in sync even after a connection gap.
  const userIdRef = useRef<string | null>(null);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  useEffect(() => {
    const handleOnline = () => {
      const uid = userIdRef.current;
      setSyncStatus("connection_restored");
      console.log("[SYNC] Back online — re-fetching and re-subscribing.");
      if (uid) {
        fetchData(uid);
        subscribeRealtime(uid);
      }
      setTimeout(() => setSyncStatus("synced"), 3000);
    };

    const handleOffline = () => {
      setSyncStatus("offline");
      toast.warning("Network lost. Working offline — data will sync when reconnected.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) setSyncStatus("offline");

    // Also handle Capacitor app resume events (Android background→foreground)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        const uid = userIdRef.current;
        if (uid) {
          console.log("[SYNC] App resumed — re-fetching latest data.");
          fetchData(uid);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchData, subscribeRealtime]);

  // Refresh manual data
  const refreshData = useCallback(async () => {
    if (userId) {
      await fetchData(userId);
    } else {
      loadGuestData();
    }
  }, [userId, fetchData, loadGuestData]);

  // UUID generator for optimistic updates
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // MUTATIONS: ADD ESTIMATION
  const addEstimation = useCallback(async (est: {
    condition: string;
    city: string;
    hospital_type: string;
    estimated_cost: number;
    insurance_applied?: boolean;
    insurance_coverage?: number;
  }) => {
    // 1. Optimistic UI update using a real UUID
    const tempId = generateUUID();
    const newRecord = {
      id: tempId,
      user_id: userId,
      condition: est.condition,
      city: est.city,
      hospital_type: est.hospital_type,
      estimated_cost: est.estimated_cost,
      insurance_applied: est.insurance_applied || false,
      insurance_coverage: est.insurance_coverage || 0,
      created_at: new Date().toISOString(),
    };

    setEstimations((prev) => [newRecord, ...prev]);

    // Save to localStorage as local cache
    try {
      const savedEst = {
        id: tempId,
        date: newRecord.created_at,
        condition: est.condition,
        city: est.city,
        hospitalType: est.hospital_type,
        total: est.estimated_cost,
        insurance_applied: est.insurance_applied,
        insurance_coverage: est.insurance_coverage
      };
      const existing = JSON.parse(localStorage.getItem("estimationHistory") || "[]");
      // Prevent local storage duplication if already exists
      if (!existing.some((x: any) => x.id === tempId)) {
        existing.unshift(savedEst);
        localStorage.setItem("estimationHistory", JSON.stringify(existing.slice(0, 50)));
      }
    } catch {}

    if (!userId || !navigator.onLine) {
      console.log("[SYNC] Saved offline/guest estimation locally.");
      return newRecord;
    }

    try {
      setSyncStatus("syncing");
      const { data, error } = await supabase
        .from("cost_estimation_logs")
        .insert({
          id: tempId,
          user_id: userId,
          condition: est.condition,
          city: est.city,
          hospital_type: est.hospital_type,
          estimated_cost: est.estimated_cost,
          insurance_applied: est.insurance_applied || false,
          insurance_coverage: est.insurance_coverage || 0
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic record with the real confirmed record
      setEstimations((prev) => {
        // If real-time stream already added it, avoid duplicating
        const exists = prev.filter(x => x.id === tempId || x.id === data.id);
        if (exists.length > 1) {
          return prev.filter(x => x.id !== tempId); // remove the temp one if duplicated
        }
        return prev.map((x) => (x.id === tempId ? data : x));
      });
      setSyncStatus("synced");
      return data;
    } catch (err: any) {
      console.error("[SYNC] Add estimation failed, rolled back optimistic record.", err);
      // rollback from state
      setEstimations((prev) => prev.filter((x) => x.id !== tempId));
      setSyncStatus("offline");
      throw err;
    }
  }, [userId]);

  // MUTATIONS: UPDATE ESTIMATION
  const updateEstimation = useCallback(async (id: string, condition: string) => {
    // Optimistic UI update
    setEstimations((prev) =>
      prev.map((x) => (x.id === id ? { ...x, condition } : x))
    );

    // Local Storage Update
    try {
      const existing = JSON.parse(localStorage.getItem("estimationHistory") || "[]");
      const updated = existing.map((x: any) => (x.id === id ? { ...x, condition } : x));
      localStorage.setItem("estimationHistory", JSON.stringify(updated));
    } catch {}

    if (!userId || id.startsWith("temp_") || !navigator.onLine) {
      return;
    }

    try {
      setSyncStatus("syncing");
      const { error } = await supabase
        .from("cost_estimation_logs")
        .update({ condition })
        .eq("id", id);

      if (error) throw error;
      setSyncStatus("synced");
    } catch (err: any) {
      console.error("[SYNC] Update estimation failed:", err);
      setSyncStatus("offline");
      throw err;
    }
  }, [userId]);

  // MUTATIONS: DELETE ESTIMATION
  const deleteEstimation = useCallback(async (id: string) => {
    // Optimistic UI update
    setEstimations((prev) => prev.filter((x) => x.id !== id));

    // Local Storage delete
    try {
      const existing = JSON.parse(localStorage.getItem("estimationHistory") || "[]");
      const updated = existing.filter((x: any) => x.id !== id);
      localStorage.setItem("estimationHistory", JSON.stringify(updated));
    } catch {}

    if (!userId || id.startsWith("temp_") || !navigator.onLine) {
      return;
    }

    try {
      setSyncStatus("syncing");
      const { error } = await supabase.from("cost_estimation_logs").delete().eq("id", id);
      if (error) throw error;
      setSyncStatus("synced");
    } catch (err: any) {
      console.error("[SYNC] Delete estimation failed:", err);
      setSyncStatus("offline");
      throw err;
    }
  }, [userId]);

  // MUTATIONS: ADD SYMPTOM
  const addSymptom = useCallback(async (sym: {
    symptom: string;
    predicted_condition: string;
    confidence_score: number;
    city?: string;
  }) => {
    const tempId = generateUUID();
    const newRecord = {
      id: tempId,
      user_id: userId,
      symptom: sym.symptom,
      predicted_condition: sym.predicted_condition,
      confidence_score: sym.confidence_score,
      city: sym.city || "Unknown",
      created_at: new Date().toISOString(),
    };

    setSymptoms((prev) => [newRecord, ...prev]);

    // Save to local storage cache
    try {
      const savedSym = {
        id: tempId,
        date: newRecord.created_at,
        symptoms: sym.symptom,
        analysis: sym.predicted_condition,
        confidence: sym.confidence_score,
        city: sym.city || "Unknown"
      };
      const existing = JSON.parse(localStorage.getItem("symptomHistory") || "[]");
      if (!existing.some((x: any) => x.id === tempId)) {
        existing.unshift(savedSym);
        localStorage.setItem("symptomHistory", JSON.stringify(existing.slice(0, 50)));
      }
    } catch {}

    if (!userId || !navigator.onLine) {
      console.log("[SYNC] Saved offline/guest symptom locally.");
      return newRecord;
    }

    try {
      setSyncStatus("syncing");
      const { data, error } = await supabase
        .from("symptom_searches")
        .insert({
          id: tempId,
          user_id: userId,
          symptom: sym.symptom,
          predicted_condition: sym.predicted_condition,
          confidence_score: sym.confidence_score,
          city: sym.city || "Unknown"
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic record with the real confirmed record
      setSymptoms((prev) => {
        const exists = prev.filter(x => x.id === tempId || x.id === data.id);
        if (exists.length > 1) {
          return prev.filter(x => x.id !== tempId);
        }
        return prev.map((x) => (x.id === tempId ? data : x));
      });
      setSyncStatus("synced");
      return data;
    } catch (err: any) {
      console.error("[SYNC] Add symptom failed, rolled back optimistic record.", err);
      setSymptoms((prev) => prev.filter((x) => x.id !== tempId));
      setSyncStatus("offline");
      throw err;
    }
  }, [userId]);

  // MUTATIONS: UPDATE SYMPTOM
  const updateSymptom = useCallback(async (id: string, symptom: string) => {
    setSymptoms((prev) =>
      prev.map((x) => (x.id === id ? { ...x, symptom } : x))
    );

    try {
      const existing = JSON.parse(localStorage.getItem("symptomHistory") || "[]");
      const updated = existing.map((x: any) => (x.id === id ? { ...x, symptoms: symptom } : x));
      localStorage.setItem("symptomHistory", JSON.stringify(updated));
    } catch {}

    if (!userId || id.startsWith("temp_") || !navigator.onLine) {
      return;
    }

    try {
      setSyncStatus("syncing");
      const { error } = await supabase
        .from("symptom_searches")
        .update({ symptom })
        .eq("id", id);

      if (error) throw error;
      setSyncStatus("synced");
    } catch (err: any) {
      console.error("[SYNC] Update symptom failed:", err);
      setSyncStatus("offline");
      throw err;
    }
  }, [userId]);

  // MUTATIONS: DELETE SYMPTOM
  const deleteSymptom = useCallback(async (id: string) => {
    setSymptoms((prev) => prev.filter((x) => x.id !== id));

    try {
      const existing = JSON.parse(localStorage.getItem("symptomHistory") || "[]");
      const updated = existing.filter((x: any) => x.id !== id);
      localStorage.setItem("symptomHistory", JSON.stringify(updated));
    } catch {}

    if (!userId || id.startsWith("temp_") || !navigator.onLine) {
      return;
    }

    try {
      setSyncStatus("syncing");
      const { error } = await supabase.from("symptom_searches").delete().eq("id", id);
      if (error) throw error;
      setSyncStatus("synced");
    } catch (err: any) {
      console.error("[SYNC] Delete symptom failed:", err);
      setSyncStatus("offline");
      throw err;
    }
  }, [userId]);

  return (
    <RealtimeSyncContext.Provider
      value={{
        estimations,
        symptoms,
        syncStatus,
        isAuthenticated,
        addEstimation,
        updateEstimation,
        deleteEstimation,
        addSymptom,
        updateSymptom,
        deleteSymptom,
        refreshData,
      }}
    >
      {children}
    </RealtimeSyncContext.Provider>
  );
};

export const useRealtimeSync = () => {
  const context = useContext(RealtimeSyncContext);
  if (context === undefined) {
    throw new Error("useRealtimeSync must be used within a RealtimeSyncProvider");
  }
  return context;
};
