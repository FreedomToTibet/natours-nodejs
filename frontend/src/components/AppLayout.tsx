import { Outlet } from 'react-router-dom';

function AppLayout() {
  return (
    <div>
      <h1>App Layout</h1>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
