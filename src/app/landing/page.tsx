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
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-[#f0eeee]">
      <div className="flex flex-col items-center gap-6 md:gap-10">
        <div className="flex items-end gap-4">
          <img
            className="shrink-0 w-9 sm:w-[50px] md:w-[110px] h-auto relative top-3 sm:top-[17px] md:top-[37px]"
            src="/icon.png"
            alt="LeadLab"
          />
          <span className="text-[2.5rem] sm:text-[3.5rem] md:text-[8.5rem] font-medium tracking-tight leading-none">
            <span className="text-[#2d2d2d]">Lead</span>
            <span className="text-[#a8558f]">Lab</span>
          </span>
        </div>

        <h1 className="m-0 text-xl sm:text-[1.2rem] md:text-4xl font-bold text-[#2d2d2d] text-center leading-relaxed px-4 md:px-0">
          O futuro das vendas PME<br />
          é automático e descomplicado.
        </h1>

        <button
          className="bg-transparent border-none p-0 cursor-pointer text-lg sm:text-[1.1rem] md:text-xl text-gray-500 transition-colors duration-200 hover:text-[#a8558f]"
          onClick={onStart}
        >
          Let's do it!
        </button>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 flex flex-col md:flex-row justify-center items-center gap-3 md:gap-16 p-4 md:py-8 md:px-8 border-t border-[#d1d1d1] text-gray-500 text-base md:text-lg md:relative">
        <div className="flex items-center gap-2.5">
          <svg className="w-6 h-6" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 4L12 13L2 4" />
          </svg>
          <span>contato@leadlab.com.br</span>
        </div>
        <div className="flex items-center gap-2.5">
          <svg className="w-6 h-6" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>www.leadlab.com.br</span>
        </div>
        <div className="flex items-center gap-2.5">
          <svg className="w-6 h-6" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
    <div className="fixed inset-0 w-screen h-screen flex flex-col bg-white overflow-y-auto">
      <div className="pt-6 px-6 md:pt-8 md:px-12">
        <span
          className="text-sm font-semibold text-[#a8558f] tracking-wide cursor-pointer"
          onClick={onBackToHero}
        >
          Landind Page
        </span>
        <h2 className="mt-2 text-2xl md:text-[2rem] font-bold text-[#2d2d2d] italic">
          Croqui da Plataforma – Guia para Dev
        </h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-6 md:p-8">
        <div className="flex items-end gap-4">
          <span className="text-[3.5rem] sm:text-[3.5rem] md:text-[8.5rem] font-[450] tracking-tight leading-none">
            <span className="text-[#2d2d2d]">Lead</span>
            <span className="text-[#a8558f]">Lab</span>
          </span>
        </div>

        <div className="flex items-center justify-between w-full max-w-full md:max-w-[700px] py-2.5 px-4 md:py-3.5 md:px-5 border border-gray-200 rounded-[28px] bg-white shadow-sm">
          <button className="bg-transparent border-none p-0 text-2xl text-gray-500 cursor-pointer flex items-center justify-center w-8 h-8">
            +
          </button>
          <input
            className="flex-1 border-none outline-none bg-transparent text-base md:text-lg text-gray-700 py-1 px-2"
            type="text"
            placeholder="Digite sua mensagem..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button
              className="bg-transparent border-none p-0 text-xl text-gray-400 cursor-pointer flex items-center justify-center w-7 h-7"
              onClick={() => setSearchValue('')}
            >
              &times;
            </button>
          )}
          <button className="flex items-center gap-1.5 py-2 px-3 sm:px-4 md:px-[1.1rem] border border-gray-200 rounded-[18px] bg-white text-sm sm:text-[0.9rem] md:text-base font-medium text-gray-700 cursor-pointer transition-colors duration-150 hover:bg-gray-100">
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

        <div className="flex flex-col md:flex-row gap-4 w-full max-w-[300px] md:max-w-none md:w-auto">
          <button
            className="py-3 px-8 border border-gray-200 rounded-[22px] bg-white text-lg font-medium text-gray-700 cursor-pointer transition-all duration-150 hover:bg-gray-100 hover:border-gray-300 text-center"
            onClick={onGoToLogin}
          >
            Dados da empresa
          </button>
          <button
            className="py-3 px-8 border border-gray-200 rounded-[22px] bg-white text-lg font-medium text-gray-700 cursor-pointer transition-all duration-150 hover:bg-gray-100 hover:border-gray-300 text-center"
            onClick={onShowPricing}
          >
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
    <div className="fixed inset-0 w-screen h-screen flex flex-col bg-white overflow-y-auto p-6 md:py-8 md:px-12 box-border">
      <button
        className="bg-transparent border-none p-0 inline-flex items-center gap-1.5 cursor-pointer text-sm font-medium text-gray-500 py-1.5 px-2.5 rounded-md mb-6 transition-all duration-150 hover:bg-gray-100 hover:text-gray-700"
        onClick={onBack}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>

      <div className="text-center mb-10">
        <span className="text-sm font-semibold text-[#a8558f] tracking-wide">
          Modelo de Negócio SaaS
        </span>
        <h2 className="mt-2 text-2xl md:text-4xl font-bold text-[#2d2d2d] italic">
          Três planos para cada estágio de crescimento
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[400px] md:max-w-[960px] mx-auto w-full">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-[#f7f7f7] rounded-2xl p-8 flex flex-col relative transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] ${
              plan.recommended ? 'border-2 border-[#a8558f]' : ''
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#a8558f] text-white text-xs font-semibold py-1 px-4 rounded-md whitespace-nowrap">
                Recomendado
              </div>
            )}
            <h3 className="m-0 text-xl font-bold text-[#2d2d2d]">{plan.name}</h3>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#a8558f]">{plan.price}</span>
              <span className="text-sm text-gray-500">/mês</span>
            </div>
            <p className="mt-3 mb-6 text-sm text-gray-500 leading-relaxed">{plan.description}</p>
            <ul className="list-none m-0 p-0 flex flex-col gap-3 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a8558f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className={plan.recommended ? 'font-semibold' : ''}>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className="mt-7 py-3 border-none rounded-[10px] bg-[#a8558f] text-white text-[0.95rem] font-semibold cursor-pointer transition-colors duration-150 hover:bg-[#934a7d]"
              onClick={onGoToLogin}
            >
              Começar agora
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LandingPage
