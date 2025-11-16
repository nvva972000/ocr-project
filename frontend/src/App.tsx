import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './store';
import { AppRouter } from './routes/AppRouter';
import ToastContainer from './components/common/ToastContainer';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={{ token: { colorPrimary: '#1A3636' } }}>
          <Router basename="/">
            <AppRouter />
          </Router>
          <ToastContainer />
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
