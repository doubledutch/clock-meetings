# Magic Hour

## Data Model

### Firebase Database

#### `public/admin`

```json
{
  "currentSlotIndex": 1,
  "slotCount": 12,
  "topics": "Default topic 1\nDefault topic 2\n..."
}
```

#### `public/all`

```json
{
  "meetings": {
    "KEY": {
      "a": "ATTENDEE_A_ID",
      "b": "ATTENDEE_B_ID",
      "slotIndex": 3,
      "topic": "Specific topic selected by one of the attendees"
    }
  }
}
```

#### `public/users`

```json
{
  "USER_ID": {
    "firstName": "Bob",
    "ETC": "...",
    "topic": "What is the meaning of life?"
  }
}
```
