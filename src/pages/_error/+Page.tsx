import { usePageContext } from 'vike-react/usePageContext'

// 404 | 401 | 403 | 410 | 429 | 500 | 503
const messagesByCode = {
  "-1": "Unknown error :(",
  401: "You cannot access this page because you aren't logged in. Please log in.",
  403: "You cannot access this page because you don't have enough privileges.",
  404: "This page doesn't exist.",
}

export function Page() {
  const pageContext = usePageContext()
  let msg: string
  const { abortReason, abortStatusCode } = pageContext
  msg = abortReason || messagesByCode[abortStatusCode || -1]
  return <p style={{fontSize: "1rem", textAlign: "center"}}>{msg}</p>
}

declare global {
  namespace Vike {
    interface PageContext {
      abortReason?: string;
    }
  }
}
