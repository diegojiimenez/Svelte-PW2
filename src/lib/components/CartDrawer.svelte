<script lang="ts">
  import gsap from 'gsap';
  import { cartStore } from '$lib/stores/cart'; 
  import Toast from '$lib/components/Toast.svelte';

  let { isOpen, onClose } = $props<{
    isOpen: boolean;
    onClose: () => void;
  }>();

  let drawerRef: HTMLDivElement;
  let overlayRef: HTMLDivElement;

  // Estado para el botón de Checkout y el Toast
  let isCheckingOut = $state(false);
  let isToastOpen = $state(false);
  let toastMessage = $state('');

  // Calculamos el subtotal directamente desde el frontend
  let subtotal = $derived(
    $cartStore.subtotal || $cartStore.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  );

  $effect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; 
      gsap.to(overlayRef, { opacity: 1, duration: 0.3, ease: 'power2.out', pointerEvents: 'auto' });
      gsap.to(drawerRef, { x: 0, duration: 0.5, ease: 'power3.out' });
      
      cartStore.load();
    } else {
      document.body.style.overflow = '';
      gsap.to(overlayRef, { opacity: 0, duration: 0.3, ease: 'power2.in', pointerEvents: 'none' });
      gsap.to(drawerRef, { x: '100%', duration: 0.4, ease: 'power3.in' });
    }
  });

  // Funciones del carrito
  async function handleUpdateQuantity(itemId: string, currentQty: number, delta: number) {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    await cartStore.updateItem(itemId, { quantity: newQty });
  }

  async function handleRemove(itemId: string) {
    await cartStore.remove(itemId);
  }

  // Checkout con Toast
  async function handleCheckout() {
    if ($cartStore.items.length === 0) return;
    
    isCheckingOut = true;
    try {
      const result = await cartStore.checkout();
      if (result && result.success) {
        toastMessage = "Order Placed Successfully. Finalizing details.";
        isToastOpen = true;
        
        // Cerramos el panel lateral después de 1 segundo para que el usuario vea el toast
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        alert("Failed to process checkout. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      isCheckingOut = false;
    }
  }
</script>

<div 
  bind:this={overlayRef}
  onclick={onClose}
  class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] opacity-0 pointer-events-none cursor-pointer"
  aria-hidden="true"
></div>

<div 
  bind:this={drawerRef}
  class="fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-[#0a0a0a] border-l border-white/10 z-[101] flex flex-col translate-x-full"
>
  <div class="flex items-center justify-between p-6 md:p-8 border-b border-white/10">
    <h2 class="text-2xl font-extralight tracking-tight text-white">Your Cart</h2>
    <button onclick={onClose} class="text-white/50 hover:text-white transition-colors cursor-pointer">✕</button>
  </div>

  <div class="flex-grow overflow-y-auto p-6 md:p-8 space-y-8">
    {#if $cartStore.loading && $cartStore.items.length === 0}
      <div class="h-full flex items-center justify-center">
        <span class="text-xs text-white/50 tracking-widest uppercase animate-pulse">Loading Cart...</span>
      </div>
    {:else if $cartStore.items.length === 0}
      <div class="h-full flex flex-col items-center justify-center text-center space-y-4">
        <span class="text-sm text-white/50 tracking-widest uppercase">Your cart is empty</span>
        <button onclick={onClose} class="text-xs text-white underline underline-offset-4 hover:text-white/70 cursor-pointer">
          Continue Shopping
        </button>
      </div>
    {:else}
      {#each $cartStore.items as item (item._id)}
        <div class="flex gap-6">
          <div class="w-24 h-32 bg-neutral-900 flex-shrink-0">
            <img src={item.image} alt={item.name} class="w-full h-full object-cover" />
          </div>
          <div class="flex flex-col justify-between flex-grow">
            <div>
              <div class="flex justify-between items-start">
                <h3 class="text-sm tracking-wide text-white">{item.name}</h3>
                <button 
                  onclick={() => handleRemove(item._id)} 
                  class="text-xs text-white/30 hover:text-white/80 underline cursor-pointer transition-colors"
                >
                  Remove
                </button>
              </div>
              <p class="text-[10px] tracking-[0.2em] text-white/50 mt-1 uppercase">
                Size: {item.size} | Color: {item.color?.name || 'Standard'}
              </p>
            </div>
            
            <div class="flex justify-between items-end">
              <div class="flex items-center border border-white/20">
                <button 
                  onclick={() => handleUpdateQuantity(item._id, item.quantity, -1)}
                  disabled={item.quantity <= 1}
                  class="w-8 h-8 flex justify-center items-center text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >-</button>
                <span class="w-8 text-center text-xs text-white">{item.quantity}</span>
                <button 
                  onclick={() => handleUpdateQuantity(item._id, item.quantity, 1)}
                  class="w-8 h-8 flex justify-center items-center text-white/50 hover:text-white cursor-pointer transition-colors"
                >+</button>
              </div>
              <p class="text-sm text-white tracking-widest">${(item.price * item.quantity).toLocaleString()}</p>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <div class="p-6 md:p-8 border-t border-white/10 bg-[#0a0a0a]">
    <div class="flex justify-between text-white mb-6">
      <span class="text-sm text-white/50 uppercase tracking-widest">Subtotal</span>
      <span class="text-xl font-light">${subtotal.toLocaleString()}</span>
    </div>
    <p class="text-xs text-white/40 mb-6">Taxes and shipping calculated at checkout.</p>
    
    <button 
      onclick={handleCheckout}
      disabled={$cartStore.items.length === 0 || isCheckingOut}
      class="relative w-full py-4 bg-white text-black text-xs uppercase tracking-[0.3em] hover:bg-neutral-200 disabled:bg-white/10 disabled:text-white/30 transition-colors cursor-pointer disabled:cursor-not-allowed"
    >
      {#if isCheckingOut}
        <span class="animate-pulse">Processing Order...</span>
      {:else}
        Checkout
      {/if}
    </button>
  </div>
</div>

<Toast 
  isOpen={isToastOpen} 
  message={toastMessage} 
  onClose={() => isToastOpen = false} 
/>