// Event bus for cross-context communication
export const EVENT_TYPES = {
  LEAD_STORED: 'gbp_optimizer_lead_stored',
  LEAD_UPDATED: 'gbp_optimizer_lead_updated',
  LEAD_DELETED: 'gbp_optimizer_lead_deleted'
} as const;

// Helper to broadcast storage events
export function broadcastStorageEvent(type: string, data: any) {
  // Use localStorage event for cross-tab communication
  localStorage.setItem(type, JSON.stringify({
    timestamp: Date.now(),
    data
  }));
  localStorage.removeItem(type); // Immediately remove to allow future events
}