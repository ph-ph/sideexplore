import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';
import { Cell } from '@jupyterlab/cells';
import { INotebookTracker, Notebook, NotebookActions } from '@jupyterlab/notebook';
import { findIndex } from '@lumino/algorithm';

/**
 * Initialization data for the sideexplore extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'sideexplore:plugin',
  autoStart: true,
  activate: activate,
  requires: [ICommandPalette, INotebookTracker]
};

/**
* Activate the Side Explore extension.
*/
function activate(app: JupyterFrontEnd, palette: ICommandPalette, notebookTracker: INotebookTracker) {
  console.log('JupyterLab extension sideexplore is activated!');

  // Add an application command
  const command: string = 'apod:open';
  app.commands.addCommand(command, {
    label: 'Create new side exploration section',
    execute: () => {
      console.log('Create new side exploration section command triggered');

      if (!notebookTracker.currentWidget) {
        console.log('Current widget is null');
        return;
      }

      SideExplorePlugin.createSideExplorationCells(notebookTracker.currentWidget.content);
    }
  });

  // Add the command to the palette.
  palette.addItem({ command, category: 'Tutorial' }); // FIXME: update the category
}

namespace SideExplorePlugin {
  export function createSideExplorationCells(notebook: Notebook): void {
      if (!notebook.model) {
        console.log('Notebook model is null');
        return;
      }

      const activeCell = notebook.activeCell;
      if (!activeCell) {
        console.log('There is no active cell');
        return;
      }

      if (activeCell.model.type != 'code') {
        console.log('Can only run when code cell is active');
        return;
      }

      // Copy contents of the current cell
      NotebookActions.copy(notebook);
      // Insert markdown cell
      NotebookActions.insertBelow(notebook);
      NotebookActions.setMarkdownHeader(notebook, getCurrentHeadingLevel(notebook.activeCell!, notebook) + 1);
      // Paste the code cell below the markdown cell
      NotebookActions.paste(notebook, 'below');
      // Go back to the header cell and go into the edit mode
      NotebookActions.selectAbove(notebook);
      notebook.activeCell!.editorWidget.activate();
  }

  /**
   * Get the heading level for the given cell.
   *
   * If the given cell is header, returns its level. Otherwise finds the first heading cell above it and returns its level.
   * If there are no headings above, returns 0.
   *
   * @param cell - notebook cell
   * @param notebook - notebook that the cell belongs to
   * @returns A number between 0 and 6, representing the heading level for the given cell.
   */
  function getCurrentHeadingLevel(cell: Cell, notebook: Notebook): number {
    // find the index of the current cell
    let index = findIndex(
      notebook.widgets,
      (possibleCell: Cell, index: number) => {
        return cell.model.id === possibleCell.model.id;
      }
    );
    // look back to find the first heading cell
    for (; index >= 0; index--) {
      let hInfo = NotebookActions.getHeadingInfo(notebook.widgets[index]);
      if (hInfo.isHeading) {
        return hInfo.headingLevel;
      }
    }
    // We didn't find any heading cells, so the heading level is 0
    return 0;
  }
}

export default plugin;
