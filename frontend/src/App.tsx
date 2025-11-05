import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AppRouter } from './router';

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1A3636' } }}>
      <Router basename="/">
        <AppRouter />
      </Router>
    </ConfigProvider>
  );
}

export default App;
