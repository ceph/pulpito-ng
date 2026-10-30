import { fetchPaddles } from "#src/lib/paddles";

export default async function data() {
  return fetchPaddles({ endpoint: "/runs/queued/" })
}
