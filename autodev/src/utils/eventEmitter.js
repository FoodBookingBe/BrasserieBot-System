/**
 * eventEmitter.js
 * Custom event emitter for the AutoDev agent
 */

import { EventEmitter as NodeEventEmitter } from 'events';

/**
 * Enhanced EventEmitter with additional features
 */
export class EventEmitter {
  constructor() {
    this.emitter = new NodeEventEmitter();
    this.listeners = new Map();
    this.history = new Map();
    this.historyLimit = 100;
  }
  
  /**
   * Register an event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event listener function
   * @returns {Function} Unsubscribe function
   */
  on(event, listener) {
    this.emitter.on(event, listener);
    
    // Store listener for management
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(listener);
    
    // Return unsubscribe function
    return () => this.off(event, listener);
  }
  
  /**
   * Register a one-time event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event listener function
   * @returns {Function} Unsubscribe function
   */
  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener(...args);
    };
    
    return this.on(event, onceWrapper);
  }
  
  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event listener function
   */
  off(event, listener) {
    this.emitter.off(event, listener);
    
    // Remove from stored listeners
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(listener);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }
  
  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {...any} args - Event arguments
   */
  emit(event, ...args) {
    // Store in history
    if (!this.history.has(event)) {
      this.history.set(event, []);
    }
    
    const eventHistory = this.history.get(event);
    eventHistory.push({
      timestamp: new Date(),
      args
    });
    
    // Limit history size
    if (eventHistory.length > this.historyLimit) {
      eventHistory.shift();
    }
    
    // Emit event
    this.emitter.emit(event, ...args);
  }
  
  /**
   * Get event history
   * @param {string} [event] - Event name (optional, if not provided returns all events)
   * @param {number} [limit] - Maximum number of events to return
   * @returns {Array|Object} Event history
   */
  getHistory(event, limit = this.historyLimit) {
    if (event) {
      const eventHistory = this.history.get(event) || [];
      return eventHistory.slice(-limit);
    }
    
    // Return all events history
    const allHistory = {};
    for (const [eventName, eventHistory] of this.history.entries()) {
      allHistory[eventName] = eventHistory.slice(-limit);
    }
    
    return allHistory;
  }
  
  /**
   * Clear event history
   * @param {string} [event] - Event name (optional, if not provided clears all events)
   */
  clearHistory(event) {
    if (event) {
      this.history.delete(event);
    } else {
      this.history.clear();
    }
  }
  
  /**
   * Get all registered event names
   * @returns {Array<string>} Array of event names
   */
  getEventNames() {
    return Array.from(this.listeners.keys());
  }
  
  /**
   * Get listener count for an event
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   */
  listenerCount(event) {
    return this.listeners.has(event) ? this.listeners.get(event).size : 0;
  }
  
  /**
   * Remove all listeners for an event
   * @param {string} [event] - Event name (optional, if not provided removes all listeners)
   */
  removeAllListeners(event) {
    if (event) {
      this.emitter.removeAllListeners(event);
      this.listeners.delete(event);
    } else {
      this.emitter.removeAllListeners();
      this.listeners.clear();
    }
  }
}