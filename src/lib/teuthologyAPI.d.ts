
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

// Extend Vike's PageContext to include user session
declare global {
    namespace Vike {
        interface PageContext {
            user?: Session['session'];
        }
    }
}
