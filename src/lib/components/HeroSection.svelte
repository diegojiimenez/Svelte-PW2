<script lang="ts">
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import ScrollRevealSection from '$lib/components/ScrollRevealSection.svelte';
  import Navigation from '$lib/components/Navigation.svelte';

  // Registramos el plugin de GSAP
  gsap.registerPlugin(ScrollTrigger);

  let containerRef: HTMLElement;
  let imageRef: HTMLDivElement;
  let overlayRef: HTMLDivElement;
  let titleRef: HTMLHeadingElement;
  let subtitleRef: HTMLParagraphElement;
  let scrollTextRef: HTMLDivElement;    

  $effect(() => {
    // Asegurarnos de que el contenedor existe antes de animar
    if (!containerRef) return;

    const ctx = gsap.context(() => {
      // 1. Reveal dramático inicial del fondo (Zoom out)
      gsap.fromTo(
        imageRef,
        { scale: 1.5 },
        { scale: 1, duration: 2.5, ease: 'power3.out' }
      );

      // 2. Fade del overlay oscuro
      gsap.fromTo(
        overlayRef,
        { opacity: 0.95 },
        { opacity: 0.6, duration: 2, ease: 'power2.out' }
      );

      // 3. Reveal del título con stagger (efecto en cascada)
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.5 });

      tl.fromTo(
        '.hero-title-line',
        { y: 150, opacity: 0, rotateX: 45 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.4, stagger: 0.2 }
      )
        .fromTo(
          subtitleRef,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          '-=0.8'
        )
        .fromTo(
          scrollTextRef,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          '-=0.4'
        );

      // 4. Efectos basados en el SCROLL (CORREGIDOS)
      // Usamos fromTo + immediateRender:false para forzar el punto de partida real 
      // y evitar el salto brusco al interrumpir la animación de entrada.
      
      gsap.fromTo(imageRef, 
        { scale: 1 }, // Obligamos a que la base sea 1
        {
          scale: 1.15, // Un zoom más suave (1.15 en lugar de 1.3)
          immediateRender: false, // No lo apliques de inmediato
          scrollTrigger: {
            trigger: containerRef,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );

      gsap.fromTo(overlayRef, 
        { opacity: 0.6 },
        {
          opacity: 0.95,
          immediateRender: false,
          scrollTrigger: {
            trigger: containerRef,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );

      gsap.fromTo('.hero-title-line', 
        { y: 0, opacity: 1 },
        {
          y: -80,
          opacity: 0.3,
          stagger: 0.05,
          immediateRender: false,
          scrollTrigger: {
            trigger: containerRef,
            start: 'top top',
            end: '80% top',
            scrub: 1,
          },
        }
      );

      gsap.fromTo(subtitleRef, 
        { y: 0, opacity: 1 },
        {
          y: -40,
          opacity: 0,
          immediateRender: false,
          scrollTrigger: {
            trigger: containerRef,
            start: 'top top',
            end: '50% top',
            scrub: 1,
          },
        }
      );

      gsap.fromTo(scrollTextRef, 
        { y: 0, opacity: 1 },
        {
          opacity: 0,
          y: -20,
          immediateRender: false,
          scrollTrigger: {
            trigger: containerRef,
            start: '5% top',
            end: '15% top',
            scrub: true,
          },
        }
      );
    }, containerRef);

    // Función de limpieza de Svelte 5 (se ejecuta al desmontar)
    return () => ctx.revert();
  });
</script>

<section
  bind:this={containerRef}
  class="relative h-screen w-full overflow-hidden isolate"
>
  <div
    bind:this={imageRef}
    class="absolute inset-0 w-full h-full"
  >
    <img
      src="/images/hero-bg.png"
      alt="Fashion editorial"
      class="object-cover object-center w-full h-full"
    />
  </div>

  <div class="absolute inset-0 bg-black/55 z-[1]"></div>

  <div
    bind:this={overlayRef}
    class="absolute inset-0 z-[2] bg-gradient-to-b from-black/70 via-black/45 to-black/70"
  ></div>

  <div class="absolute inset-0 z-[3] opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]"></div>

  <div class="relative z-10 flex flex-col items-center justify-center h-full px-6" style="perspective: 1000px;">
    <h1
      bind:this={titleRef}
      class="text-center overflow-hidden"
    >
      <span class="hero-title-line block text-[14vw] md:text-[12vw] lg:text-[10vw] font-extralight tracking-[-0.03em] leading-[0.85] text-white drop-shadow-2xl">
        DEFYING
      </span>
      <span class="hero-title-line block text-[14vw] md:text-[12vw] lg:text-[10vw] font-extralight tracking-[-0.03em] leading-[0.85] text-white drop-shadow-2xl">
        CONVENTION
      </span>
    </h1>
    
    <p
      bind:this={subtitleRef}
      class="mt-10 md:mt-14 text-xs md:text-sm tracking-[0.4em] text-white/80 uppercase font-light"
    >
      SS26 Collection Now Available
    </p>
  </div>

  <div
    bind:this={scrollTextRef}
    class="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10"
  >
    <span class="text-[10px] tracking-[0.5em] text-white/60 uppercase font-light">
      Scroll to Explore
    </span>
    <div class="relative w-px h-14 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent animate-scroll-line"></div>
    </div>
  </div>
</section>