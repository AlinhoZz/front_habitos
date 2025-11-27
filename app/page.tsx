"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  PersonStanding, 
  Dumbbell, 
  ChevronRight, 
  CheckCircle2, 
  Play, 
  Menu, 
  X,
  Facebook,
  Twitter,
  Instagram,
  Star,
  Check,
  Smartphone
} from 'lucide-react';

// --- Tipos e Interfaces ---

type Category = 'cycling' | 'running' | 'lifting';

interface FeatureData {
  id: Category;
  title: string;
  description: string;
  metrics: string[];
  bgStrong: string; 
  buttonColor: string;
  icon: React.ElementType;
}

// --- Dados das Funcionalidades ---

const features: FeatureData[] = [
  {
    id: 'cycling',
    title: 'Ciclismo de Alta Performance',
    description: 'Monitore suas pedaladas com precisão. Registre altimetria, cadência e velocidade média em tempo real.',
    metrics: ['Registro de rotas GPS', 'Métricas de cadência', 'Histórico de altimetria'],
    bgStrong: 'bg-orange-600', // Removi transparência aqui para o fundo total, o vidro fará o efeito
    buttonColor: 'text-orange-600',
    icon: Bike,
  },
  {
    id: 'running',
    title: 'Corrida e Resistência',
    description: 'Supere seus limites a cada quilômetro. Acompanhe seu pace, zonas de frequência cardíaca e evolução.',
    metrics: ['Análise de Pace', 'Zonas de FC', 'Comparativo semanal'],
    bgStrong: 'bg-emerald-600',
    buttonColor: 'text-emerald-600',
    icon: PersonStanding,
  },
  {
    id: 'lifting',
    title: 'Musculação e Hipertrofia',
    description: 'Gerencie séries, repetições e cargas. O controle total do seu treino de força na palma da mão.',
    metrics: ['Controle de carga progressiva', 'Timer de descanso', 'Biblioteca de exercícios'],
    bgStrong: 'bg-red-700',
    buttonColor: 'text-red-700',
    icon: Dumbbell,
  },
];

// --- Componentes ---

const LandingPage: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Category>('cycling');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // --- Autoplay do Carrossel ---
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((current) => {
        if (current === 'cycling') return 'running';
        if (current === 'running') return 'lifting';
        return 'cycling';
      });
    }, 6000); // Aumentei um pouco o tempo para apreciar o design
    return () => clearInterval(interval);
  }, []);

  const currentData = features.find((f) => f.id === activeFeature) || features[0];

  const getButtonClass = (id: Category) => {
    const baseClass = "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300";
    if (activeFeature === id) {
      return `${baseClass} bg-white ${currentData.buttonColor} shadow-xl scale-105 translate-y-[-2px]`;
    }
    return `${baseClass} bg-white/10 text-white/60 hover:bg-white/20 hover:text-white backdrop-blur-sm`;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo Limpa */}
            <div className="flex-shrink-0 flex items-center">
               <img 
                src="/icons/logo2.svg" 
                alt="Logo" 
                className="h-20 w-auto object-contain"
              />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-2 items-center font-medium text-sm">
              <a href="#features" className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors">Funcionalidades</a>
              <a href="#testimonials" className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors">Depoimentos</a>
              <a href="#plans" className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors">Planos</a>
              <div className="pl-4">
                  {/* REDIRECIONAMENTO ENTRAR */}
                  <a href="/login" className="inline-block bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md shadow-red-600/20 active:scale-95">
                    Entrar
                  </a>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 hover:text-red-600">
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 p-4 space-y-2 shadow-lg absolute w-full font-medium z-50">
             <a href="#features" className="block px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg">Funcionalidades</a>
             <a href="#plans" className="block px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg">Planos</a>
             <a href="/entrar" className="block w-full text-center bg-red-600 text-white py-3 rounded-xl font-bold mt-2">Entrar</a>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-36 pb-20 lg:pt-52 lg:pb-48 overflow-hidden">
        <div className="absolute inset-0 z-0">
           <img 
             src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop"
             alt="Background treino"
             className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="w-full max-w-3xl space-y-8 text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Mais do que um app,<br/>
              seu novo <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">+Fôlego.</span>
            </h1>
            <p className="text-lg text-slate-700 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Centralize Ciclismo, Corrida e Musculação em um só lugar. Métricas avançadas simplificadas para você evoluir de verdade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              {/* REDIRECIONAMENTO REGISTRAR */}
              <a href="/register" className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-xl shadow-red-600/30 active:scale-95">
                Criar conta Grátis <ChevronRight size={20}/>
              </a>
            </div>
            
            {/* Social Proof */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
               <div className="flex -space-x-3">
                 {[1, 2, 3, 4, 5].map((i) => (
                   <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})` }} />
                 ))}
               </div>
               <div className="text-center sm:text-left">
                 <p className="text-slate-900 font-bold leading-tight">+15.000 atletas ativos</p>
                 <p className="text-slate-600 text-sm font-medium">Confiado por atletas em todo o Brasil</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURE CAROUSEL (DESIGN MELHORADO) --- */}
      <section id="features" className="relative py-28 overflow-hidden transition-all duration-1000">
        
        {/* Fundo Base: Imagem com Overlay de Cor Dinâmico */}
        <div className="absolute inset-0 bg-slate-900 z-0">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
             {/* O gradiente agora é mais forte para dar destaque ao "vidro" que vem por cima */}
             <div className={`absolute inset-0 transition-colors duration-1000 ease-in-out ${currentData.bgStrong} opacity-90`}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 drop-shadow-md">Um software, <span className="opacity-80 underline decoration-4 underline-offset-8 decoration-white/40">três paixões.</span></h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto font-medium drop-shadow-sm">Alterne entre as modalidades para ver como o <span className="font-bold">+Fôlego</span> se adapta.</p>
          </div>

          {/* TAB SWITCHER (Novo Design) */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <button onClick={() => setActiveFeature('cycling')} className={getButtonClass('cycling')}>
              <Bike size={20} /> Ciclismo
            </button>
            <button onClick={() => setActiveFeature('running')} className={getButtonClass('running')}>
              <PersonStanding size={20} /> Corrida
            </button>
            <button onClick={() => setActiveFeature('lifting')} className={getButtonClass('lifting')}>
              <Dumbbell size={20} /> Musculação
            </button>
          </div>

          {/* GLASS CARD CONTAINER (O grande destaque visual) */}
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-8 lg:p-16 shadow-2xl overflow-hidden">
            
            {/* Brilho decorativo no fundo do card */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              
              {/* Lado Esquerdo: Texto */}
              <div className="w-full lg:w-1/2 space-y-8 relative z-10">
                <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white text-slate-900 shadow-lg transform rotate-3 transition-transform hover:rotate-0">
                  <currentData.icon size={32} strokeWidth={2.5} className={currentData.buttonColor} />
                </div>
                
                <div key={activeFeature} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 drop-shadow-md">
                    {currentData.title}
                  </h3>
                  <p className="text-xl text-white/90 leading-relaxed font-medium">
                    {currentData.description}
                  </p>
                </div>
                
                <div className="h-px w-full bg-gradient-to-r from-white/30 to-transparent my-6"></div>

                <ul className="space-y-4">
                  {currentData.metrics.map((metric, idx) => (
                    <li key={idx} className="flex items-center gap-4 font-bold text-lg text-white">
                      <div className="bg-white/20 p-1 rounded-full"><Check size={16} strokeWidth={4} /></div>
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lado Direito: Mockup estilo iPhone */}
              <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
                 {/* Sombra projetada do celular */}
                 <div className="absolute inset-0 bg-black/30 blur-2xl transform translate-y-8 scale-90 rounded-full -z-10"></div>
                 
                 <div className="relative w-[300px] h-[600px] bg-slate-950 rounded-[3rem] border-8 border-slate-900 shadow-2xl overflow-hidden transform transition-all duration-700 hover:scale-[1.02]">
                    {/* Notch e Câmera */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-slate-900 rounded-b-2xl z-20"></div>
                    
                    {/* Tela do Celular */}
                    <div className="w-full h-full bg-white relative flex flex-col">
                        {/* Header Falso do App */}
                        <div className={`h-24 ${currentData.buttonColor.replace('text-', 'bg-')} flex items-end p-4 pb-2 justify-between text-white`}>
                           <Menu size={20}/>
                           <span className="font-bold tracking-tight">+Fôlego</span>
                           <div className="w-6 h-6 rounded-full bg-white/30"></div>
                        </div>

                        {/* Conteúdo Falso do App */}
                        <div className="flex-1 p-4 space-y-4 bg-slate-50">
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <currentData.icon size={12}/> {currentData.id}
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 leading-none">Resumo do<br/>Treino</h2>
                            
                            {/* Gráfico Fake */}
                            <div className="h-32 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-end justify-between p-4 px-6 gap-2">
                                {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                                    <div key={i} style={{height: `${h}%`}} className={`w-3 rounded-t-sm ${currentData.buttonColor.replace('text-', 'bg-')} opacity-60`}></div>
                                ))}
                            </div>

                            {/* Stats Fakes */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                    <p className="text-xs text-slate-400">Tempo</p>
                                    <p className="text-lg font-bold text-slate-800">45:00</p>
                                </div>
                                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                    <p className="text-xs text-slate-400">Kcal</p>
                                    <p className="text-lg font-bold text-slate-800">320</p>
                                </div>
                            </div>

                             {/* Botão Fake */}
                            <div className={`mt-4 w-full py-3 rounded-xl ${currentData.buttonColor.replace('text-', 'bg-')} text-white text-center font-bold text-sm shadow-lg opacity-90`}>
                                Ver Detalhes
                            </div>
                        </div>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- DEPOIMENTOS --- */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">O que dizem nossos atletas</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Milhares de pessoas já transformaram seus treinos com o +Fôlego.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Ricardo S.', role: 'Ciclista Amador', text: 'Melhorou minha performance em 30% nos primeiros meses. A análise de cadência é surreal.', img: 55 },
              { name: 'Fernanda L.', role: 'Maratonista', text: 'Finalmente um app que entende que corrida não é só distância. O controle de pace é perfeito.', img: 44 },
              { name: 'João P.', role: 'Bodybuilder', text: 'Consigo acompanhar minha progressão de carga semana a semana sem precisar de papel e caneta.', img: 12 },
            ].map((testimonal, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[1,2,3,4,5].map(star => <Star key={star} size={18} fill="currentColor" />)}
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed">"{testimonal.text}"</p>
                <div className="flex items-center gap-4">
                   <img src={`https://i.pravatar.cc/100?img=${testimonal.img}`} alt={testimonal.name} className="w-12 h-12 rounded-full" />
                   <div>
                     <p className="font-bold text-slate-900">{testimonal.name}</p>
                     <p className="text-xs text-slate-500 uppercase tracking-wide">{testimonal.role}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BANNER FULL WIDTH --- */}
      <section className="w-full bg-gray-100">
        <img
          src="/icons/banner1.jpeg"
          alt="Banner Promocional +Fôlego"
          className="block mx-auto w-full max-w-full h-auto object-contain"
        />
      </section>

      {/* --- PLANOS --- */}
      <section id="plans" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Escolha seu plano</h2>
            <p className="text-slate-600 mb-8">Comece hoje e evolua sempre. Cancele quando quiser.</p>
            
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Mensal</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="w-14 h-8 bg-slate-200 rounded-full relative transition-colors focus:outline-none"
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${billingCycle === 'monthly' ? 'left-1' : 'left-7 bg-red-600'}`}></div>
              </button>
              <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>Anual <span className="text-red-600 text-xs ml-1 font-normal">-20% OFF</span></span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* INICIANTE */}
            <div className="p-8 border border-gray-200 rounded-3xl hover:border-red-200 transition-colors">
              <h3 className="text-xl font-bold text-slate-900">Iniciante</h3>
              <div className="my-4">
                <span className="text-4xl font-extrabold text-slate-900">R$ 0</span>
                <span className="text-slate-500">/mês</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Para quem está começando a se movimentar.</p>
              {/* REDIRECIONAMENTO REGISTRAR */}
              <a href="/registrar" className="block w-full text-center py-3 border-2 border-slate-900 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-colors">Começar Grátis</a>
              <ul className="mt-8 space-y-3">
                {['Registro básico de treino', 'Histórico de 7 dias', '1 Modalidade ativa'].map(item => (
                   <li key={item} className="flex gap-3 text-sm text-slate-600"><Check size={18} className="text-slate-400"/> {item}</li>
                ))}
              </ul>
            </div>

            {/* ATLETA PRO */}
            <div className="p-8 bg-slate-900 text-white rounded-3xl shadow-2xl scale-105 relative border-2 border-red-600">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">Mais Popular</div>
              <h3 className="text-xl font-bold text-white">Atleta Pro</h3>
              <div className="my-4">
                <span className="text-5xl font-extrabold text-white">R$ {billingCycle === 'monthly' ? '29' : '24'}</span>
                <span className="text-slate-400">,90/mês</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">Métricas completas para evoluir de verdade.</p>
              {/* REDIRECIONAMENTO REGISTRAR */}
              <a href="/registrar" className="block w-full text-center py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-900/50">Assinar Pro</a>
              <ul className="mt-8 space-y-3">
                {['Todas as 3 modalidades', 'Histórico Ilimitado', 'Métricas Avançadas (GPS, FC)', 'Integração com Strava', 'Sem anúncios'].map(item => (
                   <li key={item} className="flex gap-3 text-sm font-medium"><div className="bg-red-600 rounded-full p-0.5"><Check size={12} className="text-white"/></div> {item}</li>
                ))}
              </ul>
            </div>

            {/* ASSESSORIA */}
            <div className="p-8 border border-gray-200 rounded-3xl hover:border-red-200 transition-colors">
              <h3 className="text-xl font-bold text-slate-900">Assessoria</h3>
              <div className="my-4">
                <span className="text-4xl font-extrabold text-slate-900">Sob Consulta</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Para treinadores e equipes esportivas.</p>
              <button className="w-full py-3 border border-gray-200 text-slate-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">Falar com Consultor</button>
              <ul className="mt-8 space-y-3">
                {['Painel do Treinador', 'Gestão de Alunos', 'Prescrição de Treinos', 'Relatórios em PDF'].map(item => (
                   <li key={item} className="flex gap-3 text-sm text-slate-600"><Check size={18} className="text-slate-400"/> {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- RODAPÉ --- */}
      <footer className="bg-slate-950 text-slate-400 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            <div className="space-y-6">
                <h3 className="text-white text-2xl font-bold tracking-tighter flex items-center gap-2">
                    <img 
                      src="/icons/logo1.svg" 
                      alt="Logo Rodapé" 
                      className="h-18 w-auto object-contain"
                    />
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                    Nossa missão é democratizar a alta performance. Tecnologia de ponta para quem corre, pedala e levanta peso.
                </p>
                <div className="flex gap-4 pt-2">
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"><Instagram size={18}/></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"><Twitter size={18}/></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"><Facebook size={18}/></a>
                </div>
            </div>

            <div>
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Produto</h4>
                <ul className="space-y-4 text-sm">
                    <li><a href="#features" className="hover:text-red-500 transition-colors">Funcionalidades</a></li>
                    <li><a href="#testimonials" className="hover:text-red-500 transition-colors">Depoimentos</a></li>
                    <li><a href="#plans" className="hover:text-red-500 transition-colors">Planos e Preços</a></li>
                    <li><a href="#" className="hover:text-red-500 transition-colors">Download App</a></li>
                </ul>
            </div>

             <div>
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Suporte & Legal</h4>
                <ul className="space-y-4 text-sm">
                    <li><a href="#" className="hover:text-red-500 transition-colors">Central de Ajuda</a></li>
                    <li><a href="#" className="hover:text-red-500 transition-colors">Termos de Uso</a></li>
                    <li><a href="#" className="hover:text-red-500 transition-colors">Política de Privacidade</a></li>
                    <li><a href="#" className="hover:text-red-500 transition-colors">Contato</a></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Newsletter</h4>
                <p className="text-xs text-slate-500 mb-4">Receba dicas de treino semanais.</p>
                <form className="flex flex-col gap-3">
                    <input type="email" placeholder="seu@email.com" className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-white" />
                    <button className="bg-red-600 text-white px-4 py-3 rounded-lg font-bold text-sm hover:bg-red-700 transition-all">
                        Inscrever-se
                    </button>
                </form>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <p>© 2024 +Fôlego Tecnologia Esportiva Ltda.</p>
          <p>Feito com ❤️ para atletas.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;