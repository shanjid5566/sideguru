import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './route/router'
import { AuthProvider } from './context/AuthContext'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ScrollToTop />
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App