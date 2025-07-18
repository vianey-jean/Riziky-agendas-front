
import React from 'react';
import ClientManager from '@/components/ClientManager';

const ClientsPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden mt-[80px]">
      {/* Background premium */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-purple-400/20 rounded-full blur-3xl animate-pulse floating-animation"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000 floating-animation"></div>
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-spin" style={{ animationDuration: '25s' }}></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <ClientManager />
      </div>
    </div>
  );
};

export default ClientsPage;
