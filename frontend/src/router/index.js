import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '../services/token.js'

import DefaultLayout from '../layouts/DefaultLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import EventsView from '../views/EventsView.vue'
import EventDetailsView from '../views/EventDetailsView.vue'
import ParticipantProfileView from '../views/ParticipantProfileView.vue'
import RegistrationView from '../views/RegistrationView.vue'
import MyRegistrationsView from '../views/MyRegistrationsView.vue'
import DashboardView from '../views/DashboardView.vue'
import NotFoundView from '../views/NotFoundView.vue'

/**
 * Routes de l'application EventHub.
 *
 * Deux layouts :
 * - DefaultLayout : pages publiques (accueil, événements, auth, ...)
 * - DashboardLayout : espace de gestion (tableau de bord, profil, ...)
 */
const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'login', name: 'login', component: LoginView },
      { path: 'register', name: 'register', component: RegisterView },
      { path: 'events', name: 'events', component: EventsView },
      { path: 'events/:id', name: 'event-details', component: EventDetailsView },
      {
        path: 'events/:id/edit',
        name: 'event-edit',
        component: EventDetailsView
      },
      {
        path: 'events/:eventId/register',
        name: 'event-registration',
        component: RegistrationView
      },
      {
        // Route protégée : mes inscriptions (JWT requis)
        path: 'registrations',
        name: 'my-registrations',
        component: MyRegistrationsView,
        meta: { requiresAuth: true }
      },
      { path: 'participants/:id', name: 'participant-profile', component: ParticipantProfileView }
    ]
  },
  {
    // Espace de gestion : toutes les routes sont protégées (JWT requis)
    path: '/dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: DashboardView },
      {
        // Gestion des événements depuis le tableau de bord
        // (mode admin : création / suppression activées)
        path: 'events',
        name: 'dashboard-events',
        component: EventsView
      },
      {
        path: 'events/:id',
        name: 'dashboard-event-details',
        component: EventDetailsView
      }
    ]
  },
  {
    // Route fourre-tout : page 404 pour toute URL inconnue
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

/**
 * Garde de navigation globale : les routes marquées
 * `meta.requiresAuth = true` (ou dont le parent est marqué) ne sont
 * accessibles qu'avec un jeton JWT valide.
 *
 * - Jeton absent ou expiré → redirection vers /login
 * - Jeton présent → la navigation est autorisée
 *
 * Le jeton est vérifié à chaque navigation (token.js) ; un 401
 * reçu pendant un appel API déclenche également la déconnexion
 * côté api.js.
 */
router.beforeEach((to) => {
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)
  const token = getToken()

  if (requiresAuth && !token) {
    return {
      name: 'login',
      query: { redirect: to.fullPath }
    }
  }

  if (to.name === 'login' && token) {
    // Un utilisateur déjà connecté n'a pas besoin de la page de connexion.
    const redirect = to.query.redirect || '/dashboard'
    return redirect
  }
})

export default router
