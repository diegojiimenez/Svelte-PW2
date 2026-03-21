<script lang="ts">
  import gsap from 'gsap';

  // Usamos $props para controlar abrir/cerrar desde App.svelte
  let { isOpen, onClose } = $props<{
    isOpen: boolean;
    onClose: () => void;
  }>();

  let drawerRef: HTMLDivElement;
  let overlayRef: HTMLDivElement;

  // Animación del Drawer
  $effect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Bloquear scroll de fondo
      gsap.to(overlayRef, { opacity: 1, duration: 0.3, ease: 'power2.out', pointerEvents: 'auto' });
      gsap.to(drawerRef, { x: 0, duration: 0.5, ease: 'power3.out' });
    } else {
      document.body.style.overflow = '';
      gsap.to(overlayRef, { opacity: 0, duration: 0.3, ease: 'power2.in', pointerEvents: 'none' });
      gsap.to(drawerRef, { x: '100%', duration: 0.4, ease: 'power3.in' });
    }
  });

  // Datos mockeados del carrito para el diseño
  const cartItems = [
    { id: 1, name: 'OBSIDIAN COAT', price: 890, size: 'M', quantity: 1, image: 'https://images.unsplash.com/photo-1550614000-4b95d415d18a?w=400&q=80' },
    { id: 2, name: 'VOID TROUSERS', price: 450, size: '32', quantity: 2, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80' }
  ];
  
  // Runa derivada para calcular el total
  let subtotal = $derived(cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0));
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
    {#each cartItems as item}
      <div class="flex gap-6">
        <div class="w-24 h-32 bg-neutral-900 flex-shrink-0">
          <img src={item.image} alt={item.name} class="w-full h-full object-cover" />
        </div>
        <div class="flex flex-col justify-between flex-grow">
          <div>
            <div class="flex justify-between items-start">
              <h3 class="text-sm tracking-wide text-white">{item.name}</h3>
              <button class="text-xs text-white/30 hover:text-white/80 underline cursor-pointer">Remove</button>
            </div>
            <p class="text-[10px] tracking-[0.2em] text-white/50 mt-1 uppercase">Size: {item.size}</p>
          </div>
          
          <div class="flex justify-between items-end">
            <div class="flex items-center border border-white/20">
              <button class="w-8 h-8 flex justify-center items-center text-white/50 hover:text-white cursor-pointer">-</button>
              <span class="w-8 text-center text-xs text-white">{item.quantity}</span>
              <button class="w-8 h-8 flex justify-center items-center text-white/50 hover:text-white cursor-pointer">+</button>
            </div>
            <p class="text-sm text-white tracking-widest">${item.price}</p>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="p-6 md:p-8 border-t border-white/10 bg-[#0a0a0a]">
    <div class="flex justify-between text-white mb-6">
      <span class="text-sm text-white/50 uppercase tracking-widest">Subtotal</span>
      <span class="text-xl font-light">${subtotal.toLocaleString()}</span>
    </div>
    <p class="text-xs text-white/40 mb-6">Taxes and shipping calculated at checkout.</p>
    
    <button class="w-full py-4 bg-white text-black text-xs uppercase tracking-[0.3em] hover:bg-neutral-200 transition-colors cursor-pointer">
      Checkout
    </button>
  </div>
</div>