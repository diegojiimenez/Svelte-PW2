<script lang="ts">
  import gsap from 'gsap';
  import { cn } from '$lib/utils';

  // DEFINICIÓN DE PROPS (Svelte 5)
  let { isOpen, message, type = 'success', onClose } = $props<{
    isOpen: boolean;
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
  }>();

  let toastRef: HTMLDivElement;
  let timer: ReturnType<typeof setTimeout>;

  // Efecto: Controlar animación y auto-cierre
  $effect(() => {
    if (isOpen && toastRef) {
      // Limpiamos temporizadores anteriores si los hay
      clearTimeout(timer);

      // GSAP Entrance
      gsap.fromTo(toastRef,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );

      // Temporizador de auto-cierre (4 segundos)
      timer = setTimeout(() => {
        handleClose();
      }, 4000);

    } else if (!isOpen && toastRef) {
       // La animación de salida se maneja en handleClose
    }
  });

  // Cierre controlado con animación de salida
  function handleClose() {
    if (toastRef) {
      gsap.to(toastRef, {
        x: 50, opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: onClose // Notifica al padre que ya puede destruir el componente
      });
    } else {
      onClose();
    }
  }
</script>

{#if isOpen}
  <div
    bind:this={toastRef}
    class="fixed top-24 right-6 md:right-12 z-[200] w-full max-w-sm pointer-events-auto opacity-0 translate-x-[100px]"
  >
    <div class="bg-[#0a0a0a] border border-white/10 p-5 flex items-start gap-4 shadow-2xl">
      
      <div class="flex-shrink-0 mt-0.5">
        {#if type === 'success'}
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"></path></svg>
        {:else}
          <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
        {/if}
      </div>

      <div class="flex-grow">
        <span class="block text-[10px] tracking-[0.3em] uppercase text-white/40 mb-1">Status</span>
        <p class="text-sm font-light text-white leading-relaxed">{message}</p>
      </div>

      <button onclick={handleClose} class="flex-shrink-0 text-white/40 hover:text-white transition-colors cursor-pointer">✕</button>
    </div>
  </div>
{/if}