import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';

interface APODResponse {
  copyright: string,
  date: string,
  explanation: string,
  media_type: 'video' | 'image',
  title: string,
  url: string
};

/**
 * Initialization data for the sideexplore extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'sideexplore:plugin',
  autoStart: true,
  activate: async (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('JupyterLab extension sideexplore is activated!');

    // Create blank content widget inside of MainAreaWidget
    const content = new Widget();
    const widget = new MainAreaWidget({ content });
    widget.id = 'sideexplore-jupyterlab';
    widget.title.label = 'Astronomy Picture';
    widget.title.closable = true;

    let img = document.createElement('img');
    content.node.appendChild(img);

    // Get a random date string in YYYY-MM-DD format
    function randomDate() {
      const start = new Date(2010, 1, 1);
      const end = new Date(); // today date
      const randomDate = new Date(start.getTime() + Math.random()*(end.getTime() - start.getTime()));
      return randomDate.toISOString().slice(0, 10);
    }

    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${randomDate()}`, { headers: [['Upgrade-Insecure-Requests', '1']]});
    const data = await response.json() as APODResponse;

    if (data.media_type === 'image') {
      // Populate the image
      img.src = data.url;
      img.title = data.title;
    } else {
      console.log('Random APOD was not a picture :(');
    }

    // Add an application command
    const command: string = 'sideexplore:open';
    app.commands.addCommand(command, {
      label: 'Random Astronomy Picture',
      execute: () => {
        if (!widget.isAttached) {
          // Attach the widget to the main work area if it's not there
          app.shell.add(widget, 'main');
        }
        // Activate the widget
        app.shell.activateById(widget.id);
      }
    })

    palette.addItem({ command, category: 'Tutorial' });
  },
  requires: [ICommandPalette]
};

export default plugin;
