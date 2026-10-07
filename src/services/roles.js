// Hierarchie numerique des roles (5 niveaux)
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  CHEF_DE_PROJET: 3,
  SOUS_CHEF_DE_PROJET: 2,
  MEMBRE: 1
};

// Convertit n'importe quel texte de role en cle standardisee
export function normalizeRole(role) {
  if (!role) return 'MEMBRE';
  const r = role.toString().trim().toUpperCase();
  if (r.includes('SUPER')) return 'SUPER_ADMIN';
  if (r.includes('ADMIN')) return 'ADMIN';
  if (r.includes('SOUS') || r.includes('SUB')) return 'SOUS_CHEF_DE_PROJET';
  if (r.includes('CHEF')) return 'CHEF_DE_PROJET';
  return 'MEMBRE';
}

// Nom lisible a affiicher dans le chat sous le nom de l'utilisateur
export function getRoleDisplayName(role) {
  const norm = normalizeRole(role);
  switch (norm) {
    case 'SUPER_ADMIN': return 'Super Administrateur';
    case 'ADMIN': return 'Administrateur';
    case 'CHEF_DE_PROJET': return 'Chef de Projet';
    case 'SOUS_CHEF_DE_PROJET': return 'Sous-chef de Projet';
    case 'MEMBRE': default: return 'Membre';
  }
}

// Le backend autorise la suppression des messages aux administrateurs uniquement.
export function peutSupprimerMessage(userRole) {
  const role = userRole?.toString().trim();
  return role === "Admin" || role === "SUPER_ADMIN";
}

// Styles de couleur des bulles du chat (Compatible Mode Clair & Sombre)
export function getMessageRoleStyle(role) {
  const norm = normalizeRole(role);
  switch (norm) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      // Fond JAUNE
      return 'bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-200 dark:border-yellow-700/50';
    
    case 'CHEF_DE_PROJET':
      // Fond ROSE
      return 'bg-pink-100 text-pink-900 border-pink-300 dark:bg-pink-900/40 dark:text-pink-200 dark:border-pink-700/50';
    
    case 'SOUS_CHEF_DE_PROJET':
      // Fond BLEU
      return 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700/50';
    
    case 'MEMBRE':
    default:
      // Fond BLANC
      return 'bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700';
  }
}