<script lang="ts">
  import { cn } from '$lib/utils';
  import { cartStore } from '$lib/stores/cart';
  import { auth } from '$lib/stores/auth'; 
  
  let { onOpenCart } = $props<{ onOpenCart: () => void }>();
  let currentPath = $state(window.location.pathname);

  // Obtenemos el usuario de forma reactiva
  let user: any = $state(null);

  $effect(() => {
    const unsub = auth.subscribe((s) => {
      user = s.user;
    });
    return () => unsub();
  });

  $effect(() => {
    const handleLocationChange = () => {
      currentPath = window.location.pathname;
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  });

  // Enlaces dinámicos basados en el rol
  let links = $derived(() => {
    const base = [
      { href: '/', label: 'Home' },
      { href: '/shop', label: 'Shop' }
    ];
    
    // Si el usuario existe y es admin, mostramos la pestaña
    if (user?.rol === 'administrador') {
      base.push({ href: '/admin', label: 'Admin' });
    }
    
    return base;
  });

  function handleNavigate(e: MouseEvent, href: string) {
    e.preventDefault();
    window.history.pushState({}, '', href);
    currentPath = href;
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  function handleLogout() {
    if (auth.logout) {
      auth.logout(); 
    } else {
      localStorage.removeItem('token'); 
      window.location.reload(); 
    }
    
    window.history.pushState({}, '', '/');
    currentPath = '/';
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  let totalItems = $derived(
    $cartStore.items.reduce((total, item) => total + item.quantity, 0)
  );
</script>

<nav class="fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 pointer-events-none">
  <div class="flex items-center justify-between w-full pointer-events-auto">
    <a 
      href="/" 
      onclick={(e) => handleNavigate(e, '/')}
      class="text-xl tracking-[0.3em] font-light text-white hover:text-white/80 transition-colors duration-300"
    >
      NOIR
    </a>
    
    <div class="flex items-center gap-8 md:gap-12">
      {#each links() as link}
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
      
      <button 
        onclick={onOpenCart}
        class="text-xs tracking-[0.2em] uppercase text-white/60 hover:text-white transition-all duration-300 cursor-pointer"
      >
        Cart ({totalItems})
      </button>

      {#if user}
        <button 
          onclick={handleLogout}
          title="Log Out"
          class="text-white/40 hover:text-red-500 transition-colors duration-300 cursor-pointer flex items-center justify-center"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
      {/if}

    </div>
  </div>
</nav>