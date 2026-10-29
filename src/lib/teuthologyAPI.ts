import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Cookies } from "react-cookie";

import type { Session, KillRunPayload, KillRunResult } from "./teuthologyAPI.d"
import { getRuntimeConfig } from "./config";

// The teuthology API runs on its own host and keeps the login session in its
// own cookies, which are never sent to pulpito's server. So, like before the
// SSR conversion, session lookups and kills happen from the browser, using
// credentialed cross-origin requests.
const TEUTHOLOGY_API_SERVER = getRuntimeConfig().teuthologyApi;
const GH_USER_COOKIE = "GH_USER";

function getURL(relativeURL: string): string {
    if ( ! TEUTHOLOGY_API_SERVER ) return "";
    return new URL(relativeURL, TEUTHOLOGY_API_SERVER).toString();
}

function doLogin() {
    const url = getURL("/login/");
    if ( url ) window.location.href = url;
}

function doLogout() {
    const cookies = new Cookies();
    cookies.remove(GH_USER_COOKIE);
    const url = getURL("/logout/");
    if ( url ) window.location.href = url;
}

type SessionState = {
    data?: Session;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
};

// Shared across components and client-side navigations; fetched once per page load
let sessionPromise: Promise<Session> | undefined;

function useSession(): SessionState {
    const [state, setState] = useState<SessionState>({
        isLoading: true, isError: false, isSuccess: false,
    });
    useEffect(() => {
        const url = getURL("/");
        if ( ! url ) {
            setState({ isLoading: false, isError: true, isSuccess: false });
            return;
        }
        if ( ! sessionPromise ) {
            sessionPromise = axios.get<Session>(url, { withCredentials: true, timeout: 10000 })
                .then(resp => resp.data);
            // allow a retry on the next mount if this one fails
            sessionPromise.catch(() => { sessionPromise = undefined; });
        }
        let active = true;
        sessionPromise.then(
            data => { if ( active ) setState({ data, isLoading: false, isError: false, isSuccess: true }) },
            () => { if ( active ) setState({ isLoading: false, isError: true, isSuccess: false }) },
        );
        return () => { active = false; };
    }, []);
    return state;
}

type RunKillState = {
    data?: KillRunResult;
    error: Error | null;
    isPending: boolean;
    isError: boolean;
    isSuccess: boolean;
};

const initialKillState: RunKillState = {
    error: null, isPending: false, isError: false, isSuccess: false,
};

function useRunKill() {
    const [state, setState] = useState<RunKillState>(initialKillState);
    const mutate = useCallback((payload: KillRunPayload) => {
        setState({ ...initialKillState, isPending: true });
        axios.post<KillRunResult>(getURL("/kill/?logs=true"), payload, { withCredentials: true })
            .then(resp => setState({ ...initialKillState, data: resp.data, isSuccess: true }))
            .catch(error => {
                const detail = error.response?.data?.detail;
                const message = typeof detail === "string" ? detail : error.message;
                setState({ ...initialKillState, error: new Error(message), isError: true });
            });
    }, []);
    const reset = useCallback(() => setState(initialKillState), []);
    return { ...state, mutate, reset };
}

export {
    doLogin,
    doLogout,
    useSession,
    useRunKill,
}
