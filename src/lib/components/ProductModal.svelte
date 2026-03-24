<script lang="ts">
  import gsap from "gsap";
  import { cn } from "$lib/utils";
  import type { Product } from "$lib/data";
  import { cartStore } from "$lib/stores/cart";

  let { product, isOpen, onClose } = $props<{
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
  }>();

  // Referencias DOM
  let modalRef: HTMLDivElement;
  let contentRef: HTMLDivElement;
  let imageRef: HTMLDivElement;
  let detailsRef: HTMLDivElement;

  // Estados interactivos con Svelte 5
  let selectedColor = $state(0);
  let selectedSize = $state<string | null>(null);
  let quantity = $state(1);
  let imageLoaded = $state(false);

  // Efecto 1: Resetear el estado cuando cambia el producto
  $effect(() => {
    if (product) {
      selectedColor = 0;
      selectedSize = null;
      quantity = 1;
      imageLoaded = false;
    }
  });

  // Efecto 2: Animación de entrada y bloqueo del scroll
  $effect(() => {
    if (isOpen && modalRef && contentRef && imageRef && detailsRef) {
      document.body.style.overflow = "hidden";

      const tl = gsap.timeline();

      tl.fromTo(
        modalRef,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" },
      )
        .fromTo(
          contentRef,
          { opacity: 0, scale: 0.95, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.out" },
          "-=0.1",
        )
        .fromTo(
          imageRef,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" },
          "-=0.3",
        )
        .fromTo(
          detailsRef,
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" },
          "-=0.5",
        );

      return () => {
        document.body.style.overflow = "";
      };
    }
  });

  async function addToCart() {
    if (!selectedSize || !product) return;
    await cartStore.addOrUpdate({
      productId: product._id || product.id,
      quantity,
      size: selectedSize,
      color: product.colors[selectedColor],
    });
    // Opcional: muestra feedback o cierra modal
  }

  // Animación de salida controlada
  function handleClose() {
    if (modalRef && contentRef) {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          onClose(); // Le avisa al padre que ya puede destruir el componente
        },
      });

      tl.to(contentRef, {
        opacity: 0,
        scale: 0.95,
        y: 20,
        duration: 0.3,
        ease: "power2.in",
      }).to(
        modalRef,
        { opacity: 0, duration: 0.2, ease: "power2.in" },
        "-=0.1",
      );
    } else {
      onClose();
    }
  }
</script>

{#if isOpen && product}
  <div
    bind:this={modalRef}
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 opacity-0"
  >
    <div
      class="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
      onclick={handleClose}
      aria-hidden="true"
    ></div>

    <div
      bind:this={contentRef}
      class="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-[#0a0a0a] border border-white/10 opacity-0"
    >
      <button
        onclick={handleClose}
        class="absolute top-4 right-4 z-20 w-12 h-12 flex items-center justify-center border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-300 group cursor-pointer"
      >
        <svg
          class="w-5 h-5 text-white/50 group-hover:text-white transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M6 18L18 6M6 6l12 12"
          ></path></svg
        >
      </button>

      <div class="grid grid-cols-1 md:grid-cols-2 h-full">
        <div
          bind:this={imageRef}
          class="relative aspect-square md:aspect-auto md:h-[90vh] bg-neutral-900 overflow-hidden opacity-0"
        >
          <div
            class={cn(
              "absolute inset-0 bg-neutral-900 animate-pulse transition-opacity duration-500",
              imageLoaded ? "opacity-0" : "opacity-100",
            )}
          ></div>

          <img
            src={product.image}
            alt={product.name}
            onload={() => (imageLoaded = true)}
            class={cn(
              "w-full h-full object-cover transition-all duration-700",
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
            )}
          />

          <div
            class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
          ></div>

          <div
            class="absolute top-8 left-8 bg-black/80 backdrop-blur-sm px-6 py-3 border border-white/10"
          >
            <span class="text-3xl font-extralight tracking-tight text-white"
              >${product.price}</span
            >
          </div>

          <div class="absolute bottom-8 left-8">
            <span
              class={cn(
                "px-4 py-2 text-[10px] tracking-[0.3em] uppercase",
                product.status === "active"
                  ? "bg-white text-black"
                  : "bg-neutral-800 text-white/50",
              )}
            >
              {product.status === "active" ? "Available" : "Sold Out"}
            </span>
          </div>
        </div>

        <div
          bind:this={detailsRef}
          class="relative p-8 md:p-12 flex flex-col justify-between bg-[#0a0a0a] overflow-y-auto max-h-[50vh] md:max-h-[90vh] opacity-0"
        >
          <div>
            <span class="text-[10px] tracking-[0.5em] text-white/40 uppercase">
              {product.category}
            </span>
            <h2
              class="mt-4 text-3xl md:text-4xl font-extralight tracking-tight text-white"
            >
              {product.name}
            </h2>
            <p class="mt-6 text-sm text-white/60 leading-relaxed">
              {product.description}
            </p>

            <div class="w-full h-px bg-white/10 my-8"></div>

            <div class="mb-8">
              <div class="flex items-center justify-between mb-4">
                <span
                  class="text-[10px] tracking-[0.3em] text-white/40 uppercase"
                  >Color</span
                >
                <span class="text-xs text-white/70"
                  >{product.colors[selectedColor]?.name}</span
                >
              </div>
              <div class="flex gap-3">
                {#each product.colors as color, index}
                  <button
                    onclick={() => (selectedColor = index)}
                    class={cn(
                      "relative w-10 h-10 rounded-full border-2 transition-all duration-300 cursor-pointer",
                      selectedColor === index
                        ? "border-white scale-110"
                        : "border-transparent hover:scale-105",
                    )}
                    title={color.name}
                  >
                    <span
                      class="absolute inset-1 rounded-full"
                      style="background-color: {color.hex}"
                    ></span>
                    {#if selectedColor === index}
                      <span
                        class="absolute inset-0 rounded-full ring-2 ring-white/20 ring-offset-2 ring-offset-[#0a0a0a]"
                      ></span>
                    {/if}
                  </button>
                {/each}
              </div>
            </div>

            <div class="mb-8">
              <div class="flex items-center justify-between mb-4">
                <span
                  class="text-[10px] tracking-[0.3em] text-white/40 uppercase"
                  >Size</span
                >
                <button
                  class="text-[10px] tracking-wider text-white/40 hover:text-white underline transition-colors cursor-pointer"
                >
                  Size Guide
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                {#each product.sizes as size}
                  <button
                    onclick={() => (selectedSize = size)}
                    class={cn(
                      "min-w-[48px] h-12 px-4 text-sm tracking-wider border transition-all duration-300 cursor-pointer",
                      selectedSize === size
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/60 border-white/20 hover:border-white/50 hover:text-white",
                    )}
                  >
                    {size}
                  </button>
                {/each}
              </div>
            </div>

            <div class="mb-8">
              <span
                class="block text-[10px] tracking-[0.3em] text-white/40 uppercase mb-4"
                >Quantity</span
              >
              <div class="inline-flex items-center border border-white/20">
                <button
                  onclick={() => (quantity = Math.max(1, quantity - 1))}
                  class="w-12 h-12 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M20 12H4"
                    ></path></svg
                  >
                </button>
                <span
                  class="w-16 h-12 flex items-center justify-center text-lg font-light border-x border-white/20 text-white"
                >
                  {quantity}
                </span>
                <button
                  onclick={() => quantity++}
                  class="w-12 h-12 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M12 4v16m8-8H4"
                    ></path></svg
                  >
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-4 pt-4 border-t border-white/10 mt-auto">
            <div class="flex items-center justify-between text-white">
              <span class="text-sm text-white/40">Total</span>
              <span class="text-2xl font-extralight tracking-tight">
                ${(product.price * quantity).toLocaleString()}
              </span>
            </div>

            <button
              disabled={product.status !== "active" || !selectedSize}
              class={cn(
                "group relative w-full h-14 overflow-hidden transition-colors",
                product.status === "active" && selectedSize
                  ? "bg-white text-black hover:bg-neutral-200 cursor-pointer"
                  : "bg-neutral-800 text-white/30 cursor-not-allowed border border-white/10",
              )}
              onclick={addToCart}
            >
              <span
                class="relative z-10 flex items-center justify-center gap-3 text-[11px] tracking-[0.3em] uppercase"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  ></path></svg
                >
                {!selectedSize ? "Select a Size" : "Add to Cart"}
              </span>
            </button>

            <div class="flex gap-2">
              <button
                class="flex-1 h-12 border border-white/10 text-[10px] tracking-[0.2em] uppercase text-white/50 hover:text-white hover:border-white/30 transition-all cursor-pointer"
              >
                Wishlist
              </button>
              <button
                class="flex-1 h-12 border border-white/10 text-[10px] tracking-[0.2em] uppercase text-white/50 hover:text-white hover:border-white/30 transition-all cursor-pointer"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
