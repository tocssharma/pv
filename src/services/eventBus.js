// services/eventBus.js
class EventBus {
    constructor() {
      this.subscribers = new Map();
    }
  
    subscribe(event, callback) {
      if (!this.subscribers.has(event)) {
        this.subscribers.set(event, new Set());
      }
      this.subscribers.get(event).add(callback);
      return () => this.unsubscribe(event, callback);
    }
  
    publish(event, data) {
      if (this.subscribers.has(event)) {
        this.subscribers.get(event).forEach(callback => callback(data));
      }
    }
  }
  
  export const eventBus = new EventBus();