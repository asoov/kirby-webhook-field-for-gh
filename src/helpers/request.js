
export function request(url, method, successHandler, errorHandler, payload, headers) {
  const http = new XMLHttpRequest();
  console.log('Headers', headers)
  http.open(method, url, true);
  if (headers) {
    http.setRequestHeader('Authorization', headers['Authorization'])
    http.setRequestHeader('Accept', headers['Accept'])
  }
  http.onreadystatechange = () => {
    if (http.readyState === 4 && http.status < 400) {
      if (successHandler) successHandler(http);
    } else if (http.readyState === 4) {
      if (errorHandler) errorHandler(http);
    }
  };

  if (payload) {
    http.setRequestHeader("Content-Type", "application/json");
    http.send(JSON.stringify(payload));
  } else {
    http.send();
  }
}
