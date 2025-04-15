import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthService } from '@/services/AuthService';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';

// Schéma de validation pour l’étape email
const emailSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
});

// Schéma de validation pour l’étape mot de passe
const passwordSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre")
    .regex(/[^A-Za-z0-9]/, "Doit contenir au moins un caractère spécial"),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [emailValue, setEmailValue] = useState('');
  const [password, setPassword] = useState('');
  const [emailNotFound, setEmailNotFound] = useState(false);

  const navigate = useNavigate();

  // Formulaire de saisie de l’email
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Formulaire de saisie du mot de passe
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange"
  });

  // Soumission de l’email
  const onSubmitEmail = async (values: z.infer<typeof emailSchema>) => {
    setIsSubmitting(true);
    setEmailNotFound(false);
    try {
      const exists = await AuthService.checkEmail(values.email);
      if (exists) {
        setEmailValue(values.email);
        setStep('password');
        passwordForm.setValue('email', values.email);
      } else {
        setEmailNotFound(true);
        emailForm.setError('email', {
          message: "Cet profil n'existe pas."
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (step === 'password') {
      passwordForm.setValue('password', '');
      setPassword('');
    }
  }, [step, passwordForm]);

  // Soumission du mot de passe
  const onSubmitPassword = async (values: z.infer<typeof passwordSchema>) => {
    setIsSubmitting(true);
    try {
      const success = await AuthService.login(values.email, values.password);
      if (success) {
        navigate('/dashboard', { replace: true });
      } else {
        passwordForm.setError('password', {
          message: "Mot de passe incorrect"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    passwordForm.setValue('password', newPassword, { shouldValidate: true });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connexion</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'email' ? (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-6">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="votre@email.com" 
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        {emailNotFound && (
                          <div className="mt-2 text-sm text-red-600 flex items-center space-x-2">
                            <Link to="/inscription" className="text-blue-600 underline">
                              S'inscrire
                            </Link>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Vérification..." : "Continuer"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={() => (
                      <FormItem>
                        <FormLabel>Mot de passe pour {emailValue}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="Votre mot de passe"
                              autoComplete="new-password"
                              value={password}
                              onChange={handlePasswordChange}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={togglePasswordVisibility}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                        <PasswordStrengthIndicator password={password} />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep('email')} 
                      className="w-1/2"
                    >
                      Retour
                    </Button>
                    <Button 
                      type="submit" 
                      className="w-1/2" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Connexion..." : "Se connecter"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
