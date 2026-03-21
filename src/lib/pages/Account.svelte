<script lang="ts">
  import { onMount } from 'svelte';
  import gsap from 'gsap';


  // Referencias del DOM
  let containerRef: HTMLDivElement;
  let formRef: HTMLFormElement;

  // Estados interactivos (Svelte 5 Runes)
  let email = $state('');
  let password = $state('');
  let rememberMe = $state(false);

  // Animación de entrada GSAP
  $effect(() => {
    if (!containerRef) return;
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.fromTo('.login-title', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
        .fromTo('.login-subtitle', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
        .fromTo('.form-field', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, '-=0.4')
        .fromTo('.submit-button', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.2')
        .fromTo('.login-footer', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.2');
    }, containerRef);

    return () => ctx.revert();
  });

  // Manejador del Formulario
  function handleSubmit(e: Event) {
    e.preventDefault();
    console.log("Datos listos para enviar al backend:", { email, password, rememberMe });
    // Aquí es donde harás tu const res = await fetch('http://localhost:3000/api/login', ...)
  }

  function handleNavigate(e: MouseEvent, href: string) {
    e.preventDefault();
    window.history.pushState({}, '', href);
    const navEvent = new PopStateEvent('popstate');
    window.dispatchEvent(navEvent);
  }
</script>

<div
  bind:this={containerRef}
  class="min-h-screen w-full relative flex items-center justify-center px-6 py-32 overflow-hidden bg-[#0a0a0a]"
>
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-800/20 via-[#0a0a0a] to-[#0a0a0a]"></div>
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
  
  <div 
    class="absolute inset-0 opacity-[0.03]"
    style="background-image: linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px); background-size: 100px 100px;"
  ></div>

  <div class="relative z-10 w-full max-w-md">
    <div class="glass border border-white/10 p-10 md:p-14 bg-white/5 backdrop-blur-xl">
      <div class="text-center mb-12">
        <h1 class="login-title text-3xl md:text-4xl font-extralight tracking-[0.1em] text-white mb-4">
          Welcome Back
        </h1>
        <p class="login-subtitle text-xs tracking-[0.3em] uppercase text-white/50">
          Sign in to your account
        </p>
      </div>

      <form bind:this={formRef} onsubmit={handleSubmit} class="space-y-8">
        <div class="form-field space-y-2">
          <label
            for="email"
            class="block text-[10px] tracking-[0.3em] uppercase text-white/50"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            bind:value={email}
            required
            class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none transition-colors duration-300"
            placeholder="your@email.com"
          />
        </div>

        <div class="form-field space-y-2">
          <label
            for="password"
            class="block text-[10px] tracking-[0.3em] uppercase text-white/50"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            bind:value={password}
            required
            class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none transition-colors duration-300"
            placeholder="••••••••"
          />
        </div>

        <div class="form-field flex items-center justify-between">
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative w-4 h-4 border border-white/30 group-hover:border-white transition-colors duration-300">
              <input type="checkbox" bind:checked={rememberMe} class="sr-only peer" />
              <div class="absolute inset-0.5 bg-white scale-0 peer-checked:scale-100 transition-transform duration-200"></div>
            </div>
            <span class="text-[10px] tracking-[0.2em] uppercase text-white/50 group-hover:text-white transition-colors duration-300">
              Remember me
            </span>
          </label>
          <a
            href="#"
            class="text-[10px] tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors duration-300"
          >
            Forgot Password?
          </a>
        </div>

        <button
          type="submit"
          class="submit-button group relative w-full py-4 mt-4 text-xs tracking-[0.3em] uppercase text-white border border-white/20 hover:border-white/60 transition-colors duration-300 overflow-hidden cursor-pointer bg-transparent"
        >
          <span class="relative z-10 transition-colors duration-500 group-hover:text-black">Sign In</span>
          <span class="absolute inset-0 bg-white scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500"></span>
        </button>
      </form>

      <div class="login-footer mt-10 text-center">
        <p class="text-[10px] tracking-[0.2em] uppercase text-white/50">
          Don't have an account? 
          <a 
            href="/register" 
            onclick={(e) => handleNavigate(e, '/register')} 
            class="text-white hover:text-white/70 transition-colors duration-300 cursor-pointer"
          >
            Create One
          </a>
        </p>
      </div>
    </div>

    <div class="absolute -top-20 -right-20 w-40 h-40 bg-white/5 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-neutral-600/10 blur-3xl pointer-events-none"></div>
  </div>
</div>