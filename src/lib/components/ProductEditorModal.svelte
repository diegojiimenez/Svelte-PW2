<script lang="ts">
  import gsap from 'gsap';
  import { cn } from '$lib/utils';
  import type { Product } from '$lib/data';

  let { isOpen, productToEdit, onClose, onSave } = $props<{
    isOpen: boolean;
    productToEdit: Product | null;
    onClose: () => void;
    onSave: (productData: Partial<Product>) => void;
  }>();

  let modalRef: HTMLDivElement;
  let overlayRef: HTMLDivElement;

  // Estados del formulario
  let name = $state('');
  let category = $state('Tops'); // Por defecto seleccionado en Tops
  let price = $state<number | string>('');
  let quantity = $state<number | string>(1);
  let status = $state<'active' | 'inactive'>('active');
  let description = $state('');
  let imageUrl = $state('');
  let imageAlt = $state(''); 
  
  // Tallas y Colores
  let sizesInput = $state('');
  let colors = $state<{name: string, hex: string}[]>([]);
  let newColorName = $state('');
  let newColorHex = $state('#ffffff');

  let isEditing = $derived(!!productToEdit);
  let modalTitle = $derived(isEditing ? 'Edit Product' : 'Add New Product');

  // EFECTO REACTIVO: Si la cantidad es 0, pasar a inactive automáticamente
  $effect(() => {
    if (Number(quantity) === 0) {
      status = 'inactive';
    }
  });

  // Efecto para pre-rellenar datos
  $effect(() => {
    if (productToEdit) {
      name = productToEdit.name;
      category = productToEdit.category || 'Tops'; 
      price = productToEdit.price;
      quantity = productToEdit.quantity ?? 1;
      status = productToEdit.status;
      description = productToEdit.description || '';
      imageUrl = productToEdit.image;
      imageAlt = productToEdit.imageAlt || '';
      sizesInput = (productToEdit.sizes || []).join(', ');
      colors = [...(productToEdit.colors || [])];
    } else {
      name = '';
      category = 'Tops';
      price = '';
      quantity = 1;
      status = 'active';
      description = '';
      imageUrl = '';
      imageAlt = '';
      sizesInput = '';
      colors = [];
    }
  });

  $effect(() => {
    if (isOpen && modalRef && overlayRef) {
      document.body.style.overflow = 'hidden';
      gsap.to(overlayRef, { opacity: 1, duration: 0.3, ease: 'power2.out', pointerEvents: 'auto' });
      gsap.fromTo(modalRef, { opacity: 0, scale: 0.9, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.1 });
    } else if (!isOpen && modalRef && overlayRef) {
      gsap.to(modalRef, { opacity: 0, scale: 0.95, y: 20, duration: 0.3, ease: 'power2.in' });
      gsap.to(overlayRef, { opacity: 0, duration: 0.3, ease: 'power2.in', pointerEvents: 'none', onComplete: () => { document.body.style.overflow = ''; } });
    }
  });

  // Funciones para colores
  function addColor() {
    if (newColorName.trim()) {
      colors = [...colors, { name: newColorName.trim(), hex: newColorHex }];
      newColorName = '';
    }
  }
  
  function removeColor(index: number) {
    colors = colors.filter((_, i) => i !== index);
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    
    // Convertimos "S, M, L" en un array ['S', 'M', 'L']
    const parsedSizes = sizesInput.split(',').map(s => s.trim()).filter(Boolean);

    const productData: Partial<Product> = {
      name,
      category,
      price: Number(price),
      quantity: Number(quantity),
      status,
      description,
      image: imageUrl,
      imageAlt,
      sizes: parsedSizes,
      colors
    };

    onSave(productData);
  }

  function handleClose() {
    onClose();
  }
</script>

<div bind:this={overlayRef} onclick={handleClose} class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] opacity-0 pointer-events-none cursor-pointer flex items-center justify-center p-4 md:p-8" aria-hidden="true">
  <div bind:this={modalRef} onclick={(e) => e.stopPropagation()} class="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 p-8 md:p-12 opacity-0 shadow-2xl hide-scrollbar">
    <button onclick={handleClose} class="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-300 group cursor-pointer">
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
          
          <select id="p-category" bind:value={category} required class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white focus:border-white focus:outline-none transition-colors duration-300 appearance-none cursor-pointer">
            <option value="Tops" class="bg-[#0a0a0a] text-white">Tops</option>
            <option value="Bottoms" class="bg-[#0a0a0a] text-white">Bottoms</option>
            <option value="Outerwear" class="bg-[#0a0a0a] text-white">Outerwear</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="space-y-2">
          <label for="p-price" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Price ($)</label>
          <input type="number" id="p-price" bind:value={price} min="0" required class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white focus:border-white focus:outline-none transition-colors duration-300" />
        </div>
        <div class="space-y-2">
          <label for="p-quantity" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Quantity</label>
          <input type="number" id="p-quantity" bind:value={quantity} min="0" required class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white focus:border-white focus:outline-none transition-colors duration-300" />
        </div>
        <div class="space-y-2">
          <label for="p-status" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Status</label>
          <select id="p-status" bind:value={status} required class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white focus:border-white focus:outline-none transition-colors duration-300 appearance-none cursor-pointer">
            <option value="active" class="bg-[#0a0a0a] text-white">Active (In Stock)</option>
            <option value="inactive" class="bg-[#0a0a0a] text-white">Inactive (Sold Out)</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 border border-white/10 bg-white/[0.02]">
        <div class="space-y-4">
          <label for="p-sizes" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Sizes (Comma separated)</label>
          <input type="text" id="p-sizes" bind:value={sizesInput} class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none transition-colors duration-300" placeholder="XS, S, M, L, XL" />
        </div>

        <div class="space-y-4">
          <label class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Colors</label>
          <div class="flex gap-2 items-end">
            <input type="text" bind:value={newColorName} placeholder="Color Name" class="flex-1 bg-transparent border-b border-white/20 py-3 text-sm text-white focus:border-white focus:outline-none transition-colors duration-300" />
            <input type="color" bind:value={newColorHex} class="w-10 h-10 p-0.5 bg-transparent border-b border-white/20 cursor-pointer" />
            <button type="button" onclick={addColor} class="px-4 py-2 border border-white/20 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors cursor-pointer">Add</button>
          </div>
          <div class="flex flex-wrap gap-2 mt-2">
            {#each colors as color, i}
              <div class="flex items-center gap-2 border border-white/20 px-3 py-1 bg-black/50 text-xs text-white">
                <span class="w-3 h-3 rounded-full border border-white/10" style="background-color: {color.hex}"></span>
                {color.name}
                <button type="button" onclick={() => removeColor(i)} class="text-white/40 hover:text-red-500 cursor-pointer ml-1">✕</button>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-2">
          <label for="p-image" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Primary Image URL</label>
          <input type="url" id="p-image" bind:value={imageUrl} required class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none transition-colors duration-300" />
        </div>
        <div class="space-y-2">
          <label for="p-imageAlt" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Hover Image URL (Optional)</label>
          <input type="url" id="p-imageAlt" bind:value={imageAlt} class="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none transition-colors duration-300" />
        </div>
      </div>

      <div class="space-y-2">
        <label for="p-desc" class="block text-[10px] tracking-[0.3em] uppercase text-white/50">Description</label>
        <textarea id="p-desc" bind:value={description} rows="3" class="w-full bg-neutral-900 border border-white/10 p-4 text-xs text-white/70 placeholder:text-white/30 focus:border-white/40 focus:outline-none transition-colors duration-300 resize-none hide-scrollbar"></textarea>
      </div>

      <div class="flex flex-col md:flex-row md:items-center justify-end gap-4 pt-8 border-t border-white/10">
        <button type="button" onclick={handleClose} class="px-8 py-4 text-xs tracking-[0.3em] uppercase text-white/60 hover:text-white border border-white/10 hover:border-white/30 transition-all cursor-pointer">
          Cancel
        </button>
        <button type="submit" class="px-12 py-4 text-xs tracking-[0.3em] uppercase bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer">
          {isEditing ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  </div>
</div>