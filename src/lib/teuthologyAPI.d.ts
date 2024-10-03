
export type Session = {
    session: {
        id: int,
        username: string,
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
