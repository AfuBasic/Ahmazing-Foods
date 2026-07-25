import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { Layout } from './components/layout';
import Home from './pages/home';
import MenuPage from './pages/menu';
import ProductsPage from './pages/products';
import CateringPage from './pages/catering';
import BookPage from './pages/book';
import BookingConfirmedPage from './pages/booking-confirmed';
import WeekendSpecialsPage from './pages/weekend-specials';
import HealthyMealsPage from './pages/healthy-meals';
import BlogIndexPage from './pages/blog/index';
import DiabetesFriendlyPage from './pages/blog/diabetes-friendly';
import SoupLessOilPage from './pages/blog/soup-less-oil';
import HeartHealthyPage from './pages/blog/heart-healthy';
import TraysAndPlattersPage from './pages/trays-platters';
import AdminDashboard from './pages/admin/dashboard';
import AdminOrdersList from './pages/admin/orders';
import AdminOrderDetail from './pages/admin/order-detail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/soups" component={MenuPage} />
        <Route path="/stews" component={MenuPage} />
        <Route path="/breakfast" component={MenuPage} />
        <Route path="/weekend-specials" component={WeekendSpecialsPage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/healthy-meals" component={HealthyMealsPage} />
        <Route path="/blog" component={BlogIndexPage} />
        <Route path="/blog/diabetes-friendly-nigerian-foods" component={DiabetesFriendlyPage} />
        <Route path="/blog/nigerian-soups-less-oil" component={SoupLessOilPage} />
        <Route path="/blog/heart-healthy-nigerian-kitchen" component={HeartHealthyPage} />
        <Route path="/trays-platters" component={TraysAndPlattersPage} />
        <Route path="/catering" component={CateringPage} />
        <Route path="/book" component={BookPage} />
        <Route path="/booking-confirmed/:id" component={BookingConfirmedPage} />

        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/orders" component={AdminOrdersList} />
        <Route path="/admin/orders/:id" component={AdminOrderDetail} />

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
