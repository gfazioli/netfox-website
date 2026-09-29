/**
 * What the fox says: a piece of machine speak, and what Netfox makes of it --
 * the hero's "machine speak → humanese", one example at a time. They are
 * public claims, so each is something the app does as of 0.28.0, checked
 * against its source rather than remembered, and inside the same capability
 * boundary as `SolutionSection`'s conversions:
 *
 * - `ESP-8A2F`: the hero's own example, the subtitle's claim word for word.
 * - `_hap._tcp`: the Bonjour type HomeKit accessories advertise, which the
 *   app's service catalogue labels HomeKit (since 0.17.0, when the label was
 *   found unreachable for want of `_hap`).
 * - Amazon + 55442/55443: the app asks those two ports of devices whose MAC
 *   Amazon registered, and names one that answers on both an Amazon Echo
 *   (0.28.0).
 * - `5432 open`: a port that answered the app's probe, which asks over the
 *   network; its finding for it reads "a PostgreSQL database reachable from
 *   your home network", and the plain line is those words. Not
 *   `0.0.0.0:5432`, which is what a listener binds to and says nothing of a
 *   firewall in front of it (Codex, round 2 of #82).
 * - Two MACs answering to one `.local` name while both are there are one
 *   machine, listed once, the other connection in its details (0.28.0). One
 *   MACHINE: the grouping never learns it is a Mac (round 2 again).
 *
 * If a release changes one of these, change it here in the same motion.
 */
export const TRANSLATIONS = [
  { raw: 'ESP-8A2F', plain: 'An Espressif gadget, running a web server on port 80.' },
  { raw: '_hap._tcp', plain: 'A HomeKit accessory.' },
  { raw: 'Amazon · 55442 + 55443', plain: 'An Amazon Echo: those are the ports Alexa answers on.' },
  { raw: '5432 open', plain: 'A PostgreSQL database, reachable from your home network.' },
  { raw: '2 MACs, one .local name', plain: 'One machine with two connections, listed once.' },
] as const;
