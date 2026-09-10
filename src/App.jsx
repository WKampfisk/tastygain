import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from '@/lib/store';
import AppShell from '@/components/layout/AppShell';
import Welcome from '@/pages/Welcome';
import Onboarding from '@/pages/Onboarding';
import Today from '@/pages/Today';
import Meals from '@/pages/Meals';
import Kitchen from '@/pages/Kitchen';
import Shopping from '@/pages/Shopping';
import Tips from '@/pages/Tips';
import Settings from '@/pages/Settings';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/settings" element={<Settings />} />
          <Route element={<AppShell />}>
            <Route path="/today" element={<Today />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/home" element={<Kitchen />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route path="/tips" element={<Tips />} />
            <Route path="/support" element={<Navigate to="/tips" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
