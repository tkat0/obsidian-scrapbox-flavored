<script lang="ts" context="module">
  import { Menu } from 'obsidian';
  import { getSortTitle } from 'src/domain/usecase/GetPagesUsecase';
  import type { SortKind } from 'src/domain/usecase/GetPagesUsecase';

  import type { ObsidianContext } from '../context';
  import type { ICard } from '../domain/model';

  export interface OpenCardMenuInput {
    event: MouseEvent;
    card: ICard;
  }

  export function openCardMenu(input: OpenCardMenuInput, ctx: ObsidianContext) {
    const { event, card } = input;

    const menu = new Menu();

    if (ctx.obsidian.pluginEnabled('starred')) {
      if (card.star) {
        menu.addItem((item) => {
          item
            .setTitle('UnStar')
            .setSection('action')
            .setIcon('crossed-star')
            .onClick(() => {
              card.toggleStar();
            });
        });
      } else {
        menu.addItem((item) => {
          item
            .setTitle('Star')
            .setSection('action')
            .setIcon('star')
            .onClick(() => {
              card.toggleStar();
            });
        });
      }
    }

    menu.addItem((item) => {
      item
        .setTitle('Delete item')
        .setIcon('trash')
        .setSection('danger')
        .onClick(() => {
          card.trash();
        });
      (item as any).dom.addClass('is-warning');
    });

    menu.showAtMouseEvent(event);
  }

  export interface OpenSortMenuInput {
    current: SortKind;
    pinStarred: boolean;
    event: MouseEvent;
    onSelect: (kind: SortKind) => void;
    onPinStarredChange: (value: boolean) => void;
  }

  export function openSortMenu(input: OpenSortMenuInput) {
    const { event, onSelect, current, onPinStarredChange, pinStarred } = input;

    const menu = new Menu();

    const addItem = (newKind: SortKind) => {
      menu.addItem((item) => {
        item.setTitle(getSortTitle(newKind)).onClick(() => {
          onSelect(newKind);
        });
        if (newKind == current) item.setIcon('checkmark');
      });
    };

    addItem('file-name-a-to-z');
    addItem('file-name-z-to-a');
    menu.addSeparator();
    addItem('modified-new-to-old');
    addItem('modified-old-to-new');
    menu.addSeparator();
    addItem('created-new-to-old');
    addItem('created-old-to-new');
    menu.addSeparator();
    addItem('most-linked');
    addItem('least-linked');
    menu.addSeparator();
    menu.addItem((item) => {
      item.setTitle('Pin starred').onClick(() => {
        onPinStarredChange(!pinStarred);
      });
      if (pinStarred) item.setIcon('checkmark');
    });

    menu.showAtMouseEvent(event);
  }
</script>
