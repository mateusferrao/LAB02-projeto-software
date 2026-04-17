import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Code2,
  Database,
  Server,
  Sparkles,
  Layers,
  Container,
  Palette,
  Wand2,
  ShoppingCart,
  FileCheck,
  Banknote,
  ClipboardList,
  PackageCheck,
  UserCog,
  ShieldCheck,
  Rocket,
  Check,
  X as XIcon,
  Play,
  Pause,
  Maximize,
  Minimize,
  Type,
  Droplet,
  MousePointer2,
  Eye,
  Accessibility,
  Smartphone,
} from 'lucide-react'

type SlideProps = { mx: any; my: any }

const SLIDE_COUNT = 6

/* ──────────────────────────────────────────────────────────────
 * Background — blobs animados + grid sutil
 * ────────────────────────────────────────────────────────────── */
function AnimatedBackground({ slide }: { slide: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid sutil */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #F59E0B 1px, transparent 1px), linear-gradient(to bottom, #F59E0B 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Blob 1 */}
      <motion.div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.35), transparent 60%)' }}
        animate={{
          x: [0, 120, -60, 0],
          y: [0, 80, 40, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Blob 2 */}
      <motion.div
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(180,83,9,0.45), transparent 60%)' }}
        animate={{
          x: [0, -100, 60, 0],
          y: [0, -60, 30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Blob 3 — muda por slide */}
      <motion.div
        key={`slide-blob-${slide}`}
        className="absolute top-1/3 left-1/2 w-[500px] h-[500px] rounded-full blur-3xl -translate-x-1/2"
        style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.18), transparent 70%)' }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
 * Slide 1 — Hero
 * ────────────────────────────────────────────────────────────── */
function Slide1Hero({ mx, my }: SlideProps) {
  const titleLetters = 'DRIVENOW'.split('')
  const tx = useTransform(mx, [-1, 1], [-20, 20])
  const ty = useTransform(my, [-1, 1], [-20, 20])

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative">
      <motion.div style={{ x: tx, y: ty }} className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="mb-6"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(245,158,11,0.6)',
                '0 0 60px 20px rgba(245,158,11,0.2)',
                '0 0 0 0 rgba(245,158,11,0.6)',
              ],
            }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="p-6 rounded-full bg-brand-amber/10 border border-brand-amber/40"
          >
            <Car className="w-16 h-16 text-brand-amber" />
          </motion.div>
        </motion.div>

        <h1 className="font-display text-7xl md:text-9xl tracking-widest text-brand-offwhite flex">
          {titleLetters.map((l, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 80, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 200 }}
              className={i >= 5 ? 'text-brand-amber' : ''}
            >
              {l}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-white/70 text-lg md:text-2xl text-center max-w-2xl"
        >
          Plataforma de aluguel de carros premium
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-2 text-brand-amber/80 text-sm md:text-base tracking-[0.3em] uppercase"
        >
          LAB02 • PUC Minas
        </motion.p>

        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {['3 Atores', 'Full-Stack TS', 'SPA + API REST', 'Docker'].map((b, i) => (
            <motion.span
              key={b}
              initial={{ opacity: 0, y: 30, scale: 0.7 }}
              animate={{
                opacity: 1,
                y: [0, -8, 0],
                scale: 1,
              }}
              transition={{
                opacity: { delay: 1.6 + i * 0.1 },
                scale: { delay: 1.6 + i * 0.1, type: 'spring' },
                y: { delay: 1.6 + i * 0.1, duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="px-4 py-2 rounded-full border border-brand-amber/40 bg-brand-graphite/60 backdrop-blur text-sm text-brand-offwhite"
            >
              {b}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 2.2 }, y: { repeat: Infinity, duration: 1.5 } }}
        className="absolute bottom-8 text-white/40 text-xs tracking-[0.3em] uppercase"
      >
        ← → navegar • ESC sair
      </motion.div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
 * Slide 2 — Arquitetura & Tecnologias
 * ────────────────────────────────────────────────────────────── */
const techs = [
  { icon: Code2, label: 'React 18', hue: '#61DAFB' },
  { icon: Layers, label: 'TypeScript', hue: '#3178C6' },
  { icon: Server, label: 'Node + Express', hue: '#68A063' },
  { icon: Database, label: 'Prisma + PostgreSQL', hue: '#4169E1' },
  { icon: Container, label: 'Docker', hue: '#2496ED' },
  { icon: Palette, label: 'Tailwind', hue: '#38BDF8' },
  { icon: Wand2, label: 'Framer Motion', hue: '#FF4FD8' },
  { icon: ShieldCheck, label: 'JWT Auth', hue: '#F59E0B' },
]

function Slide2Arquitetura() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-6">
      <motion.h2
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="font-display text-5xl md:text-7xl tracking-wider text-brand-offwhite mb-2"
      >
        ARQUITETURA <span className="text-brand-amber">&amp;</span> STACK
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white/60 mb-10 text-center max-w-2xl"
      >
        SPA desacoplada consumindo API REST — tipada de ponta a ponta.
      </motion.p>

      {/* Diagrama: Frontend → Backend → DB */}
      <div className="flex items-center gap-3 md:gap-6 mb-12 flex-wrap justify-center">
        {[
          { label: 'Frontend', sub: 'React + Vite', Icon: Code2 },
          { label: 'Backend', sub: 'Express API', Icon: Server },
          { label: 'Database', sub: 'PostgreSQL', Icon: Database },
        ].map((n, i) => (
          <div key={n.label} className="flex items-center gap-3 md:gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.25, type: 'spring', stiffness: 200 }}
              whileHover={{ y: -6, scale: 1.05 }}
              className="card p-5 min-w-[150px] text-center border border-brand-amber/30"
            >
              <n.Icon className="w-8 h-8 text-brand-amber mx-auto mb-2" />
              <div className="font-display tracking-widest text-brand-offwhite">{n.label}</div>
              <div className="text-xs text-white/50">{n.sub}</div>
            </motion.div>
            {i < 2 && (
              <motion.svg
                width="60"
                height="24"
                viewBox="0 0 60 24"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.25 }}
              >
                <motion.path
                  d="M0 12 L52 12"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.6 + i * 0.25, duration: 0.6 }}
                />
                <motion.path
                  d="M48 6 L58 12 L48 18"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.9 + i * 0.25, duration: 0.3 }}
                />
              </motion.svg>
            )}
          </div>
        ))}
      </div>

      {/* Grid de techs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
        {techs.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 1 + i * 0.08, type: 'spring', stiffness: 250, damping: 18 }}
            whileHover={{ y: -8, rotate: 3, scale: 1.05 }}
            className="card p-4 flex items-center gap-3 group cursor-default"
          >
            <div
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: `${t.hue}20`, color: t.hue }}
            >
              <t.icon className="w-5 h-5" />
            </div>
            <span className="text-sm text-brand-offwhite font-medium">{t.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
 * Slide 3 — Design & Identidade Visual
 * ────────────────────────────────────────────────────────────── */
const palette = [
  { name: 'Black', hex: '#0A0A0A', role: 'Fundo', textOn: '#F5F5F5' },
  { name: 'Graphite', hex: '#1C1C1C', role: 'Cards', textOn: '#F5F5F5' },
  { name: 'Amber', hex: '#F59E0B', role: 'Destaque', textOn: '#0A0A0A' },
  { name: 'Amber Light', hex: '#FCD34D', role: 'Hover', textOn: '#0A0A0A' },
  { name: 'Amber Dark', hex: '#B45309', role: 'Active', textOn: '#F5F5F5' },
  { name: 'Offwhite', hex: '#F5F5F5', role: 'Texto', textOn: '#0A0A0A' },
]

const uxPrinciples = [
  { Icon: Eye, title: 'Hierarquia Visual', desc: 'Bebas Neue gigante guia o olhar; Inter organiza leitura.' },
  { Icon: MousePointer2, title: 'Microinterações', desc: 'Hover, spring e stagger dão feedback imediato.' },
  { Icon: Smartphone, title: 'Mobile-First', desc: 'Layout responsivo com menu colapsado e grids fluidas.' },
  { Icon: Accessibility, title: 'Contraste AAA', desc: 'Âmbar sobre preto garante leitura mesmo em luz forte.' },
]

function SlideDesign() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-6 overflow-y-auto">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-5xl md:text-7xl tracking-wider text-brand-offwhite mb-2"
      >
        DESIGN <span className="text-brand-amber">&amp;</span> IDENTIDADE
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white/60 mb-8 text-center max-w-2xl"
      >
        Estética automotiva premium: preto profundo, âmbar vibrante e tipografia que lembra pista.
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl w-full">
        {/* Paleta */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Droplet className="w-5 h-5 text-brand-amber" />
            <h3 className="font-display text-2xl tracking-widest text-brand-offwhite">PALETA</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {palette.map((c, i) => (
              <motion.div
                key={c.hex}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.08, type: 'spring' }}
                whileHover={{ y: -6, scale: 1.05 }}
                className="rounded-lg overflow-hidden border border-white/10"
              >
                <motion.div
                  className="h-16 flex items-end p-2"
                  style={{ backgroundColor: c.hex }}
                  animate={{ boxShadow: [`0 0 0 0 ${c.hex}00`, `0 0 20px 2px ${c.hex}66`, `0 0 0 0 ${c.hex}00`] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                >
                  <span className="text-[10px] font-mono" style={{ color: c.textOn }}>
                    {c.hex}
                  </span>
                </motion.div>
                <div className="bg-brand-graphite px-2 py-1.5">
                  <div className="text-xs text-brand-offwhite font-semibold">{c.name}</div>
                  <div className="text-[10px] text-white/40">{c.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tipografia */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-brand-amber" />
            <h3 className="font-display text-2xl tracking-widest text-brand-offwhite">TIPOGRAFIA</h3>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mb-5 pb-5 border-b border-white/10"
          >
            <div className="text-[10px] uppercase tracking-widest text-brand-amber mb-1">Display</div>
            <div className="font-display text-4xl md:text-5xl tracking-widest text-brand-offwhite leading-none">
              BEBAS NEUE
            </div>
            <div className="text-xs text-white/50 mt-2">Títulos, logo, marcos visuais — vibe automotiva.</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="text-[10px] uppercase tracking-widest text-brand-amber mb-1">Body</div>
            <div className="text-2xl text-brand-offwhite" style={{ fontFamily: 'Inter, sans-serif' }}>
              Inter — <span className="font-light">light</span> <span className="font-normal">regular</span>{' '}
              <span className="font-semibold">semibold</span> <span className="font-bold">bold</span>
            </div>
            <div className="text-xs text-white/50 mt-2">Corpo de texto, UI, labels — legível em qualquer tamanho.</div>
          </motion.div>
        </motion.div>

        {/* Componentes */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-brand-amber" />
            <h3 className="font-display text-2xl tracking-widest text-brand-offwhite">COMPONENTES</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <motion.button whileHover={{ scale: 1.05 }} className="btn-primary py-2 px-4 text-sm">
              Primary
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} className="btn-outline py-2 px-4 text-sm">
              Outline
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} className="btn-ghost py-2 px-4 text-sm">
              Ghost
            </motion.button>
            <span className="px-3 py-1 rounded-full text-xs bg-green-500/15 text-green-400 border border-green-500/30">
              APROVADO
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
              PENDENTE
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-blue-500/15 text-blue-400 border border-blue-500/30">
              EM ANÁLISE
            </span>
          </div>
          <div className="mt-4 text-xs text-white/50">
            Cards <code className="text-brand-amber">.card</code> com borda sutil (<code>white/5</code>), radius 2xl e
            gradiente interno.
          </div>
        </motion.div>

        {/* Princípios UI/UX */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <MousePointer2 className="w-5 h-5 text-brand-amber" />
            <h3 className="font-display text-2xl tracking-widest text-brand-offwhite">UI / UX</h3>
          </div>
          <ul className="space-y-3">
            {uxPrinciples.map((p, i) => (
              <motion.li
                key={p.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-1.5 rounded-md bg-brand-amber/15 text-brand-amber flex-shrink-0"
                >
                  <p.Icon className="w-4 h-4" />
                </motion.div>
                <div>
                  <div className="text-sm font-semibold text-brand-offwhite">{p.title}</div>
                  <div className="text-xs text-white/60">{p.desc}</div>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
 * Slide 4 — Funcionalidades
 * ────────────────────────────────────────────────────────────── */
const roles = [
  {
    title: 'CLIENTE',
    color: '#FCD34D',
    features: [
      { Icon: ShoppingCart, text: 'Navega catálogo público' },
      { Icon: ClipboardList, text: 'Cria pedidos de aluguel' },
      { Icon: UserCog, text: 'Gerencia rendimentos e perfil' },
      { Icon: PackageCheck, text: 'Acompanha status dos pedidos' },
    ],
  },
  {
    title: 'EMPRESA',
    color: '#F59E0B',
    features: [
      { Icon: Car, text: 'Cadastra / edita veículos' },
      { Icon: FileCheck, text: 'Analisa pedidos de clientes' },
      { Icon: ShieldCheck, text: 'Aprova ou rejeita aluguéis' },
      { Icon: PackageCheck, text: 'Acompanha execução' },
    ],
  },
  {
    title: 'BANCO',
    color: '#B45309',
    features: [
      { Icon: Banknote, text: 'Emite contratos de crédito' },
      { Icon: FileCheck, text: 'Avalia viabilidade financeira' },
      { Icon: Car, text: 'Registra veículos em garantia' },
      { Icon: ClipboardList, text: 'Auditoria de pedidos' },
    ],
  },
]

function Slide3Funcionalidades() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-6">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-5xl md:text-7xl tracking-wider text-brand-offwhite mb-2"
      >
        FUNCIONALIDADES
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white/60 mb-10 text-center"
      >
        Três atores, um fluxo: pedir → analisar → executar.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {roles.map((role, ri) => (
          <motion.div
            key={role.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + ri * 0.15, type: 'spring' }}
            whileHover={{ y: -8 }}
            className="card p-6 border-t-4"
            style={{ borderTopColor: role.color }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: ri * 0.3 }}
              className="font-display text-3xl tracking-widest mb-4"
              style={{ color: role.color }}
            >
              {role.title}
            </motion.div>

            <ul className="space-y-3">
              {role.features.map((f, fi) => (
                <motion.li
                  key={f.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + ri * 0.15 + fi * 0.1 }}
                  className="flex items-start gap-3 text-white/80 text-sm"
                >
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                    className="p-1.5 rounded-md flex-shrink-0"
                    style={{ backgroundColor: `${role.color}22`, color: role.color }}
                  >
                    <f.Icon className="w-4 h-4" />
                  </motion.div>
                  <span>{f.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
 * Slide 4 — Decisões & Trade-offs
 * ────────────────────────────────────────────────────────────── */
const decisoes = [
  {
    escolha: 'Prisma ORM',
    descartada: 'SQL raw',
    motivo: 'Tipagem automática e migrations declarativas.',
  },
  {
    escolha: 'JWT Stateless',
    descartada: 'Session + Redis',
    motivo: 'Menos infra para escopo acadêmico.',
  },
  {
    escolha: 'SPA (Vite)',
    descartada: 'SSR (Next.js)',
    motivo: 'SEO não é requisito; DX com HMR é imbatível.',
  },
  {
    escolha: 'Docker Compose',
    descartada: 'Kubernetes',
    motivo: 'Overkill para 3 serviços locais.',
  },
  {
    escolha: 'Tailwind CSS',
    descartada: 'CSS-in-JS',
    motivo: 'Consistência visual e build menor.',
  },
]

function Slide4Decisoes() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-6">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-5xl md:text-7xl tracking-wider text-brand-offwhite mb-2"
      >
        DECISÕES <span className="text-brand-amber">&amp;</span> TRADE-OFFS
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white/60 mb-8 text-center"
      >
        Simplicidade vence sofisticação quando o escopo permite.
      </motion.p>

      <div className="w-full max-w-4xl space-y-3">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-[1fr_auto_1fr_2fr] gap-4 text-xs uppercase tracking-widest text-white/40 px-4"
        >
          <span>Escolhido</span>
          <span className="w-6" />
          <span>Descartado</span>
          <span>Por quê</span>
        </motion.div>

        {decisoes.map((d, i) => (
          <motion.div
            key={d.escolha}
            initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
            transition={{ delay: 0.4 + i * 0.12, duration: 0.6, ease: 'easeOut' }}
            whileHover={{ scale: 1.02, x: 4 }}
            className="grid grid-cols-[1fr_auto_1fr_2fr] gap-4 items-center card p-4 hover:border-brand-amber/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                className="p-1 rounded-full bg-brand-amber/20"
              >
                <Check className="w-4 h-4 text-brand-amber" />
              </motion.div>
              <span className="text-brand-offwhite font-semibold">{d.escolha}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-white/30" />
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-white/5">
                <XIcon className="w-4 h-4 text-white/40" />
              </div>
              <span className="text-white/50 line-through">{d.descartada}</span>
            </div>
            <span className="text-white/70 text-sm">{d.motivo}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
 * Slide 5 — Encerramento
 * ────────────────────────────────────────────────────────────── */
function Slide5Encerramento() {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, () => ({
        x: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 6 + Math.random() * 6,
        size: 4 + Math.random() * 8,
        opacity: 0.3 + Math.random() * 0.5,
      })),
    [],
  )

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Partículas caindo */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-brand-amber"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            filter: 'blur(1px)',
          }}
          initial={{ y: -50 }}
          animate={{ y: '110vh', rotate: 360 }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        className="mb-8"
      >
        <Sparkles className="w-16 h-16 text-brand-amber" />
      </motion.div>

      <motion.h2
        className="font-display text-7xl md:text-[10rem] tracking-widest text-center leading-none"
        style={{
          background: 'linear-gradient(90deg, #F59E0B, #FCD34D, #B45309, #F59E0B)',
          backgroundSize: '300% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      >
        OBRIGADO
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 text-white/70 text-lg md:text-2xl max-w-2xl text-center"
      >
        Qualquer dúvida, é só abrir o catálogo e dirigir.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-10 flex gap-3"
      >
        <Link
          to="/catalogo"
          className="btn-primary flex items-center gap-2 group"
        >
          <Rocket className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          Explorar Catálogo
        </Link>
        <Link to="/" className="btn-outline flex items-center gap-2">
          Voltar ao Início
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 text-white/40 text-xs tracking-[0.3em] uppercase text-center"
      >
        LAB02 • Laboratório de Desenvolvimento de Software • PUC Minas
      </motion.div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
 * Componente principal
 * ────────────────────────────────────────────────────────────── */
const slideTitles = ['Visão Geral', 'Arquitetura', 'Design', 'Funcionalidades', 'Trade-offs', 'Obrigado']

export function Apresentacao() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [autoplay, setAutoplay] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Parallax
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 80, damping: 20 })
  const smy = useSpring(my, { stiffness: 80, damping: 20 })

  const go = (dir: number) => {
    setDirection(dir)
    setCurrent((c) => {
      const next = c + dir
      if (next < 0) return 0
      if (next >= SLIDE_COUNT) return SLIDE_COUNT - 1
      return next
    })
  }

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1)
    setCurrent(idx)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/')
        return
      }
      if (e.key === 'ArrowRight' || e.key === ' ') go(1)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key >= '1' && e.key <= '6') goTo(parseInt(e.key, 10) - 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  // Fullscreen ao entrar, sair ao desmontar
  useEffect(() => {
    const el = document.documentElement
    const req = el.requestFullscreen?.bind(el)
    req?.().catch(() => {
      /* navegador bloqueou — usuário pode usar botão */
    })

    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)

    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {})
      }
    }
  }, [])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {})
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {})
    }
  }

  useEffect(() => {
    if (!autoplay) return
    const id = setInterval(() => {
      setDirection(1)
      setCurrent((c) => (c + 1) % SLIDE_COUNT)
    }, 6000)
    return () => clearInterval(id)
  }, [autoplay])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mx.set(x * 2)
    my.set(y * 2)
  }

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.92,
      filter: 'blur(8px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
      scale: 0.92,
      filter: 'blur(8px)',
    }),
  }

  const renderSlide = () => {
    switch (current) {
      case 0:
        return <Slide1Hero mx={smx} my={smy} />
      case 1:
        return <Slide2Arquitetura />
      case 2:
        return <SlideDesign />
      case 3:
        return <Slide3Funcionalidades />
      case 4:
        return <Slide4Decisoes />
      case 5:
        return <Slide5Encerramento />
      default:
        return null
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 top-16 bg-brand-black overflow-hidden select-none"
    >
      <AnimatedBackground slide={current} />

      {/* Botão fullscreen (canto superior direito) */}
      <motion.button
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 4 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
        title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
        className="absolute top-4 right-4 z-40 p-2.5 rounded-lg bg-brand-graphite/70 backdrop-blur border border-white/10 hover:border-brand-amber/60 text-white/80 hover:text-brand-amber transition-colors"
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </motion.button>

      {/* Progress bar */}
      <div className="absolute top-0 inset-x-0 z-30 h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-amber-dark via-brand-amber to-brand-amber-light"
          animate={{ width: `${((current + 1) / SLIDE_COUNT) * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>

      {/* Slide content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 200, damping: 28 },
            opacity: { duration: 0.35 },
            scale: { duration: 0.45 },
            filter: { duration: 0.35 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) go(1)
            else if (info.offset.x > 80) go(-1)
          }}
          className="absolute inset-0 pt-4 pb-24 cursor-grab active:cursor-grabbing"
        >
          {renderSlide()}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-6 inset-x-0 z-30 flex flex-col items-center gap-4 pointer-events-none">
        {/* Dots */}
        <div className="flex gap-2 pointer-events-auto">
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir ao slide ${i + 1}: ${slideTitles[i]}`}
              className="group relative"
            >
              <motion.span
                animate={{
                  width: i === current ? 40 : 10,
                  backgroundColor: i === current ? '#F59E0B' : 'rgba(255,255,255,0.25)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="block h-2.5 rounded-full"
              />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-white/60 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {slideTitles[i]}
              </span>
            </button>
          ))}
        </div>

        {/* Botões Anterior / Próximo / Autoplay */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => go(-1)}
            disabled={current === 0}
            className="btn-ghost py-2 px-4 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>

          <button
            onClick={() => setAutoplay((a) => !a)}
            className="btn-outline py-2 px-3 flex items-center gap-2"
            aria-label={autoplay ? 'Pausar autoplay' : 'Iniciar autoplay'}
          >
            {autoplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-xs">
              {current + 1} / {SLIDE_COUNT}
            </span>
          </button>

          <button
            onClick={() => go(1)}
            disabled={current === SLIDE_COUNT - 1}
            className="btn-primary py-2 px-4 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Próximo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
