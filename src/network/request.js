import axios from "axios";
// 导入NProgress包对应的JS和CSS
import NProgress from 'nprogress'

export function Login(config){
  const instance = axios.create({
    baseURL:'http://127.0.0.1:8888/api/private/v1/',
    method:'post',
    timeout: 5000
  });
  instance.interceptors.request.use(config=>{
    NProgress.start();
    return config;
  });
  instance.interceptors.response.use(config=>{
    NProgress.done();
    return config;
  },()=>{
    NProgress.done();
  });
  return instance(config);
}

export function get(config){
  const instance = axios.create({
    baseURL:'http://127.0.0.1:8888/api/private/v1/',
    method:'get',
    timeout: 5000
  });
  //  在request拦截器中，展示进度条 NProgress.start()
  instance.interceptors.request.use(config=>{
    NProgress.start();
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config;
  });
  //  在response拦截器中，隐藏进度条 NProgress.done()
  instance.interceptors.response.use(config=>{
    NProgress.done();
    return config;
  },()=>{
    NProgress.done();
  });
  return instance(config);
}

export function put(config){
  const instance = axios.create({
    baseURL:'http://127.0.0.1:8888/api/private/v1/',
    method:'put',
    timeout: 5000
  });
  instance.interceptors.request.use(config=>{
    NProgress.start();
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config;
  });
  instance.interceptors.response.use(config=>{
    NProgress.done();
    return config;
  },()=>{
    NProgress.done();
  });
  return instance(config);
}

export function post(config){
  const instance = axios.create({
    baseURL:'http://127.0.0.1:8888/api/private/v1/',
    method:'post',
    timeout: 5000
  });
  instance.interceptors.request.use(config=>{
    NProgress.start();
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config;
  });
  instance.interceptors.response.use(config=>{
    NProgress.done();
    return config;
  },()=>{
    NProgress.done();
  });
  return instance(config);
}

export function Delete(config){
  const instance = axios.create({
    baseURL:'http://127.0.0.1:8888/api/private/v1/',
    method:'delete',
    timeout: 5000
  });
  instance.interceptors.request.use(config=>{
    NProgress.start();
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config;
  });
  instance.interceptors.response.use(config=>{
    NProgress.done();
    return config;
  },()=>{
    NProgress.done();
  });
  return instance(config);
}