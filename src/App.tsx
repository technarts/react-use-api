import React, {useState} from 'react';
import { useApi } from "./pkg/index"
import type { CallResult } from "./pkg/index";
import './App.css'

function App() {
  const [title, setTitle] = useState('')
  const [resultResponse, setResultResponse] = useState<CallResult<{ status: string; data: number[]; } | null>>()
  const [getUrl, setGetUrl] = useState('https://dummyjson.com/products/1')
  const [getWithPromiseUrl, setGetWithPromiseUrl] = useState('https://dummyjson.com/products/1')
  const [postUrl, setPostUrl] = useState('https://dummyjson.com/products/add')
  const [downloadUrl, setDownloadUrl] = useState('https://pbs.twimg.com/profile_images/459271147347906560/ytA20381_400x400.jpeg')
  const [uploadUrl, setUploadUrl] = useState('https://filebin.net/ppkj55e4jturjty7/test.pdf')
  const linkRef: React.MutableRefObject<HTMLAnchorElement | null> = React.useRef(null);
  const adminHelpDocInputRef: React.MutableRefObject<HTMLInputElement | null> = React.useRef(null);

  const apiGetter = useApi<{ status: string, data: number[] }>({
    url: getUrl,
    method: "GET"
  });

  const apiGetterWithPromise = useApi<{ status: string, data: number[] }>({
    url: getWithPromiseUrl,
    method: "GET"
  });

  const apiPoster = useApi<{ status: string, data: number[] }>({
    url: postUrl,
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
  });

  const apiDownloader = useApi<Blob>({
    url: downloadUrl,
    method: "DOWNLOAD",
  });

  const apiUploader = useApi<Blob>({
    url: uploadUrl,
    method: "UPLOAD",
    headers: {
      'Content-Type': 'application/octet-stream',
      'accept': 'application/json',
    }
  });

  React.useEffect(() => {
      if (apiDownloader.RESP && linkRef.current) {
        linkRef.current.href = URL.createObjectURL(apiDownloader.RESP);
        linkRef.current.download = `file.jpg`;
        linkRef.current.click();
      }
  }, [apiDownloader.RESP])

  return (
    <div>
      <div className={"method-section"}>
        <h3>GET</h3>
        <input
          type="text"
          value={getUrl}
          onChange={(e) => setGetUrl(e.target.value)}
        />
        <button onClick={() => apiGetter.call()}>
          Send Get Request
        </button>
        <div className={"output-section"}>
          <b>RESP:</b> <br/>
          <code>{apiGetter?.RESP ? JSON.stringify(apiGetter?.RESP) : ''}</code> <br/>
          <b>error:</b>
          <code>{apiGetter?.error ? JSON.stringify(apiGetter?.error) : ''}</code> <br/>
          <b>fault:</b>
          <code>{apiGetter?.fault ? JSON.stringify(apiGetter?.fault) : ''}</code> <br/>
          <b>inFlight:</b>
          <code>{JSON.stringify(apiGetter?.inFlight)}</code> <br/>
          <b>url:</b>
          <code>{getUrl}</code> <br/>
        </div>
      </div>
      <div className={"method-section"}>
        <h3>GET WITH PROMISE</h3>
        <input
          type="text"
          value={getWithPromiseUrl}
          onChange={(e) => setGetWithPromiseUrl(e.target.value)}
        />
        <button onClick={() => apiGetterWithPromise.call().then((r) => {
          setResultResponse(r)
        }
        )}>
          Send Get Request
        </button>
        <div className={"output-section"}>
          <b>RESP:</b> <br/>
          <code>{resultResponse?.resp ?JSON.stringify(resultResponse?.resp) : ""}</code> <br/>
          <b>error:</b>
          <code>{resultResponse?.error ?JSON.stringify(resultResponse?.error) : ""}</code> <br/>
          <b>fault:</b>
          <code>{resultResponse?.fault ?JSON.stringify(resultResponse?.fault) : ""}</code> <br/>
          <b>inFlight:</b>
          <code>{JSON.stringify(apiGetter?.inFlight)}</code> <br/>
          <b>url:</b>
          <code>{getWithPromiseUrl}</code> <br/>
        </div>
      </div>

      <div className={"method-section"}>
        <h3>POST</h3>
        <input
          type="text"
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
        />
        <input
          type="text"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          placeholder={"Give me a string."}
        />
        <button onClick={() => apiPoster.call({'payload': {"title": title}})}>
          Send Post Request
        </button>
        <div className={"output-section"}>
          <b>RESP:</b> <br/>
          <code>{apiPoster?.RESP ? JSON.stringify(apiPoster?.RESP) : ''}</code> <br/>
          <b>error:</b>
          <code>{apiPoster?.error ? JSON.stringify(apiPoster?.error) : ''}</code> <br/>
          <b>fault:</b>
          <code>{apiPoster?.fault ? JSON.stringify(apiPoster?.fault) : ''}</code> <br/>
          <b>inFlight:</b>
          <code>{JSON.stringify(apiPoster?.inFlight)}</code> <br/>
          <b>url:</b>
          <code>{postUrl}</code> <br/>
        </div>
      </div>

      <div className={"method-section"}>
        <h3>DOWNLOAD</h3>
        <input
          type="text"
          value={downloadUrl}
          onChange={(e) => setDownloadUrl(e.target.value)}
        />
        <button onClick={() => apiDownloader.call()}>
          Send Download Request
        </button>
        <a ref={linkRef} style={{ display: 'none' }}></a>
        <div className={"output-section"}>
          <b>RESP:</b> <br/>
          <code>{apiDownloader?.RESP ? JSON.stringify(apiDownloader?.RESP) : ''}</code> <br/>
          <b>error:</b>
          <code>{apiDownloader?.error ? JSON.stringify(apiDownloader?.error) : ''}</code> <br/>
          <b>fault:</b>
          <code>{apiDownloader?.fault ? JSON.stringify(apiDownloader?.fault) : ''}</code> <br/>
          <b>inFlight:</b>
          <code>{JSON.stringify(apiDownloader?.inFlight)}</code> <br/>
          <b>url:</b>
          <code>{downloadUrl}</code> <br/>
        </div>
      </div>

      <div className={"method-section"}>
        <div style={{display: "flex"}}>
          <h3>UPLOAD</h3><p>*Run browser without CORS protection to work with upload request.</p>
        </div>
        <input
          ref={adminHelpDocInputRef}
          style={{ display: "none" }}
          type='file'
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files ? event.target.files[0] : null
            apiUploader.call({
              payload: file
            });
          }}
        />
        <input
          type="text"
          value={uploadUrl}
          onChange={(e) => setUploadUrl(e.target.value)}
        />
        <button onClick={() => adminHelpDocInputRef.current?.click()}>
          Select File and Send Upload Request
        </button>
        <a ref={linkRef} style={{ display: 'none' }}></a>
        <div className={"output-section"}>
          <b>RESP:</b> <br/>
          <code>{apiUploader?.RESP ? JSON.stringify(apiUploader?.RESP) : ''}</code> <br/>
          <b>error:</b>
          <code>{apiUploader?.error ? JSON.stringify(apiUploader?.error) : ''}</code> <br/>
          <b>fault:</b>
          <code>{apiUploader?.fault ? JSON.stringify(apiUploader?.fault) : ''}</code> <br/>
          <b>inFlight:</b>
          <code>{JSON.stringify(apiUploader?.inFlight)}</code> <br/>
          <b>url:</b>
          <code>{uploadUrl}</code> <br/>
        </div>
      </div>
    </div>
  );
}

export default App;
