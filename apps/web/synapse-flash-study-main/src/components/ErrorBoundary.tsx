import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Error Boundary capturou um erro:', error);
    console.error('❌ Stack trace:', errorInfo.componentStack);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#f8f9fa',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>
              ⚠️ Erro na Aplicação
            </h1>

            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              Possíveis causas:
            </h2>

            <ul style={{ lineHeight: '1.8', marginBottom: '1.5rem' }}>
              <li><strong>Variáveis de ambiente não configuradas</strong> - Configure no painel da Vercel</li>
              <li><strong>Firebase não inicializado</strong> - Verifique as credenciais do Firebase</li>
              <li><strong>API não acessível</strong> - Verifique a URL da API (VITE_API_URL)</li>
            </ul>

            <details style={{ marginBottom: '1rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Detalhes do erro (clique para expandir)
              </summary>
              <pre style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '0.875rem'
              }}>
                {this.state.error?.toString()}
              </pre>
            </details>

            <div style={{
              padding: '1rem',
              backgroundColor: '#fff3cd',
              borderLeft: '4px solid #ffc107',
              borderRadius: '4px'
            }}>
              <strong>🔧 Para desenvolvedores:</strong>
              <p style={{ margin: '0.5rem 0 0 0' }}>
                Abra o console do navegador (F12) para ver mais detalhes do erro.
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                width: '100%'
              }}
            >
              🔄 Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
