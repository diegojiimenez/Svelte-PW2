<script lang="ts">
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  let footerRef: HTMLElement;

  $effect(() => {
    if (!footerRef) return;

    const ctx = gsap.context(() => {
      // Animación en cascada (stagger) para las columnas del footer
      gsap.fromTo(
        '.footer-content',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef,
            start: 'top 90%', // Se dispara cuando el 90% del viewport toca el footer
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  });

  // Manejador SPA para los enlaces
  function handleNavigate(e: MouseEvent, href: string) {
    e.preventDefault();
    if (href !== '#') {
      window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  // Listas de enlaces para no ensuciar el HTML
  const shopLinks = ['New Arrivals', 'Best Sellers', 'Outerwear', 'Essentials', 'Sale'];
  const infoLinks = ['About Us', 'Sustainability', 'Stores', 'Careers', 'Press'];
  const supportLinks = ['Contact', 'Shipping', 'Returns', 'Size Guide', 'FAQ'];
</script>

<footer bind:this={footerRef} class="bg-[#0a0a0a] border-t border-white/10 py-20 px-6 md:px-12">
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-20">
      
      <div class="footer-content md:col-span-1">
        <a 
          href="/" 
          onclick={(e) => handleNavigate(e, '/')}
          class="text-2xl tracking-[0.3em] font-light text-white hover:text-white/70 transition-colors"
        >
          NOIR
        </a>
        <p class="mt-6 text-xs leading-relaxed text-white/50 max-w-xs">
          Redefining the intersection of brutalist design and contemporary streetwear since 2024.
        </p>
      </div>

      <div class="footer-content">
        <h4 class="text-[10px] tracking-[0.3em] uppercase text-white mb-6">Shop</h4>
        <ul class="space-y-3">
          {#each shopLinks as item}
            <li>
              <a 
                href="/shop" 
                onclick={(e) => handleNavigate(e, '/shop')}
                class="text-xs text-white/50 hover:text-white transition-colors duration-300"
              >
                {item}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <div class="footer-content">
        <h4 class="text-[10px] tracking-[0.3em] uppercase text-white mb-6">Information</h4>
        <ul class="space-y-3">
          {#each infoLinks as item}
            <li>
              <a 
                href="#" 
                onclick={(e) => handleNavigate(e, '#')}
                class="text-xs text-white/50 hover:text-white transition-colors duration-300"
              >
                {item}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <div class="footer-content">
        <h4 class="text-[10px] tracking-[0.3em] uppercase text-white mb-6">Support</h4>
        <ul class="space-y-3">
          {#each supportLinks as item}
            <li>
              <a 
                href="#" 
                onclick={(e) => handleNavigate(e, '#')}
                class="text-xs text-white/50 hover:text-white transition-colors duration-300"
              >
                {item}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <div class="footer-content border-t border-white/10 pt-12 mb-12">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div>
          <h4 class="text-[10px] tracking-[0.3em] uppercase text-white mb-2">Newsletter</h4>
          <p class="text-xs text-white/50">Subscribe for exclusive updates and early access.</p>
        </div>
        <form class="flex w-full md:w-auto" onsubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter your email"
            class="flex-1 md:w-64 bg-transparent border-b border-white/20 py-2 text-xs text-white placeholder:text-white/40 focus:border-white focus:outline-none transition-colors duration-300"
          />
          <button
            type="submit"
            class="ml-4 px-6 py-2 text-[10px] tracking-[0.2em] uppercase text-black bg-white hover:bg-neutral-300 transition-colors duration-300 cursor-pointer"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>

    <div class="footer-content flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-[10px] text-white/40">
      <p>© 2026 NOIR. All rights reserved.</p>
      <div class="flex items-center gap-6">
        <a href="#" class="hover:text-white transition-colors duration-300">Privacy</a>
        <a href="#" class="hover:text-white transition-colors duration-300">Terms</a>
        <a href="#" class="hover:text-white transition-colors duration-300">Cookies</a>
      </div>
    </div>
  </div>
</footer>