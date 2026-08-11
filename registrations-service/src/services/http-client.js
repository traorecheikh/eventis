const timeoutMs = () => Number.parseInt(process.env.HTTP_TIMEOUT_MS, 10) || 3000;

async function attempt(url, token) {
  const startedAt = Date.now();
  try {
    const response = await fetch(url, { headers: token ? { Authorization: token } : {}, signal: AbortSignal.timeout(timeoutMs()) });
    console.log(`GET ${url} ${response.status} ${Date.now() - startedAt}ms`);
    return response;
  } catch (error) {
    console.error(`GET ${url} NETWORK_ERROR ${Date.now() - startedAt}ms`);
    throw error;
  }
}

export async function getJson(url, token) {
  let response;
  try { response = await attempt(url, token); }
  catch {
    try { response = await attempt(url, token); }
    catch { const error = new Error("Service amont indisponible"); error.code = "SERVICE_UNAVAILABLE"; throw error; }
  }
  let data = null;
  try { data = await response.json(); } catch { data = null; }
  return { status: response.status, data };
}
