<script lang="ts">
  import { getContext, onMount, setContext } from 'svelte';
  import InfiniteScroll from 'svelte-infinite-scroll';
  import { throttle } from 'throttle-debounce';

  import { ObsidianContextKey } from './context';
  import type { ObsidianContext } from './context';
  import type { ObsidianAdapter } from './domain/adapter/ObsidianAdapter.js';
  import type { ICard } from './domain/model.js';
  import type { GetPagesUsecase } from './domain/usecase/GetPagesUsecase';
  import type { GridViewSettings } from './setting';
  import Card from './view/Card.svelte';
  import { openCardMenu, openSortMenu } from './view/ContextMenu.svelte';
  import SearchBar from './view/SearchBar.svelte';
  import SortMenu from './view/SortMenu.svelte';

  export let getPagesUsecase: GetPagesUsecase;
  export let obsidianAdapter: ObsidianAdapter;
  export let settings: GridViewSettings;
  export let saveSettings: () => Promise<void>;

  let cards: ICard[] = [];
  let page = 0;
  let size = 100;
  let hasMore = true;

  let cardRef: HTMLElement[] = [];
  let gridWidth: number;
  let cardWidth: number;
  let searchRef: HTMLElement;
  $: pinStarred = settings.gridView.pinStarred;
  $: sort = settings.gridView.sort;
  let search = '';

  let infiniteScrollTarget: HTMLElement;

  setContext<ObsidianContext>(ObsidianContextKey, {
    obsidian: obsidianAdapter,
  });

  let ctx = getContext<ObsidianContext>(ObsidianContextKey);

  $: {
    // register callback for contextmenu
    cardRef.forEach((t, i) => {
      if (!t || t.oncontextmenu) return;
      t.oncontextmenu = (event) => {
        event.preventDefault();
        openCardMenu({ event, card: cards[i] }, ctx);
      };
    });
  }

  $: {
    // update card width depending on window size
    // >= 200px
    const nCards = Math.trunc(gridWidth / 216);
    const space = Math.trunc(gridWidth % 216);
    const expand = Math.trunc(space / nCards);
    cardWidth = 200 + expand - 1;
  }

  $: (async () => {
    if (!infiniteScrollTarget) return;

    // load more until the page gets scrollable if it has more pages
    const scrollable = infiniteScrollTarget.scrollHeight > window.screen.height;
    if (cards.length > 0 && hasMore && true && !scrollable) {
      await loadMore();
    }
  })();

  onMount(async () => {
    searchRef.focus();
    obsidianAdapter.onFileChange(async () => {
      await loadPages({ reloadAll: true });
    });
    await loadPages();
  });

  function onWindowResize() {
    // control to load more pages when resizeing the window
    // https://github.com/andrelmlins/svelte-infinite-scroll/blob/9e6bcf84c96090629dc6d837fc996814eab944a7/src/lib/InfiniteScroll.svelte#L24
    infiniteScrollTarget.dispatchEvent(new Event('resize'));
  }

  function onSortClick(event: MouseEvent) {
    openSortMenu({
      current: sort,
      event,
      pinStarred,
      onSelect: async (newKind) => {
        settings.gridView.sort = newKind;
        await saveSettings();
        await loadPages({ reset: true });
      },
      onPinStarredChange: async (value) => {
        settings.gridView.pinStarred = value;
        await saveSettings();
        await loadPages({ reloadAll: true });
      },
    });
  }

  async function onSearch() {
    await loadPages({ reset: true });
  }

  interface LoadPagesOption {
    /** reload pages currently loaded. it should be called after several page changes */
    reloadAll?: boolean;
    reset?: boolean;
  }

  const loadPages = throttle(200, async (option: LoadPagesOption | undefined = undefined): Promise<void> => {
    if (option?.reset || option?.reloadAll) {
      page = 0;
    }
    try {
      const { cards: newCards, hasMore: hasMore_ } = await getPagesUsecase.invoke({
        page,
        size: option?.reloadAll ? cards.length : size,
        sort,
        search,
        pinStarred,
      });
      hasMore = hasMore_;
      if (option?.reset || option?.reloadAll) {
        cards = newCards;
      } else {
        cards = [...cards, ...newCards];
      }
    } catch (error) {
      console.error(error);
    }
  });

  async function loadMore() {
    page += 1;
    await loadPages();
  }
</script>

<svelte:window on:resize={onWindowResize} />

<!-- search -->
<div class="flex justify-center">
  <div class="w-96 pb-[20px]">
    <SearchBar bind:ref={searchRef} bind:value={search} on:input={onSearch} on:change={onSearch} />
  </div>
</div>
<!-- infinite scroll grid -->
<div class="max-h-full overflow-x-scroll" bind:this={infiniteScrollTarget}>
  <!-- sort -->
  <SortMenu {sort} {onSortClick} />
  <!-- card grid -->
  <div class="flex justify-center">
    <!-- TODO: svelte inserts <iframe> via bind:clientWidth and it is visible on Windows.  -->
    <div class="flex max-h-full w-[90%] flex-wrap gap-[16px] overflow-x-scroll pl-[16px]" bind:clientWidth={gridWidth}>
      {#each cards as card, i}
        <div bind:this={cardRef[i]}>
          <Card {...card} width={cardWidth} />
        </div>
      {/each}
    </div>
  </div>
  <InfiniteScroll threshold={100} {hasMore} on:loadMore={() => loadMore()} />
</div>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
