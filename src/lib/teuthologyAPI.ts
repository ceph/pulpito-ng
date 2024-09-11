import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { Cookies } from "react-cookie";
import { Session } from "./teuthologyAPI.d"

const TEUTHOLOGY_API_SERVER = 
    import.meta.env.VITE_TEUTHOLOGY_API || "";
const GH_USER_COOKIE = "GH_USER";

function getURL(relativeURL: URL|string): string {
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
    window.location.href = url;
}

function useSession(): UseQueryResult<Session> {
    const url = getURL("/");
    const query = useQuery<Session, Error>({
        queryKey: ['ping-api', { url }],
        queryFn: () => (
            axios.get(url, {
                withCredentials: true
            }).then((resp) => resp.data)
        ),
        retry: 1,
        enabled: url !== "",
    });
    return query;
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

function useRunKill(): UseMutationResult {
    const data = {
        "name": "Foo",
        "description": "An optional description",
        "price": 45.2,
        "tax": 3.5
    }
    const url = getURL("/kill/test/");
    const mutation: UseMutationResult = useMutation({
        mutationKey: ['run-kill', { url }],
        mutationFn: (payload) => (
            axios.post(url, data, {
                withCredentials: true
            })
        ),
        retry: 0,
    });
    return mutation;
}

export {
    doLogin,
    doLogout,
    useSession,
    useUserData,
    useRunKill,
}
