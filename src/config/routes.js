import Dashboard from '@/components/pages/Dashboard';
import StoreSetup from '@/components/pages/StoreSetup';
import ProductSync from '@/components/pages/ProductSync';
import AITools from '@/components/pages/AITools';
import PriceSheets from '@/components/pages/PriceSheets';
import History from '@/components/pages/History';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  storeSetup: {
    id: 'storeSetup',
    label: 'Store Setup',
    path: '/store-setup',
    icon: 'Settings',
    component: StoreSetup
  },
  productSync: {
    id: 'productSync',
    label: 'Product Sync',
    path: '/product-sync',
    icon: 'RefreshCw',
    component: ProductSync
  },
  aiTools: {
    id: 'aiTools',
    label: 'AI Tools',
    path: '/ai-tools',
    icon: 'Bot',
    component: AITools
  },
  priceSheets: {
    id: 'priceSheets',
    label: 'Price Sheets',
    path: '/price-sheets',
    icon: 'FileSpreadsheet',
    component: PriceSheets
  },
  history: {
    id: 'history',
    label: 'History',
    path: '/history',
    icon: 'Clock',
    component: History
  }
};

export const routeArray = Object.values(routes);
export default routes;