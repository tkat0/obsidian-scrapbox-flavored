<script lang="ts">
  import type { ICard } from 'src/domain/model';

  import Card from './Card.svelte';
  import LinkCard from './LinkCard.svelte';

  export let title: string;
  export let cards: ICard[];

  let gridWidth: number;
  let width: number;

  // TODO: Adjust for default theme since the page width is narrow
  $: {
    // update card width depending on window size
    // >= 200px
    const nCards = Math.trunc(gridWidth / 216);
    const space = Math.trunc(gridWidth % 216);
    const expand = Math.trunc(space / nCards);
    width = 200 + expand - 1;
  }
</script>

{#if cards.length > 0}
  <div class="flex justify-center p-2">
    <div class="flex max-h-full w-[90%] flex-wrap gap-[16px] overflow-x-scroll pl-[16px]" bind:clientWidth={gridWidth}>
      <LinkCard {title} {width} />
      {#each cards as card}
        <Card {...card} {width} />
      {/each}
    </div>
  </div>
{/if}
