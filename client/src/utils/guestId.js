// Guest id helper
// Temporary users get a random id saved in localStorage
// Server uses this to know which guest owns which PDF

const GUEST_KEY = "intellidocs_guest_id";

export function getGuestId() {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    // Simple random id (good enough for a college project)
    id = "guest_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}
