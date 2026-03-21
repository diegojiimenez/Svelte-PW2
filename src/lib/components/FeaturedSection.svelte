<script lang="ts">
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  // Referencias del DOM
  let sectionRef: HTMLElement;
  let titleRef: HTMLHeadingElement;
  let cardsRef: HTMLDivElement;

  // Datos de las categorías
  const categories = [
    {
      title: 'OUTERWEAR',
      description: 'Architectural silhouettes',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
    },
    {
      title: 'ESSENTIALS',
      description: 'Refined basics',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    },
    {
      title: 'ACCESSORIES',
      description: 'Statement pieces',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    },
  ];

  // Runa para los efectos de GSAP
  $effect(() => {
    if (!sectionRef) return;

    const ctx = gsap.context(() => {
      // 1. Animación del Título
      gsap.fromTo(
        titleRef,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: titleRef,
            start: 'top 80%', // La animación empieza cuando el título llega al 80% de la pantalla
            toggleActions: 'play none none reverse',
          },
        }
      );

      // 2. Animación en cascada (stagger) de las Tarjetas
      if (cardsRef && cardsRef.children) {
        gsap.fromTo(
          cardsRef.children,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2, // Retraso de 0.2s entre cada tarjeta
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  });

  // Función temporal para evitar recargas al hacer click en los enlaces (SPA behavior)
  function handleNavigate(e: MouseEvent, href: string) {
    e.preventDefault();
    window.history.pushState({}, '', href);
    // Disparar evento para actualizar el navbar u otras partes si es necesario
    const navEvent = new PopStateEvent('popstate');
    window.dispatchEvent(navEvent);
  }
</script>

<section
  bind:this={sectionRef}
  class="relative min-h-screen bg-[#0a0a0a] py-32 px-6 md:px-12"
>
  <!-- Gradiente sutil como en ScrollRevealSection -->
  <div class="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0a0a0a] to-neutral-800/20 pointer-events-none"></div>

  <div class="relative max-w-7xl mx-auto mb-20 z-10">
    <h2
      bind:this={titleRef}
      class="text-4xl md:text-6xl lg:text-7xl font-extralight tracking-[-0.02em] text-white"
    >
      <span class="block">Featured</span>
      <span class="block text-white/60">Collections</span>
    </h2>
  </div>

  <div
    bind:this={cardsRef}
    class="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 z-10"
  >
    {#each categories as category, index}
      <a
        href="/shop"
        onclick={(e) => handleNavigate(e, '/shop')}
        class="group relative aspect-[3/4] overflow-hidden bg-neutral-900 block"
      >
        <div
          class="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style="background-image: url({category.image})"
        ></div>
        
        <!-- Capa oscura principal para legibilidad -->
        <div class="absolute inset-0 bg-black/60 transition-opacity duration-500 group-hover:bg-black/45"></div>
        
        <!-- Gradiente adicional de arriba a abajo para mejor contraste -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        
        <div class="absolute inset-0 flex flex-col justify-end p-8">
          <span class="text-[10px] tracking-[0.3em] text-white/60 uppercase mb-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            {category.description}
          </span>
          <h3 class="text-2xl md:text-3xl font-light tracking-[0.1em] text-white">
            {category.title}
          </h3>
        </div>

        <span class="absolute top-6 right-6 text-xs tracking-widest text-white/50">
          0{index + 1}
        </span>
      </a>
    {/each}
  </div>

  <div class="relative max-w-7xl mx-auto mt-20 flex justify-center z-10">
    <a
      href="/shop"
      onclick={(e) => handleNavigate(e, '/shop')}
      class="group relative px-12 py-4 text-xs tracking-[0.3em] uppercase text-white border border-white/20 hover:border-white/60 transition-colors duration-300 overflow-hidden block"
    >
      <span class="relative z-10">View All Products</span>
      <span class="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></span>
      <span class="absolute inset-0 flex items-center justify-center text-xs tracking-[0.3em] uppercase text-black opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
        View All Products
      </span>
    </a>
  </div>
</section>