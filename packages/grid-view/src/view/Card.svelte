<script lang="ts">
  import type { Description } from '../domain/model';

  export let title: string;
  export let description: Description[][];
  export let icon: string | undefined = undefined;
  export let star = false;
  export let width: number;
  export let onClick: (() => void) | undefined = undefined;
</script>

<div
  class="bg-background-secondary hover:bg-background-secondary-alt relative aspect-square overflow-hidden"
  style="width: {width}px;"
  on:click={onClick}
>
  {#if star}
    <div
      class="border-r-background-primary border-b-text-accent absolute top-0 right-0 h-0 w-0 border-b-[30px] border-r-[30px] border-solid shadow-xl"
    />
  {/if}
  <div
    class="border-t-background-modifier-border h-[calc(100%-5px)] overflow-hidden border-t-[15px] border-solid py-2 px-3"
  >
    <div class="text-text-accent max-h-5 overflow-hidden text-ellipsis whitespace-nowrap font-medium">
      {title}
    </div>
    <div class="mx-2 my-2">
      {#if icon}
        <img class="m-auto block h-full overflow-hidden px-1 py-0" loading="lazy" src={icon} alt={title} />
      {:else}
        <div class="h-full overflow-hidden text-xs leading-5">
          {#each description as line}
            <div class="line">
              {#each line as node}
                <span class={node.kind}>{node.value}</span>
              {/each}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .code {
    background-color: var(--background-primary-alt);
    color: var(--text-accent);
  }

  .link {
    color: var(--text-accent);
  }

  .emphasis {
    font-weight: var(--bold-weight);
  }
</style>
