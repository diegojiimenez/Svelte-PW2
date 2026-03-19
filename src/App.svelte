<script lang="ts">
  import Navigation from '$lib/components/Navigation.svelte';
  import HeroSection from '$lib/components/HeroSection.svelte';
  import ScrollRevealSection from '$lib/components/ScrollRevealSection.svelte';
  import FeaturedSection from '$lib/components/FeaturedSection.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<main class="min-h-screen bg-background">
  <Navigation />
  <HeroSection />
  <ScrollRevealSection />
  <FeaturedSection />
  <Footer />
</main>