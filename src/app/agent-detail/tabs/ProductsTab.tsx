import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Package, Link2 } from 'lucide-react'
import Request from '../../../lib/request'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type Product, errorText } from '../types'

export default function ProductsTab({ agentId }: { agentId: number }) {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [price, setPrice] = useState('')
  const [type, setType] = useState('product')
  const [link, setLink] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setProducts(await Request.Get(`/agents/${agentId}/products/`))
    } catch (err) {
      setError(errorText(err, 'Failed to load products'))
    }
  }, [agentId])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const reset = () => {
    setEditing(null); setName(''); setDesc(''); setPrice(''); setType('product'); setLink(''); setError(null)
  }
  const openCreate = () => { reset(); setShowForm(true) }
  const openEdit = (p: Product) => {
    setEditing(p); setName(p.name); setDesc(p.description || ''); setPrice(p.price || '')
    setType(p.type || 'product'); setLink(p.purchase_link || ''); setError(null); setShowForm(true)
  }
  const closeForm = () => { reset(); setShowForm(false) }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: name.trim(),
        description: desc.trim() || null,
        price: price.trim() || null,
        type,
        purchase_link: link.trim() || null,
      }
      if (editing) await Request.Patch(`/agents/${agentId}/products/${editing.id}`, payload)
      else await Request.Post(`/agents/${agentId}/products/`, payload)
      closeForm()
      await fetchProducts()
    } catch (err) {
      // Surfaces plan caps ("Product limit reached...") instead of a generic message.
      setError(errorText(err, 'Failed to save product'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return
    try {
      await Request.Delete(`/agents/${agentId}/products/${p.id}`)
      await fetchProducts()
    } catch (err) {
      setError(errorText(err, 'Failed to delete product'))
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider m-0">Products &amp; Services</h3>
        {!showForm && <Button size="sm" onClick={openCreate}><Plus size={14} /> Add</Button>}
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="m-0 mb-3 text-sm font-semibold text-gray-900">{editing ? 'Edit' : 'Add Product / Service'}</h3>
            <form onSubmit={save}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div>
                  <Label className="block text-xs font-medium text-gray-500 mb-1">Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v || 'product')}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-xs font-medium text-gray-500 mb-1">Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" autoFocus />
                </div>
                <div>
                  <Label className="block text-xs font-medium text-gray-500 mb-1">Price</Label>
                  <Input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="29.99" />
                </div>
                {type === 'product' && (
                  <div>
                    <Label className="block text-xs font-medium text-gray-500 mb-1">Purchase Link</Label>
                    <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
                  </div>
                )}
              </div>
              <div className="mb-3">
                <Label className="block text-xs font-medium text-gray-500 mb-1">Description</Label>
                <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" className="resize-none h-16" />
              </div>
              {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</Button>
                <Button variant="outline" size="sm" type="button" onClick={closeForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!showForm && error && <p className="text-red-600 text-xs mb-2">{error}</p>}

      {products.length === 0 ? (
        <Card className="py-8 text-center text-gray-400 text-sm">
          <p className="m-0">No products yet. Add your first product or service.</p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-gray-50">
            {products.map((p) => (
              <div key={p.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <Package size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 m-0 truncate">{p.name}</p>
                    <Badge variant="secondary" className={`text-xs rounded-full px-2 py-0 ${p.type === 'service' ? 'bg-violet-50 text-violet-600 border border-violet-100' : 'bg-sky-50 text-sky-600 border border-sky-100'}`}>
                      {p.type === 'service' ? 'Service' : 'Product'}
                    </Badge>
                    {p.price && <span className="text-xs font-semibold text-gray-500">${p.price}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {p.description && <p className="text-xs text-gray-400 m-0 truncate">{p.description}</p>}
                    {p.purchase_link && (
                      <a href={p.purchase_link} target="_blank" rel="noopener noreferrer" className="text-xs text-brand inline-flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Link2 size={10} /> Link
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-brand-dark" onClick={() => openEdit(p)}><Pencil size={13} /></Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-red-600" onClick={() => remove(p)}><Trash2 size={13} /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
