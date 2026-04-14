import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Zap, HeartHandshake } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import type { Automovel } from '../services/api'
import { CarCard } from '../components/CarCard'

const HERO_BG =
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80'

const features = [
  { icon: Shield, title: 'Segurança Garantida', desc: 'Todos os veículos com seguro completo e revisão prévia.' },
  { icon: Zap, title: 'Processo Ágil', desc: 'Contrato digital, aprovação em até 24 horas.' },
  { icon: HeartHandshake, title: 'Suporte 24/7', desc: 'Nossa equipe sempre disponível para você.' },
]

export function Home() {
  const { data: cars } = useQuery<Automovel[]>({
    queryKey: ['automoveis-destaque'],
    queryFn: () => api.get('/automoveis?disponivel=true').then((r) => r.data.slice(0, 3)),
  })

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center"
        style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-hero-gradient" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-brand-amber text-sm font-semibold uppercase tracking-[0.3em] mb-4"
          >
            Aluguel de Carros Premium
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-7xl md:text-9xl leading-none mb-6"
          >
            DIRIJA O<br />
            <span className="text-brand-amber">MELHOR</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-white/60 text-lg md:text-xl mb-10 max-w-xl mx-auto"
          >
            Frota premium, contratos digitais e atendimento ágil. Seu próximo destino começa aqui.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/catalogo" className="btn-primary flex items-center gap-2 justify-center text-lg px-8 py-4">
              Ver Catálogo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/register" className="btn-outline flex items-center gap-2 justify-center text-lg px-8 py-4">
              Criar Conta
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 text-xs">
          <span>scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-8 bg-white/20" />
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="py-24 px-4 bg-brand-graphite">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-amber text-sm uppercase tracking-widest mb-2">Por que nos escolher</p>
            <h2 className="font-display text-5xl">NOSSA DIFERENÇA</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                className="card p-8 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-brand-amber/10 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-brand-amber" />
                </div>
                <h3 className="font-display text-2xl mb-3">{title}</h3>
                <p className="text-white/50 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Destaques ─────────────────────────────────────── */}
      {cars && cars.length > 0 && (
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-brand-amber text-sm uppercase tracking-widest mb-2">Disponíveis agora</p>
                <h2 className="font-display text-5xl">EM DESTAQUE</h2>
              </div>
              <Link to="/catalogo" className="btn-outline py-2 px-5 text-sm hidden sm:flex items-center gap-2">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => <CarCard key={car.id} car={car} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Final ─────────────────────────────────────── */}
      <section className="py-24 px-4 bg-brand-amber">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-6xl text-brand-black mb-4">PRONTO PARA ACELERAR?</h2>
          <p className="text-brand-black/60 text-lg mb-8">
            Cadastre-se gratuitamente e faça seu primeiro pedido de aluguel em minutos.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-brand-black text-brand-amber font-semibold px-8 py-4 rounded-lg hover:bg-brand-graphite transition-colors text-lg">
            Começar agora <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
