<script setup>
/**
 * Layout par défaut de l'application (pages publiques).
 *
 * Comporte la Navbar et le Footer réutilisables, ainsi que
 * le slot principal de la page.
 * Utilisé pour : Accueil, Événements, Détails, Connexion,
 * Inscription, etc.
 */
import Navbar from '../components/layout/Navbar.vue'
import Footer from '../components/layout/Footer.vue'
</script>

<template>
  <div class="layout-default">
    <Navbar />

    <main class="app-main container">
      <RouterView />
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.layout-default {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  padding-top: var(--space-8);
  padding-bottom: var(--space-8);
}

@media (max-width: 720px) {
  .app-main {
    padding-top: var(--space-5);
    padding-bottom: var(--space-5);
  }
}
</style>
