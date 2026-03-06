import '@testing-library/jest-dom';

// Mock EventSource globally (jsdom doesn't implement it)
class MockEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  readyState = MockEventSource.CONNECTING;
  url: string;
  private listeners: Map<string, EventListener[]> = new Map();
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    // Simulate open asynchronously
    setTimeout(() => {
      this.readyState = MockEventSource.OPEN;
      this.onopen?.();
    }, 0);
  }

  addEventListener(type: string, listener: EventListener) {
    const existing = this.listeners.get(type) ?? [];
    this.listeners.set(type, [...existing, listener]);
  }

  removeEventListener(type: string, listener: EventListener) {
    const existing = this.listeners.get(type) ?? [];
    this.listeners.set(type, existing.filter((l) => l !== listener));
  }

  dispatchEvent(event: MessageEvent) {
    const handlers = this.listeners.get(event.type) ?? [];
    handlers.forEach((h) => h(event));
    return true;
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
  }

  // Test helper: simulate an SSE event
  emit(type: string, data: unknown) {
    const event = new MessageEvent(type, { data: JSON.stringify(data) });
    this.dispatchEvent(event);
  }
}

Object.defineProperty(global, 'EventSource', {
  writable: true,
  value: MockEventSource,
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Silence console.error for expected React warnings in tests
const originalError = console.error;
beforeEach(() => {
  localStorageMock.clear();
});
afterAll(() => {
  console.error = originalError;
});
