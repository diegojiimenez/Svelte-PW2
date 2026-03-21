<script lang="ts">
  import { cn } from '$lib/utils';
  
  // En una SPA real con Vite, normalmente usarías una librería como 'svelte-routing'.
  // Por ahora, simularemos la ruta actual con una runa $state que reacciona a los clicks.
  // Más adelante, cuando añadas la lógica de navegación real, actualizarás este estado.
  let currentPath = $state(window.location.pathname);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/login', label: 'Account' }
  ];

  // Función para manejar el click y evitar la recarga de página (comportamiento SPA)
  function handleNavigate(e: MouseEvent, href: string) {
    e.preventDefault();
    window.history.pushState({}, '', href);
    currentPath = href;

    window.dispatchEvent(new PopStateEvent('popstate'));
    
  }
</script>

<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12">
  <div class="flex items-center justify-between w-full">
    <a 
      href="/" 
      onclick={(e) => handleNavigate(e, '/')}
      class="text-xl tracking-[0.3em] font-light text-white hover:text-white/80 transition-colors duration-300"
    >
      NOIR
    </a>
    
    <div class="flex items-center gap-8 md:gap-12">
      {#each links as link}
        <a
          href={link.href}
          onclick={(e) => handleNavigate(e, link.href)}
          class={cn(
            "text-xs tracking-[0.2em] uppercase transition-all duration-300",
            currentPath === link.href 
              ? "text-white" 
              : "text-white/65 hover:text-white"
          )}
        >
          {link.label}
        </a>
      {/each}
    </div>
  </div>
</nav>