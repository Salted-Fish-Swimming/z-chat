async function post (url, postData) {
  console.log(postData);
  try {
    const resp = await fetch(url, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    const data = await resp.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    return {
      type: 'error',
      message: '资源不存在',
    }
  }
}

export {
  post,
} 