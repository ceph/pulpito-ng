import { usePageContext } from 'vike-react/usePageContext'

export function Page() {
  const pageContext = usePageContext()

  let msg: string // Message shown to the user
  const { abortReason, abortStatusCode } = pageContext
  if (abortReason?.notAdmin) {
    // Handle `throw render(403, { notAdmin: true })`
    msg = "You cannot access this page because you aren't an administrator."
  } else if (typeof abortReason === 'string') {
    // Handle `throw render(abortStatusCode, `You cannot access ${someCustomMessage}`)`
    msg = abortReason
  } else if (abortStatusCode === 403) {
    // Handle `throw render(403)`
    msg = "You cannot access this page because you don't have enough privileges."
  } else if (abortStatusCode === 401) {
    // Handle `throw render(401)`
    msg = "You cannot access this page because you aren't logged in. Please log in."
  } else {
    // Fallback error message
    msg = pageContext.is404 ?
      "This page doesn't exist." :
      "Failed to fetch data; is teuthology-api reachable?"
  }

  console.log(pageContext)
  return <p>{msg}</p>
}

// When using TypeScript you can define the type of `abortReason`
declare global {
  namespace Vike {
    interface PageContext {
      abortReason?:
        | string
        | { notAdmin: true }
    }
  }
}
