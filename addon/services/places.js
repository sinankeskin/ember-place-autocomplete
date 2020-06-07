import { tracked } from '@glimmer/tracking';
import Service from '@ember/service';

export default class PlacesService extends Service {
  @tracked
  isLoaded;

  @tracked
  renderFns;

  constructor() {
    super(...arguments);

    this.isLoaded = false;
    this.renderFns = {};

    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        this.isLoaded = true;

        this.renderAll();
      }
    };
  }

  addRender(elementId, fn) {
    if (!this.renderFns[elementId]) {
      this.renderFns[elementId] = fn;

      this.renderAll();
    }
  }

  removeRender(elementId) {
    if (this.renderFns[elementId]) {
      delete this.renderFns[elementId];

      this.renderAll();
    }
  }

  renderAll() {
    if (this.isLoaded) {
      if (Object.keys(this.renderFns).length > 0) {
        Object.keys(this.renderFns).forEach((elementId) => {
          this.renderFns[elementId]();
        });
      }
    }
  }
}
