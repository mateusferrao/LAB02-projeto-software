import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Car } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import type { TipoUsuario } from '../services/api'

interface FormData {
  email: string
  senha: string
  tipo: TipoUsuario
  nome: string
  rg: string
  cpf: string
  cnpj: string
  endereco: string
  profissao: string
}

export function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { tipo: 'CLIENTE' },
  })
  const [apiError, setApiError] = useState('')
  const tipo = watch('tipo')

  const onSubmit = async (data: FormData) => {
    try {
      setApiError('')
      await registerUser(data)
      navigate(tipo === 'CLIENTE' ? '/catalogo' : '/painel-agente')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setApiError(msg ?? 'Erro ao criar conta. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-brand-black">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <Car className="w-6 h-6 text-brand-amber" />
          <span className="font-display text-2xl">DRIVE<span className="text-brand-amber">NOW</span></span>
        </Link>

        <h1 className="font-display text-5xl mb-2">CRIAR CONTA</h1>
        <p className="text-white/40 mb-8">Preencha os dados abaixo para se cadastrar</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Tipo de usuário */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Tipo de conta</label>
            <div className="grid grid-cols-3 gap-3">
              {(['CLIENTE', 'EMPRESA', 'BANCO'] as const).map((t) => (
                <label key={t} className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  tipo === t
                    ? 'border-brand-amber bg-brand-amber/10 text-brand-amber'
                    : 'border-white/10 text-white/40 hover:border-white/30'
                }`}>
                  <input type="radio" value={t} {...register('tipo')} className="sr-only" />
                  <span className="text-sm font-medium">{t.charAt(0) + t.slice(1).toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Campos comuns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-white/60 mb-1.5">Email *</label>
              <input type="email" className="input" placeholder="seu@email.com"
                {...register('email', { required: 'Obrigatório' })} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm text-white/60 mb-1.5">Senha *</label>
              <input type="password" className="input" placeholder="Mínimo 6 caracteres"
                {...register('senha', { required: 'Obrigatório', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} />
              {errors.senha && <p className="text-red-400 text-xs mt-1">{errors.senha.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm text-white/60 mb-1.5">Nome / Razão Social *</label>
              <input type="text" className="input" placeholder="Nome completo"
                {...register('nome', { required: 'Obrigatório' })} />
              {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm text-white/60 mb-1.5">Endereço *</label>
              <input type="text" className="input" placeholder="Rua, número, cidade, estado"
                {...register('endereco', { required: 'Obrigatório' })} />
            </div>
          </div>

          {/* Campos exclusivos de Cliente */}
          {tipo === 'CLIENTE' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">RG</label>
                <input type="text" className="input" placeholder="00.000.000-0" {...register('rg')} />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">CPF *</label>
                <input type="text" className="input" placeholder="000.000.000-00"
                  {...register('cpf', { required: tipo === 'CLIENTE' ? 'Obrigatório' : false })} />
                {errors.cpf && <p className="text-red-400 text-xs mt-1">{errors.cpf.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-white/60 mb-1.5">Profissão</label>
                <input type="text" className="input" placeholder="Ex: Engenheiro de Software" {...register('profissao')} />
              </div>
            </div>
          )}

          {/* Campos de Empresa / Banco */}
          {(tipo === 'EMPRESA' || tipo === 'BANCO') && (
            <div>
              <label className="block text-sm text-white/60 mb-1.5">CNPJ *</label>
              <input type="text" className="input" placeholder="00.000.000/0001-00"
                {...register('cnpj', { required: 'Obrigatório' })} />
              {errors.cnpj && <p className="text-red-400 text-xs mt-1">{errors.cnpj.message}</p>}
            </div>
          )}

          {apiError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              {apiError}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Já tem conta? <Link to="/login" className="text-brand-amber hover:underline">Entrar</Link>
        </p>
      </motion.div>
    </div>
  )
}
