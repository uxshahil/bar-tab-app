<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useDrinksStore } from '@/stores/loaders/drinks'
import { useErrorStore } from '@/stores/error'
import { storeToRefs } from 'pinia'
import { onMounted, computed, watch, ref } from 'vue'

const route = useRoute()
const drinksStore = useDrinksStore()
const { drink } = storeToRefs(drinksStore)

const slug = computed(() => route.params.slug as string)

const loading = ref(true)

const loadData = async () => {
    loading.value = true
    if (slug.value) {
        // Find ID by slug or update store to support slug
        // Current store.getDrink takes ID. 
        // But drinkQuery takes SLUG.
        // Let's use the query directly for now if store doesn't support generic slug lookup conveniently, 
        // OR better: use the store's loadDrink which calls drinkQuery(slug).
        // The store signature is getDrink(id: string).
        // In drinks.ts: const loadDrink = useMemoize(async (key: string) => await drinkQuery(key))
        // So passing slug to getDrink should work fine!
        await drinksStore.getDrink(slug.value)
    }
    loading.value = false
}

onMounted(() => {
    loadData()
})

watch(slug, () => {
    loadData()
})

// Mock ingredients logic since DB doesn't have structured ingredients yet
const ingredients = computed(() => {
    return []
})

// Parse description for method steps
const instructions = computed(() => {
    if (!drink.value?.description) return []
    // Split by newlines or periods followed by space if newlines are absent
    const text = drink.value.description
    if (text.includes('\n')) {
        return text.split('\n').filter(step => step.trim().length > 0)
    }
    return text.split('. ').filter(step => step.trim().length > 0)
})

const safeDate = computed(() => {
    if (!drink.value?.created_at) return 'N/A'
    return new Date(drink.value.created_at).toLocaleDateString()
})

// Add to Tab Logic
import { useAddToTabStore } from '@/stores/ui/addToTab'
import { Button } from '@/components/ui/button'

const addToTabStore = useAddToTabStore()
const handleAddToTab = () => {
    if (drink.value) {
        addToTabStore.open(drink.value)
    }
}
</script>

<template>
  <div class="min-h-screen text-primary p-6 md:p-12 font-serif selection:bg-primary selection:text-black">
    
    <div v-if="loading" class="flex h-[50vh] items-center justify-center">
        <div class="animate-pulse tracking-widest uppercase text-xs font-mono">Loading...</div>
    </div>

    <div v-else-if="!drink" class="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div class="text-2xl font-bold">404</div>
        <div class="text-sm uppercase tracking-widest">Drink not found</div>
    </div>

    <main v-else class="max-w-4xl mx-auto space-y-16">
      
      <!-- Header Section -->
      <header class="flex flex-col-reverse md:flex-row md:justify-between md:items-end gap-8 pb-12 border-b border-primary/20 relative">
        <div class="space-y-4 max-w-2xl">

          <h1 class="text-5xl md:text-7xl font-serif lowercase tracking-tighter leading-[0.9]">
            {{ drink.name }}
          </h1>
          <div class="flex flex-row justify-between">
            <div class="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-primary/60 font-mono">
              <span>{{ drink.category?.name || 'Unknown Category' }}</span>
              <span class="w-1 h-1 rounded-full bg-current"></span>
              <span>R {{ drink.price }}</span>
            </div>
            <Button 
              size="sm" 
              class="rounded-full px-8 py-6 text-sm font-serif bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              @click="handleAddToTab"
            >
              Add to Tab
            </Button>
          </div>
        </div>

        <div class="md:absolute md:top-0 md:right-0 flex flex-col items-end gap-6">
             <!-- Header Actions -->

             <div class="w-24 h-24 flex items-center justify-center border border-dashed border-primary/30 rounded-full p-5 hover:rotate-12 transition-transform duration-500 cursor-help">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="w-full h-full opacity-60">
                    <path d="M7 10h10" />
                    <path d="M12 21a7 7 0 0 0 7-7c0-2-2-3-2-3v-6h-5v6c0 1-2 1-2 1a7 7 0 0 0 2 9Z" />
                    <path d="M12 21v-8" />
                </svg>
            </div>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-12">
        
        <!-- Ingredients Column -->
        <div class="md:col-span-4 space-y-12">
            <div>
                <h2 class="text-xs font-bold uppercase tracking-[0.3em] pb-3 border-b border-primary/10 mb-6">
                    Components
                </h2>
                
                <div v-if="ingredients.length > 0">
                    <ul class="space-y-4">
                        <li v-for="(ing, index) in ingredients" :key="index" class="flex items-baseline gap-3 group">
                            <span class="text-[10px] font-mono text-primary/50 w-8 text-right group-hover:text-primary transition-colors">-</span>
                            <span class="text-sm border-b border-dotted border-primary/30 flex-1 pb-1 uppercase tracking-wider group-hover:border-primary transition-colors">
                                {{ ing.name }}
                            </span>
                        </li>
                    </ul>
                </div>
                <!-- Since we largely don't have ingredients, let's show a placeholder or nothing -->
                <div v-else class="text-sm italic opacity-40 font-serif leading-relaxed">
                    A secret blend of ingredients for this {{ drink.category?.name?.toLowerCase() || 'beverage' }}.
                </div>
            </div>

            <!-- Meta Data -->
             <div class="space-y-2 font-mono text-[10px] uppercase text-primary/40 pt-6 border-t border-primary/5">
              <div class="flex justify-between">
                  <span>ID</span>
                  <span>{{ drink.id }}</span>
              </div>
              <div class="flex justify-between">
                  <span>Added</span>
                  <span>{{ safeDate }}</span>
              </div>
               <div class="flex justify-between">
                  <span>Menu</span>
                  <span>{{ drink.category?.menu?.name || 'Standard' }}</span>
              </div>
           </div>
        </div>

        <!-- Method/Description Column -->
        <div class="md:col-span-8 flex flex-col justify-between">
            <div class="space-y-8">
                <h2 class="text-xs font-bold uppercase tracking-[0.3em] pb-3 border-b border-primary/10">
                    Preparation / Notes
                </h2>
                
                <div class="space-y-6">
                    <template v-if="instructions.length">
                        <p v-for="(step, index) in instructions" :key="index" class="text-xl md:text-2xl leading-relaxed font-serif text-primary/90">
                            <span class="inline-block text-[10px] font-mono mr-3 -translate-y-1 opacity-40 border border-primary/20 w-5 h-5 rounded-full text-center leading-5 select-none">{{ index + 1 }}</span>
                            {{ step }}
                        </p>
                    </template>
                    <template v-else>
                        <p class="text-xl md:text-2xl leading-relaxed text-primary/40 italic">
                            No specific instructions provided.
                        </p>
                    </template>
                </div>
            </div>
            
             <!-- Decorative -->
             <div class="mt-16 md:mt-0 flex justify-center opacity-10">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5 7.51-3.22-7.52-3.22 3.22-7.52 3.22 7.52 7.52 3.22-7.52 3.22-3.22 7.52z"/>
                </svg>
             </div>
        </div>

      </div>

      <!-- Footer -->
      <footer class="pt-8 mt-8 border-t border-primary/10 flex justify-between items-end opacity-40 hover:opacity-100 transition-opacity duration-500">
         <div class="flex flex-col gap-1">
             <div class="text-[9px] uppercase tracking-[0.3em]">Bar Tab App</div>
             <div class="text-[9px] uppercase tracking-[0.3em]">Menu Collection Volume I</div>
         </div>
         <div class="font-mono text-[9px] uppercase tracking-widest">
            Item {{ drink.id.toString().padStart(4, '0') }}
         </div>
      </footer>

    </main>
  </div>
</template>
