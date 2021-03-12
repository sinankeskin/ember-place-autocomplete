/* globals google */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { cached } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { guidFor } from '@ember/object/internals';
import { isPresent } from '@ember/utils';
import { inject as service } from '@ember/service';

export default class PlaceAutocompleteComponent extends Component {
  elementId = guidFor(this);

  element;

  @service
  places;

  @cached
  get config() {
    const _config =
      getOwner(this).resolveRegistration('config:environment') || {};

    return _config['ember-place-autocomplete'] || {};
  }

  @cached
  get _options() {
    const options = {};

    Object.keys(this.args).forEach((option) => {
      const _option = this.args[option];

      if (typeof _option === 'object') {
        options[option] = Object.assign({}, _option);
      } else {
        options[option] = _option;
      }
    });

    if (this.args.placeIdOnly) {
      delete options.placeIdOnly;

      options.fields = ['name', 'place_id'];
    }

    return options;
  }

  @action
  _initialize(element) {
    this.element = element;
    this.places.addRender(this.elementId, this._render.bind(this));
  }

  @action
  _update() {
    if (this.autocomplete) {
      this.autocomplete.setOptions(this._options);
    }
  }

  @action
  _destroy() {
    google.maps.event.clearInstanceListeners(this.autocomplete);
    this.places.removeRender(this.elementId);
  }

  _render() {
    this.autocomplete = new google.maps.places.Autocomplete(
      this.element,
      this._options
    );

    this.autocomplete.addListener('place_changed', () => {
      this.placeChanged();
    });

    this.onRenderCallback();
  }

  placeChanged() {
    const place = this.autocomplete.getPlace();

    if (this.args.onSelect && typeof this.args.onSelect === 'function') {
      this.args.onSelect(place);
    }
  }

  onRenderCallback() {
    const action = this.args.onRender;

    if (isPresent(action) && typeof action === 'function') {
      action(this);
    }
  }
}
