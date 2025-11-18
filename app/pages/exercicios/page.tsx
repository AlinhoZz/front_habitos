"use client"

import { useEffect, useState } from "react"
import { getExercicios } from "@/lib/api"

interface Exercicio {
  id: number
  nome: string
  grupo_muscular: string | null
  equipamento: string | null
}

export default function ExerciciosPage() {
  const [data, setData] = useState<Exercicio[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const accessToken = localStorage.getItem("access_token")
        if (!accessToken) {
          setError("Usuário não autenticado")
          return
        }

        const resp = await getExercicios(accessToken)
        setData(resp as Exercicio[])
      } catch (err: any) {
        setError(err.message || "Erro ao carregar exercícios")
      }
    }

    load()
  }, [])

  if (error) {
    return <p className="p-4 text-red-500">{error}</p>
  }

  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold mb-4">Catálogo de exercícios</h1>
      <ul className="space-y-2">
        {data.map(ex => (
          <li key={ex.id} className="border p-2 rounded">
            <div className="font-medium">{ex.nome}</div>
            <div className="text-sm text-slate-500">
              {ex.grupo_muscular} • {ex.equipamento}
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
