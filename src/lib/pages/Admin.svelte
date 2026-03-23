<script lang="ts">
  import gsap from 'gsap';
  import { products, type Product } from '$lib/data'; 
  import { cn } from '$lib/utils';
  import ProductEditorModal from '$lib/components/ProductEditorModal.svelte';

  // Control de pestañas
  let activeTab = $state<'products' | 'orders'>('products');
  let contentRef: HTMLDivElement;

  // Estados del Modal Editor
  let isEditorOpen = $state(false);
  let selectedProductForEdit = $state<Product | null>(null);

  // Mock data para las órdenes
  let orders = $state([
    { id: 'ORD-001', customer: 'Emma Watson', item: 'Obsidian Oversized Tee', date: 'Oct 24, 2026', total: '$189', status: 'In Transit' },
    { id: 'ORD-002', customer: 'John Doe', item: 'Void Cargo Pants', date: 'Oct 23, 2026', total: '$320', status: 'Completed' },
    { id: 'ORD-003', customer: 'Alice Smith', item: 'Monolith Leather Jacket', date: 'Oct 25, 2026', total: '$890', status: 'Placed' },
    { id: 'ORD-004', customer: 'Bob Vance', item: 'Essence Tank Top', date: 'Oct 21, 2026', total: '$120', status: 'Cancelled' }
  ]);

  // Funciones para manejar el Modal
  function openAddModal() {
    selectedProductForEdit = null;
    isEditorOpen = true;
  }

  function openEditModal(product: Product) {
    selectedProductForEdit = product;
    isEditorOpen = true;
  }

  function closeEditorModal() {
    isEditorOpen = false;
    setTimeout(() => selectedProductForEdit = null, 400); // Limpiar tras animación
  }

  function handleSaveProduct(productData: Partial<Product>) {
    if (selectedProductForEdit) {
      console.log("Actualizando producto:", selectedProductForEdit.id, productData);
      // Aquí irá tu fetch PUT a Express
    } else {
      console.log("Creando nuevo producto:", productData);
      // Aquí irá tu fetch POST a Express
    }
  }

  // Animación al cambiar de pestaña
  $effect(() => {
    const currentTab = activeTab; 
    if (contentRef) {
      gsap.fromTo(
        contentRef,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  });

  // Colores para los estados de las órdenes
  function getStatusColor(status: string) {
    switch(status) {
      case 'Placed': return 'text-white border-white';
      case 'In Transit': return 'text-neutral-400 border-neutral-400';
      case 'Completed': return 'text-neutral-600 border-neutral-600';
      case 'Cancelled': return 'text-red-900 border-red-900';
      default: return 'text-white/50 border-white/20';
    }
  }
</script>

<section class="min-h-screen bg-[#0a0a0a] pt-32 px-6 md:px-12 pb-20">
  <div class="max-w-7xl mx-auto">
    
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
      <div>
        <span class="text-[10px] tracking-[0.4em] text-white/40 uppercase mb-4 block">
          Control Panel
        </span>
        <h1 class="text-4xl md:text-6xl font-extralight tracking-[-0.02em] text-white">
          Admin
        </h1>
      </div>
      
      <div class="flex gap-4 border-b border-white/10 pb-[-1px]">
        <button
          onclick={() => activeTab = 'products'}
          class={cn(
            "pb-4 text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 relative cursor-pointer",
            activeTab === 'products' ? "text-white" : "text-white/40 hover:text-white/70"
          )}
        >
          Products
          {#if activeTab === 'products'}
            <span class="absolute bottom-0 left-0 w-full h-px bg-white"></span>
          {/if}
        </button>
        <button
          onclick={() => activeTab = 'orders'}
          class={cn(
            "pb-4 text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 relative cursor-pointer",
            activeTab === 'orders' ? "text-white" : "text-white/40 hover:text-white/70"
          )}
        >
          Orders
          {#if activeTab === 'orders'}
            <span class="absolute bottom-0 left-0 w-full h-px bg-white"></span>
          {/if}
        </button>
      </div>
    </div>

    <div bind:this={contentRef}>
      
      {#if activeTab === 'products'}
        <div class="space-y-6">
          <div class="flex justify-end">
            <button 
              onclick={openAddModal}
              class="px-6 py-3 text-[10px] tracking-[0.2em] uppercase border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
            >
              + Add New Product
            </button>
          </div>

          <div class="w-full overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr class="border-b border-white/10">
                  <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Product</th>
                  <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Category</th>
                  <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Price</th>
                  <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Status</th>
                  <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each products as product}
                  <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td class="py-4 flex items-center gap-4">
                      <div class="w-12 h-16 bg-neutral-900 flex-shrink-0">
                        <img src={product.image} alt={product.name} class="w-full h-full object-cover" />
                      </div>
                      <span class="text-sm font-light text-white">{product.name}</span>
                    </td>
                    <td class="py-4 text-xs tracking-wider text-white/60 uppercase">{product.category}</td>
                    <td class="py-4 text-sm text-white/80">${product.price}</td>
                    <td class="py-4">
                      <span class={cn(
                        "px-2 py-1 text-[9px] tracking-[0.2em] uppercase border",
                        product.status === 'active' ? "border-white/20 text-white/70" : "border-red-900/30 text-red-500/70"
                      )}>
                        {product.status}
                      </span>
                    </td>
                    <td class="py-4 text-right space-x-4">
                      <button 
                        onclick={() => openEditModal(product)}
                        class="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button class="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-red-500 transition-colors cursor-pointer">Delete</button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>

      {:else}
        <div class="w-full overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="border-b border-white/10">
                <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Order ID</th>
                <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Customer</th>
                <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Item</th>
                <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Date</th>
                <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Status</th>
                <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each orders as order}
                <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td class="py-4 text-xs font-mono text-white/60">{order.id}</td>
                  <td class="py-4 text-sm font-light text-white">{order.customer}</td>
                  <td class="py-4 text-xs tracking-wider text-white/80">{order.item}</td>
                  <td class="py-4 text-xs text-white/50">{order.date}</td>
                  <td class="py-4">
                    <span class={cn("px-2 py-1 text-[9px] tracking-[0.2em] uppercase border", getStatusColor(order.status))}>
                      {order.status}
                    </span>
                  </td>
                  <td class="py-4 text-right">
                    <button class="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors cursor-pointer">Update Status</button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}

    </div>
  </div>
</section>

<ProductEditorModal 
  isOpen={isEditorOpen} 
  productToEdit={selectedProductForEdit} 
  onClose={closeEditorModal} 
  onSave={handleSaveProduct} 
/>