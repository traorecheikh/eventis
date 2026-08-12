<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="not-found">
    <span class="error-code">404</span>
    <h1>Page introuvable</h1>
    <p>
      La page que vous recherchez n'existe pas ou a été déplacée.
    </p>
    <RouterLink
      to="/"
      class="btn btn-primary"
    >
      Retour à l'accueil
    </RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 4rem 1rem;
}

.error-code {
  display: block;
  font-size: 6rem;
  font-weight: 800;
  color: #e2e8f0;
  line-height: 1;
  margin-bottom: 1rem;
}

h1 {
  font-size: 1.75rem;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.not-found p {
  color: #64748b;
  margin-bottom: 2rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-primary:hover {
  background: #1d4ed8;
}
</style>
