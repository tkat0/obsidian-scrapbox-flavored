<script lang="ts">
  import { type SortKind, getSortTitle } from 'src/domain/model';

  import Icon from './Icon.svelte';

  export let sort: SortKind;
  export let onSortClick: (event: MouseEvent) => void;
</script>

<!-- sort -->
<div class="flex justify-center">
  <div class="flex w-[90%] pb-2">
    <div class="grow" />
    <button class="flex-none rounded p-2" on:click={onSortClick}
      >{getSortTitle(sort)}
      <Icon iconId="down-chevron-glyph" />
    </button>
  </div>
</div>
