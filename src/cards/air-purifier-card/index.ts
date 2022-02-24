import { html, LitElement, PropertyValues, unsafeCSS } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { customElement, property } from 'lit/decorators.js';
import { fireEvent, hasConfigOrEntityChanged } from 'custom-card-helpers';
import { paddingLeft } from '../../libs/utils';
import { mdiPower } from '@mdi/js';

import style from './style.module.scss';
import { HomeAssistant, Entity } from '../../interfaces/hass';
import { CardConfig, AirPurifierAttributes } from './index.types';
import { isDevelopment } from '../../libs/debug';

const ELEMENT_NAME = (isDevelopment ? 'dev-' : '') + 'air-purifier-card';
const DISPLAY_NAME = (isDevelopment ? '[dev] ' : '') + 'Air Purifier Card';
const DESCRIPTION = (isDevelopment ? '[dev] ' : '') + 'Air Purifier card allows you to control your smart air purifier.';

@customElement(ELEMENT_NAME)
class AirPurifierCard extends LitElement {
  @property({ type: Object })
  hass?: HomeAssistant

  @property({ type: Object })
  config?: CardConfig

  @property({ type: Boolean })
  isRequesting: boolean = false;

  static styles = unsafeCSS(style);

  // entity instance
  get entity(): Entity<AirPurifierAttributes> | null {
    const entity =  this.hass?.states[this.config.entity] || null;
    if (entity) return entity as Entity<AirPurifierAttributes>;
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

  // call home assistant service
  async callService(domain: string, service: string, data = {}, isRequest = true) {
    const defaultData = { entity_id: this.config.entity };
    const request = this.hass.callService(domain, service, Object.assign(defaultData, data));

    if (isRequest) {
      this.isRequesting = true;
      this.requestUpdate();
    }
    return request;
  }

  getIndicatorColor() {
    // 0-75 = green
    // 76-150 = orange
    // 150 or higher = red
    const pm2 = this.entity?.attributes['environment.pm2_5_density'];
    if (pm2 <= 75) return '#66bb6a';
    if (pm2 <= 150) return '#ffa726';
    return '#ef5350';
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
    const isOn = !/off/i.test(this.entity.state);

    return html`
      <ha-card>
        <div class="d-flex justify-content-between p-3">
          <div style="width: 48px"></div>
          <div class="preview">
            <div class="shape">
              <div class="content">
                <div class="w-100 text-center">
                  <div class="color-indicator" style="background-color: ${this.getIndicatorColor()}"></div>
                  <div class="pm2-text pt-3" @click="${() => this.handleMore()}">${paddingLeft(attributes['environment.pm2_5_density'], 3, '0')}</div>
                  <div class="pt-2">
                    <button class="clickable ${classMap({active: /auto/i.test(this.entity.state)})}"
                            @click="${() => this.callService('climate', 'set_hvac_mode', {hvac_mode: 'auto'})}">
                      <div class="letter-icon">
                        <div>A</div>
                      </div>
                    </button>
                    <button class="clickable ${classMap({active: /sleep/i.test(this.entity.state)})}"
                            @click="${() => this.callService('climate', 'set_preset_mode', {preset_mode: 'Sleep'})}">
                      <ha-icon icon="mdi:weather-night"></ha-icon>
                    </button>
                    <button class="clickable ${classMap({active: /favorite/i.test(this.entity.state)})}"
                            @click="${() => this.callService('climate', 'set_preset_mode', {preset_mode: 'Favorite'})}">
                      <ha-icon icon="mdi:heart-outline"></ha-icon>
                    </button>
                    <button>
                      <ha-icon icon="mdi:wifi"></ha-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ha-icon-button
            class="${classMap({active: isOn})}"
            path="${mdiPower}"
            label="Power on/off"
            @click="${() => this.callService('climate', 'set_hvac_mode', {hvac_mode: isOn ? 'off' : 'auto'})}">
          </ha-icon-button>
        </div>

        <p class="pb-3 display-name">
          ${this.config.name}
        </p>
        
        <div class="stats">
          <div class="stats-block">
            <span class="stats-value">${attributes['filter.filter_life_level']}</span>
            %
            <div class="stats-subtitle">Filter Remaining</div>
          </div>
          <div class="stats-block">
            <span class="stats-value">${attributes['filter.filter_used_time']}</span>
            Hrs
            <div class="stats-subtitle">Filter Age</div>
          </div>
          <div class="stats-block">
            <span class="stats-value">${attributes['custom_service.moto_speed_rpm']}</span>
            RPS
            <div class="stats-subtitle">Motor Speed</div>
          </div>
        </div>
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