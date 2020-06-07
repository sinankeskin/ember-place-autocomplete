import { tracked } from '@glimmer/tracking';
import Service from '@ember/service';

export default class PlacesService extends Service {
  @tracked
  renders;

  constructor() {
    super(...arguments);

    this.renders = {};

    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        this.renderAll();
      }
    };
  }

  addRender(elementId, fn) {
    if (!this.renders[elementId]) {
      this.renders[elementId] = fn;

      this.renderAll();
    }
  }

  removeRender(elementId) {
    if (this.renders[elementId]) {
      delete this.renders[elementId];

      this.renderAll();
    }
  }

  renderAll() {
    if (Object.keys(this.renders).length > 0) {
      Object.keys(this.renders).forEach((elementId) => {
        this.renders[elementId]();
      });
    }
  }
}
