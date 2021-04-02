/* globals google */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { cached } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { guidFor } from '@ember/object/internals';
import { isPresent } from '@ember/utils';
import EmberError from '@ember/error';

export default class PlaceAutocompleteComponent extends Component {
  elementId = guidFor(this);

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
    let intervalTime = 0;

    const interval = setInterval(() => {
      for (let index = 0; index < 1000; index++) {
        if (google && google.maps && google.maps.places) {
          this.autocomplete = new google.maps.places.Autocomplete(
            this.element,
            this._options
          );

          this.autocomplete.addListener('place_changed', () => {
            this.placeChanged();
          });

          this.onRenderCallback();
          this.element.disabled = false;

          break;
        }

        if (index > 0) {
          intervalTime = 100;
        }
      }

      if (this.element.disabled) {
        throw new EmberError(
          "We tried 100 times but no luck. We couldn't load the google.maps.places api."
        );
      }

      clearInterval(interval);
    }, intervalTime);
  }

  placeChanged() {
    if (this.autocomplete) {
      const place = this.autocomplete.getPlace();

      if (this.args.onSelect && typeof this.args.onSelect === 'function') {
        this.args.onSelect(place);
      }
    }
  }

  onRenderCallback() {
    const action = this.args.onRender;

    if (isPresent(action) && typeof action === 'function') {
      action(this);
    }
  }
}
