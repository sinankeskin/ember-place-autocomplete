/* globals google */
import Component from '@glimmer/component';
import EmberError from '@ember/error';
import { action } from '@ember/object';
import { cached } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { guidFor } from '@ember/object/internals';
import { later } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

export default class PlaceAutocompleteComponent extends Component {
  elementId = guidFor(this);

  @tracked
  intervalCount;

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

  constructor() {
    super(...arguments);

    this.intervalCount = 0;
  }

  @action
  _initialize(element) {
    this.element = element;
    this._render();
  }

  @action
  _update() {
    if (this.autocomplete) {
      this.autocomplete.setOptions(this._options);
    }
  }

  @action
  _destroy() {
    if (this.autocomplete) {
      google.maps.event.clearInstanceListeners(this.autocomplete);
    }
  }

  _render() {
    if (google && google.maps && google.maps.places) {
      this.autocomplete = new google.maps.places.Autocomplete(
        this.element,
        this._options
      );

      this.autocomplete.addListener('place_changed', () => {
        this.placeChanged();
      });

      this.onRenderCallback();
    } else {
      if (this.intervalCount < 1000) {
        this.intervalCount++;

        later(this, '_render', 100);
      } else {
        throw new EmberError(
          "We tried 1000 times but no luck. We couldn't load the google.maps.places api."
        );
      }
    }
  }

  placeChanged() {
    if (this.autocomplete) {
      const place = this.autocomplete.getPlace();

      if (this.args.onSelect && typeof this.args.onSelect === 'function') {
        this.args.onSelect(place);
      }
    }

    document.querySelectorAll('.pac-container').forEach((el) => el.remove());
  }

  onRenderCallback() {
    this.element.disabled = false;

    if (this.args.onRender && typeof this.args.onRender === 'function') {
      this.args.onRender(this);
    }
  }
}
