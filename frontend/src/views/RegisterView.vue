<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores'
import ErrorMessage from '../components/common/ErrorMessage.vue'

/**
 * Page d'inscription (création de compte).
 *
 * La logique est déléguée au authStore (register). La validation
 * locale conserve la vérification de concordance des mots de passe ;
 * le reste est géré par le store (architecture View → Component → Store).
 */
const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirm: ''
})

async function handleSubmit() {
  if (form.value.password !== form.value.passwordConfirm) {
    authStore.resetStatus()
    authStore.error = 'Les mots de passe ne correspondent pas.'
    return
  }

  if (!form.value.password || form.value.password.length < 8) {
    authStore.resetStatus()
    authStore.error = 'Le mot de passe doit contenir au moins 8 caractères.'
    return
  }

  // Le nom complet est assemblé ici afin que le store transmette
  // exactement les champs attendus par l'API
  // (POST /api/auth/register : { name, email, password }).
  const name = [
    form.value.firstName.trim(),
    form.value.lastName.trim()
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  await authStore.register({
    name,
    email: form.value.email.trim(),
    password: form.value.password
  })

  if (authStore.isAuthenticated) {
    router.push({ name: 'dashboard' })
  }
}

</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Créer un compte</h1>
      <p class="note">
        Rejoignez EventHub pour gérer vos événements.
      </p>

      <form
        class="auth-form"
        @submit.prevent="handleSubmit"
      >
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Prénom</label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              placeholder="Marie"
              required
            >
          </div>
          <div class="form-group">
            <label for="lastName">Nom</label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              placeholder="Dupont"
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label for="email">Adresse e-mail</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="vous@exemple.com"
            required
          >
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              required
            >
          </div>
          <div class="form-group">
            <label for="passwordConfirm">Confirmer</label>
            <input
              id="passwordConfirm"
              v-model="form.passwordConfirm"
              type="password"
              placeholder="••••••••"
              required
            >
          </div>
        </div>

        <ErrorMessage
          v-if="authStore.error"
          :message="authStore.error"
        />

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Création en cours…' : 'Créer mon compte' }}
        </button>
      </form>

      <p class="auth-switch">
        Déjà un compte ?
        <RouterLink to="/login">
          Se connecter
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.auth-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

h1 {
  font-size: 1.75rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.note {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 560px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

input {
  padding: 0.625rem 0.875rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #2563eb;
}

.form-error {
  color: #dc2626;
  font-size: 0.875rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 0.625rem;
  border-radius: 0.375rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.auth-switch {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #475569;
}
</style>
