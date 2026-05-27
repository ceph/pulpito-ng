import axios from "axios";
import { Cookies } from "react-cookie";
import { usePageContext } from "vike-react/usePageContext";

import { Session, KillRunResult } from "./teuthologyAPI.d"

import { isServer } from "./utils";

const TEUTHOLOGY_API_SERVER = (
  isServer()?
    process.env.VITE_TEUTHOLOGY_API || import.meta.env.VITE_TEUTHOLOGY_API :
    import.meta.env.VITE_TEUTHOLOGY_API
) || "";
const GH_USER_COOKIE = "GH_USER";

function getURL(relativeURL: URL|string): URL {
    return new URL(relativeURL, TEUTHOLOGY_API_SERVER);
}

function getLoginURL() {
    const url = getURL('login');
    url.searchParams.set("dest", window.location.href);
    return url
}

function doLogin(destinationUrl: string) {
    const url = getURL("/login/");
    url.searchParams.set("dest", destinationUrl);
    window.location.href = url.toString();
}

function doLogout() {
    const cookies = new Cookies();
    cookies.remove(GH_USER_COOKIE);
    
    const url = getURL("/logout/");
    window.location.href = url.toString();
}

/**
 * Hook to access user session data from page context
 * Session is validated server-side and passed to client via SSR
 */
function useSession(): { data?: Session; isLoading: boolean; isError: boolean; isSuccess: boolean; error: Error | null } {
    const pageContext = usePageContext();
    const user = pageContext.user;
    
    // Return compatible object structure matching the previous React Query API
    return {
        data: user ? { session: user } : undefined,
        isLoading: false,
        isError: false,
        isSuccess: true, // Always true since session is loaded during SSR
        error: null,
    };
}

function useUserData(): Map<string, string> {
    const cookies = new Cookies();
    const cookie = cookies.get(GH_USER_COOKIE);
    if (cookie) {
        const cookie_ = cookie.replace(/\\073/g, ';');
        let cookieMap: Map<string, string> = new Map();
        let cookieSegments = cookie_.split(";");
        cookieSegments.forEach((cookie: string) => {
            let [key, value] = cookie.split("=");
            cookieMap.set(key.trim(), value.trim());
        })
        return cookieMap;
    };
    return new Map();
}

function useRunKill(): { data?: KillRunResult; isLoading: boolean; isPending: boolean; isError: boolean; isSuccess: boolean; error: Error | null; mutate: (payload: any) => void; reset: () => void } {
    const url = getURL("/kill/?logs=true");
    // FIXME: Returning mock mutation object to prevent TypeErrors
    return {
        data: undefined,
        isLoading: false,
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
        mutate: () => {},
        reset: () => {},
    };
    // const mutation: UseMutationResult<KillRunResult> = useMutation({
    //     mutationKey: ['run-kill', { url }],
    //     mutationFn: (payload) => (
    //         axios.post(url.toString(), payload, {
    //             withCredentials: true
    //         })
    //     ),
    //     retry: 0,
    // });
    // return mutation;
}

export {
    getURL,
    getLoginURL,
    doLogin,
    doLogout,
    useSession,
    useUserData,
    useRunKill,
}
