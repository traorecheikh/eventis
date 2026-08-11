<script setup>
import { CalendarCheck } from "lucide-vue-next";
import { toast } from "vue-sonner";

function testerLesNotifications() {
    toast.success("Le socle frontend est câblé : Tailwind, icônes, notifications, routeur, store.");
}
</script>

<template>
    <main class="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <CalendarCheck class="w-10 h-10" />
        <h1 class="text-2xl font-semibold">EventHub</h1>
        <p class="text-sm text-gray-500 max-w-md">
            Socle frontend en place. Les écrans réels restent à construire par chaque
            binôme, voir AGENTS.md section Rôles.
        </p>
        <button
            type="button"
            class="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
            @click="testerLesNotifications"
        >
            Tester les notifications
        </button>
    </main>
</template>
