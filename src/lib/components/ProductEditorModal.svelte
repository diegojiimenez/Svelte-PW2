<script lang="ts">
  import gsap from 'gsap';
  import { cn } from '$lib/utils';
  import type { Product } from '$lib/data'; // Asegúrate de tener el tipo Product definido en data.ts

  // DEFINICIÓN DE PROPS (Svelte 5)
  let { isOpen, productToEdit, onClose, onSave } = $props<{
    isOpen: boolean;
    productToEdit: Product | null; // null = modo "Agregar", Product = modo "Editar"
    onClose: () => void;
    onSave: (productData: Partial<Product>) => void;
  }>();

  // Referencias DOM para GSAP
  let modalRef: HTMLDivElement;
  let overlayRef: HTMLDivElement;

  // ESTADOS DEL FORMULARIO (Svelte 5)
  let name = $state('');
  let category = $state('');
  let price = $state<number | string>('');
  let status = $state<'active' | 'inactive'>('active');
  let description = $state('');
  let imageUrl = $state('');

  // RUNA $derived: Título dinámico
  let isEditing = $derived(!!productToEdit);
  let modalTitle = $derived(isEditing ? 'Edit Product' : 'Add New Product');

  // Efecto 1: Resetear o pre-rellenar el formulario cuando cambia el producto a editar
  $effect(() => {
    if (productToEdit) {
      // Modo Editar: Llenar campos
      name = productToEdit.name;
      category = productToEdit.category;
      price = productToEdit.price;
      status = productToEdit.status;
      description = productToEdit.description || '';
      imageUrl = productToEdit.image;
    } else {
      // Modo Agregar: Limpiar campos
      name = '';
      category = '';
      price = '';
      status = 'active';
      description = '';
      imageUrl = '';
    }
  });

  // Efecto 2: Animación de entrada y bloqueo del scroll
  $effect(() => {
    if (isOpen && modalRef && overlayRef) {
      document.body.style.overflow = 'hidden';

      gsap.to(overlayRef, { opacity: 1, duration: 0.3, ease: 'power2.out', pointerEvents: 'auto' });
      gsap.fromTo(
        modalRef,
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.1 }
      );
    } else if (!isOpen && modalRef && overlayRef) {
      // Animación de salida controlada antes de cerrar
      gsap.to(modalRef, { opacity: 0, scale: 0.95, y: 20, duration: 0.3, ease: 'power2.in' });
      gsap.to(overlayRef, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        pointerEvents: 'none',
        onComplete: () => {
          document.body.style.overflow = '';
          // Aquí no llamamos a onClose porque el padre ya sabe que está cerrado
        }
      });
    }
  });

  // Manejador del Formulario
  function handleSubmit(e: Event) {
    e.preventDefault();
    const productData: Partial<Product> = {
      name,
      category,
      price: Number(price),
      status,
      description,
      image: imageUrl, 
    };
    onSave(productData);
    handleClose(); // Cerramos el modal tras guardar
  }

  // Cierre controlado
  function handleClose() {
    // La animación de salida se maneja en el $effect cuando isOpen cambia a false en el padre
    onClose();
  }
</script>

<div 
  bind:this={overlayRef}
  onclick={handleClose}
  class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] opacity-0 pointer-events-none cursor-pointer flex items-center justify-center p-4 md:p-8"
  aria-hidden="true"
>
  <div
    bind:this={modalRef}
    onclick={(e) => e.stopPropagation()}
    class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 p-8 md:p-12 opacity-0 shadow-2xl hide-scrollbar"
  >
    <button
      onclick={handleClose}
      class="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-300 group cursor-pointer"
    >
      <svg class="w-4 h-4 text-white/50 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>

    <div class="mb-12">
      <span class="text-[10px] tracking-[0.4em] text-white/40 uppercase block mb-2">Editor</span>
      <h2 class="text-3xl md:text-4xl font-extralight tracking-tight text-white">{modalTitle}</h2>
    </div>

    <form onsubmit={handleSubmit} class="space-y-8">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-2">
          <label for="p-name" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Product Name</label>
          <input type="text" id="p-name" bind:value={name} required class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none transition-colors duration-300" placeholder="e.g., Void Cargo Pants" />
        </div>
        <div class="space-y-2">
          <label for="p-category" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Category</label>
          <input type="text" id="p-category" bind:value={category} required class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none transition-colors duration-300" placeholder="e.g., Bottoms" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-2">
          <label for="p-price" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Price ($)</label>
          <input type="number" id="p-price" bind:value={price} required class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none transition-colors duration-300" placeholder="450" />
        </div>
        <div class="space-y-2">
          <label for="p-status" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Status</label>
          <select id="p-status" bind:value={status} required class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white focus:border-white focus:outline-none transition-colors duration-300 appearance-none cursor-pointer">
            <option value="active" class="bg-[#0a0a0a] text-white">Active (In Stock)</option>
            <option value="inactive" class="bg-[#0a0a0a] text-white">Inactive (Sold Out)</option>
          </select>
        </div>
      </div>

      <div class="space-y-2">
        <label for="p-image" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Image URL</label>
        <input type="url" id="p-image" bind:value={imageUrl} required class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none transition-colors duration-300" placeholder="https://unsplash.com/..." />
      </div>

      <div class="space-y-2">
        <label for="p-desc" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Description</label>
        <textarea id="p-desc" bind:value={description} rows="4" class="w-full bg-neutral-900 border border-white/10 p-4 text-xs text-white/70 placeholder:text-white/30 focus:border-white/40 focus:outline-none transition-colors duration-300 resize-none hide-scrollbar" placeholder="Architectural silhouettes, raw texture..."></textarea>
      </div>

      <div class="flex flex-col md:flex-row md:items-center justify-end gap-4 pt-8 border-t border-white/10">
        <button
          type="button" onclick={handleClose}
          class="px-8 py-4 text-xs tracking-[0.3em] uppercase text-white/60 hover:text-white border border-white/10 hover:border-white/30 transition-all cursor-pointer order-2 md:order-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-12 py-4 text-xs tracking-[0.3em] uppercase bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer order-1 md:order-2"
        >
          {isEditing ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  </div>
</div>