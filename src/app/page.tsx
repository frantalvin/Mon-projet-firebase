
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, type AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (err) {
      const authError = err as AuthError;
      switch (authError.code) {
        case 'auth/user-not-found':
          setError("Aucun utilisateur trouvé avec cet e-mail.");
          break;
        case 'auth/wrong-password':
          setError("Mot de passe incorrect.");
          break;
        case 'auth/invalid-credential': // Ajout de ce cas
          setError("L'adresse e-mail ou le mot de passe est incorrect.");
          break;
        case 'auth/email-already-in-use':
          setError("Cet e-mail est déjà utilisé pour un autre compte.");
          break;
        case 'auth/weak-password':
          setError("Le mot de passe doit contenir au moins 6 caractères.");
          break;
        default:
          setError(authError.message || "Une erreur est survenue lors de l'authentification.");
          break;
      }
      console.error("Firebase Auth Error:", authError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setIsSignUp(value === 'signup');
    setError(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-background">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 md:px-20 text-center">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-primary">
            Bienvenue sur PatientWise
          </h1>
          <p className="mt-3 text-xl md:text-2xl text-foreground/80">
            Votre système intelligent de gestion des patients.
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            PatientWise offre une plateforme centralisée pour la gestion des dossiers médicaux,
            la planification des rendez-vous, et l'aide à la décision grâce à l'intelligence artificielle,
            optimisant ainsi les soins aux patients.
          </p>
        </div>

        <Tabs defaultValue="login" onValueChange={handleTabChange} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Connexion</CardTitle>
                <CardDescription>Accédez à votre tableau de bord.</CardDescription>
              </CardHeader>
              <form onSubmit={handleAuth}>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="email-login">Email</Label>
                    <Input 
                      id="email-login" 
                      type="email" 
                      placeholder="docteur@exemple.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="password-login">Mot de passe</Label>
                    <Input 
                      id="password-login" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      autoComplete="current-password"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-stretch">
                  {error && !isSignUp && (
                    <Alert variant="destructive" className="mb-4 text-left">
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>Erreur de connexion</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Créer un compte</CardTitle>
                <CardDescription>Rejoignez PatientWise dès aujourd'hui.</CardDescription>
              </CardHeader>
              <form onSubmit={handleAuth}>
                <CardContent className="space-y-4">
                   <div className="space-y-2 text-left">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input 
                      id="email-signup" 
                      type="email" 
                      placeholder="nouveau.docteur@exemple.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="password-signup">Mot de passe</Label>
                    <Input 
                      id="password-signup" 
                      type="password" 
                      placeholder="********"
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      autoComplete="new-password"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-stretch">
                  {error && isSignUp && (
                     <Alert variant="destructive" className="mb-4 text-left">
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>Erreur d'inscription</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Création en cours...' : 'Créer un compte'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
      </main>
      <footer className="w-full py-6 text-center">
        <p className="text-sm text-muted-foreground">
          © {currentYear !== null ? currentYear : new Date().getFullYear()} PatientWise. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}
