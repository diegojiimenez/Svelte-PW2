<script lang="ts">
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { showcaseItems } from '$lib/data';

  gsap.registerPlugin(ScrollTrigger);

  // Referencias del DOM
  let containerRef: HTMLElement;
  let progressRef: HTMLDivElement;
  
  // En Svelte 5, los arrays de referencias se manejan de forma muy limpia
  let imagesRef: HTMLDivElement[] = [];
  let textRefs: HTMLDivElement[] = [];
  
  // Estado reactivo para saber qué elemento está visible (runa de Svelte 5)
  let activeIndex = $state(0);

  $effect(() => {
    if (!containerRef) return;
    const totalItems = showcaseItems.length;

    const ctx = gsap.context(() => {
      // Fijar la sección y crear el efecto de scroll-jacking
      ScrollTrigger.create({
        trigger: containerRef,
        start: 'top top',
        end: `+=${totalItems * 100}%`,
        pin: true, // Esto es lo que "pega" la sección a la pantalla
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          // Calcular el índice actual basado en cuánto hemos scrolleado
          const newIndex = Math.min(
            Math.floor(progress * totalItems),
            totalItems - 1
          );
          
          // Actualizar el estado de Svelte (esto actualiza los puntitos en móvil)
          activeIndex = newIndex;

          // Animar la barra de progreso vertical
          if (progressRef) {
            gsap.to(progressRef, {
              scaleY: progress,
              duration: 0.1,
              ease: 'none',
            });
          }

          // Animar las Imágenes
          imagesRef.forEach((img, i) => {
            if (!img) return;
            if (i === newIndex) {
              gsap.to(img, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' });
            } else if (i < newIndex) {
              gsap.to(img, { opacity: 0, scale: 1.1, duration: 0.6, ease: 'power2.out' });
            } else {
              gsap.to(img, { opacity: 0, scale: 0.95, duration: 0.6, ease: 'power2.out' });
            }
          });

          // Animar los Textos
          textRefs.forEach((text, i) => {
            if (!text) return;
            if (i === newIndex) {
              gsap.to(text, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
            } else {
              gsap.to(text, { opacity: 0, y: i < newIndex ? -30 : 30, duration: 0.5, ease: 'power2.out' });
            }
          });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  });
</script>

<section
  bind:this={containerRef}
  class="relative h-screen w-full bg-background overflow-hidden"
>
  <div class="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20"></div>

  <div class="absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-center gap-4">
    <span class="text-[10px] tracking-[0.3em] text-muted-foreground uppercase -rotate-90 origin-center whitespace-nowrap mb-8">
      Scroll to explore
    </span>
    <div class="relative w-px h-32 bg-foreground/10 overflow-hidden">
      <div
        bind:this={progressRef}
        class="absolute top-0 left-0 w-full bg-foreground origin-top"
        style="transform: scaleY(0);"
      ></div>
    </div>
    <span class="text-xs text-muted-foreground mt-4">
      {String(activeIndex + 1).padStart(2, '0')} / {String(showcaseItems.length).padStart(2, '0')}
    </span>
  </div>

  <div class="relative h-full max-w-7xl mx-auto px-6 md:px-12 flex items-center">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full items-center">
      
      <div class="relative h-[300px] md:h-[400px] flex items-center order-2 md:order-1">
        {#each showcaseItems as item, index (item.id)}
          <div
            bind:this={textRefs[index]}
            class="absolute inset-0 flex flex-col justify-center"
            style="opacity: {index === 0 ? 1 : 0};"
          >
            <span class="text-[120px] md:text-[200px] font-extralight text-foreground/5 absolute -left-4 md:-left-8 top-0 leading-none select-none">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div class="relative z-10">
              <span class="block text-[10px] tracking-[0.5em] text-accent uppercase mb-4">
                {item.subtitle}
              </span>
              <h2 class="text-4xl md:text-6xl lg:text-7xl font-extralight tracking-[-0.02em] text-foreground leading-none mb-6">
                {item.name}
              </h2>
              <div class="flex items-center gap-8">
                <span class="text-2xl md:text-3xl font-extralight text-foreground/80">
                  {item.price}
                </span>
                <div class="w-16 h-px bg-foreground/20"></div>
              </div>
              <button class="mt-8 group flex items-center gap-4 text-xs tracking-[0.3em] uppercase text-foreground/70 hover:text-foreground transition-colors cursor-pointer">
                <span>View Details</span>
                <span class="w-8 h-px bg-current transition-all group-hover:w-12"></span>
              </button>
            </div>
          </div>
        {/each}
      </div>

      <div class="relative aspect-[3/4] md:aspect-[4/5] order-1 md:order-2">
        <div class="absolute -inset-4 border border-foreground/5"></div>
        <div class="absolute -inset-8 border border-foreground/5 hidden md:block"></div>

        <div class="relative w-full h-full overflow-hidden bg-secondary">
          {#each showcaseItems as item, index (item.id)}
            <div
              bind:this={imagesRef[index]}
              class="absolute inset-0"
              style="opacity: {index === 0 ? 1 : 0}; transform: {index === 0 ? 'scale(1)' : 'scale(0.95)'};"
            >
              <img
                src={item.image}
                alt={item.name}
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent"></div>
            </div>
          {/each}
        </div>

        <div class="absolute -top-2 -left-2 w-8 h-8 border-l-2 border-t-2 border-foreground/20"></div>
        <div class="absolute -bottom-2 -right-2 w-8 h-8 border-r-2 border-b-2 border-foreground/20"></div>
      </div>
    </div>
  </div>

  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
    {#each showcaseItems as _, index}
      <div class="w-2 h-2 rounded-full transition-colors duration-300 {index === activeIndex ? 'bg-foreground' : 'bg-foreground/20'}"></div>
    {/each}
  </div>

  <div class="absolute top-1/4 right-0 w-px h-32 bg-gradient-to-b from-transparent via-foreground/10 to-transparent hidden md:block"></div>
  <div class="absolute bottom-1/4 left-0 w-px h-32 bg-gradient-to-b from-transparent via-foreground/10 to-transparent hidden md:block"></div>
</section>