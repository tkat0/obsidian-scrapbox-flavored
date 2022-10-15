<script lang="ts">
  import type { App, EventRef } from 'obsidian';
  import { onDestroy, onMount, setContext } from 'svelte';

  import { type ObsidianContext, ObsidianContextKey } from './context';
  import type { ObsidianAdapter } from './domain/adapter/ObsidianAdapter';
  import type { ICard } from './domain/model';
  import type { GetRelatedPagesUsecase } from './domain/usecase/GetRelatedPagesUsecase';
  import type { GridViewSettings } from './setting';
  import { openSortMenu } from './view/ContextMenu.svelte';
  import RelatedPagesSection from './view/RelatedPagesSection.svelte';
  import SortMenu from './view/SortMenu.svelte';

  export let getRelatedPagesUsecase: GetRelatedPagesUsecase;
  export let obsidianAdapter: ObsidianAdapter;
  export let app: App;
  export let settings: GridViewSettings;
  export let saveSettings: () => Promise<void>;

  let resolvedLinkCards: ICard[] = [];
  let unresolvedLinkCards: ICard[] = [];
  let tagCards: Record<string, ICard[]> = {};
  let eventRefs: EventRef[] = [];

  $: hasCard = resolvedLinkCards.length > 0 || unresolvedLinkCards.length > 0 || Object.keys(tagCards).length > 0;

  setContext<ObsidianContext>(ObsidianContextKey, {
    obsidian: obsidianAdapter,
  });

  onMount(async () => {
    const onChange = async () => {
      await load();
    };
    eventRefs.push(app.vault.on('create', onChange));
    eventRefs.push(app.vault.on('delete', onChange));
    eventRefs.push(app.vault.on('rename', onChange));
    // TODO: check only when tag is updated for performance reason
    // eventRefs.push(app.vault.on('modify', onChange));

    await load();
  });

  onDestroy(() => {
    eventRefs.forEach((ref) => {
      app.vault.offref(ref);
    });
  });

  async function load() {
    const ret = await getRelatedPagesUsecase.invoke({
      pinStarred: settings.relatedPages.pinStarred,
      sort: settings.relatedPages.sort,
    });
    resolvedLinkCards = ret.resolvedLinkCards;
    unresolvedLinkCards = ret.unresolvedLinkCards;
    tagCards = ret.tagCards;
  }

  function onSortClick(event: MouseEvent) {
    openSortMenu({
      current: settings.relatedPages.sort,
      event,
      pinStarred: true,
      onSelect: async (newKind) => {
        settings.relatedPages.sort = newKind;
        await saveSettings();
        await load();
      },
      onPinStarredChange: async (value) => {
        settings.relatedPages.pinStarred = value;
        await saveSettings();
        await load();
      },
    });
  }
</script>

<div class="w-full py-8">
  {#if hasCard}
    <SortMenu sort={settings.relatedPages.sort} {onSortClick} />
  {/if}

  <RelatedPagesSection title="Links" cards={resolvedLinkCards} />
  {#each Object.entries(tagCards) as [tag, cards]}
    <RelatedPagesSection title={tag} {cards} />
  {/each}
  <RelatedPagesSection title="New Links" cards={unresolvedLinkCards} />
</div>
