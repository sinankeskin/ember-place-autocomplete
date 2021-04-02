import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ApplicationController extends Controller {
  @tracked show = false;

  @action
  onSelect(place) {
    console.log('place', place);
  }

  @action
  onClick() {
    this.show = !this.show;
  }
}
