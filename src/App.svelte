<script lang="ts">
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  
  import Navigation from '$lib/components/Navigation.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import CartDrawer from '$lib/components/CartDrawer.svelte';
  
  import Home from '$lib/pages/Home.svelte';
  import Shop from '$lib/pages/Shop.svelte';
  import Account from '$lib/pages/Account.svelte';
  import Register from '$lib/pages/Register.svelte'; // <-- Importamos Registro

  gsap.registerPlugin(ScrollTrigger);

  let currentPath = $state(window.location.pathname);
  let isCartOpen = $state(false); // <-- Estado global del carrito

  $effect(() => {
    const handleLocationChange = () => {
      currentPath = window.location.pathname;
      window.scrollTo(0, 0); 
      setTimeout(() => ScrollTrigger.refresh(), 50);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  });
</script>

<main class="min-h-screen bg-background text-foreground flex flex-col">
  <Navigation onOpenCart={() => isCartOpen = true} />
  
  <div class="flex-grow">
    {#if currentPath === '/'}
      <Home />
    {:else if currentPath === '/shop'}
      <Shop />
    {:else if currentPath === '/login' || currentPath === '/account'}
      <Account />
    {:else if currentPath === '/register'}
      <Register />
    {:else}
      <section class="min-h-screen pt-32 flex items-center justify-center">
        <h1 class="text-2xl text-foreground font-light tracking-widest uppercase">404 - Not Found</h1>
      </section>
    {/if}
  </div>

  <Footer />

  <CartDrawer isOpen={isCartOpen} onClose={() => isCartOpen = false} />
</main>