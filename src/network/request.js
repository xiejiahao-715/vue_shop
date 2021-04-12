import axios from "axios";

export function Login(config){
  const instance = axios.create({
    baseURL:'http://127.0.0.1:8888/api/private/v1/',
    method:'post',
    timeout: 5000
  });
  return instance(config);
}

export function get(config){
  const instance = axios.create({
    baseURL:'http://127.0.0.1:8888/api/private/v1/',
    method:'get',
    timeout: 5000
  });
  instance.interceptors.request.use(config=>{
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config;
  })
  return instance(config);
}

export function put(config){
  const instance = axios.create({
    baseURL:'http://127.0.0.1:8888/api/private/v1/',
    method:'put',
    timeout: 5000
  });
  instance.interceptors.request.use(config=>{
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config;
  })
  return instance(config);
}

export function post(config){
  const instance = axios.create({
    baseURL:'http://127.0.0.1:8888/api/private/v1/',
    method:'post',
    timeout: 5000
  });
  instance.interceptors.request.use(config=>{
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config;
  })
  return instance(config);
}

export function Delete(config){
  const instance = axios.create({
    baseURL:'http://127.0.0.1:8888/api/private/v1/',
    method:'delete',
    timeout: 5000
  });
  instance.interceptors.request.use(config=>{
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config;
  })
  return instance(config);
}