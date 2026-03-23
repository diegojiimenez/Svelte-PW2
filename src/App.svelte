<script lang="ts">
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  import { auth } from '$lib/stores/auth';

  import Navigation from '$lib/components/Navigation.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import CartDrawer from '$lib/components/CartDrawer.svelte';

  import Home from '$lib/pages/Home.svelte';
  import Shop from '$lib/pages/Shop.svelte';
  import Account from '$lib/pages/Account.svelte'; 
  import Register from '$lib/pages/Register.svelte';
  import Admin from '$lib/pages/Admin.svelte';

  gsap.registerPlugin(ScrollTrigger);

  let currentPath = $state(window.location.pathname);
  let isCartOpen = $state(false);

  // estado auth
  let token: string | null = $state(null);
  let user: any = $state(null);
  let loadingAuth = $state(true);

  const publicRoutes = ['/login', '/register'];

  function navigate(href: string) {
    if (window.location.pathname === href) return;
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  $effect(() => {
    const unsub = auth.subscribe((s) => {
      token = s.token;
      user = s.user;
      loadingAuth = s.loading;
    });
    auth.init();
    return () => unsub();
  });

  $effect(() => {
    const handleLocationChange = () => {
      currentPath = window.location.pathname;
      window.scrollTo(0, 0);
      setTimeout(() => ScrollTrigger.refresh(), 50);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  });

  // Guard de rutas
  $effect(() => {
    if (loadingAuth) return;

    const isPublic = publicRoutes.includes(currentPath);

    if (!token && !isPublic) {
      navigate('/login');
      return;
    }

    if (token && isPublic) {
      navigate('/'); // ya logueado, no debería ver login/register
      return;
    }

    if (token && currentPath === '/admin' && user?.rol !== 'administrador') {
      navigate('/'); // sin permisos
      return;
    }
  });

  const isAuthPage = $derived(currentPath === '/login' || currentPath === '/register');
</script>

<main class="min-h-screen bg-background text-foreground flex flex-col">
  {#if !isAuthPage}
    <Navigation onOpenCart={() => (isCartOpen = true)} />
  {/if}

  <div class="flex-grow">
    {#if loadingAuth}
      <section class="min-h-screen pt-32 flex items-center justify-center">
        <h1 class="text-sm tracking-[0.3em] uppercase text-white/50">Loading...</h1>
      </section>

    {:else if currentPath === '/'}
      <Home />

    {:else if currentPath === '/shop'}
      <Shop />

    {:else if currentPath === '/login'}
      <Account />

    {:else if currentPath === '/register'}
      <Register />

    {:else if currentPath === '/admin'}
      <Admin />

    {:else}
      <section class="min-h-screen pt-32 flex items-center justify-center">
        <h1 class="text-2xl text-foreground font-light tracking-widest uppercase">404 - Not Found</h1>
      </section>
    {/if}
  </div>

  {#if !isAuthPage}
    <Footer />
    <CartDrawer isOpen={isCartOpen} onClose={() => (isCartOpen = false)} />
  {/if}
</main>