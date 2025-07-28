import { AuthForm } from "@/components/AuthForm"
import Navbar from "@/components/Navbar"


export default function AuthPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <AuthForm />
          </div>
        </div>
      </main>
    </div>
  )
}
