import { html, LitElement, PropertyValues, unsafeCSS } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { customElement, property } from 'lit/decorators.js';
import { fireEvent, hasConfigOrEntityChanged } from 'custom-card-helpers';

import {
  mdiCircleSlice2,
  mdiCircleSlice4,
  mdiCircleSlice6,
  mdiPower,
  mdiWaterPercent
} from '@mdi/js';

import style from './style.module.scss';
import { HomeAssistant, Entity } from '../../interfaces/hass';
import { CardConfig, HumidifierAttributes } from './index.types';
import { isDevelopment } from '../../libs/debug';

const ELEMENT_NAME = (isDevelopment ? 'dev-' : '') + 'humidifier-card';
const DISPLAY_NAME = (isDevelopment ? '[dev] ' : '') + 'Humidifier Card';
const DESCRIPTION = (isDevelopment ? '[dev] ' : '') + 'Humidifier card allows you to control your smart humidifier.';

@customElement(ELEMENT_NAME)
class HumidifierCard extends LitElement {
  @property({ type: Object })
  hass?: HomeAssistant

  @property({ type: Object })
  config?: CardConfig

  @property({ type: Boolean })
  isRequesting: boolean = false;

  static styles = unsafeCSS(style);

  // entity instance
  get entity(): Entity<HumidifierAttributes> | null {
    const entity =  this.hass?.states[this.config.entity] || null;
    if (entity) return entity as Entity<HumidifierAttributes>;
    return null;
  }

  // should render update
  shouldUpdate(_changedProperties: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, _changedProperties, false);
  }

  // when component updated
  updated(_changedProperties: PropertyValues) {
    const hass = _changedProperties.get('hass') as HomeAssistant | undefined;
    if (hass && this.entity !== hass.states[this.config.entity])
      this.isRequesting = false;
  }

  // set config handler
  setConfig(config?: CardConfig) {
    if (!config.entity) throw new Error('You need to define an entity');
    this.config = config;
  }

  async callService(domain: string, service: string, data = {}, isRequest = true) {
    const defaultData = { entity_id: this.config.entity };
    const request = this.hass.callService(domain, service, Object.assign(defaultData, data));

    if (isRequest) {
      this.isRequesting = true;
      this.requestUpdate();
    }
    return request;
  }

  handleMore() {
    fireEvent(
      this,
      'hass-more-info',
      { entityId: this.entity.entity_id },
      {
        bubbles: true,
        composed: true,
      }
    );
  }

  renderButtons() {
    if (!this.entity?.attributes.available_modes)
      return html``;

    const modes = this.entity.attributes.available_modes.filter(a => !/off/i.test(a));
    return modes.map(mode => {
      const icon = (() => {
        const levelMatch = /^level(\d+)/i.exec(mode);
        if (levelMatch) {
          if (/^1$/.test(levelMatch[1])) return mdiCircleSlice2;
          if (/^2$/.test(levelMatch[1])) return mdiCircleSlice4;
          if (/^3$/.test(levelMatch[1])) return mdiCircleSlice6;
        }
        return mdiWaterPercent;
      })();

      return html`
        <ha-icon-button
          path="${icon}"
          label="${mode}"
          class="${this.entity.attributes.mode === mode ? 'active' : ''}"
          @click="${() => this.callService('humidifier', 'set_mode', { mode })}">
        </ha-icon-button>
      `;
    }).reverse();
  }

  render() {
    // entity not available
    if (!this.entity || /unavailable/i.test(this.entity.state))
      return html`
        <ha-card class="p-3">
          <p class="m-0">Humidifier not available</p>
        </ha-card>
      `;

    // config not available
    if (!this.config)
      return html`
        <ha-card class="p-3">
          <p class="m-0">Config not available</p>
        </ha-card>
      `;

    const { attributes } = this.entity;
    const indicatorClassName = (() => {
      if (/off/i.test(attributes.mode)) return '';
      const levelMatch = /^level(\d+)/i.exec(attributes.mode);
      return `level-${levelMatch ? levelMatch[1] : 'auto'}`;
    })();

    return html`
      <ha-card class="p-3">
        <div class="preview" @click="${() => this.handleMore()}">
          <div class="display-box">
            <div class="light-indicator ${indicatorClassName}"></div>
            <div class="content-wrapper">
              <div class="content">
                <h1 class="humidity-label">${attributes['environment.relative_humidity']}%</h1>
                <p class="target-humidity-label">${attributes['humidifier.target_humidity']}</p>
                <p class="mode-label">${attributes.mode}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-3 d-flex justify-content-center">
          ${this.renderButtons()}
          <ha-icon-button
            class="${classMap({active: this.entity.state === 'on'})}"
            path="${mdiPower}"
            label="Power on/off"
            @click="${() => this.callService('humidifier', 'toggle')}">
          </ha-icon-button>
        </div>

        <p class="display-name pt-2">${this.config.name}</p>
      </ha-card>
    `;
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  preview: true,
  type: ELEMENT_NAME,
  name: DISPLAY_NAME,
  description: DESCRIPTION
});