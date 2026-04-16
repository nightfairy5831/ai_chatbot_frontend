import { useState } from 'react'
import { Button } from '@/components/ui/button'

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

function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-end gap-3">
          <img
            className="shrink-0 w-8 sm:w-10 md:w-20 h-auto relative top-2 sm:top-3 md:top-6"
            src="/icon.png"
            alt="LeadLab"
          />
          <span className="text-4xl sm:text-5xl md:text-8xl font-medium tracking-tight leading-none">
            <span className="text-gray-800">Lead</span>
            <span className="text-[#a8558f]">Lab</span>
          </span>
        </div>

        <h1 className="m-0 text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 text-center leading-relaxed px-6 md:px-0">
          O futuro das vendas PME<br />
          é automático e descomplicado.
        </h1>

        <Button
          size="lg"
          className="rounded-full px-10 py-3 text-sm font-semibold bg-[#a8558f] hover:bg-[#934a7d]"
          onClick={onStart}
        >
          Comece agora
        </Button>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 flex flex-col md:flex-row justify-center items-center gap-3 md:gap-12 p-4 md:py-6 border-t border-gray-100 text-gray-400 text-sm">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 4L12 13L2 4" />
          </svg>
          <span>contato@leadlab.com.br</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>www.leadlab.com.br</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

function PlatformSection({ onShowPricing, onGoToLogin, onBackToHero }: { onShowPricing: () => void; onGoToLogin: () => void; onBackToHero: () => void }) {
  const [searchValue, setSearchValue] = useState('')

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 overflow-y-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 md:px-10 border-b border-gray-100 bg-white">
        <button
          className="text-sm font-medium text-gray-500 cursor-pointer bg-transparent border-none p-0 hover:text-gray-800 transition-colors flex items-center gap-1.5"
          onClick={onBackToHero}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Voltar
        </button>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Dev Preview</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-10 p-6">
        {/* Logo */}
        <span className="text-4xl sm:text-5xl md:text-7xl font-medium tracking-tight leading-none">
          <span className="text-gray-800">Lead</span>
          <span className="text-[#a8558f]">Lab</span>
        </span>

        {/* Search bar */}
        <div className="flex items-center w-full max-w-md py-2 px-4 border border-gray-200 rounded-full bg-white shadow-sm gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input
            className="flex-1 border-none outline-none bg-transparent text-sm text-gray-700 py-1"
            type="text"
            placeholder="Digite sua mensagem..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button
              className="bg-transparent border-none p-0 text-gray-400 cursor-pointer hover:text-gray-600"
              onClick={() => setSearchValue('')}
            >
              &times;
            </button>
          )}
          <Button size="sm" className="rounded-full text-xs bg-[#a8558f] hover:bg-[#934a7d] h-7 px-3">
            Modo IA
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="rounded-full px-8 text-sm" onClick={onGoToLogin}>
            Dados da empresa
          </Button>
          <Button variant="outline" className="rounded-full px-8 text-sm" onClick={onShowPricing}>
            Planos disponíveis
          </Button>
        </div>
      </div>
    </div>
  )
}

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
    <div className="fixed inset-0 flex flex-col bg-gray-50 overflow-y-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 md:px-10 border-b border-gray-100 bg-white">
        <button
          className="text-sm font-medium text-gray-500 cursor-pointer bg-transparent border-none p-0 hover:text-gray-800 transition-colors flex items-center gap-1.5"
          onClick={onBack}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Voltar
        </button>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Planos</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <span className="text-xs font-semibold text-[#a8558f] uppercase tracking-widest">
          Planos
        </span>
        <h2 className="mt-2 mb-8 text-xl md:text-2xl font-bold text-gray-900 text-center">
          Três planos para cada estágio de crescimento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mx-auto items-stretch px-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-7 flex flex-col relative transition-all duration-200 ${
              plan.recommended
                ? 'bg-[#a8558f] text-white shadow-lg scale-105'
                : 'bg-white border border-gray-200 hover:shadow-md hover:border-gray-300'
            }`}
          >
            {plan.recommended && (
              <span className="inline-block self-start text-[11px] font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
                Recomendado
              </span>
            )}
            <h3 className={`m-0 text-base font-bold ${plan.recommended ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className={`text-3xl font-bold ${plan.recommended ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
              <span className={`text-sm ${plan.recommended ? 'text-white/70' : 'text-gray-400'}`}>/mês</span>
            </div>
            <p className={`mt-3 mb-6 text-sm leading-relaxed ${plan.recommended ? 'text-white/80' : 'text-gray-500'}`}>{plan.description}</p>
            <ul className="list-none m-0 p-0 flex flex-col gap-3 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.recommended ? 'white' : '#a8558f'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className={plan.recommended ? 'text-white/90 font-medium' : 'text-gray-600'}>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className={`mt-7 rounded-full text-sm font-semibold h-11 ${
                plan.recommended
                  ? 'bg-white text-[#a8558f] hover:bg-white/90'
                  : 'bg-[#a8558f] hover:bg-[#934a7d] text-white'
              }`}
              onClick={onGoToLogin}
            >
              Começar agora
            </Button>
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}

export default LandingPage
