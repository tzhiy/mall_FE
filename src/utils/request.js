import axios from "axios";

const instance = axios.create({
  baseURL: 'api',
  timeout: 10000
})

export const get = (url, params = {}, header = {}) => {
  return new Promise((resolve, reject) => {
    instance.get(url,
      {
        params,
        headers: {
          "Content-Type": "application/json",
          ...header
        },
      },
    ).then(response => {
      resolve(response.data);
    }, err => {
      reject(err);
    })
  })
}

export const post = (url, data = {}, header = {}, params = {}) => {
  return new Promise((resolve, reject) => {
    instance.post(url, data, {
      headers: {
        "Content-Type": "application/json", ...header
      },
      params
    }).then(response => {
      resolve(response.data);
    }, err => {
      reject(err);
    })
  })
}

export const put = (url, data = {}, header = {}) => {
  return new Promise((resolve, reject) => {
    instance.put(url, data, {
      headers: {
        "Content-Type": "application/json", ...header
      }
    }).then(response => {
      resolve(response.data);
    }, err => {
      reject(err);
    })
  })
}

export const deleteMethod = (url, header = {}, params = {}) => {
  return new Promise((resolve, reject) => {
    instance.delete(url, {
      headers: {
        "Content-Type": "application/json", ...header
      },
      params,
    }).then(response => {
      resolve(response.data);
    }, err => {
      reject(err);
    })
  })
}