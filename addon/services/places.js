import Service from '@ember/service';

export default class PlacesService extends Service {
  constructor() {
    super(...arguments);

    this.renders = [];

    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        this.renderAll();
      }
    };
  }

  addRender(fn) {
    this.renders.push(fn);
  }

  renderAll() {
    this.renders.forEach((fn) => {
      fn();
    });
  }
}
