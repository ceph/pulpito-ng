
export type Session = {
    session: {
        id: int,
        username: string
    }
}

export type KillRunPayload = {
    "--run": string,
    "--owner": string,
    "--machine-type": string, 
}
