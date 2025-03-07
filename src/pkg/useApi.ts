import * as React from "react";

import {
  ApiCounsel,
  Params,
  CallParams,
  CallResult
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
    const result: CallResult<T> = { resp: null, error: null, fault: null };
    setInFlight(true);

    const url = callParams?.url || params.url;
    const headers = callParams?.headers || params.headers;
    const credentials: RequestCredentials = "include"
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

    const options = { method, headers, body, credentials };

    try {
      const response = await fetch(url, options)
        .then(r => params.responseGuard?.(r, { url, headers, payload: callParams?.payload }) || Promise.resolve(r))
        .then(r => ({
          ok: r.ok,
          data: params.method === "DOWNLOAD" && r.ok ? r.blob() : r.json()
        }));

      if (response.ok)
        result.resp = await response.data;
      else
        result.error = await response.data;
    } catch (e: any) {
      result.resp = null;
      result.error = null;
      result.fault = e;
    } finally {
      setInFlight(false);
      setResp(result.resp);
      setError(result.error);
      setFault(result.fault);
    }

    return result;
  }
  
  return {
    RESP,
    inFlight,
    error,
    fault,
    url: params.url,
    call: (params: Parameters<typeof call>[0]) => new Promise<CallResult<T>>((resolve) => {
      const result = call(params);
      resolve(result);
    })
  } as ApiCounsel<T>;
}

