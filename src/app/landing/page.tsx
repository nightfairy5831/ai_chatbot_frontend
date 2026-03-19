import { useState } from 'react'

type LandingView = 'hero' | 'platform' | 'pricing'

function LandingPage({ onGoToLogin }: { onGoToLogin: () => void }) {
  const [view, setView] = useState<LandingView>('hero')

  if (view === 'pricing') {
    return <PricingSection onBack={() => setView('platform')} onGoToLogin={onGoToLogin} />
  }

  if (view === 'platform') {
    return <PlatformSection onShowPricing={() => setView('pricing')} onGoToLogin={onGoToLogin} onBackToHero={() => setView('hero')} />
  }

  return <HeroSection onStart={() => setView('platform')} />
}

/* ─── Hero Section ─── */
function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <div className="landing-hero">
      <div className="landing-hero-content">
        <div className="landing-logo">
          <img className="landing-logo-icon" src="/icon.png" alt="LeadLab" />
          <span className="landing-logo-text">
            <span className="landing-logo-lead">Lead</span>
            <span className="landing-logo-lab">Lab</span>
          </span>
        </div>

        <h1 className="landing-hero-title">
          O futuro das vendas PME<br />
          é automático e descomplicado.
        </h1>

        <button className="landing-hero-cta" onClick={onStart}>
          Let's do it!
        </button>
      </div>

      <footer className="landing-footer">
        <div className="landing-footer-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 4L12 13L2 4" />
          </svg>
          <span>contato@leadlab.com.br</span>
        </div>
        <div className="landing-footer-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>www.leadlab.com.br</span>
        </div>
        <div className="landing-footer-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="17.5" cy="6.5" r="1.5" />
          </svg>
          <span>@leadlab.ai</span>
        </div>
      </footer>
    </div>
  )
}

/* ─── Platform Section ─── */
function PlatformSection({ onShowPricing, onGoToLogin, onBackToHero }: { onShowPricing: () => void; onGoToLogin: () => void; onBackToHero: () => void }) {
  const [searchValue, setSearchValue] = useState('')

  return (
    <div className="landing-platform">
      <div className="landing-platform-header">
        <span className="landing-section-label" style={{ cursor: 'pointer' }} onClick={onBackToHero}>Landind Page</span>
        <h2 className="landing-platform-title">Croqui da Plataforma – Guia para Dev</h2>
      </div>

      <div className="landing-platform-content">
        <div className="landing-logo landing-logo--large">
          <span className="landing-logo-text">
            <span className="landing-logo-lead">Lead</span>
            <span className="landing-logo-lab">Lab</span>
          </span>
        </div>

        <div className="landing-search-bar">
          <button className="landing-search-icon-btn">+</button>
          <input
            className="landing-search-input"
            type="text"
            placeholder="Digite sua mensagem..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button className="landing-search-close" onClick={() => setSearchValue('')}>&times;</button>
          )}
          <button className="landing-search-ai">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {/* Sparkle/star search icon */}
              <path d="M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z" />
              <path d="M21 21l-4-4" />
              <path d="M10 7v6" />
              <path d="M7 10h6" />
            </svg>
            Modo IA
          </button>
        </div>

        <div className="landing-platform-actions">
          <button className="landing-platform-btn" onClick={onGoToLogin}>
            Dados da empresa
          </button>
          <button className="landing-platform-btn" onClick={onShowPricing}>
            Planos disponíveis
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Pricing Section ─── */
function PricingSection({ onBack, onGoToLogin }: { onBack: () => void; onGoToLogin: () => void }) {
  const plans = [
    {
      name: 'Starter',
      price: 'R$ 197',
      description: 'Para pequenos negócios validarem a automação.',
      features: [
        '500 leads/mês',
        '1 persona',
        'CRM Integrado',
        'Remarketing básico',
        'Relatórios simples',
      ],
      recommended: false,
    },
    {
      name: 'Growth',
      price: 'R$ 397',
      description: 'Para empresas em expansão que precisam de volume.',
      features: [
        '2.500 leads/mês',
        '3 personas',
        'Aprendizado contínuo',
        'Insights avançados',
        'Sugestão de resposta',
      ],
      recommended: true,
    },
    {
      name: 'Scale',
      price: 'R$ 797',
      description: 'Para operações de alto volume e máxima performance.',
      features: [
        'Leads ilimitados',
        'Personas ilimitadas',
        'Scripts dinâmicos',
        'Previsão de conversão',
        'Suporte prioritário',
      ],
      recommended: false,
    },
  ]

  return (
    <div className="landing-pricing">
      <button className="landing-back-btn" onClick={onBack}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>

      <div className="landing-pricing-header">
        <span className="landing-section-label">Modelo de Negócio SaaS</span>
        <h2 className="landing-pricing-title">
          Três planos para cada estágio de crescimento
        </h2>
      </div>

      <div className="landing-pricing-grid">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`landing-plan-card${plan.recommended ? ' landing-plan-card--recommended' : ''}`}
          >
            {plan.recommended && (
              <div className="landing-plan-badge">Recomendado</div>
            )}
            <h3 className="landing-plan-name">{plan.name}</h3>
            <div className="landing-plan-price">
              <span className="landing-plan-price-value">{plan.price}</span>
              <span className="landing-plan-price-period">/mês</span>
            </div>
            <p className="landing-plan-desc">{plan.description}</p>
            <ul className="landing-plan-features">
              {plan.features.map((feature) => (
                <li key={feature} className="landing-plan-feature">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a8558f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className={plan.recommended ? 'landing-plan-feature-bold' : ''}>{feature}</span>
                </li>
              ))}
            </ul>
            <button className="landing-plan-cta" onClick={onGoToLogin}>
              Começar agora
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LandingPage
