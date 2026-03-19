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
    // Actualizamos la URL en el navegador sin recargar
    window.history.pushState({}, '', href);
    // Actualizamos nuestro estado de Svelte para que la UI reaccione
    currentPath = href;
    
    // Aquí podrías despachar un evento o llamar a una función global 
    // para decirle al resto de la app que cambie de pantalla
  }
</script>

<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12">
  <div class="flex items-center justify-between">
    <a 
      href="/" 
      onclick={(e) => handleNavigate(e, '/')}
      class="text-xl tracking-[0.3em] font-light text-foreground hover:text-muted-foreground transition-colors duration-300"
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
              ? "text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {link.label}
        </a>
      {/each}
    </div>
  </div>
</nav>