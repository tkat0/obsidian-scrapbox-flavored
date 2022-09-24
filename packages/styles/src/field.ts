import { syntaxTree } from '@codemirror/language';
import { Extension, RangeSetBuilder, StateField, Transaction } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, WidgetType } from '@codemirror/view';

export class QuateWidget extends WidgetType {
  constructor(private text: string) {
    super();
  }

  toDOM(view: EditorView): HTMLElement {
    const el = document.createElement('span');

    el.addClass('HyperMD-quote');
    el.innerText = this.text;

    return el;
  }
}

export const scrapboxStyleField = StateField.define<DecorationSet>({
  create(state): DecorationSet {
    return Decoration.none;
  },
  update(oldState: DecorationSet, transaction: Transaction): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();

    syntaxTree(transaction.state);

    syntaxTree(transaction.state).iterate({
      enter(node) {
        if (!node.type.name.startsWith('list')) {
          return;
        }

        // apply style to quate in list (e.g. "- >abc")
        // TODO: apply syntax of `code`, **emphasis**, etc in list
        const endOfLine = transaction.state.doc.lineAt(node.from).to;
        const text = transaction.state.doc.sliceString(node.from, endOfLine);
        if (!text.startsWith('>')) {
          return;
        }

        builder.add(
          node.from,
          node.to + 5,
          Decoration.replace({
            widget: new QuateWidget(text),
          }),
        );
      },
    });

    return builder.finish();
  },
  provide(field: StateField<DecorationSet>): Extension {
    return EditorView.decorations.from(field);
  },
});
