import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { toast } from 'react-toastify'
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query'
import './index.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { API_URL } from './constants'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error: any) => {
      toast.error(`Error: ${error.message || 'Something went wrong'}`);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      toast.error(`Error: ${error.message || 'Something went wrong'}`);
    },
  }),
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
