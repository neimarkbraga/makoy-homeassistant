import { HomeAssistant as BasHomeAssistant } from 'custom-card-helpers/src/types';

export interface Entity<Attributes = {[key: string]: any}> {
  entity_id: string
  context: {
    id: string
    parent_id: string | null
    user_id: string | null
  },
  state: string
  attributes: Attributes
  last_changed: string
  last_updated: string
}

export interface HomeAssistant extends Omit<BasHomeAssistant, 'states'>{
  states: {
    [entity_id: string]: Entity
  }
}