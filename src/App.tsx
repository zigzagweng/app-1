import { Routes, Route } from 'react-router'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import Dashboard from "./pages/Dashboard"
import Members from "./pages/Members"
import MemberProfile from "./pages/MemberProfile"
import Publications from "./pages/Publications"
import Journals from "./pages/Journals"
import Admin from "./pages/Admin"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/members" element={<Members />} />
      <Route path="/members/:userId" element={<MemberProfile />} />
      <Route path="/publications" element={<Publications />} />
      <Route path="/journals" element={<Journals />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
