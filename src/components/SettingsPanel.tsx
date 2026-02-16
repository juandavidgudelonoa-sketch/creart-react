import { useState } from 'react'
import { Save, Settings, Users, Package, DollarSign, FileText, Link as LinkIcon } from 'lucide-react'
import { useApp } from '../context/AppContext'

type SettingsTab = 'company' | 'social' | 'orders' | 'payments' | 'policies'

export default function SettingsPanel() {
  const { storeSettings, updateStoreSettings, showToast } = useApp()
  const [activeTab, setActiveTab] = useState<SettingsTab>('company')
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      showToast('Configuración guardada correctamente', 'success')
      setSaving(false)
    }, 500)
  }

  const tabs = [
    { id: 'company', label: 'Empresa', icon: Users },
    { id: 'social', label: 'Redes Sociales', icon: LinkIcon },
    { id: 'orders', label: 'Pedidos', icon: Package },
    { id: 'payments', label: 'Pagos', icon: DollarSign },
    { id: 'policies', label: 'Políticas', icon: FileText },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Configuración de la Tienda</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingsTab)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Company Settings */}
      {activeTab === 'company' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de la Tienda</label>
              <input
                type="text"
                value={storeSettings.storeName}
                onChange={(e) => updateStoreSettings({ storeName: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slogan</label>
              <input
                type="text"
                value={storeSettings.slogan}
                onChange={(e) => updateStoreSettings({ slogan: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={storeSettings.description}
              onChange={(e) => updateStoreSettings({ description: e.target.value })}
              rows={3}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ciudad</label>
              <input
                type="text"
                value={storeSettings.city}
                onChange={(e) => updateStoreSettings({ city: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <input
                type="text"
                value={storeSettings.address}
                onChange={(e) => updateStoreSettings({ address: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="text"
                value={storeSettings.phone}
                onChange={(e) => updateStoreSettings({ phone: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp</label>
              <input
                type="text"
                value={storeSettings.whatsapp}
                onChange={(e) => updateStoreSettings({ whatsapp: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={storeSettings.email}
                onChange={(e) => updateStoreSettings({ email: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </div>
        </div>
      )}

      {/* Social Media Settings */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Facebook</label>
              <input
                type="url"
                value={storeSettings.facebook}
                onChange={(e) => updateStoreSettings({ facebook: e.target.value })}
                placeholder="https://facebook.com/tupagina"
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <input
                type="url"
                value={storeSettings.instagram}
                onChange={(e) => updateStoreSettings({ instagram: e.target.value })}
                placeholder="https://instagram.com/tuusuario"
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">YouTube</label>
              <input
                type="url"
                value={storeSettings.youtube}
                onChange={(e) => updateStoreSettings({ youtube: e.target.value })}
                placeholder="https://youtube.com/@tucanal"
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TikTok</label>
              <input
                type="url"
                value={storeSettings.tiktok}
                onChange={(e) => updateStoreSettings({ tiktok: e.target.value })}
                placeholder="https://tiktok.com/@tuusuario"
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Nota:</strong> Agrega las URLs completas de tus redes sociales para que aparezcan en el footer de la tienda.
            </p>
          </div>
        </div>
      )}

      {/* Order Settings */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pedido Mínimo ($)</label>
              <input
                type="number"
                value={storeSettings.minOrder}
                onChange={(e) => updateStoreSettings({ minOrder: Number(e.target.value) })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Costo de Envío ($)</label>
              <input
                type="number"
                value={storeSettings.shippingCost}
                onChange={(e) => updateStoreSettings({ shippingCost: Number(e.target.value) })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tiempo de Entrega</label>
              <input
                type="text"
                value={storeSettings.deliveryTime}
                onChange={(e) => updateStoreSettings({ deliveryTime: e.target.value })}
                placeholder="3-5 días hábiles"
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Vista Previa:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Pedido mínimo: ${storeSettings.minOrder.toLocaleString('es-CO')}</p>
              <p>• Costo de envío: ${storeSettings.shippingCost.toLocaleString('es-CO')}</p>
              <p>• Tiempo de entrega: {storeSettings.deliveryTime}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <h3 className="font-medium">Métodos de Pago Disponibles</h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={storeSettings.paymentWhatsapp}
                onChange={(e) => updateStoreSettings({ paymentWhatsapp: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">WhatsApp</span>
                <p className="text-sm text-gray-500">El cliente recibe el pedido por WhatsApp</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={storeSettings.paymentTransfer}
                onChange={(e) => updateStoreSettings({ paymentTransfer: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">Transferencia Bancaria</span>
                <p className="text-sm text-gray-500">Pago directo a cuenta bancaria</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={storeSettings.paymentCash}
                onChange={(e) => updateStoreSettings({ paymentCash: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <span className="font-medium">Contra Entrega</span>
                <p className="text-sm text-gray-500">Paga cuando recibes el producto</p>
              </div>
            </label>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">
              <strong>Nota:</strong> Por ahora solo el método WhatsApp está activo en el checkout.
            </p>
          </div>
        </div>
      )}

      {/* Policies Settings */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Política de Devoluciones</label>
            <textarea
              value={storeSettings.returnPolicy}
              onChange={(e) => updateStoreSettings({ returnPolicy: e.target.value })}
              rows={4}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Términos y Condiciones</label>
            <textarea
              value={storeSettings.terms}
              onChange={(e) => updateStoreSettings({ terms: e.target.value })}
              rows={4}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Política de Privacidad</label>
            <textarea
              value={storeSettings.privacy}
              onChange={(e) => updateStoreSettings({ privacy: e.target.value })}
              rows={4}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
        </div>
      )}
    </div>
  )
}
