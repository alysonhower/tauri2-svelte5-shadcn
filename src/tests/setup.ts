import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mock: @tauri-apps/api/core
// Provides a controllable `invoke` stub so every frontend test can simulate
// IPC responses without a running Tauri backend.
// ---------------------------------------------------------------------------

const invokeMock = vi.fn().mockResolvedValue('');

vi.mock('@tauri-apps/api/core', () => ({
	invoke: invokeMock
}));

// Expose the mock so individual tests can configure per-command responses.
// Usage:  import { mockInvoke } from '../setup';
//         mockInvoke.mockResolvedValueOnce('hello');
export { invokeMock as mockInvoke };
