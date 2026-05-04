import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WishlistProvider } from './context/WishlistContext';
import Layout from './components/Layout';
import CalendarView from './pages/CalendarView';
import Wishlist from './pages/Wishlist';
import Dashboard from './pages/Dashboard';
import GameDetail from './pages/GameDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WishlistProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<CalendarView />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="game/:id" element={<GameDetail />} />
            </Route>
          </Routes>
        </Router>
      </WishlistProvider>
    </QueryClientProvider>
  );
}

export default App;
