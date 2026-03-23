<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Product } from '$lib/data';

  // Svelte 5: Definición de props
  let { product, index, onQuickView } = $props<{
    product: Product;
    index: number;
    onQuickView: (p: Product) => void;
  }>();

  // Estado local para el hover (en lugar del useState de React)
  let isHovered = $state(false);
</script>

<article
  class={cn(
    "group relative",
    // Posicionamiento asimétrico para el Masonry Grid
    index % 5 === 0 && "md:col-span-2 md:row-span-2",
    index % 7 === 3 && "md:col-span-2"
  )}
  onmouseenter={() => isHovered = true}
  onmouseleave={() => isHovered = false}
>
  <div class="relative aspect-[3/4] overflow-hidden bg-neutral-900">
    <div
      class={cn(
        "absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out",
        isHovered ? "scale-105 opacity-0" : "scale-100 opacity-100"
      )}
      style="background-image: url({product.image})"
    ></div>
    
    <div
      class={cn(
        "absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out",
        isHovered ? "scale-100 opacity-100" : "scale-110 opacity-0"
      )}
      style="background-image: url({product.imageAlt || product.image})"
    ></div>
    
    <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div class="absolute top-4 left-4">
      <span
        class={cn(
          "inline-flex items-center px-3 py-1 text-[10px] tracking-[0.2em] uppercase",
          product.status === 'active'
            ? "bg-white/10 text-white backdrop-blur-sm"
            : "bg-neutral-800/50 text-white/50 backdrop-blur-sm"
        )}
      >
        {product.status === 'active' ? 'In Stock' : 'Sold Out'}
      </span>
    </div>

    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <button 
        onclick={() => onQuickView(product)}
        class="px-6 py-3 text-[10px] tracking-[0.3em] uppercase bg-black/90 text-white backdrop-blur-sm hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer"
      >
        View Details
      </button>
    </div>
  </div>

  <div class="mt-4 space-y-1">
    <div class="flex items-start justify-between gap-4">
      <h3 class="text-sm font-light tracking-wide text-white group-hover:text-white/60 transition-colors duration-300">
        {product.name}
      </h3>
      <span class="text-sm font-light tracking-wider text-white/60">
        ${product.price}
      </span>
    </div>
    <p class="text-[10px] tracking-[0.2em] uppercase text-white/40">
      {product.category}
    </p>
  </div>
</article>