import { useState } from 'react'
import { Bell, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useApp, Notification } from '../context/AppContext'

export default function NotificationsDropdown() {
  const { notifications, markNotificationRead, clearNotifications, unreadCount } = useApp()
  const [isOpen, setIsOpen] = useState(false)

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <Check className="w-4 h-4 text-green-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default: return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getBgColor = (read: boolean, type: Notification['type']) => {
    if (read) return 'bg-white'
    switch (type) {
      case 'success': return 'bg-green-50'
      case 'error': return 'bg-red-50'
      case 'warning': return 'bg-yellow-50'
      default: return 'bg-blue-50'
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 hover:text-teal-600 transition">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white shadow-xl rounded-lg z-50 w-80 max-h-96 overflow-auto">
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-semibold">Notificaciones</span>
            {notifications.length > 0 && (
              <button onClick={clearNotifications} className="text-xs text-red-500">Limpiar todo</button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No hay notificaciones</div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3 border-b cursor-pointer ${getBgColor(notif.read, notif.type)}`}
              >
                <div className="flex gap-2">
                  {getIcon(notif.type)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notif.title}</p>
                    <p className="text-xs text-gray-500">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.date).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
