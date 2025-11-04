
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Scale, AlertCircle, Crown } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 mt-[60px] sm:mt-[70px] lg:mt-[80px]">
      {/* Background décoratif */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-48 sm:w-64 lg:w-72 h-48 sm:h-64 lg:h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-48 sm:w-64 lg:w-72 h-48 sm:h-64 lg:h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12 relative z-10">
        {/* En-tête */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl sm:rounded-2xl shadow-lg mb-4 sm:mb-6 floating-animation">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <Crown className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
            Conditions d'Utilisation
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Cadre légal pour une utilisation optimale
          </p>
        </div>

        {/* Contenu */}
        <div className="space-y-6 sm:space-y-8">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-blue-700 text-base sm:text-lg lg:text-xl">
                <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
                Conditions Générales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-gray-700 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                En utilisant Riziky-Agendas Premium, vous acceptez les conditions suivantes :
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                <li>• Utilisation conforme aux lois en vigueur</li>
                <li>• Respect de la confidentialité des données clients</li>
                <li>• Interdiction d'utilisation malveillante</li>
                <li>• Responsabilité des contenus publiés</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-violet-200 shadow-xl">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-violet-700 text-base sm:text-lg lg:text-xl">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                Notre service est fourni "en l'état". Nous nous efforçons d'assurer 
                une disponibilité maximale mais ne pouvons garantir un fonctionnement 
                ininterrompu. Les utilisateurs sont responsables de leurs sauvegardes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 border-blue-300 shadow-xl">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-center text-xl sm:text-2xl text-blue-800">
                Modifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-center text-gray-700 text-sm sm:text-base px-2">
                Ces conditions peuvent être modifiées. Les utilisateurs seront 
                informés des changements importants par email.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
