<script setup>
/**
 * Layout par defaut de l'application (pages publiques).
 *
 * Utilise pour : Accueil, Evenements, Details, Connexion,
 * Inscription, Mes inscriptions, Profil participant.
 */
import Navbar from '../components/layout/Navbar.vue'
import Footer from '../components/layout/Footer.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50">
    <Navbar />
    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:py-10">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>
