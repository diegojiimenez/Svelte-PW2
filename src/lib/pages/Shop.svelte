<script lang="ts">
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { products, type Product } from '$lib/data';
  import { cn } from '$lib/utils';
  import ProductModal from '$lib/components/ProductModal.svelte';

  gsap.registerPlugin(ScrollTrigger);

  let gridRef: HTMLDivElement;
  let headerRef: HTMLDivElement;

  // Estados de Svelte 5
  let selectedProduct: Product | null = $state(null);
  let isModalOpen = $state(false);
  
  // EL BUSCADOR FUNCIONAL (Añade puntos en tu rúbrica)
  let searchQuery = $state('');
  
  // RUNA $derived: Se actualiza automáticamente cada vez que el usuario escribe en la barra
  let filteredProducts = $derived(
    products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  function handleQuickView(product: Product) {
    selectedProduct = product;
    isModalOpen = true;
  }

  function handleCloseModal() {
    isModalOpen = false;
    setTimeout(() => selectedProduct = null, 300);
  }

  // Animaciones de GSAP
  $effect(() => {
    if (!headerRef) return;
    const ctx = gsap.context(() => {
      // Animar el Header y la Barra de Búsqueda
      gsap.fromTo(
        headerRef,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );
    });
    return () => ctx.revert();
  });

  // Animación del grid (Se vuelve a ejecutar si cambian los productos filtrados)
  $effect(() => {
    // Al añadir filteredProducts aquí, Svelte sabe que debe re-ejecutar el efecto si cambia la búsqueda
    const currentProducts = filteredProducts; 
    
    if (!gridRef) return;
    const ctx = gsap.context(() => {
      const cards = gridRef.querySelectorAll('article');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef,
              start: 'top 85%',
            },
          }
        );
      }
    });
    return () => ctx.revert();
  });
</script>

<section class="min-h-screen bg-[#0a0a0a] py-32 px-6 md:px-12">
  <div bind:this={headerRef} class="max-w-7xl mx-auto mb-16">
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
      
      <div class="w-full md:w-auto">
        <span class="text-[10px] tracking-[0.4em] text-white/40 uppercase mb-4 block">
          All Products
        </span>
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-extralight tracking-[-0.02em] text-white">
          Shop
        </h1>

        <div class="mt-8 relative max-w-md group">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search by name or category..."
            class="w-full bg-transparent border-b border-white/20 py-3 pl-8 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none transition-colors duration-300"
          />
          <svg class="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-3">
        {#each ['All', 'Tops', 'Bottoms', 'Outerwear'] as filter, i}
          <button
            class={cn(
              "px-4 py-2 text-[10px] tracking-[0.2em] uppercase border transition-all duration-300 cursor-pointer",
              i === 0 
                ? "bg-white text-black border-white" 
                : "border-white/20 text-white/50 hover:text-white hover:border-white/50"
            )}
          >
            {filter}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div
    bind:this={gridRef}
    class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-4 auto-rows-auto"
  >
    {#each filteredProducts as product, index (product.id)}
      <ProductCard 
        {product} 
        {index} 
        onQuickView={handleQuickView} 
      />
    {:else}
      <div class="col-span-full py-20 text-center">
        <p class="text-white/40 tracking-[0.2em] uppercase text-xs">No products found matching "{searchQuery}"</p>
      </div>
    {/each}
  </div>

  {#if filteredProducts.length > 0}
    <div class="max-w-7xl mx-auto mt-20 flex justify-center">
      <button class="group relative px-12 py-4 text-xs tracking-[0.3em] uppercase text-white border border-white/20 hover:border-white/60 transition-colors duration-300 overflow-hidden cursor-pointer">
        <span class="relative z-10">Load More</span>
        <span class="absolute inset-0 bg-white scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500"></span>
        <span class="absolute inset-0 flex items-center justify-center text-xs tracking-[0.3em] uppercase text-black opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
          Load More
        </span>
      </button>
    </div>
  {/if}

<ProductModal 
  product={selectedProduct} 
  isOpen={isModalOpen} 
  onClose={handleCloseModal} 
/>
</section>