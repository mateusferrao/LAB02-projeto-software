import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Car } from 'lucide-react'
import api from '../services/api'
import type { Automovel } from '../services/api'
import { CarCard } from '../components/CarCard'

export function Catalogo() {
  const [search, setSearch] = useState('')
  const [somenteDisponiveis, setSomenteDisponiveis] = useState(false)

  const { data: cars = [], isLoading } = useQuery<Automovel[]>({
    queryKey: ['automoveis'],
    queryFn: () => api.get('/automoveis').then((r) => r.data),
  })

  const filtered = cars.filter((c) => {
    const q = search.toLowerCase()
    const match = c.marca.toLowerCase().includes(q) || c.modelo.toLowerCase().includes(q)
    return match && (!somenteDisponiveis || c.disponivel)
  })

  return (
    <div className="min-h-screen pt-20 px-4 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="py-12 border-b border-white/5 mb-10">
          <p className="text-brand-amber text-sm uppercase tracking-widest mb-2">Nossa frota</p>
          <h1 className="font-display text-6xl">CATÁLOGO</h1>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Buscar por marca ou modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              className={`relative w-10 h-6 rounded-full transition-colors ${somenteDisponiveis ? 'bg-brand-amber' : 'bg-white/10'}`}
              onClick={() => setSomenteDisponiveis(!somenteDisponiveis)}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${somenteDisponiveis ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-sm text-white/60 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4" />
              Somente disponíveis
            </span>
          </label>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-80 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <Car className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl">Nenhum veículo encontrado</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((car, i) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CarCard car={car} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
