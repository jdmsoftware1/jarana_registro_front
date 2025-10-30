import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import Footer from '../components/Footer';

const AdminLoginPage = () => {
  return (
    <div className="flex-1 bg-gradient-to-br from-brand-dark to-brand-deep py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        
        {/* Back Button */}
        <Link 
          to="/"
          className="inline-flex items-center text-brand-accent hover:text-brand-cream mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-light rounded-full">
              <Shield className="h-8 w-8 text-brand-cream" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-brand-cream font-serif">
            Acceso Administrador
          </h2>
          <p className="mt-2 text-brand-accent">
            Inicia sesión con tu cuenta de administrador
          </p>
        </div>

        {/* Clerk Sign In */}
        <div className="flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: "bg-brand-light hover:bg-brand-medium text-brand-cream border-0",
                card: "shadow-2xl border border-neutral-mid/20 bg-white",
                headerTitle: "text-neutral-dark font-serif text-xl",
                headerSubtitle: "text-brand-medium",
                socialButtonsBlockButton: "border-neutral-mid/30 hover:bg-neutral-light",
                formFieldInput: "border-neutral-mid/30 focus:border-brand-light",
                footerActionLink: "text-brand-light hover:text-brand-medium"
              },
              layout: {
                socialButtonsPlacement: "top"
              }
            }}
            redirectUrl="/"
            signUpUrl="/admin-signup"
          />
        </div>

        {/* Info */}
        <div className="mt-8 text-center">
          <div className="bg-brand-light/10 border border-brand-accent/20 rounded-lg p-4">
            <h3 className="text-brand-cream font-medium mb-2">
              Solo para Administradores
            </h3>
            <p className="text-brand-accent/80 text-sm">
              Este acceso está restringido a usuarios con permisos de administrador. 
              Si eres empleado, usa el <Link to="/employee-kiosk" className="text-brand-light hover:underline">Kiosk de Empleados</Link>.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminLoginPage;
