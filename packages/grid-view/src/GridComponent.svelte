<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import InfiniteScroll from 'svelte-infinite-scroll';
    import { throttle } from 'throttle-debounce';

    import type { ICard } from './model';
    import type { GridViewSettings } from './setting';
    import type { ContextMenuUsecase } from './usecase/ContextMenuUsecase';
    import { getSortTitle } from './usecase/GetPagesUsecase';
    import type { GetPagesUsecase } from './usecase/GetPagesUsecase';
    import type { PageObserveUsecase } from './usecase/PageObserveUsecase';
    import Card from './view/Card.svelte';
    import Icon from './view/Icon.svelte';
    import SearchBar from './view/SearchBar.svelte';

    export let getPagesUsecase: GetPagesUsecase;
    export let contextMenuUsecase: ContextMenuUsecase;
    export let pageObserveUsecase: PageObserveUsecase;
    export let settings: GridViewSettings;
    export let saveSettings: () => Promise<void>;

    let cards: ICard[] = [];
    let page = 0;
    let size = 100;

    let cardRef: HTMLElement[] = [];
    let gridWidth: number;
    let cardWidth: number;
    let searchRef: HTMLElement;
    $: pinStarred = settings.pinStarred;
    $: sort = settings.sort;
    let search: string = '';

    let infiniteScrollTarget: HTMLElement;

    $: {
        // register callback for contextmenu
        cardRef.forEach((t, i) => {
            if (!t || t.oncontextmenu) return;
            t.oncontextmenu = (event) => {
                event.preventDefault();
                contextMenuUsecase.openCardMenu({ event, card: cards[i] });
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

    onMount(async () => {
        console.debug('onMount');
        searchRef.focus();
        pageObserveUsecase.invoke({
            onChange: async () => {
                console.log('reload');
                await loadPages({ reloadAll: true });
            },
        });
        await loadPages();
    });

    onDestroy(() => {
        console.debug('onDestroy');
    });

    function onWindowResize() {
        // control to load more pages when resizeing the window
        // https://github.com/andrelmlins/svelte-infinite-scroll/blob/9e6bcf84c96090629dc6d837fc996814eab944a7/src/lib/InfiniteScroll.svelte#L24
        infiniteScrollTarget.dispatchEvent(new Event('resize'));
    }

    function onSortClick(event: MouseEvent) {
        contextMenuUsecase.openSortMenu({
            current: sort,
            event,
            pinStarred,
            onSelect: async (newKind) => {
                settings.sort = newKind;
                await saveSettings();
                await loadPages({ reset: true });
            },
            onPinStarredChange: async (value) => {
                settings.pinStarred = value;
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
            const newCards = await getPagesUsecase.invoke({
                page,
                size: option?.reloadAll ? cards.length : size,
                sort,
                search,
                pinStarred,
            });
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
    <div class="flex justify-center">
        <div class="flex w-[90%] pb-2">
            <div class="grow" />
            <button class="flex-none rounded p-2" on:click={onSortClick}
                >{getSortTitle(sort)}
                <Icon iconId="down-chevron-glyph" />
            </button>
        </div>
    </div>
    <!-- card grid -->
    <div class="flex justify-center">
        <div
            class="flex max-h-full w-[90%] flex-wrap gap-[16px] overflow-x-scroll pl-[16px]"
            bind:clientWidth={gridWidth}
        >
            {#each cards as card, i}
                <div bind:this={cardRef[i]}>
                    <Card {...card} width={cardWidth} />
                </div>
            {/each}
        </div>
    </div>
    <InfiniteScroll threshold={100} hasMore={true} on:loadMore={() => loadMore()} />
</div>

<style global lang="postcss">
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
</style>