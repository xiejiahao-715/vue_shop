import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const Login = ()=>import('@/views/login/Login')
const Home = ()=>import('@/views/home/Home')
const Welcome = ()=>import('@/views/welcome/Welcome')
const Users = ()=>import('@/views/user/Users')
const Rights = ()=>import('@/views/power/Rights')
const Roles = ()=>import('@/views/power/Roles')
const Categories = ()=>import('@/views/good/Categories')
const Params = ()=>import('@/views/good/Params')
const routes = [
  {
    path:'/',
    redirect: '/login'
  },
  {
    path:'/login',
    component: Login
  },
  {
    path:'/home',
    component: Home,
    redirect: '/welcome',
    children:[
      {
        path:'/welcome',
        component: Welcome
      },
      {
        path:'/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path:'/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/params',
        component: Params
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if(to.path==='/login') return next();
  const tokenStr = window.sessionStorage.getItem('token');
  if(!tokenStr) return next('/login');
  next();
})

export default router
