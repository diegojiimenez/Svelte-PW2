<script lang="ts">
  import gsap from 'gsap';
  import { cn } from '$lib/utils';
  import type { Product } from '$lib/data';
  import ProductEditorModal from '$lib/components/ProductEditorModal.svelte';
  import Toast from '$lib/components/Toast.svelte';
  
  import { productsStore } from '$lib/stores/products';
  import { adminOrderStore } from '$lib/stores/adminOrders';

  let activeTab = $state<'products' | 'orders'>('products');
  let contentRef: HTMLDivElement;

  let isEditorOpen = $state(false);
  let selectedProductForEdit = $state<Product | null>(null);

  // Estados del Toast
  let isToastOpen = $state(false);
  let toastMessage = $state('');
  let toastType = $state<'success' | 'error'>('success');

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    toastMessage = msg;
    toastType = type;
    isToastOpen = true;
  }

  $effect(() => {
    productsStore.load();
    adminOrderStore.load();
  });

  $effect(() => {
    const currentTab = activeTab; 
    if (contentRef) {
      gsap.fromTo(contentRef, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
  });

  // PRODUCTOS
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
    setTimeout(() => selectedProductForEdit = null, 400); 
  }

  async function handleSaveProduct(productData: Partial<Product>) {
    try {
      if (selectedProductForEdit) {
        const id = selectedProductForEdit.id || (selectedProductForEdit as any)._id;
        await productsStore.updateItem(id, productData);
        showToast('Product updated successfully.', 'success');
      } else {
        await productsStore.add(productData);
        showToast('Product created successfully.', 'success');
      }
      closeEditorModal();
    } catch (error: any) {
      showToast(error?.message || 'Error saving product', 'error');
    }
  }

  async function handleDeleteProduct(id: string) {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await productsStore.remove(id);
        showToast('Product deleted.', 'success');
      } catch (error: any) {
        showToast('Error deleting product', 'error');
      }
    }
  }

  // ÓRDENES
  const allowedStatuses = ["Placed", "In Transit", "Completed", "Cancelled"];

  // Paleta de colores brutalista + semántica
  function getStatusColor(status: string) {
    switch(status) {
      case 'Placed': return 'text-white border-white/30 bg-white/5';
      case 'In Transit': return 'text-amber-400 border-amber-400/30 bg-amber-400/5';
      case 'Completed': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5';
      case 'Cancelled': return 'text-red-500 border-red-500/30 bg-red-500/5';
      default: return 'text-white/50 border-white/10';
    }
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    try {
      await adminOrderStore.updateStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}`, 'success');
    } catch (error) {
      showToast('Error updating order status', 'error');
    }
  }
</script>

<section class="min-h-screen bg-[#0a0a0a] pt-32 px-6 md:px-12 pb-20">
  <div class="max-w-7xl mx-auto">
    
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
      <div>
        <span class="text-[10px] tracking-[0.4em] text-white/40 uppercase mb-4 block">Control Panel</span>
        <h1 class="text-4xl md:text-6xl font-extralight tracking-[-0.02em] text-white">Admin</h1>
      </div>
      
      <div class="flex gap-4 border-b border-white/10 pb-[-1px]">
        <button onclick={() => activeTab = 'products'} class={cn("pb-4 text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 relative cursor-pointer", activeTab === 'products' ? "text-white" : "text-white/40 hover:text-white/70")}>
          Products
          {#if activeTab === 'products'} <span class="absolute bottom-0 left-0 w-full h-px bg-white"></span> {/if}
        </button>
        <button onclick={() => activeTab = 'orders'} class={cn("pb-4 text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 relative cursor-pointer", activeTab === 'orders' ? "text-white" : "text-white/40 hover:text-white/70")}>
          Orders
          {#if activeTab === 'orders'} <span class="absolute bottom-0 left-0 w-full h-px bg-white"></span> {/if}
        </button>
      </div>
    </div>

    <div bind:this={contentRef}>
      
      {#if activeTab === 'products'}
        <div class="space-y-6">
          <div class="flex justify-end">
            <button onclick={openAddModal} class="px-6 py-3 text-[10px] tracking-[0.2em] uppercase border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 cursor-pointer">
              + Add New Product
            </button>
          </div>

          <div class="w-full overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr class="border-b border-white/10">
                  <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Product</th>
                  <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Category</th>
                  <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Qty</th>
                  <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Price</th>
                  <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Status</th>
                  <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {#if $productsStore.loading && $productsStore.items.length === 0}
                  <tr><td colspan="6" class="py-8 text-center text-xs text-white/40">Loading products...</td></tr>
                {/if}
                
                {#each $productsStore.items as product}
                  <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td class="py-4 flex items-center gap-4">
                      <div class="w-12 h-16 bg-neutral-900 flex-shrink-0">
                        <img src={product.image} alt={product.name} class="w-full h-full object-cover" />
                      </div>
                      <span class="text-sm font-light text-white">{product.name}</span>
                    </td>
                    <td class="py-4 text-xs tracking-wider text-white/60 uppercase">{product.category}</td>
                    <td class="py-4 text-sm text-white/80">{product.quantity ?? 0}</td>
                    <td class="py-4 text-sm text-white/80">${product.price}</td>
                    <td class="py-4">
                      <span class={cn("px-2 py-1 text-[9px] tracking-[0.2em] uppercase border", product.status === 'active' ? "border-white/20 text-white/70" : "border-red-900/30 text-red-500/70")}>
                        {product.status}
                      </span>
                    </td>
                    <td class="py-4 text-right space-x-4">
                      <button onclick={() => openEditModal(product)} class="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors cursor-pointer">Edit</button>
                      <button onclick={() => handleDeleteProduct(product.id || (product as any)._id)} class="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-red-500 transition-colors cursor-pointer">Delete</button>
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
                <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Total</th>
                <th class="py-4 text-[10px] tracking-[0.3em] uppercase text-white/40 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {#if $adminOrderStore.loading && $adminOrderStore.items.length === 0}
                <tr><td colspan="6" class="py-8 text-center text-xs text-white/40">Loading orders...</td></tr>
              {/if}

              {#each $adminOrderStore.items as order}
                <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td class="py-4 text-xs font-mono text-white/60">{order.id}</td>
                  <td class="py-4 text-sm font-light text-white">{order.customer}</td>
                  <td class="py-4 text-xs tracking-wider text-white/80">{order.item}</td>
                  <td class="py-4 text-xs text-white/50">{order.date}</td>
                  <td class="py-4 text-sm text-white/80">{order.total}</td>
                  <td class="py-4 flex items-center justify-between">
                    
                    <span class={cn("px-2 py-1 text-[9px] tracking-[0.2em] uppercase border", getStatusColor(order.status))}>
                      {order.status}
                    </span>
                    
                    <select 
                      onchange={async (e) => {
                        const select = e.target as HTMLSelectElement;
                        await handleStatusChange(order.id, select.value);
                        select.value = ""; 
                      }}
                      class="bg-transparent text-[10px] tracking-[0.2em] uppercase border border-white/10 text-white/40 hover:text-white py-1 px-2 focus:outline-none cursor-pointer appearance-none text-right"
                    >
                      <option value="" disabled selected class="bg-[#0a0a0a]">Update</option>
                      {#each allowedStatuses as statusOption}
                        <option value={statusOption} class="bg-[#0a0a0a] text-white">{statusOption}</option>
                      {/each}
                    </select>

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

<Toast 
  isOpen={isToastOpen} 
  message={toastMessage} 
  type={toastType}
  onClose={() => isToastOpen = false} 
/>