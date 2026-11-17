import { MenuItem } from "./menuData";

export const searchItems = (query: string, items: MenuItem[]): MenuItem[] => {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
  );
};

export const highlightMatch = (text: string, query: string) => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(regex, "**$1**");
};