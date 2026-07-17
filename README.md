# Travelling Allowance Bill for Tour

Digital fillable version of the Government Travelling Allowance (TA) Bill form.

## Features

- Exact replica of traditional Government TA Bill form
- All fields are editable digitally
- Add/remove journey rows dynamically
- Save and load drafts via browser localStorage
- Print directly to A4 paper
- Export as PDF (Print > Save as PDF)
- Clear form with confirmation

## Form Sections

1. **Employee Details** - Name, Designation, Basic Pay, Headquarters, Purpose, Department, Office Address
2. **Details of Journey** - Expandable table with 15 columns covering all journey parameters
3. **Mode of Journey** - Checkboxes for Air, Rail, Bus, Taxi, Auto, Private/Government Vehicle, Other
4. **Certificate** - Government declaration with digital signature, date, and place
5. **Office Use Only** - Verification, payment, bill/voucher numbers, officer signatures
6. **Footer** - Standard government form reference

## Usage

Open `index.html` in any modern web browser. No server required.

### Buttons

- **Save Draft** - Saves all form data to browser storage
- **Load Draft** - Restores previously saved draft
- **Print** - Opens browser print dialog (A4 formatted)
- **Export PDF** - Opens print dialog; choose "Save as PDF"
- **Clear Form** - Resets all fields (with confirmation)

### Journey Table

- Click **+ Add Row** to add more journey entries
- Click **X** on any row to remove it (minimum one row required)

## Technical

- Pure HTML, CSS, and JavaScript
- No external libraries, frameworks, or dependencies
- Times New Roman font throughout
- A4 portrait layout with proper print styling
- Print stylesheet for clean A4 output
- Data persisted in localStorage as JSON

## File Structure

- `index.html` - Form structure and layout
- `style.css` - Government form styling and print rules
- `script.js` - Form logic and data management
- `README.md` - This file

## Compatible Browsers

Chrome, Firefox, Edge, Safari (modern versions with HTML5 input types support).
