import HelloWorld from '../containor/HelloWorld'
import Home from '../containor/Home'

const routes = [
  {
    path: '/helloWorld',
    element: <HelloWorld />
  },
  {
    path: '/*',
    element: <Home />
  }
]

export default routes
