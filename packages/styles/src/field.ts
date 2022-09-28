import { syntaxTree } from '@codemirror/language';
import { Extension, RangeSetBuilder, StateField, Transaction } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';

/**
 * matches line as follows.
 *  " - ", " * ", " 1. "
 */
export const REGEX_MARKDOWN_LIST = /(?<indent>[\s]*)([-*]|\d+\.)\s/;

export const QuoteInListField = StateField.define<DecorationSet>({
  create(state): DecorationSet {
    return Decoration.none;
  },
  update(oldState: DecorationSet, transaction: Transaction): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();

    // apply quote style to <div> block for a list item
    // e.g. "- >abc"
    syntaxTree(transaction.state).iterate({
      enter(node) {
        if (!node.type.name.startsWith('HyperMD-list-line')) {
          return;
        }

        const endOfLine = transaction.state.doc.lineAt(node.from).to;
        const line = transaction.state.doc.sliceString(node.from, endOfLine);
        const text = line.replace(REGEX_MARKDOWN_LIST, '');
        if (text.startsWith('>')) {
          // "    - > abc `abc`"
          //        ^ add "sbf-quote-head cm-transparent"
          //
          // "    - > abc `abc`"
          //         ^^^^^^^^^^ add "sbf-quote-tail cm-quote"
          const offset = line.length - text.length;
          builder.add(
            node.from + offset,
            node.from + offset + 1,
            Decoration.mark({ class: 'sbf-quote-head cm-transparent' }),
          );
          builder.add(node.from + offset + 1, node.to, Decoration.mark({ class: 'sbf-quote-tail' }));
          // NOTE: Decoration.line highlights all of the line.
          // builder.add(node.from, node.from, Decoration.line({ class: 'HyperMD-quote' }));
          return;
        }
      },
    });

    return builder.finish();
  },
  provide(field: StateField<DecorationSet>): Extension {
    return EditorView.decorations.from(field);
  },
});

export const HelpfeelField = StateField.define<DecorationSet>({
  create(state): DecorationSet {
    return Decoration.none;
  },
  update(oldState: DecorationSet, transaction: Transaction): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();

    // apply helpfeel style to each line that starts with `?`
    // e.g. "- ? abc"
    syntaxTree(transaction.state).iterate({
      // TODO: doesn't support non-list like "? abc" yet
      enter(node) {
        if (node.type.name.startsWith('HyperMD-list-line')) {
          const endOfLine = transaction.state.doc.lineAt(node.from).to;
          const line = transaction.state.doc.sliceString(node.from, endOfLine);
          const text = line.replace(REGEX_MARKDOWN_LIST, '');
          if (text.startsWith('? ')) {
            const offset = line.length - text.length;
            builder.add(node.from + offset, node.from + offset + 1, Decoration.mark({ class: 'sbf-helpfeel-head' }));
            builder.add(node.from + offset, node.to, Decoration.mark({ class: 'sbf-helpfeel-tail' }));
            return;
          }
        }
      },
    });

    return builder.finish();
  },
  provide(field: StateField<DecorationSet>): Extension {
    return EditorView.decorations.from(field);
  },
});
