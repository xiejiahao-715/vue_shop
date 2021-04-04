import axios from "axios";

export function postLogin(config){
  const instance = axios.create({
    baseURL:'http://127.0.0.1:5000/api',
    timeout: 5000
  });
  return instance(config);
}

export function get(config){
  const instance = axios.create({
    baseURL:'http://127.0.0.1:5000/api',
    timeout: 5000
  });
  instance.interceptors.request.use(config=>{
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config;
  })
  return instance(config);
}