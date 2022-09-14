<script lang="ts">
  import { getContext, onMount } from 'svelte';

  import { ObsidianContextKey } from '../context';
  import type { ObsidianContext } from '../context';

  export let iconId: string;
  export let size: number | undefined = undefined;

  const ctx = getContext<ObsidianContext>(ObsidianContextKey);

  let ref: HTMLElement;

  onMount(() => {
    ctx.obsidian.setIcon(ref, iconId, size);
  });
</script>

<span bind:this={ref} class="first:inline-block" />
