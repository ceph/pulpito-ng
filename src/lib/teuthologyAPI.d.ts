
export type Session = {
    session: {
        id: number,
        username: string,
        avatar_url: string,
        isUserAdmin?: boolean,
        role: string,
        state: string,
    }
}

export type KillRunPayload = {
    "--run": string,
    "--owner": string,
    "--machine-type": string, 
    "--preserve-queue": boolean,
}

export type KillRunResult = {
    kill: string;
    logs?: string;
}
