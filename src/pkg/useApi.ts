import * as React from "react";

import {
  ApiCounsel,
  Params,
  CallParams
} from "./types";

export default function useApi<T>(params: Params) {
  // Data after a successful fetch operation:
  const [RESP, setResp] = React.useState<T | null>(null);

  // Data after a successful fetch operation,
  // but the response is not ok:
  const [error, setError] = React.useState<any>(null);

  // Data after an unsuccessful fetch operation:
  const [fault, setFault] = React.useState<any>(null);

  // Is there an ongoing request?:
  const [inFlight, setInFlight] = React.useState(false);

  const call = async (callParams?: CallParams) => {
    setInFlight(true);

    const url = callParams?.url || params.url;
    const headers = callParams?.headers || params.headers;
    let body = callParams?.payload;
    let method = params.method;

    if (headers?.["Content-Type"] === "application/json")
      body = JSON.stringify(body);

    if (method === "UPLOAD")
      method = "POST";
    else if (method === "DOWNLOAD" && body)
      method = "POST";
    else if (method === "DOWNLOAD" && !body)
      method = "GET";

    const options = { method, headers, body };

    try {
      const response = await fetch(url, options)
        .then(r => params.responseGuard?.(r, { url, headers, payload: callParams?.payload }) || Promise.resolve(r))
        .then(r => ({
          ok: r.ok,
          data: params.method === "DOWNLOAD" ? r.blob() : r.json()
        }));

      if (response.ok) {
        setError(null);
        setFault(null);
        setResp(await response.data)
      } else {
        setResp(null);
        setFault(null);
        setError(await response.data)
      }
    } catch (e: any) {
      setResp(null);
      setError(null);
      setFault(e);
    } finally {
      setInFlight(false);
    }
  }

  return {
    RESP,
    inFlight,
    error,
    fault,
    url: params.url,
    call,
  } as ApiCounsel<T>;
}
