import { useRef, useState, useEffect, type ChangeEvent, type DragEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Car, UploadCloud } from 'lucide-react'
import api from '../services/api'
import type { Automovel } from '../services/api'

interface FormData {
  matricula: string
  ano: number
  marca: string
  modelo: string
  placa: string
  disponivel: boolean
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
    reader.readAsDataURL(file)
  })
}

export function EditarCarro() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const backPath = id ? `/catalogo/${id}` : '/catalogo'
  const [apiError, setApiError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [preview, setPreview] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()

  useEffect(() => {
    if (!id) return
    api.get<Automovel>(`/automoveis/${id}`)
      .then((r) => {
        const v = r.data
        reset({
          matricula: v.matricula,
          ano: v.ano,
          marca: v.marca,
          modelo: v.modelo,
          placa: v.placa,
          disponivel: v.disponivel,
        })
        const foto = v.fotoUrl ?? v.foto_url
        if (foto) setPreview(foto)
      })
      .catch(() => setLoadError('Não foi possível carregar os dados do veículo.'))
      .finally(() => setIsLoading(false))
  }, [id, reset])

  const handleFile = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setApiError('Selecione um arquivo de imagem válido.')
      return
    }
    try {
      setApiError('')
      const dataUrl = await fileToDataUrl(file)
      setPreview(dataUrl)
    } catch {
      setApiError('Não foi possível processar a imagem selecionada.')
    }
  }

  const onDrop = async (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragging(false)
    await handleFile(e.dataTransfer.files?.[0])
  }

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    await handleFile(e.target.files?.[0])
  }

  const onSubmit = async (data: FormData) => {
    if (!id) {
      setApiError('Veículo inválido para edição.')
      return
    }

    try {
      setApiError('')
      const payload = {
        matricula: data.matricula,
        ano: Number(data.ano),
        marca: data.marca,
        modelo: data.modelo,
        placa: data.placa,
        fotoUrl: preview || undefined,
        disponivel: !!data.disponivel,
      }
      await api.put(`/automoveis/${id}`, payload)
      navigate(backPath)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setApiError(msg ?? 'Erro ao atualizar veículo. Tente novamente.')
    }
  }

  const onDelete = async () => {
    if (!id) {
      setApiError('Veículo inválido para exclusão.')
      return
    }

    const ok = window.confirm('Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.')
    if (!ok) return

    try {
      setApiError('')
      setIsDeleting(true)
      await api.delete(`/automoveis/${id}`)
      navigate('/catalogo')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setApiError(msg ?? 'Erro ao excluir veículo. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-amber border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{loadError}</p>
          <button onClick={() => navigate('/catalogo')} className="btn-ghost">Voltar ao catálogo</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-brand-black">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
        <Link to={backPath} className="flex items-center gap-2 mb-8">
          <Car className="w-6 h-6 text-brand-amber" />
          <span className="font-display text-2xl">DRIVE<span className="text-brand-amber">NOW</span></span>
        </Link>

        <h1 className="font-display text-5xl mb-2">EDITAR VEÍCULO</h1>
        <p className="text-white/40 mb-8">Atualize os dados do veículo no catálogo</p>

        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Matrícula *</label>
              <input
                type="text"
                className="input"
                placeholder="AUTO-001"
                {...register('matricula', { required: 'Obrigatório' })}
              />
              {errors.matricula && <p className="text-red-400 text-xs mt-1">{errors.matricula.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">Ano *</label>
              <input
                type="number"
                className="input"
                placeholder="2024"
                {...register('ano', {
                  required: 'Obrigatório',
                  valueAsNumber: true,
                  min: { value: 1900, message: 'Ano inválido' },
                  max: { value: new Date().getFullYear() + 1, message: 'Ano inválido' },
                })}
              />
              {errors.ano && <p className="text-red-400 text-xs mt-1">{errors.ano.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">Marca *</label>
              <input
                type="text"
                className="input"
                placeholder="Toyota"
                {...register('marca', { required: 'Obrigatório' })}
              />
              {errors.marca && <p className="text-red-400 text-xs mt-1">{errors.marca.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">Modelo *</label>
              <input
                type="text"
                className="input"
                placeholder="Corolla"
                {...register('modelo', { required: 'Obrigatório' })}
              />
              {errors.modelo && <p className="text-red-400 text-xs mt-1">{errors.modelo.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">Placa *</label>
              <input
                type="text"
                className="input"
                placeholder="ABC1D23"
                {...register('placa', { required: 'Obrigatório' })}
              />
              {errors.placa && <p className="text-red-400 text-xs mt-1">{errors.placa.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Foto do veículo</label>
              <label
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`block rounded-xl border border-dashed p-5 transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-brand-amber bg-brand-amber/10'
                    : 'border-white/20 hover:border-brand-amber/70 bg-white/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={onFileChange}
                />
                {preview ? (
                  <img src={preview} alt="Pré-visualização do veículo" className="w-full h-52 object-cover rounded-lg" />
                ) : (
                  <div className="text-center text-white/50">
                    <UploadCloud className="w-8 h-8 mx-auto mb-2 text-brand-amber" />
                    <p className="text-sm">Arraste a imagem aqui ou clique para selecionar</p>
                    <p className="text-xs text-white/30 mt-1">PNG, JPG, WEBP</p>
                  </div>
                )}
              </label>
              {preview && (
                <button
                  type="button"
                  onClick={() => {
                    setPreview('')
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="mt-2 text-xs text-white/50 hover:text-red-400 transition-colors"
                >
                  Remover imagem
                </button>
              )}
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-white/70 cursor-pointer select-none">
              <input type="checkbox" className="accent-brand-amber" {...register('disponivel')} />
              Disponível para aluguel
            </label>

            {apiError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
                {apiError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
              </button>
              <button type="button" onClick={() => navigate(backPath)} className="btn-ghost flex-1">
                Cancelar
              </button>
            </div>

            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting || isSubmitting}
              className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-red-400 text-sm hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir veículo'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
