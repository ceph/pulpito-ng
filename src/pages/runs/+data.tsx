import type { PageContext } from 'vike/types'
import { useIsFetching, QueryClient } from "@tanstack/react-query";

import { useRuns, getURL, queryFn } from "#src/lib/paddles";

export default async function data(pageContext: PageContext) {
  const url = getURL("/runs/", pageContext.urlParsed.search);
  const response = await fetch(url);
  return await response.json();

  const queryClient = new QueryClient();
  return await queryClient.fetchQuery({
    queryKey: ["runs", { url: getURL("/runs/", pageContext.urlParsed.search) }],
    queryFn: queryFn,
  })
}
