import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Cookies } from "react-cookie";
import type { UseQueryResult } from "@tanstack/react-query";

const TEUTHOLOGY_API_SERVER =
    import.meta.env.VITE_TEUTHOLOGY_API || "";
const GH_USER_COOKIE = "GH_USER";

function getURL(relativeURL: URL | string): string {
    if (!TEUTHOLOGY_API_SERVER) return "";
    return new URL(relativeURL, TEUTHOLOGY_API_SERVER).toString();
}

function doLogin() {
    const url = getURL("/login/");
    if (url) window.location.href = url;
}

function doLogout() {
    const cookies = new Cookies();
    cookies.remove(GH_USER_COOKIE);

    const url = getURL("/logout/");
    window.location.href = url;
}

function doSchedule(commandValue: any, dryRun = false) {
    console.log("doSchedule");
    console.log(commandValue);
    let url;
    if (dryRun) {
        url = getURL("/suite?dry_run=true");
    } else {
        url = getURL("/suite?dry_run=false");
    }
    if (commandValue['--user'] != useUserData().get("username")) {
        console.log("Error: --user doesn't match username of current logged in account");
        return false;
    }
    axios.post(url, commandValue, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
    }).then((resp) => {
        console.log(resp);
    }, (error) => {
        console.log(error);
    });
}

function useSession(): UseQueryResult {
    const url = getURL("/");
    const query = useQuery({
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

export {
    doLogin,
    doLogout,
    doSchedule,
    useSession,
    useUserData,
}
