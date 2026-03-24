<script lang="ts">
  import { cn } from '$lib/utils';
  import { cartStore } from '$lib/stores/cart';
  
  let { onOpenCart } = $props<{ onOpenCart: () => void }>();
  let currentPath = $state(window.location.pathname);

  $effect(() => {
    const handleLocationChange = () => {
      currentPath = window.location.pathname;
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  });

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
      
      <button 
        onclick={onOpenCart}
        class="text-xs tracking-[0.2em] uppercase text-white/60 hover:text-white transition-all duration-300 cursor-pointer"
      >
        Cart ({totalItems})
      </button>
    </div>
  </div>
</nav>