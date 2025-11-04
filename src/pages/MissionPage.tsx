
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Heart, Users, Star, Sparkles, Crown } from 'lucide-react';

const MissionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 mt-[60px] sm:mt-[70px] lg:mt-[80px]">
      {/* Background décoratif */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-48 sm:w-64 lg:w-72 h-48 sm:h-64 lg:h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-48 sm:w-64 lg:w-72 h-48 sm:h-64 lg:h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-48 sm:w-64 lg:w-72 h-48 sm:h-64 lg:h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12 relative z-10">
        {/* En-tête */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl sm:rounded-2xl shadow-lg mb-4 sm:mb-6 floating-animation">
            <Target className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <Crown className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
            Notre Mission
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Révolutionner la gestion des rendez-vous avec élégance et simplicité
          </p>
        </div>

        {/* Contenu principal */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10 lg:mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-blue-700 text-base sm:text-lg lg:text-xl">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                Notre Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                Nous croyons que chaque rendez-vous est une opportunité précieuse. 
                Notre mission est de créer des solutions qui transforment la façon dont 
                les professionnels gèrent leur temps et leurs relations client.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-violet-200 shadow-xl">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-violet-700 text-base sm:text-lg lg:text-xl">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                Nos Valeurs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ul className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
                <li className="flex items-center gap-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                  Excellence dans chaque fonctionnalité
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                  Innovation constante
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                  Satisfaction client prioritaire
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Section engagement */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 border-blue-300 shadow-xl">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-center text-xl sm:text-2xl text-blue-800">
              Notre Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-3 sm:space-y-4">
              <p className="text-base sm:text-lg text-gray-700 px-2">
                Nous nous engageons à fournir une plateforme premium qui allie 
                sophistication, performance et facilité d'utilisation.
              </p>
              <div className="flex justify-center items-center gap-2">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                <span className="text-blue-600 font-semibold text-sm sm:text-base">Premium par nature</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MissionPage;
