import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the sideexplore extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'sideexplore:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension sideexplore is activated!');
  }
};

export default plugin;
