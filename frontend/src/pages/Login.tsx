import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Car, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

interface FormData {
  email: string
  senha: string
}

const BG = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&q=80'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>()
  const [apiError, setApiError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (data: FormData) => {
    try {
      setApiError('')
      await login(data.email, data.senha)
      navigate(from, { replace: true })
    } catch {
      setApiError('Email ou senha inválidos.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo — imagem */}
      <div
        className="hidden lg:flex flex-1 relative"
        style={{ backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-brand-black/60" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <p className="text-brand-amber text-sm uppercase tracking-widest mb-2">Bem-vindo de volta</p>
          <h2 className="font-display text-6xl leading-tight">
            SEU PRÓXIMO<br />
            <span className="text-brand-amber">DESTINO</span><br />
            TE ESPERA
          </h2>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-brand-graphite">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-10">
            <Car className="w-6 h-6 text-brand-amber" />
            <span className="font-display text-2xl">DRIVE<span className="text-brand-amber">NOW</span></span>
          </Link>

          <h1 className="font-display text-4xl mb-2">ENTRAR</h1>
          <p className="text-white/40 mb-8">Acesse sua conta para continuar</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Email</label>
              <input
                type="email"
                className="input"
                placeholder="seu@email.com"
                {...register('email', { required: 'Email obrigatório' })}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  {...register('senha', { required: 'Senha obrigatória' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.senha && <p className="text-red-400 text-xs mt-1">{errors.senha.message}</p>}
            </div>

            {apiError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                {apiError}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Não tem conta?{' '}
            <Link to="/register" className="text-brand-amber hover:underline">Cadastre-se</Link>
          </p>

          {/* Dica de credenciais de teste */}
          <div className="mt-8 p-4 rounded-lg border border-white/5 bg-white/3">
            <p className="text-white/30 text-xs mb-2 font-semibold uppercase tracking-widest">Contas de teste (seed)</p>
            <p className="text-white/40 text-xs">cliente@exemplo.com / 123456</p>
            <p className="text-white/40 text-xs">empresa@exemplo.com / 123456</p>
            <p className="text-white/40 text-xs">banco@exemplo.com / 123456</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
