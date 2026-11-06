/**
 * Set on <html> while the newsletter prompt is open (`PromptDialog`). The
 * mascot in the corner (`ScrollGuide`) is nowhere while it is: the prompt opens
 * once the page has scrolled 1200px, and a walk to the corner, or to the
 * Support card, played behind the prompt's overlay is an entrance nobody sees.
 */
export const PROMPT_OPEN_ATTRIBUTE = 'data-newsletter-prompt';

/**
 * Stored as the JSON `true` once the visitor closes the prompt
 * (`NewsletterModal`); `scripts/shot.mjs`, `scripts/pageshot.swift` and
 * `scripts/pageeval.swift` write it to keep the prompt out of what they see,
 * and `NewsletterModal.test.tsx` holds them to one string.
 */
export const DISMISSED_KEY = 'netfox-newsletter-prompt-dismissed';
