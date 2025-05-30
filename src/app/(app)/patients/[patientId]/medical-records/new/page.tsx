// IMPORTANT: CE FICHIER EST OBSOLÈTE ET CAUSE UNE ERREUR DE DÉMARRAGE DU SERVEUR !
// L'erreur "Error: You cannot use different slug names for the same dynamic path ('id' !== 'patientId')"
// est due au fait que le dossier parent de ce fichier, nommé '[patientId]', est en conflit
// avec le dossier '[id]' (utilisé pour '/src/app/(app)/patients/[id]/page.tsx').
//
// ===> POUR RÉSOUDRE L'ERREUR, VEUILLEZ SUPPRIMER LE DOSSIER '[patientId]' <===
// ===> qui se trouve dans 'src/app/(app)/patients/'                     <===
//
// La fonctionnalité de création de nouveau dossier médical a été déplacée vers l'onglet
// 'Nouv. Dossier' accessible depuis '/dashboard?tab=new-medical-record'.

import { notFound } from 'next/navigation';

export default function ObsoleteAndConflictingNewMedicalRecordPage() {
  // Ce composant ne devrait jamais être rendu si le dossier parent est supprimé.
  // S'il l'est quand même, il renverra une 404.
  notFound();
  return null;
}
