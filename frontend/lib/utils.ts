import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function scrollToHash(hash: string) {
  const href = hash.replace('/', '');
  const el = document.querySelector(href);
  if (!el) return;

  el.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

/**
 * Generate a synthetic slug based on entity data
 * Creates a URL-friendly slug with the entity ID as a query parameter
 * @param entity - The entity object with an id and optional name/title field
 * @param entityType - Type of entity (e.g., 'email-config', 'plan', 'ticket')
 * @returns A synthetic slug string like "email-config-default-smtp?id=uuid"
 */
export function generateSyntheticSlug(
  entity: { id: string; name?: string; title?: string },
  entityType: string
): string {
  // Get a name/title for the slug, or use a default
  const nameField = entity.name || entity.title || 'item';

  // Convert to URL-friendly slug
  const slug = nameField
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length

  // Return slug with entity type prefix and ID as query param
  return `${entityType} -${slug}?id = ${entity.id} `;
}

/**
 * Extract entity ID from a slug
 * Handles both synthetic slugs (with ?id=) and direct ID slugs
 * @param slug - The slug string (can be a UUID, numeric ID, or synthetic slug with ?id=)
 * @returns The extracted entity ID or null if not found
 */
export function extractIdFromSlug(slug: string): string | null {
  // Check if it's a synthetic slug with query parameter
  if (slug.includes('?id=')) {
    const idMatch = slug.match(/[?&]id=([^&]+)/);
    if (idMatch && idMatch[1]) {
      return decodeURIComponent(idMatch[1]);
    }
  }

  // Check if it's a UUID
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
  ) {
    return slug;
  }

  // Check if it's a numeric ID
  if (/^\d+$/.test(slug)) {
    return slug;
  }

  // Try to extract ID from the end of the slug (before query params)
  const slugWithoutQuery = slug.split('?')[0];
  const parts = slugWithoutQuery.split('-');
  const lastPart = parts[parts.length - 1];

  // If last part looks like an ID, return it
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      lastPart
    ) ||
    /^\d+$/.test(lastPart)
  ) {
    return lastPart;
  }

  return null;
}