
import { Check, X } from 'lucide-react';

// Props du composant
interface PasswordStrengthIndicatorProps {
  password: string;
}

/**
 * Composant qui affiche les critères de force du mot de passe
 * et indique si chaque critère est satisfait
 */
const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  // Liste des exigences pour le mot de passe
  const requirements = [
    {
      label: "Au moins une majuscule",
      test: /[A-Z]/.test(password),
    },
    {
      label: "Au moins une minuscule",
      test: /[a-z]/.test(password),
    },
    {
      label: "Au moins un chiffre",
      test: /[0-9]/.test(password),
    },
    {
      label: "Au moins un caractère spécial",
      test: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
    {
      label: "Au moins 8 caractères",
      test: password.length >= 8,
    },
  ];

  // Rendu du composant
  return (
    <div className="mt-2 space-y-2">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center space-x-2">
          {req.test ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm ${req.test ? 'text-green-500' : 'text-red-500'}`}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PasswordStrengthIndicator;
