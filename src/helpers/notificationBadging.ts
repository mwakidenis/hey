export const clearNotificationAppBadge = () => {
  if (typeof navigator !== "undefined" && "clearAppBadge" in navigator) {
    navigator.clearAppBadge().catch(() => {});
  }
};

export const setNotificationAppBadge = (count: number) => {
  if (typeof navigator !== "undefined" && "setAppBadge" in navigator) {
    navigator.setAppBadge(count).catch(() => {});
  }
};
