'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Coffee } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      router.push('/dashboard');
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else if (data.user?.identities?.length === 0) {
      setError("Este usuario ya existe. Por favor, intenta iniciar sesión.");
    } else {
      setError("¡Registro exitoso! Si tu proyecto requiere confirmación por email, por favor revisa tu bandeja de entrada. Si no, intenta iniciar sesión ahora.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-cafetin-cream flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-cafetin-dark text-white p-3 rounded-full">
              <Coffee size={32} />
            </div>
            <h1 className="text-4xl font-bold text-cafetin-dark font-poppins">Cafetin</h1>
          </div>
        </div>

        <Card>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-cafetin-dark">Acceso Host</h2>
            <p className="text-cafetin-light text-sm mt-1">Inicia sesión o regístrate para moderar tu mesa</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className={`p-3 rounded-lg text-sm text-center ${error.includes('exitoso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {error}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <Button type="submit" fullWidth isLoading={isLoading}>
                Ingresar
              </Button>
              <Button type="button" variant="outline" fullWidth isLoading={isLoading} onClick={handleRegister}>
                Crear nueva cuenta
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
