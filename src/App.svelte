<script lang="ts">
  import Navigation from '$lib/components/Navigation.svelte';
  import Footer from '$lib/components/Footer.svelte';
  
  import Home from '$lib/pages/Home.svelte';
  import Shop from '$lib/pages/Shop.svelte';
  import Account from '$lib/pages/Account.svelte';

  let currentPath = $state(window.location.pathname);

  $effect(() => {
    const handleLocationChange = () => {
      currentPath = window.location.pathname;
      window.scrollTo(0, 0); 
    };

    window.addEventListener('popstate', handleLocationChange);
    
    return () => window.removeEventListener('popstate', handleLocationChange);
  });
</script>

<main class="min-h-screen bg-background text-foreground flex flex-col">
  <Navigation />
  
  <div class="flex-grow">
    {#if currentPath === '/'}
      <Home />
    {:else if currentPath === '/shop'}
      <Shop />
    {:else if currentPath === '/login' || currentPath === '/account'}
      <Account />
    {:else}
      <section class="min-h-screen pt-32 flex items-center justify-center">
        <h1 class="text-2xl text-foreground font-light tracking-widest uppercase">404 - Not Found</h1>
      </section>
    {/if}
  </div>

  <Footer />
</main>