import { useState } from 'react'
import { Base44Adapter } from '../lib/base44-interceptor'

export function MigrationTest() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  
  const testSupabase = async () => {
    setLoading(true)
    try {
      const testEntity = Base44Adapter.Entity('test_migration')
      
      // Criar um teste
      const newItem = await testEntity.create({
        name: 'Teste Supabase',
        timestamp: new Date().toISOString()
      })
      console.log('Item criado:', newItem)
      
      // Listar itens
      const allItems = await testEntity.list()
      setItems(allItems)
      console.log('Items listados:', allItems)
      
    } catch (error) {
      console.error('Erro no teste:', error)
      alert('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Teste de Migração Supabase</h2>
      <button 
        onClick={testSupabase}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Testando...' : 'Testar Conexão Supabase'}
      </button>
      
      {items.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Itens no Supabase:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(items, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}