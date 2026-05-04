import { FirestorePermissionError } from './errors';

type EventMap = {
  'permission-error': FirestorePermissionError;
};

type Handler<T> = (payload: T) => void;

class TypedErrorEmitter {
  private listeners: { [K in keyof EventMap]?: Set<Handler<EventMap[K]>> } = {};

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>) {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event]!.add(handler);
  }

  off<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>) {
    this.listeners[event]?.delete(handler);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    this.listeners[event]?.forEach(handler => handler(payload));
  }
}

export const errorEmitter = new TypedErrorEmitter();
