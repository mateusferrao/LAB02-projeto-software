import { motion } from 'framer-motion'
import { Calendar, Tag, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { automovelFotoUrl, type Automovel } from '../services/api'

interface Props {
  car: Automovel
}

const FALLBACK = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80'

export function CarCard({ car }: Props) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="card group cursor-pointer"
    >
      {/* Imagem */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={automovelFotoUrl(car) ?? FALLBACK}
          alt={`${car.marca} ${car.modelo}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK }}
        />
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-card-gradient" />

        {/* Badge disponibilidade */}
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${
          car.disponivel
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-red-500/20 text-red-400 border-red-500/30'
        }`}>
          {car.disponivel ? 'Disponível' : 'Indisponível'}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        <p className="text-brand-amber text-xs font-semibold uppercase tracking-widest mb-1">{car.marca}</p>
        <h3 className="font-display text-2xl mb-3">{car.modelo}</h3>

        <div className="flex items-center gap-4 text-white/50 text-sm mb-5">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {car.ano}
          </span>
          <span className="flex items-center gap-1.5">
            <Tag className="w-4 h-4" />
            {car.placa}
          </span>
        </div>

        <Link
          to={`/catalogo/${car.id}`}
          className="flex items-center gap-2 text-brand-amber text-sm font-semibold hover:gap-3 transition-all duration-200"
        >
          Ver detalhes <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  )
}
