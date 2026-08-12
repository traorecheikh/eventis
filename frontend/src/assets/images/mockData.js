/**
 * Données mockées partagées pour la visualisation des composants.
 *
 * Ces données temporaires permettent de prévisualiser l'interface
 * en attendant l'intégration des stores Pinia et de l'API backend.
 *
 * Emplacement : src/assets/images/mockData.js (déplacé à terme
 * vers src/stores/mockData.js ou src/services/mockData.js).
 */

export const MOCK_EVENTS = [
  {
    id: 1,
    title: 'Conférence Tech Paris',
    date: '15 septembre 2026',
    time: '09h00 – 18h00',
    location: 'Paris, France',
    category: 'Technologie',
    description:
      'Une journée dédiée aux dernières tendances technologiques : intelligence artificielle, cloud, cybersécurité et développement durable numérique.',
    maxParticipants: 200,
    currentParticipants: 120,
    organizer: 'Tech Events France',
    status: 'published'
  },
  {
    id: 2,
    title: 'Atelier Design UX',
    date: '22 septembre 2026',
    time: '14h00 – 17h00',
    location: 'Lyon, France',
    category: 'Design',
    description:
      'Atelier pratique sur les méthodes de conception centrée utilisateur : recherche, parcours, maquettes et tests utilisateurs.',
    maxParticipants: 60,
    currentParticipants: 45,
    organizer: 'Design Lyon',
    status: 'published'
  },
  {
    id: 3,
    title: 'Hackathon Jeunes Talents',
    date: '5 octobre 2026',
    time: '48 heures non-stop',
    location: 'Bordeaux, France',
    category: 'Hackathon',
    description:
      '48 heures pour prototyper une solution innovante en équipe. Mentorat, prix et opportunités de recrutement à la clé.',
    maxParticipants: 100,
    currentParticipants: 100,
    organizer: 'Jeunes Talents Bordeaux',
    status: 'full'
  },
  {
    id: 4,
    title: 'Rencontre Entrepreneurs',
    date: '12 octobre 2026',
    time: '18h30 – 21h30',
    location: 'Nantes, France',
    category: 'Networking',
    description:
      'Networking entre porteurs de projets et investisseurs locaux autour de pitches de 5 minutes.',
    maxParticipants: 80,
    currentParticipants: 32,
    organizer: 'Entrepreneurs Nantes',
    status: 'published'
  }
]

export const MOCK_PARTICIPANTS = [
  {
    id: 1,
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@exemple.com',
    phone: '06 12 34 56 78',
    role: 'Organisateur',
    bio: 'Passionnée par l\'organisation d\'événements tech et les rencontres professionnelles.',
    eventsParticipated: 7
  },
  {
    id: 2,
    firstName: 'Thomas',
    lastName: 'Martin',
    email: 'thomas.martin@exemple.com',
    phone: '06 98 76 54 32',
    role: 'Participant',
    bio: 'Développeur full-stack, amateur de hackathons.',
    eventsParticipated: 3
  },
  {
    id: 3,
    firstName: 'Amina',
    lastName: 'Benali',
    email: 'amina.benali@exemple.com',
    phone: '06 45 12 87 63',
    role: 'Participant',
    bio: 'Designer UX/UI, curieuse des nouvelles méthodes de travail collaboratif.',
    eventsParticipated: 5
  }
]

export const MOCK_REGISTRATIONS = [
  {
    id: 101,
    eventId: 1,
    eventTitle: 'Conférence Tech Paris',
    eventDate: '15 septembre 2026',
    status: 'confirmed',
    registeredAt: '1er août 2026',
    dietaryRequirements: 'Végétarien'
  },
  {
    id: 102,
    eventId: 3,
    eventTitle: 'Hackathon Jeunes Talents',
    eventDate: '5 octobre 2026',
    status: 'pending',
    registeredAt: '8 août 2026',
    dietaryRequirements: ''
  },
  {
    id: 103,
    eventId: 2,
    eventTitle: 'Atelier Design UX',
    eventDate: '22 septembre 2026',
    status: 'cancelled',
    registeredAt: '5 août 2026',
    dietaryRequirements: ''
  }
]

export const MOCK_STATISTICS = {
  totalEvents: 4,
  totalParticipants: 325,
  remainingPlaces: 135,
  fillRate: 70,
  monthlyRegistrations: [
    { month: 'Mai', value: 42 },
    { month: 'Juin', value: 58 },
    { month: 'Juillet', value: 75 },
    { month: 'Août', value: 64 },
    { month: 'Septembre', value: 86 }
  ],
  eventsByCategory: [
    { category: 'Technologie', count: 1 },
    { category: 'Design', count: 1 },
    { category: 'Hackathon', count: 1 },
    { category: 'Networking', count: 1 }
  ]
}

/**
 * Retourne la classe de badge correspondant au statut d'une inscription.
 */
export function registrationStatusMeta(status) {
  const map = {
    confirmed: { label: 'Confirmée', cssClass: 'badge-success' },
    pending: { label: 'En attente', cssClass: 'badge-warning' },
    cancelled: { label: 'Annulée', cssClass: 'badge-danger' }
  }
  return map[status] ?? { label: status, cssClass: 'badge-neutral' }
}
