import axios from "axios";
import { Cookies } from "react-cookie";

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

function useSession() {
    // const url = getURL("/");
    // FIXME
    return false;
    // const query = useQuery<Session, Error>({
    //     queryKey: ['ping-api', { url }],
    //     queryFn: () => (
    //         axios.get(url.toString(), {
    //             withCredentials: true
    //         }).then((resp) => resp.data)
    //     ),
    //     retry: 1,
    //     enabled: url.toString() !== "",
    // });
    // return query;
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

function useRunKill() {
    const url = getURL("/kill/?logs=true");
    // FIXME
    return false;
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
