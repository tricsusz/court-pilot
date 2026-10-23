# Domain Glossary

This document records confirmed Court Pilot terminology and business rules. Agents must preserve these invariants and ask before defining additional rotation behavior.

## Confirmed terms

### Court official

A person maintained in the application roster. The persistence type is currently named `Umpire`, while parts of the UI use the broader label “Court Official.” A record contains first name, last name, country, and gender.

### Umpire

The primary official assigned to a court. An official can wait in the umpire queue, be assigned to a court as umpire, or be off duty.

### Service judge

An optional second role on a court. Service-judge behavior can be enabled or disabled globally in settings. The same official records are used for both umpire and service-judge roles.

### Court

A numbered play area. Courts are generated from `1` through the configured `numberOfCourts`; the default is five.

### Waiting queue

An ordered FIFO list of officials awaiting assignment. Umpires and service judges have separate queues and numeric order values. The lowest `order` value is assigned next. Officials may be reordered with drag and drop.

### Not on duty / rest

An official who is not found in either waiting queue or in either kind of court assignment. The code derives this state rather than persisting it separately.

### Send to court

Assign the first eligible waiting official or officials to a selected court. With service judges enabled, one official is taken from each role-specific queue.

### Remove from court

Remove assigned officials from a court and return them to waiting duty. With service judges enabled, roles intentionally swap when re-queuing: the prior service judge enters the umpire queue and the prior umpire enters the service-judge queue.

## Domain invariants

- “Court official” is the umbrella term; “umpire” and “service judge” are roles.
- Every official must be in exactly one state: not on duty, one waiting queue, or one active court role.
- An official must never occupy multiple queues or assignments at the same time.
- Queue assignment is FIFO by numeric `order`; the lowest value is next.
- Removing a court assignment with service judges enabled swaps the officials' role queues.
- Reducing `numberOfCourts` removes assignments above the new court count. Those officials become not on duty; they are not automatically added to a waiting queue.

## Current settings

- `numberOfCourts` — number of numbered courts shown
- `withServiceJudge` — whether service-judge assignments are active
- `showAlert` — whether quick court actions require confirmation
- language — stored separately in local storage; currently English or Hungarian

## Still-undecided behavior

Ask the maintainer before a task depends on any of these questions:

1. How should malformed queue data—duplicate or conflicting order values—be repaired?
2. Are gender and country free-form values, fixed choices, or governed by tournament data?
3. Will Court Pilot continue to manage one tournament/session at a time, or support multiple events later?
