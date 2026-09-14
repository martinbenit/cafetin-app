import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Coffee } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-cafetin-cream flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-cafetin-dark text-white p-5 rounded-full mb-6">
        <Coffee size={48} />
      </div>
      <h1 className="text-5xl md:text-7xl font-bold text-cafetin-dark font-poppins mb-4">
        Cafetin
      </h1>
      <p className="text-xl md:text-2xl text-cafetin-light font-medium mb-12 max-w-2xl">
        Conecta. Comparte. Habla.<br/>
        <span className="text-base font-normal mt-2 block">
          La plataforma de moderación y turnos gamificada que convierte cualquier clase, reunión o presentación en una experiencia dinámica, justa y divertida.
        </span>
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link href="/login" className="w-full">
          <Button variant="primary" size="lg" fullWidth>
            Soy Guía (Host)
          </Button>
        </Link>
      </div>

      <p className="mt-8 text-sm text-cafetin-light">
        Si eres invitado, pide a tu guía que te comparta el enlace de la mesa.
      </p>
    </div>
  );
}
