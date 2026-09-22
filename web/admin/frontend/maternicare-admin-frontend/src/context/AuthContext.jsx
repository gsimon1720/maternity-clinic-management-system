import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  login as apiLogin,
  getCurrentSession,
  logout as apiLogout,
} from '../services/authService';
import { getAccessToken, request } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentClinic, setCurrentClinic] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Permission state ────────────────────────────────────────────────────────
  // Stored as a Set for O(1) hasPermission look-ups.
  // Super admins get a special sentinel value so we never accidentally block them.
  const [permissions, setPermissions] = useState(new Set());
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // ── Fetch permissions from the API ─────────────────────────────────────────
  const fetchPermissions = useCallback(async (role) => {
    // Super admin has unrestricted access – no DB call needed
    if (role === 'super_admin') {
      setPermissions(new Set(['__SUPER_ADMIN__']));
      setPermissionsLoaded(true);
      return;
    }

    // For clinic_admin (and future staff roles) fetch from the backend
    try {
      const res = await request('/permissions/my-permissions');
      const list = res?.permissions || res?.data?.permissions || [];
      setPermissions(new Set(list));
    } catch (err) {
      console.warn('[AuthContext] Could not load permissions – failing open:', err.message);
      setPermissions(new Set());
    } finally {
      setPermissionsLoaded(true);
    }
  }, []);

  // ── hasPermission helper exposed to every consumer ─────────────────────────
  /**
   * Returns true if the current user has the given permission.
   *  - Super admins always return true.
   *  - If permissions haven't loaded yet, returns true (fail-open while loading).
   *  - Otherwise checks the Set returned by /api/permissions/my-permissions.
   */
  const hasPermission = useCallback((permissionName) => {
    if (!permissionName) return true;
    if (permissions.has('__SUPER_ADMIN__')) return true;
    if (!permissionsLoaded) return true; // fail-open during initial load
    return permissions.has(permissionName);
  }, [permissions, permissionsLoaded]);

  // ── Session helpers ─────────────────────────────────────────────────────────
  const applySession = useCallback((sessionData) => {
    console.log('📝 Applying session:', sessionData);

    const userData = sessionData?.user || sessionData;
    const role = userData?.user_type || userData?.role || null;
    const clinic = sessionData?.clinic ||
                   (userData?.clinic_id ? { id: userData.clinic_id } : null);

    setIsAuthenticated(true);
    setUser(userData);
    setUserType(role);
    setCurrentClinic(clinic);

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', role || '');
    if (clinic) {
      localStorage.setItem('currentClinic', JSON.stringify(clinic));
    } else {
      localStorage.removeItem('currentClinic');
    }

    // Load permissions for the resolved role
    fetchPermissions(role);
  }, [fetchPermissions]);

  const clearSession = useCallback(() => {
    apiLogout();
    setIsAuthenticated(false);
    setUser(null);
    setCurrentClinic(null);
    setUserType(null);
    setPermissions(new Set());
    setPermissionsLoaded(false);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const session = await getCurrentSession();
      applySession(session);
      return session;
    } catch (error) {
      console.error('Refresh session error:', error);
      clearSession();
      throw error;
    }
  }, [applySession, clearSession]);

  // ── Refresh permissions (call after Super Admin changes role permissions) ──
  const refreshPermissions = useCallback(async () => {
    const role = userType;
    if (role) {
      setPermissionsLoaded(false);
      await fetchPermissions(role);
    }
  }, [userType, fetchPermissions]);

  // ── Restore session on app start ───────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = getAccessToken();
      const cachedUser = localStorage.getItem('user');

      console.log('🔄 Restoring session...');

      if (!token || !cachedUser) {
        setLoading(false);
        return;
      }

      try {
        const session = await getCurrentSession();
        applySession(session);
        console.log('✅ Session restored successfully');
      } catch (error) {
        console.error('❌ Session restore error:', error);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);   // deliberately empty — runs once on mount

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      console.log('🔐 AuthContext: Login attempt');
      const data = await apiLogin(email, password);

      console.log('✅ Login response data:', data);
      applySession(data);

      const userData = data?.user || data;
      const resolvedUserType = userData?.user_type || userData?.role || null;

      console.log('👤 User logged in:', userData);

      return {
        userType: resolvedUserType,
        clinic: data?.clinic || null,
      };
    } catch (error) {
      console.error('❌ AuthContext login error:', error);
      throw error;
    }
  };

  const logout = () => {
    clearSession();
  };

  const isSuperAdmin = () => userType === 'super_admin';
  const isClinicAdmin = () => userType === 'clinic_admin';

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        currentClinic,
        userType,
        loading,
        login,
        logout,
        refreshSession,
        refreshPermissions,
        isSuperAdmin,
        isClinicAdmin,
        // Permission API
        hasPermission,
        permissions,
        permissionsLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
