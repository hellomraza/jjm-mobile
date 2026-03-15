# JJM Employee Mobile App — UI Design Guidelines

This document defines the UI/UX design system for the Employee Mobile Application used in the Jal Jeevan Mission project monitoring system.

The UI structure and interaction flow are inspired by the example application design provided in the reference document.

This document focuses strictly on:

- visual design rules
- UI layout
- screen structure
- navigation
- component styles
- multilingual support

Backend API logic and system architecture are documented separately.

---

## Design Philosophy

The application must follow a government service design style.

Key design goals:

- Simple
- Minimal
- Clean
- Highly readable
- Accessible for field workers
- Easy to operate outdoors
- Consistent interface across screens

The interface must be usable in:

- bright sunlight
- outdoor construction environments
- low network conditions

---

## Color System

### Primary Color

- `#126EB6`

### Theme

- Primary + White

### Usage Rules

Primary color must be used for:

- primary buttons
- active UI elements
- action buttons
- navigation highlights
- selected states

White must be used for:

- background
- cards
- containers
- forms

---

## Action Color

All interactive actions must use the primary color.

### Action Color

- `#126EB6`

Examples:

- capture photo button
- login button
- submit button
- confirm action buttons

---

## Background Colors

- Main Background: `#FFFFFF`
- Secondary Background: `#F6F7F9`
- Card Background: `#FFFFFF`
- Divider Color: `#E5E7EB`

---

## Typography

### Primary Font

- System Font

Recommended fonts:

- Inter
- Roboto

### Font Sizes

- Screen Title — `22px`
- Section Header — `18px`
- Body Text — `16px`
- Secondary Text — `14px`
- Caption — `12px`

Text must always maintain strong contrast with background.

---

## Icon Rules

Icons must follow these strict rules:

- Never use emoji for icons
- Use vector icons only
- Icons must be consistent across the application
- Icons should be minimal and clear

Recommended library:

- `react-native-vector-icons`

Preferred icon style:

- outline icons
- minimal design
- consistent stroke thickness

---

## Spacing System

Spacing unit:

- `8px`

Spacing scale used across the app:

- `8px`
- `16px`
- `24px`
- `32px`
- `40px`

All layouts must follow this spacing scale to maintain visual consistency.

---

## Layout System

The application uses a card-based layout system.

General screen layout:

- Header
- Content Area
- Primary Action Area

Cards must include:

- `border-radius: 12`
- `padding: 16`
- `background: white`
- subtle shadow

---

## Navigation Design

### Navigation Type

- Stack Navigation

The application must not use bottom tab navigation.

### Screen Flow

1. Login
2. Work Item List
3. Work Item Details
4. Component List
5. Upload Photo
6. Camera
7. Photo Preview

---

## Screen Designs

### Login Screen

**Purpose**

- Authenticate employee.

**Layout**

- Centered login card.

**Elements**

- JJM Logo
- Application Title
- Email Input Field
- Password Input Field
- Login Button
- Forgot Password Link

**Design rules**

- minimal layout
- centered form
- large primary login button

### Work Item List Screen

**Purpose**

- Display work items assigned to the employee.

**Layout**

- Scrollable card list.

**Card content**

- Work Item Name
- Location
- Progress Indicator

**Example**

- Village Water Supply
- Village: Rampur
- Progress: 45%

Tap card → open Work Item Details screen.

### Work Item Details Screen

**Purpose**

- Show detailed information about the selected work item.

**Sections**

- Work Item Information
- Component Progress List

**Information displayed**

- Village Name
- District
- Contractor
- Total Progress

### Component List Screen

**Purpose**

- Display the 12 predefined components assigned to the work item.

**Layout**

- List or table-style layout.

**Each component row contains**

- Component Name
- Progress
- Quantity
- Status

**Example**

- Pumping Mains
- 120 / 300 meters
- Status: Pending

Tap component → open Upload Photo screen.

### Upload Photo Screen

**Purpose**

- Allow employee to upload progress photo.

**Elements**

- Component Name (read-only)
- Progress Input Field
- Capture Photo Button

**Progress input rules**

- progress must be greater than current progress
- progress must not exceed component quantity

### Camera Screen

**Purpose**

- Capture field photo.

**Elements**

- Camera Preview
- Capture Button
- Flash Toggle
- Close Button

Captured photo metadata must include:

- latitude
- longitude
- timestamp

Location must be captured automatically from device GPS.

### Photo Preview Screen

**Purpose**

- Allow employee to confirm captured image.

**Layout**

- Photo Preview
- Progress Value Display
- Retake Button
- Submit Button

### Photo History Screen

**Purpose**

- Display previously uploaded photos.

**Layout**

- Vertical photo list.

**Each item displays**

- Photo
- Progress Value
- Upload Timestamp

---

## Button Design

### Primary Button

- `background: #126EB6`
- `text-color: white`
- `border-radius: 8`
- `padding: 14`

### Disabled Button

- `background: #D1D5DB`
- `text-color: #6B7280`

---

## Input Field Design

### Input style

- `border-radius: 8`
- `border: 1px solid #D1D5DB`
- `padding: 12`
- `background: white`

### Focus state

- `border-color: #126EB6`

---

## Multi Language Support

The application must support multi-language using i18n.

Recommended library:

- `react-i18next`

All UI text must come from translation files.

Folder structure:

```text
/locales/en.json
/locales/hi.json
```

Example translation keys:

- `login.title`
- `login.button`
- `component.progress`
- `upload.photo`

Hardcoded text inside components is not allowed.

---

## Accessibility Guidelines

The interface must remain readable in outdoor sunlight.

Minimum contrast ratio:

- `4.5:1`

Minimum touch target size:

- `44px` height

Buttons must be easy to tap with gloves or rough touch.

---

## Performance Guidelines

The application must perform well on low-end Android devices.

Best practices:

- Use `FlatList` or `FlashList` for lists
- Avoid heavy animations
- Avoid large image rendering
- Lazy load images

---

## Design Summary

### Design style

- Minimal government-style UI
- Card-based layout
- Primary color driven interface

### Theme

- Primary (`#126EB6`) + White

### Icons

- Vector icons only
- Emoji icons are not allowed

### Language

- i18n mandatory

### Navigation

- Stack navigation only
- No bottom tab navigation

---

## End of Document
