import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark to-brand-deep py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/src/Images/logo_jarana.jpg" 
              alt="Jarana Logo" 
              className="h-20 w-20 rounded-full object-cover shadow-lg"
            />
          </div>
          <h2 className="mt-6 text-4xl font-extrabold text-brand-cream font-serif">
            Jarana
          </h2>
          <h3 className="mt-2 text-xl font-semibold text-brand-accent">
            Registro Horario
          </h3>
          <p className="mt-2 text-sm text-brand-accent/80">
            Inicia sesión para fichar tu horario
          </p>
        </div>

        <div className="flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: "bg-brand-light hover:bg-brand-medium text-brand-cream",
                card: "shadow-xl border border-neutral-mid/20",
                headerTitle: "text-neutral-dark font-serif",
                headerSubtitle: "text-brand-medium"
              }
            }}
            redirectUrl="/checkin"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
