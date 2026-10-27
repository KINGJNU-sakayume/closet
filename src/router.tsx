import { createBrowserRouter } from 'react-router-dom';
import { AppLayout, type RouteHandle } from './components/AppLayout';
import { Closet } from './pages/Closet';
import { DevComponents } from './pages/DevComponents';
import { Explore } from './pages/Explore';
import { Fitting } from './pages/Fitting';
import { Landing } from './pages/Landing';
import { Register } from './pages/Register';
import { Shopping } from './pages/Shopping';

const h = (handle: RouteHandle) => handle;

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Landing />, handle: h({ title: 'Closet / Look', chrome: 'landing' }) },
      { path: '/explore', element: <Explore />, handle: h({ title: '룩 탐색' }) },
      { path: '/fitting/:lookId?', element: <Fitting />, handle: h({ title: '피팅룸' }) },
      { path: '/closet', element: <Closet />, handle: h({ title: '내 옷장' }) },
      { path: '/shopping', element: <Shopping />, handle: h({ title: '쇼핑 리스트' }) },
      { path: '/register', element: <Register />, handle: h({ title: '옷 등록', chrome: 'modal' }) },
      { path: '/dev/components', element: <DevComponents />, handle: h({ title: '공통 컴포넌트' }) },
    ],
  },
]);
