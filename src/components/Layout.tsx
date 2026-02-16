import { Outlet } from 'react-router'
import Navbar from './Navbar'
import Footer from './Footer'
import { Toast } from './Toast'
import CompareBar from './CompareBar'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-auto pb-28">
        <Outlet />
      </main>
      <CompareBar />
      <Footer />
      <Toast />
    </div>
  )
}
