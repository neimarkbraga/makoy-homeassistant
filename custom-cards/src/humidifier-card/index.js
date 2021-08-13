import { LitElement, html, css } from 'lit-element';
import { hasConfigOrEntityChanged, fireEvent } from 'custom-card-helpers';
import style from './style.scss';

class HumidifierCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
      requestInProgress: Boolean,
    };
  }

  static get styles() {
    return style({ css });
  }

  // static async getConfigElement() {
  //   return document.createElement('purifier-card-editor');
  // }

  // static getStubConfig(hass, entities) {
  //   const [purifierEntity] = entities.filter(
  //     (eid) => eid.substr(0, eid.indexOf('.')) === 'fan'
  //   );
  //
  //   return {
  //     entity: purifierEntity || '',
  //   };
  // }

  get entity() {
    return this.hass.states[this.config.entity];
  }

  get name() {
    const { name } = this.config;
    const { friendly_name } = this.entity.attributes;
    return name || friendly_name || 'Humidifier';
  }

  get modes() {
    const { available_modes } = this.entity.attributes;
    if (Array.isArray(available_modes)) {
      return available_modes.filter(a => !/off/i.test(a)).reverse();
    }
    return [];
  }

  get mode() {
    return this.entity.attributes['mode'];
  }

  get humidity() {
    return Number(this.entity.attributes['humidity']);
  }

  get targetHumidity() {
    return Number(this.entity.attributes['humidifier.target_humidity']);
  }


  // The user supplied configuration. Throw an exception and Lovelace will
  // render an error card.
  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return 2;
  }

  shouldUpdate(changedProps) {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  updated(changedProps) {
    if (
      changedProps.get('hass') &&
      changedProps.get('hass').states[this.config.entity] !==
      this.hass.states[this.config.entity]
    ) {
      this.requestInProgress = false;
    }
  }

  handleMore() {
    fireEvent(
      this,
      'hass-more-info',
      {
        entityId: this.entity.entity_id,
      },
      {
        bubbles: true,
        composed: true,
      }
    );
  }

  callService(service, options = {}, isRequest = true) {
    const [domain, name] = service.split('.');
    this.hass.callService(domain, name, {
      entity_id: this.config.entity,
      ...options,
    });

    if (isRequest) {
      this.requestInProgress = true;
      this.requestUpdate();
    }
  }

  getModeLevel(mode = this.mode) {
    if (!/off/i.test(mode)) {
      if (/level(\d)/i.test(mode)) {
        return Number(/level(\d)/i.exec(mode)[1]);
      }
      return 'auto';
    }
    return '';
  }

  renderModes() {
    if (this.modes.length) {

      const modes = this.modes.map(mode => {
        const icon = (() => {
          const level = this.getModeLevel(mode);
          if (typeof level === 'number') {
            return `mdi:circle-slice-${level * 2}`;
          }
          return 'mdi:water-percent';
        })();

        return html`
          <ha-icon-button
            icon="${icon}"
            title="${mode}"
            class="${this.mode === mode ? 'active' : ''}"
            @click="${() => this.callService('humidifier.set_mode', { mode })}">    
          </ha-icon-button>
        `;
      });

      return html`
        <div class="toolbar-buttons-container">
          ${modes}
          
          <ha-icon-button
            icon="hass:power"
            title="Power on/off"
            @click="${() => this.callService('humidifier.toggle')}">    
          </ha-icon-button>
        </div>
      `;
    }

    return html``;
  }

  render() {
    if (!this.entity) {
      return html`
         <ha-card header="Humidifier">
          <div class="card-content"></div>
        </ha-card>
      `;
    }

    if (this.entity.state === 'unavailable') {
      return html`
         <ha-card header="Humidifier">
          <div class="card-content">Disconnected</div>
        </ha-card>
      `;
    }

    const indicatorClassName = (() => {
      const level = this.getModeLevel();
      return level ? `level-${level}` : '';
    })();

    return html`
      <ha-card>
        <div class="preview"
          @click="${() => this.handleMore()}">
          <div class="display-box">
            <div class="light-indicator ${indicatorClassName}"></div>
            <div class="content-wrapper">
              <div class="content">
                <h1 class="humidity-label">${this.humidity}%</h1>
                <p class="target-humidity-label">${this.targetHumidity}</p>
                <p class="mode-label">${this.mode}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="actions-content">
          ${this.renderModes()}
          
          <p class="display-name">${this.name}</p>
        </div>
      </ha-card>
    `;
  }
}

customElements.define('humidifier-card', HumidifierCard);

window.customCards = window.customCards || [];
window.customCards.push({
  preview: true,
  type: 'humidifier-card',
  name: 'Humidifier Card',
  description: 'Humidifier card allows you to control your smart humidifier.',
});
