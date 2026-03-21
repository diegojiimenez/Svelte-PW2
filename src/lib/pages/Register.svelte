<script lang="ts">
  import gsap from 'gsap';

  let containerRef: HTMLDivElement;
  let formRef: HTMLFormElement;

  // Datos del formulario
  let fullName = $state('');
  let email = $state('');
  let password = $state('');

  // Animación de entrada GSAP
  $effect(() => {
    if (!containerRef) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.fromTo('.register-title', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
        .fromTo('.register-subtitle', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
        .fromTo('.form-field', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, '-=0.4')
        .fromTo('.submit-button', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.2')
        .fromTo('.register-footer', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.2');
    }, containerRef);
    return () => ctx.revert();
  });

  // Navegación SPA
  function handleNavigate(e: MouseEvent, href: string) {
    e.preventDefault();
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    console.log("Registrando usuario:", { fullName, email, password });
  }
</script>

<div bind:this={containerRef} class="min-h-screen w-full relative flex items-center justify-center px-6 py-32 overflow-hidden bg-[#0a0a0a]">
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-800/20 via-[#0a0a0a] to-[#0a0a0a]"></div>
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
  <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px); background-size: 100px 100px;"></div>

  <div class="relative z-10 w-full max-w-md">
    <div class="glass border border-white/10 p-10 md:p-14 bg-white/5 backdrop-blur-xl">
      <div class="text-center mb-12">
        <h1 class="register-title text-3xl md:text-4xl font-extralight tracking-[0.1em] text-white mb-4">Create Account</h1>
        <p class="register-subtitle text-xs tracking-[0.3em] uppercase text-white/50">Join the avant-garde</p>
      </div>

      <form bind:this={formRef} onsubmit={handleSubmit} class="space-y-6">
        <div class="form-field space-y-2">
          <label for="name" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Full Name</label>
          <input type="text" id="name" bind:value={fullName} required class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none transition-colors duration-300" placeholder="John Doe" />
        </div>

        <div class="form-field space-y-2">
          <label for="email" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Email Address</label>
          <input type="email" id="email" bind:value={email} required class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none transition-colors duration-300" placeholder="your@email.com" />
        </div>

        <div class="form-field space-y-2">
          <label for="password" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Password</label>
          <input type="password" id="password" bind:value={password} required class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none transition-colors duration-300" placeholder="••••••••" />
        </div>

        <button
          type="submit"
          class="submit-button group relative w-full py-4 mt-6 text-xs tracking-[0.3em] uppercase text-white border border-white/20 hover:border-white/60 transition-colors duration-300 overflow-hidden cursor-pointer bg-transparent"
        >
          <span class="relative z-10 transition-colors duration-500 group-hover:text-black">Create Account</span>
          <span class="absolute inset-0 bg-white scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500"></span>
        </button>
      </form>

      <div class="register-footer mt-10 text-center">
        <p class="text-[10px] tracking-[0.2em] uppercase text-white/50">
          Already have an account? 
          <a href="/login" onclick={(e) => handleNavigate(e, '/login')} class="text-white hover:text-white/70 transition-colors duration-300 cursor-pointer">Sign In</a>
        </p>
      </div>
    </div>
  </div>
</div>